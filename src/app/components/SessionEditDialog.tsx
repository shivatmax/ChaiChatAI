import React from 'react';
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const sessionData: {
      title: string;
      [key: string]: string | null;
    } = {
      title: formData.get('title') as string,
    };

    if (session.session_type === SessionType.StoryMode) {
      sessionData.charactersAndRelationships = formData.get(
        'characters_and_relationships'
      ) as string;
    } else if (session.session_type === SessionType.ResearchCreateMode) {
      sessionData.teamMembers = formData.get('team_members') as string;
      sessionData.projectDescription = formData.get(
        'project_description'
      ) as string;
    } else {
      sessionData.description = formData.get('description') as string;
    }

    const updates: Partial<Session> = {
      title: sessionData.title,
      description: JSON.stringify(sessionData),
    };

    onUpdate(updates);
  };

  if (!session) return null;

  const getDescriptionValue = (key: string): string => {
    if (
      typeof session.description === 'object' &&
      session.description !== null
    ) {
      return (
        ((session.description as Record<string, unknown>)[key] as string) || ''
      );
    }
    return typeof session.description === 'string' ? session.description : '';
  };

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
                defaultValue={session.title}
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
                  defaultValue={getDescriptionValue('description')}
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
                  defaultValue={getDescriptionValue(
                    'charactersAndRelationships'
                  )}
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
                    defaultValue={getDescriptionValue('teamMembers')}
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
                    defaultValue={getDescriptionValue('projectDescription')}
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
