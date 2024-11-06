import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { AIFriend } from '../types/AIFriend';
import { PlusCircle, X, User, AlertCircle } from 'lucide-react';
import { useAddAIFriend } from '../integrations/supabase/hooks/useAIFriend';
import { motion, AnimatePresence } from 'framer-motion';
import { sanitizeInput } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../integrations/supabase/supabase';

interface AIFriendCreatorProps {
  onAIFriendCreated: (friend: AIFriend) => void;
  friendCount: number;
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AIFriendCreator: React.FC<AIFriendCreatorProps> = ({
  onAIFriendCreated,
  friendCount,
  isOpen,
  onClose,
  userId,
}) => {
  const [name, setName] = useState('');
  const [persona, setPersona] = useState('');
  const [about, setAbout] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const addAIFriend = useAddAIFriend();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, 12);
    setName(newName);
    validateField('name', newName);
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'name' && value.length < 3) {
      newErrors[field] = 'Name must be at least 3 characters long';
    } else if (field !== 'name' && value.length < 6) {
      newErrors[field] = 'Must be at least 6 characters long';
    } else {
      delete newErrors[field];
    }

    setErrors(newErrors);
  };

  const handleCreateFriend = async () => {
    // Validate all fields before submission
    validateField('name', name);
    validateField('persona', persona);
    validateField('knowledgeBase', knowledgeBase);

    if (name.length < 3 || persona.length < 6 || knowledgeBase.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted errors before continuing.',
        variant: 'destructive',
      });
      return;
    }

    if (name && persona && knowledgeBase) {
      const sanitizedName = sanitizeInput(name);
      const sanitizedPersona = sanitizeInput(persona);
      const sanitizedKnowledgeBase = sanitizeInput(knowledgeBase);

      if (friendCount < 5) {
        try {
          // First create a default avatar
          const avatarId = uuidv4();
          const now = new Date().toISOString();
          const { error: avatarError } = await supabase.from('Avatar').insert([
            {
              id: avatarId,
              name: sanitizedName,
              creator_id: userId,
              description: about || '',
              image_url: '',
              about: about || '',
              persona: sanitizedPersona,
              knowledge_base: sanitizedKnowledgeBase,
              status: true,
              created_at: now,
              updated_at: now,
              interactions: 0,
              tags: [],
              is_featured: false,
              is_public: false,
            },
          ]);

          if (avatarError) throw avatarError;

          // Then create the AI Friend with the avatar reference
          const newFriend: Omit<AIFriend, 'id' | 'created_at' | 'updated_at'> =
            {
              name: sanitizedName,
              persona: sanitizedPersona,
              about,
              knowledge_base: sanitizedKnowledgeBase,
              memory: [],
              status: true,
              user_id: userId,
              avatar_id: avatarId,
            };

          const result = await addAIFriend.mutateAsync({
            newAIFriend: newFriend,
            userId,
          });

          if (result && result.id) {
            toast({
              title: 'AI Friend Created',
              description: `${sanitizedName} has been added to your chat group!`,
            });
            setName('');
            setPersona('');
            setAbout('');
            setKnowledgeBase('');
            onAIFriendCreated(result as AIFriend);
            onClose();
          } else {
            throw new Error('Failed to create AI Friend');
          }
        } catch (error) {
          logger.error('Error creating AI Friend', error);
          toast({
            title: 'Error',
            description: 'Failed to create AI Friend. Please try again.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'You can only create up to 5 AI friends',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-lg bg-gradient-to-br from-blue-100 to-white/90 backdrop-blur-xl rounded-2xl border border-blue-200 shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Create AI Friend
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-blue-100 text-blue-600 hover:text-blue-700"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-lg font-medium text-blue-900 mb-2 block">
                    Name (3-12 characters)
                  </label>
                  <div className="relative flex flex-col">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                      <Input
                        value={name}
                        onChange={handleNameChange}
                        maxLength={12}
                        className={`pl-10 bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400 ${
                          errors.name ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter name..."
                      />
                    </div>
                    {errors.name && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-lg font-medium text-blue-900 mb-2 block">
                    Persona (min 6 characters)
                  </label>
                  <Textarea
                    value={persona}
                    onChange={(e) => {
                      setPersona(e.target.value);
                      validateField('persona', e.target.value);
                    }}
                    className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400 min-h-[100px] ${
                      errors.persona ? 'border-red-500' : ''
                    }`}
                    placeholder="Describe personality, interests, communication style..."
                  />
                  {errors.persona && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.persona}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-lg font-medium text-blue-900 mb-2 block">
                    About
                  </label>
                  <Textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400 min-h-[100px]"
                    placeholder="Age, background, life experiences..."
                  />
                </div>

                <div>
                  <label className="text-lg font-medium text-blue-900 mb-2 block">
                    Knowledge Base (min 6 characters)
                  </label>
                  <Textarea
                    value={knowledgeBase}
                    onChange={(e) => {
                      setKnowledgeBase(e.target.value);
                      validateField('knowledgeBase', e.target.value);
                    }}
                    className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400 min-h-[100px] ${
                      errors.knowledgeBase ? 'border-red-500' : ''
                    }`}
                    placeholder="Areas of expertise, special knowledge..."
                  />
                  {errors.knowledgeBase && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.knowledgeBase}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 bg-white/80 border-blue-200 text-blue-600 hover:bg-blue-50 transition-all duration-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFriend}
                    className="flex-[2] bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-300"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create AI Friend
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIFriendCreator;
