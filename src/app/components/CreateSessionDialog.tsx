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
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { createNewSession } from '../services/SessionService';
import { SessionType } from '../types/Session';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Microscope } from 'lucide-react';
import { logger } from '../utils/logger';

interface CreateSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSessionCreated: (newSession: { id: string }) => void;
}

const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
  isOpen,
  onClose,
  userId,
  onSessionCreated,
}) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>(
    SessionType.General
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [charactersAndRelationships, setCharactersAndRelationships] =
    useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sessionData = {
        title,
        description:
          sessionType === SessionType.General
            ? description
            : sessionType === SessionType.StoryMode
              ? charactersAndRelationships
              : projectDescription,
        session_type: sessionType,
      };

      const newSession = await createNewSession(
        userId,
        [],
        sessionType,
        sessionData
      );
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
      onSessionCreated(newSession);
      onClose();
    } catch (error) {
      logger.error('Error creating session:', { error });
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow max-h-[96vh]">
        <DialogHeader>
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-comic-purple">
            Create New Session
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="advanced-mode"
              className="text-lg sm:text-xl font-medium text-comic-darkblue"
            >
              Advanced Mode
            </Label>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
            />
          </div>
          <div>
            <Label
              htmlFor="title"
              className="text-lg sm:text-xl font-medium text-comic-darkblue"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter session title"
              required
              className="mt-1 text-lg sm:text-xl p-3 sm:p-4 comic-border comic-shadow"
            />
          </div>
          <AnimatePresence>
            {isAdvancedMode ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <Label className="text-lg sm:text-xl font-medium text-comic-darkblue">
                    Session Type
                  </Label>
                  <div className="mt-2 space-y-2">
                    <Button
                      type="button"
                      onClick={() => setSessionType(SessionType.StoryMode)}
                      variant={
                        sessionType === SessionType.StoryMode
                          ? 'default'
                          : 'outline'
                      }
                      className={`w-full text-lg sm:text-xl p-3 sm:p-4 ${
                        sessionType === SessionType.StoryMode
                          ? 'bg-comic-green text-black'
                          : 'bg-white text-comic-darkblue'
                      } comic-border comic-shadow transition-colors duration-300`}
                    >
                      <Book className="w-6 h-6 sm:w-8 sm:h-8 mr-2" /> Story Mode
                      📚
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        setSessionType(SessionType.ResearchCreateMode)
                      }
                      variant={
                        sessionType === SessionType.ResearchCreateMode
                          ? 'default'
                          : 'outline'
                      }
                      className={`w-full text-lg sm:text-xl p-3 sm:p-4 ${
                        sessionType === SessionType.ResearchCreateMode
                          ? 'bg-comic-blue text-white'
                          : 'bg-white text-comic-darkblue'
                      } comic-border comic-shadow transition-colors duration-300`}
                    >
                      <Microscope className="w-6 h-6 sm:w-8 sm:h-8 mr-2" />{' '}
                      Research Mode 🔬
                    </Button>
                  </div>
                </div>
                <AnimatePresence>
                  {sessionType === SessionType.StoryMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <Label
                        htmlFor="charactersAndRelationships"
                        className="text-lg sm:text-xl font-medium text-comic-darkblue"
                      >
                        Characters & Relationships
                      </Label>
                      <Textarea
                        id="charactersAndRelationships"
                        value={charactersAndRelationships}
                        onChange={(e) =>
                          setCharactersAndRelationships(e.target.value)
                        }
                        placeholder="Describe characters and their relationships"
                        rows={3}
                        className="mt-1 text-lg sm:text-xl p-3 sm:p-4 comic-border comic-shadow"
                      />
                    </motion.div>
                  )}
                  {sessionType === SessionType.ResearchCreateMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      <div>
                        <Label
                          htmlFor="teamMembers"
                          className="text-lg sm:text-xl font-medium text-comic-darkblue"
                        >
                          Team Members
                        </Label>
                        <Input
                          id="teamMembers"
                          value={teamMembers}
                          onChange={(e) => setTeamMembers(e.target.value)}
                          placeholder="Enter team members"
                          className="mt-1 text-lg sm:text-xl p-3 sm:p-4 comic-border comic-shadow"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="projectDescription"
                          className="text-lg sm:text-xl font-medium text-comic-darkblue"
                        >
                          Project Description
                        </Label>
                        <Textarea
                          id="projectDescription"
                          value={projectDescription}
                          onChange={(e) =>
                            setProjectDescription(e.target.value)
                          }
                          placeholder="Describe the research project"
                          rows={3}
                          className="mt-1 text-lg sm:text-xl p-3 sm:p-4 comic-border comic-shadow"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Label
                  htmlFor="description"
                  className="text-lg sm:text-xl font-medium text-comic-darkblue"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter session description"
                  rows={3}
                  className="mt-1 text-lg sm:text-xl p-3 sm:p-4 comic-border comic-shadow"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <DialogFooter className="flex flex-row justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-1/2 bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2 bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow"
            >
              Create Session 🚀
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionDialog;
