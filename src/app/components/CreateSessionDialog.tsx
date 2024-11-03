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
      <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-blue-50 to-white backdrop-blur-lg rounded-2xl border border-blue-200 shadow-2xl max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
            Create New Session
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl backdrop-blur-sm">
            <Label
              htmlFor="advanced-mode"
              className="text-xl font-medium text-blue-800"
            >
              Advanced Mode
            </Label>
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              className="data-[state=checked]:bg-gradient-to-r from-blue-400 to-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-xl font-medium text-blue-800"
            >
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter session title"
              required
              className="text-xl p-4 bg-white border border-blue-200 rounded-xl text-blue-800 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <AnimatePresence>
            {isAdvancedMode ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              >
                <div className="space-y-4">
                  <Label className="text-xl font-medium text-blue-800">
                    Session Type
                  </Label>
                  <div className="grid gap-4">
                    <Button
                      type="button"
                      onClick={() => setSessionType(SessionType.StoryMode)}
                      variant={
                        sessionType === SessionType.StoryMode
                          ? 'default'
                          : 'outline'
                      }
                      className={`group relative overflow-hidden p-6 ${
                        sessionType === SessionType.StoryMode
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                          : 'bg-blue-50 hover:bg-blue-100'
                      } rounded-xl border border-blue-200 transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center">
                        <Book className="w-8 h-8 mr-3" />
                        <span className="text-xl font-bold">Story Mode 📚</span>
                      </div>
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
                      className={`group relative overflow-hidden p-6 ${
                        sessionType === SessionType.ResearchCreateMode
                          ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                          : 'bg-blue-50 hover:bg-blue-100'
                      } rounded-xl border border-blue-200 transition-all duration-300`}
                    >
                      <div className="flex items-center justify-center">
                        <Microscope className="w-8 h-8 mr-3" />
                        <span className="text-xl font-bold">
                          Research Mode 🔬
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
                <AnimatePresence>
                  {sessionType === SessionType.StoryMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 20,
                      }}
                      className="mt-6"
                    >
                      <Label
                        htmlFor="charactersAndRelationships"
                        className="text-xl font-medium text-blue-800"
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
                        rows={4}
                        className="mt-2 text-xl p-4 bg-white border border-blue-200 rounded-xl text-blue-800 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400"
                      />
                    </motion.div>
                  )}
                  {sessionType === SessionType.ResearchCreateMode && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{
                        type: 'spring',
                        stiffness: 120,
                        damping: 20,
                      }}
                      className="mt-6 space-y-4"
                    >
                      <div>
                        <Label
                          htmlFor="teamMembers"
                          className="text-xl font-medium text-blue-800"
                        >
                          Team Members
                        </Label>
                        <Input
                          id="teamMembers"
                          value={teamMembers}
                          onChange={(e) => setTeamMembers(e.target.value)}
                          placeholder="Enter team members"
                          className="mt-2 text-xl p-4 bg-white border border-blue-200 rounded-xl text-blue-800 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="projectDescription"
                          className="text-xl font-medium text-blue-800"
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
                          rows={4}
                          className="mt-2 text-xl p-4 bg-white border border-blue-200 rounded-xl text-blue-800 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400"
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
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              >
                <Label
                  htmlFor="description"
                  className="text-xl font-medium text-blue-800"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter session description"
                  rows={4}
                  className="mt-2 text-xl p-4 bg-white border border-blue-200 rounded-xl text-blue-800 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-400"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <DialogFooter className="flex gap-4 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-lg py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
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
