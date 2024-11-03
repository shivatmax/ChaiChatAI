import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '../hooks/use-toast';
import { createNewSession } from '../services/SessionService';
import { SessionType } from '../types/Session';
import { logger } from '../utils/logger';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SessionCreationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'Story' | 'Research' | null;
  userId: string;
  onSessionCreated: () => void;
}

const SessionCreationPopup: React.FC<SessionCreationPopupProps> = ({
  isOpen,
  onClose,
  mode,
  userId,
  onSessionCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionType =
        mode === 'Story'
          ? SessionType.StoryMode
          : mode === 'Research'
            ? SessionType.ResearchCreateMode
            : SessionType.General;

      const sessionData = {
        title,
        description,
        charactersAndRelationships: mode === 'Story' ? description : undefined,
        teamMembers: mode === 'Research' ? '' : undefined,
        projectDescription: mode === 'Research' ? description : undefined,
        session_type: sessionType,
      };

      await createNewSession(userId, [], sessionType, sessionData);
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
      onSessionCreated();
      onClose();
    } catch (error) {
      logger.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-w-[90%] w-full bg-gradient-to-br from-blue-100/90 to-white/90 backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DialogHeader className="relative">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-900 text-center pb-4">
              {mode ? `Create ${mode} Mode Session` : 'Create New Session'}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  rotate: [0, 15, -15, 15, 0],
                  scale: [1, 1.2, 1, 1.2, 1],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Sparkles className="h-6 w-6 text-blue-400" />
              </motion.div>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label
                htmlFor="title"
                className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter session title"
                required
                className="bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
              >
                {mode === 'Story'
                  ? 'Characters & Relationships'
                  : mode === 'Research'
                    ? 'Project Description'
                    : 'Description'}
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  mode === 'Story'
                    ? 'Describe characters and their relationships'
                    : mode === 'Research'
                      ? 'Describe the research project'
                      : 'Enter session description'
                }
                rows={3}
                className="bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <DialogFooter className="mt-6 sm:mt-8 space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto text-sm sm:text-base bg-white hover:bg-blue-50 text-blue-900 border-blue-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto text-sm sm:text-base bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transform hover:scale-105 transition-all duration-300"
              >
                Create Session
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionCreationPopup;
