import React, { useState, useRef, useEffect } from 'react';
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
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlowingComponent from './GlowingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/use-toast';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Label } from './ui/label';
import { imageGen } from '../utils/models';
import { decrypt } from '../utils/encryption';
import { logger } from '../utils/logger';

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
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (editedUser) {
      const errors: { [key: string]: string } = {};

      // Validate all fields
      const fieldsToValidate = {
        name: editedUser.name || '',
        persona: editedUser.persona || '',
        about: (editedUser.about as string) || '',
        knowledge_base: editedUser.knowledge_base || '',
      };

      Object.entries(fieldsToValidate).forEach(([field, value]) => {
        const error = validateField(field, value);
        if (error) {
          errors[field] = error;
        }
      });

      setValidationErrors(errors);
    }
  }, [editedUser]);

  const validateField = (field: string, value: string) => {
    if (field === 'name' && value.length < 3) {
      return 'Name must be at least 3 characters long';
    } else if (field !== 'name' && value.length < 6) {
      return 'Must be at least 6 characters long';
    } else {
      return '';
    }
  };

  const handleSave = async () => {
    if (editedUser && Object.keys(validationErrors).length === 0) {
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
        setValidationErrors({});
      } catch (error) {
        logger.error('Error updating user:', error);
      }
    } else {
      const errorMessages = Object.values(validationErrors).join('\n');
      toast({
        title: 'Validation Error',
        description: errorMessages,
        variant: 'destructive',
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (newName.length <= 12) {
      setEditedUser((prev) =>
        prev
          ? {
              ...prev,
              name: newName,
            }
          : null
      );
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedUser((prev) => (prev ? { ...prev, [field]: value } : null));
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
      logger.error('Error generating avatar:', error);
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
        logger.error('Error saving avatar:', error);
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

  const getDisplayName = () => {
    if (!user) return '?';

    // First try to get name
    if (user.name) {
      return user.name;
    }

    // Fallback to decrypted name
    try {
      if (user.encrypted_name) {
        const key = Buffer.from(user.encryption_key, 'hex');
        const decryptedName = decrypt(
          user.encrypted_name,
          key,
          user.iv,
          user.tag
        );
        return decryptedName;
      }
    } catch (error) {
      logger.error('Error decrypting name:', error);
    }

    return 'New User';
  };

  if (!user) return null;
  return (
    <div className="bg-gradient-to-br from-blue-300/40 to-blue-500/40 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-h-screen overflow-y-hidden">
      <div className="flex flex-col items-center mb-4 relative">
        <div className="relative group">
          <Avatar
            onClick={() => setIsAvatarDialogOpen(true)}
            className="cursor-pointer hover:opacity-90 transition-all duration-300 w-28 h-28 ring-4 ring-white/20 hover:ring-white/40"
          >
            <AvatarImage src={currentAvatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-300 to-blue-400 text-white text-3xl font-bold">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="outline"
            size="sm"
            className="absolute -bottom-2 -right-2 rounded-full bg-white/30 hover:bg-white/40 border border-white/30 backdrop-blur-sm"
            onClick={() => setIsAvatarDialogOpen(true)}
          >
            <Camera className="h-4 w-4 text-white" />
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1 mt-4">
          {truncateName(getDisplayName(), 12)}
        </h2>
        <p className="text-base text-white/80 text-center mb-4 font-medium">
          {user.persona.slice(0, 50)}...
        </p>
        <GlowingComponent isGlowing={isGlowing}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setEditedUser(user);
                setIsOpen(true);
              }}
              className="w-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Pencil className="mr-2 h-5 w-5" />
              Edit Profile
            </Button>
          </motion.div>
        </GlowingComponent>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[91vh] bg-gradient-to-br from-blue-100/90 to-white/90 backdrop-blur-lg border border-white/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-900">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <label
                htmlFor="name"
                className="block text-lg font-medium text-blue-900/80 mb-2"
              >
                Name (3-12 characters)
              </label>
              <div className="relative flex flex-col">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                  <Input
                    id="name"
                    placeholder="Name"
                    value={editedUser?.name || ''}
                    onChange={handleNameChange}
                    maxLength={12}
                    minLength={3}
                    className={`w-full pl-10 pr-3 py-2 text-lg bg-white/50 border rounded-xl text-blue-900 ${
                      validationErrors.name
                        ? 'border-red-500'
                        : 'border-blue-200'
                    }`}
                  />
                </div>
                {validationErrors.name && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {validationErrors.name}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="persona"
                className="block text-lg font-medium text-blue-900/80 mb-2"
              >
                Persona
              </label>
              <Textarea
                id="persona"
                placeholder="Persona"
                value={editedUser?.persona || ''}
                onChange={(e) => handleFieldChange('persona', e.target.value)}
                className={`w-full px-3 py-2 text-lg bg-white/50 border rounded-xl min-h-[80px] resize-y text-blue-900 ${
                  validationErrors.persona
                    ? 'border-red-500'
                    : 'border-blue-200'
                }`}
              />
              {validationErrors.persona && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.persona}
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="about"
                className="block text-lg font-medium text-blue-900/80 mb-2"
              >
                About
              </label>
              <Textarea
                id="about"
                placeholder="About"
                value={(editedUser?.about as string) || ''}
                onChange={(e) => handleFieldChange('about', e.target.value)}
                className={`w-full px-3 py-2 text-lg bg-white/50 border rounded-xl min-h-[80px] resize-y text-blue-900 ${
                  validationErrors.about ? 'border-red-500' : 'border-blue-200'
                }`}
              />
              {validationErrors.about && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.about}
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="knowledgeBase"
                className="block text-lg font-medium text-blue-900/80 mb-2"
              >
                Knowledge Base
              </label>
              <Textarea
                id="knowledgeBase"
                placeholder="Knowledge Base"
                value={editedUser?.knowledge_base || ''}
                onChange={(e) =>
                  handleFieldChange('knowledge_base', e.target.value)
                }
                className={`w-full px-3 py-2 text-lg bg-white/50 border rounded-xl min-h-[80px] resize-y text-blue-900 ${
                  validationErrors.knowledge_base
                    ? 'border-red-500'
                    : 'border-blue-200'
                }`}
              />
              {validationErrors.knowledge_base && (
                <div className="flex items-center mt-1 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {validationErrors.knowledge_base}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <div className="w-full flex justify-between space-x-3">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setValidationErrors({});
                }}
                variant="outline"
                className="w-1/2 bg-blue-200 hover:bg-blue-300 text-blue-900 text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  updateUserMutation.isPending ||
                  Object.keys(validationErrors).length > 0
                }
                className="w-1/2 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <Save className="mr-2 h-5 w-5" />
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-blue-100/90 to-white/90 backdrop-blur-lg border border-white/20 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-blue-900 mb-4">
              Update Your Avatar
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/50">
              <TabsTrigger
                value="upload"
                className="text-lg font-bold text-blue-900 data-[state=active]:bg-blue-300/50"
              >
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="text-lg font-bold text-blue-900 data-[state=active]:bg-blue-300/50"
              >
                Generate
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="space-y-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-6 w-6" />
                  )}
                  {isUploading ? 'Uploading...' : 'Choose Your Avatar'}
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
                    className="text-lg font-bold text-blue-900/80"
                  >
                    Describe Your Dream Avatar
                  </Label>
                  <Input
                    id="imagePrompt"
                    placeholder="E.g., A superhero cat with laser eyes"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="mb-2 bg-white/50 border border-blue-200 text-blue-900 rounded-xl"
                  />
                </div>
                <Button
                  onClick={handleGenerateAvatar}
                  className="w-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
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
          <div className="mt-4 h-64 w-full bg-white/50 rounded-xl overflow-hidden border border-blue-200 relative">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Preview"
                layout="fill"
                objectFit="contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-900/50">
                <ImageIcon className="w-16 h-16 animate-pulse" />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <div className="w-full flex justify-between space-x-3">
              <Button
                onClick={() => {
                  setIsAvatarDialogOpen(false);
                  setPreviewImage(null);
                }}
                variant="outline"
                className="w-1/2 bg-blue-200 hover:bg-blue-300 text-blue-900 text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={saveAvatar}
                disabled={!previewImage || isSaving}
                className="w-1/2 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
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
    </div>
  );
};

export default UserProfile;
