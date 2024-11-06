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
import { supabase } from '../integrations/supabase/supabase';

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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
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
          const { error } = await supabase
            .from('Avatar')
            .update({ image_url: previewImage })
            .eq('id', selectedFriend.avatar_id);

          if (error) throw error;

          toast({
            title: 'Avatar Updated',
            description: 'AI Friend avatar has been successfully updated.',
          });
          setIsAvatarDialogOpen(false);
          setPreviewImage(null);
        } catch (error) {
          console.error(error);
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
        <div className="text-center py-4 text-3xl font-bold text-comic-purple">
          Loading...
        </div>
      );
    if (error)
      return (
        <div className="text-center py-4 text-3xl font-bold text-comic-red">
          Error: {error.message}
        </div>
      );

    return (
      <ScrollArea className="h-[calc(100vh-600px)] w-full hide-scrollbar">
        <div className="space-y-4 pt-4 pb-6 pr-4">
          {aiFriends &&
            aiFriends.map((friend: AIFriend) => (
              <TooltipProvider key={friend.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-white backdrop-blur-xl cursor-pointer transition-all duration-300 border border-blue-200 shadow-lg hover:shadow-xl hover:border-blue-300 w-[95%] mx-auto`}
                      onClick={() => onSelectFriend(friend)}
                    >
                      <div className="relative">
                        <Avatar className="w-14 h-14 flex-shrink-0 ring-2 ring-blue-200">
                          <AvatarImage
                            src={friend.avatar_url}
                            alt={friend.name}
                          />
                          <AvatarFallback
                            className={`bg-gradient-to-br from-blue-300 to-blue-100 text-blue-800 text-2xl font-bold ${
                              friend.status ? 'ring-4 ring-blue-200' : ''
                            }`}
                          >
                            {friend.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          variant="outline"
                          size="xs"
                          className="absolute -bottom-1 -right-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400 text-white border border-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFriend(friend);
                            setIsAvatarDialogOpen(true);
                          }}
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex-grow min-w-0 ml-4">
                        <p className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                          {truncateName(friend.name, 8)}
                        </p>
                        <p className="text-sm text-blue-600/70 truncate">
                          {friend.persona.split(' ').slice(0, 2).join(' ')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        {friend.status && (
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"
                          ></motion.div>
                        )}
                        <Switch
                          checked={friend.status}
                          onCheckedChange={() => toggleFriendStatus(friend)}
                          disabled={updateAIFriendMutation.isPending}
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 border-2 border-blue-300 transition-opacity duration-200"
                        />
                        <AIFriendEditor
                          friend={friend}
                          onAIFriendUpdated={() => {}}
                          userId={userId}
                        >
                          <Pencil className="h-5 w-5 text-blue-600/70 hover:text-blue-600 transition-colors duration-200" />
                        </AIFriendEditor>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFriend(friend);
                          }}
                          className="p-1 hover:bg-red-100 text-blue-600/70 hover:text-red-400 transition-colors duration-200 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gradient-to-br from-blue-100 to-white backdrop-blur-xl text-blue-800 p-3 rounded-xl border border-blue-200">
                    <p className="text-lg font-medium">{friend.persona}</p>
                    <p className="text-sm text-blue-600/70">
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
          <AlertDialogContent className="bg-gradient-to-br from-blue-100 to-white backdrop-blur-xl rounded-2xl border border-blue-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold text-blue-800">
                Delete AI Friend
              </AlertDialogTitle>
              <AlertDialogDescription className="text-lg text-blue-600/70">
                Are you sure you want to delete {friendToDelete?.name}? This
                action cannot be undone. And also all the conversation and
                messages of {friendToDelete?.name} will be deleted from all the
                sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors duration-300 rounded-xl border border-blue-200 text-lg font-medium">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteFriend}
                className="bg-gradient-to-r from-red-400 to-red-300 hover:from-red-500 hover:to-red-400 text-white transition-colors duration-300 rounded-xl border border-red-200 text-lg font-medium"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-100 to-white backdrop-blur-xl rounded-2xl border border-blue-200">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-blue-800 mb-4 text-center">
                Update {selectedFriend?.name} Avatar
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-blue-50 rounded-xl overflow-hidden">
                <TabsTrigger
                  value="upload"
                  className="text-lg font-medium text-blue-800 data-[state=active]:bg-blue-200 transition-colors duration-300"
                >
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="generate"
                  className="text-lg font-medium text-blue-800 data-[state=active]:bg-blue-200 transition-colors duration-300"
                >
                  Generate
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <div className="space-y-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gradient-to-r from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400 text-white transition-all duration-300 rounded-xl border border-blue-200 text-lg font-medium"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-6 w-6" />
                    )}
                    {isUploading ? 'Uploading...' : 'Choose Image'}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </TabsContent>
              <TabsContent value="generate">
                <div className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <Label
                      htmlFor="imagePrompt"
                      className="text-lg font-medium text-blue-800"
                    >
                      Magic Prompt
                    </Label>
                    <Input
                      id="imagePrompt"
                      placeholder="Describe your dream avatar..."
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="bg-blue-50 border-blue-200 text-blue-800 placeholder:text-blue-400 focus:ring-blue-300"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateAvatar}
                    className="w-full bg-gradient-to-r from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400 text-white transition-all duration-300 rounded-xl border border-blue-200 text-lg font-medium"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-6 w-6" />
                    )}
                    {isGenerating ? 'Generating...' : 'Create Magic Avatar'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <div className="mt-4 h-64 w-full bg-blue-50 rounded-xl overflow-hidden border border-blue-200 relative">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Preview"
                  layout="fill"
                  objectFit="contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-400">
                  <ImageIcon className="w-16 h-16 animate-pulse" />
                </div>
              )}
            </div>
            <DialogFooter className="mt-4">
              <div className="w-full flex justify-between space-x-4">
                <Button
                  onClick={() => {
                    setIsAvatarDialogOpen(false);
                    setPreviewImage(null);
                  }}
                  variant="outline"
                  className="w-1/2 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-all duration-300 rounded-xl border border-blue-200 text-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveAvatar}
                  disabled={!previewImage || isSaving}
                  className="w-1/2 bg-gradient-to-r from-blue-400 to-blue-300 hover:from-blue-500 hover:to-blue-400 text-white transition-all duration-300 rounded-xl border border-blue-200 text-lg font-medium"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Avatar'}
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
