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
      console.error('Error creating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode ? `Create ${mode} Mode Session` : 'Create New Session'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='title'
                className='block text-sm font-medium text-gray-700'
              >
                Title
              </label>
              <Input
                id='title'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter session title'
                required
              />
            </div>
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-gray-700'
              >
                {mode === 'Story'
                  ? 'Characters & Relationships'
                  : mode === 'Research'
                  ? 'Project Description'
                  : 'Description'}
              </label>
              <Textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  mode === 'Story'
                    ? 'Describe characters and their relationships'
                    : mode === 'Research'
                    ? 'Describe the research project'
                    : 'Enter session description'
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type='submit'>Create Session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionCreationPopup;
