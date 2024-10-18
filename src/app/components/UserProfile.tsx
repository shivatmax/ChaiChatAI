import React, { useState } from 'react';
import { User } from '../types/User';
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
import { Avatar, AvatarFallback } from './ui/avatar';
import { useUpdateUser } from '../integrations/supabase/hooks/useUser';
import { User as UserIcon, Pencil, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import GlowingComponent from './GlowingComponent';
import { useQueryClient } from '@tanstack/react-query';

interface UserProfileProps {
  user: User | null;
  isGlowing: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isGlowing }) => {
  const updateUserMutation = useUpdateUser();
  const [, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (editedUser) {
      try {
        await updateUserMutation.mutateAsync({
          ...editedUser,
          created_at:
            editedUser.created_at instanceof Date
              ? editedUser.created_at.toISOString()
              : editedUser.created_at,
          updated_at: new Date().toISOString(),
        });
        setIsOpen(false);
        queryClient.invalidateQueries({ queryKey: ['user', editedUser.id] });
        // Update the user state in the parent component
        if (user) {
          user.name = editedUser.name;
          user.persona = editedUser.persona;
          user.about = editedUser.about;
          user.knowledge_base = editedUser.knowledge_base;
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

  const truncateName = (name: string | undefined, limit: number) => {
    return name && name.length > limit
      ? name.substring(0, limit) + '...'
      : name;
  };

  if (!user) return null;

  return (
    <div className='bg-comic-yellow comic-bg p-4 rounded-lg comic-border comic-shadow max-h-screen overflow-y-auto'>
      <div className='flex flex-col items-center mb-3'>
        <Avatar className='w-20 h-20 mb-3 ring-3 ring-comic-purple'>
          <AvatarFallback className='bg-comic-blue text-white text-2xl font-bold'>
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <h2 className='text-2xl font-bold text-comic-purple mb-1'>
          {truncateName(user.name, 12)}
        </h2>
        <p className='text-base text-comic-darkblue text-center mb-3 font-medium'>
          {user.persona.slice(0, 80)}...
        </p>
        <GlowingComponent isGlowing={isGlowing}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setIsEditing(true);
                setEditedUser(user);
                setIsOpen(true);
              }}
              className='w-full bg-comic-green hover:bg-comic-blue text-black hover:text-white transition-colors duration-200 comic-border comic-shadow text-lg font-bold'
            >
              <Pencil className='mr-2 h-5 w-5' />
              Edit Profile
            </Button>
          </motion.div>
        </GlowingComponent>
      </div>
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogContent className='sm:max-w-[375px] max-h-[91vh] bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold text-comic-purple'>
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className='grid gap-4 py-3'>
            <div className='relative'>
              <label
                htmlFor='name'
                className='block text-lg font-medium text-comic-darkblue mb-1'
              >
                Name (max 12 characters)
              </label>
              <div className='relative'>
                <UserIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 text-comic-purple text-xl' />
                <Input
                  id='name'
                  placeholder='Name'
                  value={editedUser?.name || ''}
                  onChange={handleNameChange}
                  maxLength={12}
                  className='w-full pl-10 pr-3 py-2 text-lg bg-white bg-opacity-50 rounded-md comic-border comic-shadow'
                />
              </div>
            </div>
            <div>
              <label
                htmlFor='persona'
                className='block text-lg font-medium text-comic-darkblue mb-1'
              >
                Persona
              </label>
              <Textarea
                id='persona'
                placeholder='Persona'
                value={editedUser?.persona || ''}
                onChange={(e) =>
                  setEditedUser((prev) =>
                    prev ? { ...prev, persona: e.target.value } : null
                  )
                }
                className='w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow'
              />
            </div>
            <div>
              <label
                htmlFor='about'
                className='block text-lg font-medium text-comic-darkblue mb-1'
              >
                About
              </label>
              <Textarea
                id='about'
                placeholder='About'
                value={editedUser?.about || ''}
                onChange={(e) =>
                  setEditedUser((prev) =>
                    prev
                      ? {
                          ...prev,
                          about: e.target.value,
                        }
                      : null
                  )
                }
                className='w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow'
              />
            </div>
            <div>
              <label
                htmlFor='knowledgeBase'
                className='block text-lg font-medium text-comic-darkblue mb-1'
              >
                Knowledge Base
              </label>
              <Textarea
                id='knowledgeBase'
                placeholder='Knowledge Base'
                value={editedUser?.knowledge_base || ''}
                onChange={(e) =>
                  setEditedUser((prev) =>
                    prev ? { ...prev, knowledge_base: e.target.value } : null
                  )
                }
                className='w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow'
              />
            </div>
          </div>
          <DialogFooter>
            <motion.div className='w-full space-y-2'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setIsOpen(false)}
                  variant='outline'
                  className='w-full bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow text-lg font-bold'
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleSave}
                  disabled={updateUserMutation.isPending}
                  className='w-full bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow text-lg font-bold'
                >
                  <Save className='mr-2 h-5 w-5' />
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </motion.div>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
