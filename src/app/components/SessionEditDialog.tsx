import React, { useEffect, useState } from 'react';
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
import { Session, SessionType } from '../types/Session';

interface SessionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onUpdate: (updatedSession: Partial<Session>) => void;
}

const SessionEditDialog: React.FC<SessionEditDialogProps> = ({
  isOpen,
  onClose,
  session,
  onUpdate,
}) => {
  const [sessionData, setSessionData] = useState<{
    title: string;
    description?: string;
    charactersAndRelationships?: string;
    teamMembers?: string;
    projectDescription?: string;
  }>({
    title: '',
  });

  useEffect(() => {
    if (session) {
      const parsedDescription =
        typeof session.description === 'string'
          ? JSON.parse(session.description)
          : session.description;

      setSessionData({
        title: session.title,
        description: parsedDescription.description || '',
        charactersAndRelationships:
          parsedDescription.charactersAndRelationships || '',
        teamMembers: parsedDescription.teamMembers || '',
        projectDescription: parsedDescription.projectDescription || '',
      });
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const updates: Partial<Session> = {
      title: sessionData.title,
      description: JSON.stringify({
        description: sessionData.description,
        charactersAndRelationships: sessionData.charactersAndRelationships,
        teamMembers: sessionData.teamMembers,
        projectDescription: sessionData.projectDescription,
      }),
    };

    onUpdate(updates);
  };

  if (!session) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className='sm:max-w-[425px] bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow'>
        <DialogHeader>
          <DialogTitle className='text-4xl font-bold text-comic-purple'>
            Edit Session
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className='space-y-6'
        >
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='title'
                className='block text-xl font-medium text-comic-darkblue'
              >
                Title
              </label>
              <Input
                id='title'
                name='title'
                value={sessionData.title}
                onChange={(e) =>
                  setSessionData({ ...sessionData, title: e.target.value })
                }
                required
                className='mt-1 text-xl p-4 comic-border comic-shadow'
              />
            </div>
            {session.session_type === SessionType.General && (
              <div>
                <label
                  htmlFor='description'
                  className='block text-xl font-medium text-comic-darkblue'
                >
                  Description
                </label>
                <Textarea
                  id='description'
                  name='description'
                  value={sessionData.description}
                  onChange={(e) =>
                    setSessionData({
                      ...sessionData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className='mt-1 text-xl p-4 comic-border comic-shadow'
                />
              </div>
            )}
            {session.session_type === SessionType.StoryMode && (
              <div>
                <label
                  htmlFor='characters_and_relationships'
                  className='block text-xl font-medium text-comic-darkblue'
                >
                  Characters and Relationships
                </label>
                <Textarea
                  id='characters_and_relationships'
                  name='characters_and_relationships'
                  value={sessionData.charactersAndRelationships}
                  onChange={(e) =>
                    setSessionData({
                      ...sessionData,
                      charactersAndRelationships: e.target.value,
                    })
                  }
                  rows={3}
                  className='mt-1 text-xl p-4 comic-border comic-shadow'
                />
              </div>
            )}
            {session.session_type === SessionType.ResearchCreateMode && (
              <>
                <div>
                  <label
                    htmlFor='team_members'
                    className='block text-xl font-medium text-comic-darkblue'
                  >
                    Team Members
                  </label>
                  <Input
                    id='team_members'
                    name='team_members'
                    value={sessionData.teamMembers}
                    onChange={(e) =>
                      setSessionData({
                        ...sessionData,
                        teamMembers: e.target.value,
                      })
                    }
                    className='mt-1 text-xl p-4 comic-border comic-shadow'
                  />
                </div>
                <div>
                  <label
                    htmlFor='project_description'
                    className='block text-xl font-medium text-comic-darkblue'
                  >
                    Project Description
                  </label>
                  <Textarea
                    id='project_description'
                    name='project_description'
                    value={sessionData.projectDescription}
                    onChange={(e) =>
                      setSessionData({
                        ...sessionData,
                        projectDescription: e.target.value,
                      })
                    }
                    rows={3}
                    className='mt-1 text-xl p-4 comic-border comic-shadow'
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className='mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='mr-2 bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow'
            >
              Update Session 🚀
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionEditDialog;
