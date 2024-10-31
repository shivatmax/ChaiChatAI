import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { AIFriend } from '../types/AIFriend';
import { PlusCircle, X } from 'lucide-react';
import { useAddAIFriend } from '../integrations/supabase/hooks/useAIFriend';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { sanitizeInput } from '../utils/sanitize';

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
  const { toast } = useToast();
  const addAIFriend = useAddAIFriend();
  //
  // eslint-disable-next-line no-undef
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, 12);
    setName(newName);
  };

  const handleCreateFriend = async () => {
    if (name && persona && knowledgeBase) {
      const sanitizedName = sanitizeInput(name);
      const sanitizedPersona = sanitizeInput(persona);
      const sanitizedKnowledgeBase = sanitizeInput(knowledgeBase);

      if (friendCount < 5) {
        const newFriend: Omit<AIFriend, 'id' | 'created_at' | 'updated_at'> = {
          name: sanitizedName,
          persona: sanitizedPersona,
          about,
          knowledge_base: sanitizedKnowledgeBase,
          memory: [],
          status: true,
          user_id: userId,
        };
        try {
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // eslint-disable-next-line no-undef
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow w-full max-w-sm"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-comic-purple">
                  Create AI Friend
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-comic-red hover:text-comic-purple"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="block text-lg font-medium text-comic-darkblue mb-1"
                  >
                    Name (max 12 characters)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-comic-purple text-xl" />
                    <Input
                      id="name"
                      placeholder="Name"
                      value={name}
                      onChange={handleNameChange}
                      maxLength={12}
                      className="w-full pl-10 pr-3 py-2 text-lg bg-white bg-opacity-50 rounded-md comic-border comic-shadow"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="persona"
                    className="block text-lg font-medium text-comic-darkblue mb-1"
                  >
                    Persona (your interests, likes, dislikes, language,..)
                  </label>
                  <Textarea
                    id="persona"
                    placeholder="Persona"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow"
                  />
                </div>
                <div>
                  <label
                    htmlFor="about"
                    className="block text-lg font-medium text-comic-darkblue mb-1"
                  >
                    About (your age, gender, background,...)
                  </label>
                  <Textarea
                    id="about"
                    placeholder="About (comma-separated)"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className="w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow"
                  />
                </div>
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
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    className="w-full px-3 py-2 text-lg bg-white bg-opacity-50 rounded-md min-h-[80px] resize-y comic-border comic-shadow"
                  />
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="w-1/3 bg-comic-red text-white hover:bg-comic-purple comic-border comic-shadow"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateFriend}
                    className="w-2/3 bg-comic-green hover:bg-comic-blue text-black hover:text-white font-bold py-2 px-4 rounded-full comic-border comic-shadow transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" /> Create AI Friend
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
