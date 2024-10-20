import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { AIFriend } from '../types/AIFriend';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Switch } from './ui/switch';
import AIFriendEditor from './AIFriendEditor';
import {
  Pencil,
  Trash2,
  Camera,
  Upload,
  Wand2,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useAIFriends,
  useUpdateAIFriend,
  useDeleteAIFriend,
} from '../integrations/supabase/hooks/useAIFriend';
import { motion } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { imageGen } from '../utils/models';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';

interface AIFriendListProps {
  onSelectFriend: (friend: AIFriend) => void;
  userId: string;
}

const AIFriendList: React.FC<AIFriendListProps> = React.memo(
  ({ onSelectFriend, userId }) => {
    const { data: aiFriends, isLoading, error } = useAIFriends(userId);
    const updateAIFriendMutation = useUpdateAIFriend();
    const deleteAIFriendMutation = useDeleteAIFriend();
    const { toast } = useToast();
    const [friendToDelete, setFriendToDelete] = useState<AIFriend | null>(null);
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<AIFriend | null>(null);
    const [imagePrompt, setImagePrompt] = useState('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const toggleFriendStatus = useCallback(
      (friend: AIFriend) => {
        updateAIFriendMutation.mutate({
          updatedAIFriend: { ...friend, status: !friend.status },
          userId,
        });
        invalidateFriendsSummaryCache();
      },
      [updateAIFriendMutation, userId]
    );

    const handleDeleteFriend = useCallback((friend: AIFriend) => {
      setFriendToDelete(friend);
      invalidateFriendsSummaryCache();
    }, []);

    const confirmDeleteFriend = useCallback(async () => {
      if (friendToDelete) {
        try {
          await deleteAIFriendMutation.mutateAsync({
            id: friendToDelete.id,
            userId,
          });
          toast({
            title: 'AI Friend Deleted',
            description: `${friendToDelete.name} has been deleted successfully.`,
            className: 'bg-comic-green text-black font-bold',
          });
          invalidateFriendsSummaryCache();
          setFriendToDelete(null);
        } catch (error) {
          console.error('Error deleting AI Friend:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete AI Friend. Please try again.',
            variant: 'destructive',
            className: 'bg-comic-red text-white font-bold',
          });
        }
      }
    }, [friendToDelete, deleteAIFriendMutation, userId, toast]);

    const truncateName = (name: string, limit: number) => {
      return name.length > limit ? name.substring(0, limit) + '...' : name;
    };

    const handleAvatarUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (file) {
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleGenerateAvatar = async () => {
      setIsGenerating(true);
      try {
        const b64Image = await imageGen(imagePrompt);
        setPreviewImage(`data:image/png;base64,${b64Image}`);
      } catch (error) {
        console.error('Error generating avatar:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate avatar. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsGenerating(false);
      }
    };

    const saveAvatar = async () => {
      if (selectedFriend && previewImage) {
        setIsSaving(true);
        try {
          await updateAIFriendMutation.mutateAsync({
            updatedAIFriend: { ...selectedFriend, avatar_url: previewImage },
            userId,
          });
          toast({
            title: 'Avatar Updated',
            description: 'AI Friend avatar has been successfully updated.',
          });
          setIsAvatarDialogOpen(false);
          setPreviewImage(null);
        } catch (error) {
          console.error('Error saving avatar:', error);
          toast({
            title: 'Error',
            description: 'Failed to save avatar. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsSaving(false);
        }
      }
    };

    if (isLoading)
      return (
        <div className='text-center py-4 text-3xl font-bold text-comic-purple'>
          Loading...
        </div>
      );
    if (error)
      return (
        <div className='text-center py-4 text-3xl font-bold text-comic-red'>
          Error: {error.message}
        </div>
      );

    return (
      <ScrollArea className='h-[calc(100vh-500px)] w-full hide-scrollbar'>
        <div className='space-y-2 pt-2 pb-5 pr-2'>
          {aiFriends &&
            aiFriends.map((friend: AIFriend) => (
              <TooltipProvider key={friend.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center p-3 rounded-lg bg-comic-yellow hover:bg-comic-green cursor-pointer transition-all duration-200 comic-border comic-shadow w-11/12 mx-auto`}
                      onClick={() => onSelectFriend(friend)}
                    >
                      <div className='relative'>
                        <Avatar className='w-12 h-12 flex-shrink-0'>
                          <AvatarImage
                            src={friend.avatar_url}
                            alt={friend.name}
                          />
                          <AvatarFallback
                            className={`bg-comic-purple text-white text-2xl font-bold ${
                              friend.status
                                ? 'ring-4 ring-comic-green ring-opacity-50'
                                : ''
                            }`}
                          >
                            {friend.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant='outline'
                          size='xs'
                          className='absolute bottom-0 right-0 rounded-full bg-comic-blue'
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFriend(friend);
                            setIsAvatarDialogOpen(true);
                          }}
                        >
                          <Camera className='h-3 w-3' />
                        </Button>
                      </div>
                      <div className='flex-grow min-w-0 ml-3'>
                        <p className='font-bold text-lg text-comic-darkblue'>
                          {truncateName(friend.name, 8)}
                        </p>
                        <p className='text-sm text-comic-purple truncate'>
                          {friend.persona.split(' ').slice(0, 2).join(' ')}
                        </p>
                      </div>
                      <div className='flex items-center space-x-1 flex-shrink-0'>
                        {friend.status && (
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              backgroundColor: [
                                'rgba(105, 240, 174, 0.5)',
                                'rgba(105, 240, 174, 1)',
                                'rgba(105, 240, 174, 0.5)',
                              ],
                              boxShadow: [
                                '0 0 5px rgba(105, 240, 174, 0.5)',
                                '0 0 20px rgba(105, 240, 174, 1)',
                                '0 0 5px rgba(105, 240, 174, 0.5)',
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className='w-4 h-4 rounded-full'
                          ></motion.div>
                        )}
                        <Switch
                          checked={friend.status}
                          onCheckedChange={() => toggleFriendStatus(friend)}
                          disabled={updateAIFriendMutation.isPending}
                          className='transition-opacity duration-200'
                        />
                        <AIFriendEditor
                          friend={friend}
                          onAIFriendUpdated={() => {}}
                          userId={userId}
                        >
                          <Pencil className='h-6 w-6 text-comic-darkblue hover:text-comic-purple transition-colors duration-200' />
                        </AIFriendEditor>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFriend(friend);
                          }}
                          className='p-1 hover:bg-comic-red hover:text-white transition-colors duration-200'
                        >
                          <Trash2 className='h-5 w-5' />
                        </Button>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className='bg-comic-purple text-white p-2 rounded comic-border comic-shadow'>
                    <p className='text-lg font-medium'>{friend.persona}</p>
                    <p className='text-sm text-comic-yellow'>
                      Click to view details
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
        </div>
        <AlertDialog
          open={!!friendToDelete}
          onOpenChange={() => setFriendToDelete(null)}
        >
          <AlertDialogContent className='bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-3xl font-bold text-comic-purple'>
                Delete AI Friend
              </AlertDialogTitle>
              <AlertDialogDescription className='text-xl text-comic-darkblue'>
                Are you sure you want to delete {friendToDelete?.name}? This
                action cannot be undone. And also all the conversation and
                messages of {friendToDelete?.name} will be deleted from all the
                sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow text-xl font-bold'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteFriend}
                className='bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow text-xl font-bold'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog
          open={isAvatarDialogOpen}
          onOpenChange={setIsAvatarDialogOpen}
        >
          <DialogContent className='sm:max-w-[500px] bg-gradient-to-br to-comic-blue comic-bg rounded-xl comic-border comic-shadow'>
            <DialogHeader>
              <DialogTitle className='text-3xl font-bold text-comic-purple mb-4 text-center'>
                🎨 Update {selectedFriend?.name} Avatar 🖼️
              </DialogTitle>
            </DialogHeader>
            <Tabs
              defaultValue='upload'
              className='w-full'
            >
              <TabsList className='grid w-full grid-cols-2 mb-4 bg-comic-purple overflow-hidden'>
                <TabsTrigger
                  value='upload'
                  className='text-lg font-bold text-white data-[state=active]:bg-comic-blue transition-colors duration-300'
                >
                  📤 Upload
                </TabsTrigger>
                <TabsTrigger
                  value='generate'
                  className='text-lg font-bold text-white data-[state=active]:bg-comic-green transition-colors duration-300'
                >
                  ✨ Generate
                </TabsTrigger>
              </TabsList>
              <TabsContent value='upload'>
                <div className='space-y-4'>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full bg-comic-red text-white hover:bg-comic-purple transition-all duration-300 comic-border comic-shadow text-lg font-bold rounded-full'
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className='mr-2 h-6 w-6 animate-spin' />
                    ) : (
                      <Upload className='mr-2 h-6 w-6' />
                    )}
                    {isUploading ? '📤 Uploading...' : '📁 Choose Image'}
                  </Button>
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept='image/*'
                    className='hidden'
                  />
                </div>
              </TabsContent>
              <TabsContent value='generate'>
                <div className='space-y-4'>
                  <div className='grid w-full items-center gap-1.5'>
                    <Label
                      htmlFor='imagePrompt'
                      className='text-lg font-bold text-comic-purple'
                    >
                      🧙‍♂️ Magic Prompt
                    </Label>
                    <Input
                      id='imagePrompt'
                      placeholder='Describe your dream avatar...'
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className='mb-2 bg-white/50 border-comic-purple focus:ring-comic-blue'
                    />
                  </div>
                  <Button
                    onClick={handleGenerateAvatar}
                    className='w-full bg-comic-purple text-white hover:bg-comic-blue transition-all duration-300 comic-border comic-shadow text-lg font-bold rounded-full'
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className='mr-2 h-6 w-6 animate-spin' />
                    ) : (
                      <Wand2 className='mr-2 h-6 w-6' />
                    )}
                    {isGenerating
                      ? '🎭 Conjuring...'
                      : '🎨 Create Magic Avatar'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <div className='mt-4 h-64 w-full bg-white/70 rounded-lg overflow-hidden comic-border relative'>
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt='Preview'
                  layout='fill'
                  objectFit='contain'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-comic-purple text-lg font-bold'>
                  <ImageIcon className='w-16 h-16 text-comic-purple/50 animate-pulse' />
                </div>
              )}
            </div>
            <DialogFooter className='mt-4'>
              <div className='w-full flex justify-between space-x-2'>
                <Button
                  onClick={() => {
                    setIsAvatarDialogOpen(false);
                    setPreviewImage(null);
                  }}
                  variant='outline'
                  className='w-1/2 bg-comic-red text-white hover:bg-comic-purple transition-all duration-300 comic-border comic-shadow text-lg font-bold rounded-full'
                >
                  🚫 Cancel
                </Button>
                <Button
                  onClick={saveAvatar}
                  disabled={!previewImage || isSaving}
                  className='w-1/2 bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-all duration-300 comic-border comic-shadow text-lg font-bold rounded-full'
                >
                  {isSaving ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <Sparkles className='mr-2 h-4 w-4' />
                  )}
                  {isSaving ? '💾 Saving...' : '✅ Save Avatar'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ScrollArea>
    );
  }
);

AIFriendList.displayName = 'AIFriendList';

const invalidateFriendsSummaryCache = () => {
  localStorage.removeItem('aiFriendsSummary');
  localStorage.removeItem('cachedAIFriendsData');
};

export default AIFriendList;
