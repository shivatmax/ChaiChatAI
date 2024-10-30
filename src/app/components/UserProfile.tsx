import React, { useState, useRef } from 'react';
import { User } from '../types/SupabaseTypes';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUpdateUser } from '../integrations/supabase/hooks/useUser';
import {
  User as UserIcon,
  Pencil,
  Save,
  Camera,
  Upload,
  Wand2,
  Loader2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlowingComponent from './GlowingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Label } from './ui/label';
import { imageGen } from '../utils/models';

interface UserProfileProps {
  user: User | null;
  isGlowing: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isGlowing }) => {
  const updateUserMutation = useUpdateUser();
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [imagePrompt, setImagePrompt] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatar_url || '');

  const handleSave = async () => {
    if (editedUser) {
      try {
        await updateUserMutation.mutateAsync({
          ...editedUser,
          created_at:
            typeof editedUser.created_at === 'string'
              ? editedUser.created_at
              : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ['user', editedUser.id] });
        if (user) {
          Object.assign(user, editedUser);
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, 12);
    setEditedUser((prev) => (prev ? { ...prev, name: newName } : null));
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
    if (user && previewImage) {
      setIsSaving(true);
      try {
        await updateUserMutation.mutateAsync({
          ...user,
          avatar_url: previewImage,
        });
        toast({
          title: 'Avatar Updated',
          description: 'Your avatar has been successfully updated.',
        });
        setCurrentAvatar(previewImage); // Update the current avatar immediately
        setIsAvatarDialogOpen(false);
        setPreviewImage(null);
        queryClient.invalidateQueries({ queryKey: ['user', user.id] });
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

  const truncateName = (name: string | undefined, limit: number) => {
    return name && name.length > limit
      ? name.substring(0, limit) + '...'
      : name;
  };

  if (!user) return null;

  return (
    <div className="bg-comic-yellow comic-bg p-4 rounded-lg comic-border comic-shadow max-h-screen overflow-y-auto">
      <div className="flex flex-col items-center mb-3 relative">
        <div className="relative">
          <Avatar className="w-20 h-20 mb-3 ring-3 ring-comic-purple">
            <AvatarImage
              src={currentAvatar}
              alt={user.name}
              onError={(e) => {
                console.error('Error loading avatar image:', e);
                e.currentTarget.src = '/path/to/fallback/image.png';
              }}
            />
            <AvatarFallback className="bg-comic-blue text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="absolute bottom-0 right-0 rounded-full bg-comic-blue"
            onClick={() => setIsAvatarDialogOpen(true)}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-comic-purple mb-1">
          {truncateName(user.name, 12)}
        </h2>
        <p className="text-base text-comic-darkblue text-center mb-3 font-medium">
          {user.persona.slice(0, 80)}...
        </p>
        <GlowingComponent isGlowing={isGlowing}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditedUser(user);
                setIsOpen(true);
              }}
              className="w-full bg-comic-green hover:bg-comic-blue text-black hover:text-white transition-colors duration-200 comic-border comic-shadow text-lg font-bold"
            >
              <Pencil className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          </motion.div>
        </GlowingComponent>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[375px] max-h-[91vh] bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-comic-purple">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            {/* Name input */}
            <div className="relative">
              <label
                htmlFor="name"
                className="block text-lg font-medium text-comic-darkblue mb-1"
              >
                Name (max 12 characters)
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-comic-purple text-xl" />
                <Input
                  id="name"
                  placeholder="Name"
                  value={editedUser?.name || ''}
                  onChange={handleNameChange}
                  maxLength={12}
                  className="w-full pl-10 pr-3 py-2 text-lg bg-white bg-opacity-50 rounded-md comic-border comic-shadow"
                />
              </div>
            </div>
            {/* Persona textarea */}
            <div>
              <label
                htmlFor="persona"
                className="block text-lg font-medium text-comic-darkblue mb-1"
              >
                Persona
              </label>
              <Textarea
                id="persona"
                placeholder="Persona"
                value={editedUser?.persona || ''}
                onChange={(e) =>
                  setEditedUser((prev) =>
                    prev ? { ...prev, persona: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow"
              />
            </div>
            {/* About textarea */}
            <div>
              <label
                htmlFor="about"
                className="block text-lg font-medium text-comic-darkblue mb-1"
              >
                About
              </label>
              <Textarea
                id="about"
                placeholder="About"
                value={(editedUser?.about as string) || ''}
                onChange={(e) =>
                  setEditedUser((prev) =>
                    prev ? { ...prev, about: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow"
              />
            </div>
            {/* Knowledge Base textarea */}
            <div>
              <label
                htmlFor="knowledgeBase"
                className="block text-lg font-medium text-comic-darkblue mb-1"
              >
                Knowledge Base
              </label>
              <Textarea
                id="knowledgeBase"
                placeholder="Knowledge Base"
                value={editedUser?.knowledge_base || ''}
                onChange={(e) =>
                  setEditedUser((prev) =>
                    prev ? { ...prev, knowledge_base: e.target.value } : null
                  )
                }
                className="w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow"
              />
            </div>
          </div>
          <DialogFooter>
            <div className="w-full flex justify-between space-x-2">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-1/2 bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow text-lg font-bold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateUserMutation.isPending}
                className="w-1/2 bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow text-lg font-bold"
              >
                <Save className="mr-2 h-5 w-5" />
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br to-comic-blue comic-bg rounded-xl comic-border comic-shadow">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-comic-purple mb-4">
              🎨 Update Your Avatar 🖼️
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-comic-purple">
              <TabsTrigger
                value="upload"
                className="text-lg font-bold text-white data-[state=active]:bg-comic-blue"
              >
                📤 Upload
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="text-lg font-bold text-white data-[state=active]:bg-comic-green"
              >
                🪄 Generate
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="space-y-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-comic-red text-white hover:bg-comic-purple transition-all duration-300 comic-border comic-shadow text-lg font-bold transform hover:scale-105"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-6 w-6" />
                  )}
                  {isUploading ? '📤 Uploading...' : '📁 Choose Your Avatar'}
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
                    className="text-lg font-bold text-comic-purple"
                  >
                    🎭 Describe Your Dream Avatar
                  </Label>
                  <Input
                    id="imagePrompt"
                    placeholder="E.g., A superhero cat with laser eyes"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="mb-2 bg-white bg-opacity-70 comic-border"
                  />
                </div>
                <Button
                  onClick={handleGenerateAvatar}
                  className="w-full bg-comic-purple text-white hover:bg-comic-blue transition-all duration-300 comic-border comic-shadow text-lg font-bold transform hover:scale-105"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-6 w-6" />
                  )}
                  {isGenerating ? '🎭 Conjuring...' : '🎨 Create Magic Avatar'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-4 h-64 w-full bg-white/70 rounded-lg overflow-hidden comic-border relative">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Preview"
                layout="fill"
                objectFit="contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-comic-purple text-lg font-bold">
                <ImageIcon className="w-16 h-16 text-comic-purple/50 animate-pulse" />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <div className="w-full flex justify-between space-x-2">
              <Button
                onClick={() => {
                  setIsAvatarDialogOpen(false);
                  setPreviewImage(null);
                }}
                variant="outline"
                className="w-1/2 bg-comic-red text-white hover:bg-comic-purple transition-all duration-300 comic-border comic-shadow text-lg font-bold rounded-full"
              >
                🚫 Cancel
              </Button>
              <Button
                onClick={saveAvatar}
                disabled={!previewImage || isSaving}
                className="w-1/2 bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-all duration-300 comic-border comic-shadow text-lg font-bold rounded-full"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isSaving ? '💾 Saving...' : '✅ Save Avatar'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
