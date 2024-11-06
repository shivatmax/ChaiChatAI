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
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

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

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    if (field === 'title' && value.length < 3) {
      newErrors[field] = 'Title must be at least 3 characters long';
    } else if (field !== 'title' && value.length < 6) {
      newErrors[field] = 'Must be at least 6 characters long';
    } else {
      delete newErrors[field];
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    // Validate all fields before submission
    validateField('title', sessionData.title);
    if (sessionData.description)
      validateField('description', sessionData.description);
    if (sessionData.charactersAndRelationships)
      validateField(
        'charactersAndRelationships',
        sessionData.charactersAndRelationships
      );
    if (sessionData.teamMembers)
      validateField('teamMembers', sessionData.teamMembers);
    if (sessionData.projectDescription)
      validateField('projectDescription', sessionData.projectDescription);

    // Check if any field has validation errors
    if (Object.keys(errors).length > 0) {
      toast({
        title: 'Validation Error',
        description: 'Please check all fields meet minimum length requirements',
        variant: 'destructive',
      });
      return;
    }

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-w-[90%] w-full bg-gradient-to-br from-blue-100/90 to-white/90 backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DialogHeader className="relative">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-blue-900 text-center pb-4">
              Edit Session
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
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
                >
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={sessionData.title}
                  onChange={(e) => {
                    setSessionData({ ...sessionData, title: e.target.value });
                    validateField('title', e.target.value);
                  }}
                  required
                  className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400 ${
                    errors.title ? 'border-red-500' : ''
                  }`}
                />
                {errors.title && (
                  <div className="flex items-center mt-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.title}
                  </div>
                )}
              </div>
              {session.session_type === SessionType.General && (
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={sessionData.description}
                    onChange={(e) => {
                      setSessionData({
                        ...sessionData,
                        description: e.target.value,
                      });
                      validateField('description', e.target.value);
                    }}
                    rows={3}
                    className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.description && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.description}
                    </div>
                  )}
                </div>
              )}
              {session.session_type === SessionType.StoryMode && (
                <div>
                  <label
                    htmlFor="characters_and_relationships"
                    className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
                  >
                    Characters and Relationships
                  </label>
                  <Textarea
                    id="characters_and_relationships"
                    name="characters_and_relationships"
                    value={sessionData.charactersAndRelationships}
                    onChange={(e) => {
                      setSessionData({
                        ...sessionData,
                        charactersAndRelationships: e.target.value,
                      });
                      validateField(
                        'charactersAndRelationships',
                        e.target.value
                      );
                    }}
                    rows={3}
                    className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400 ${
                      errors.charactersAndRelationships ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.charactersAndRelationships && (
                    <div className="flex items-center mt-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.charactersAndRelationships}
                    </div>
                  )}
                </div>
              )}
              {session.session_type === SessionType.ResearchCreateMode && (
                <>
                  <div>
                    <label
                      htmlFor="team_members"
                      className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
                    >
                      Team Members
                    </label>
                    <Input
                      id="team_members"
                      name="team_members"
                      value={sessionData.teamMembers}
                      onChange={(e) => {
                        setSessionData({
                          ...sessionData,
                          teamMembers: e.target.value,
                        });
                        validateField('teamMembers', e.target.value);
                      }}
                      className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400 ${
                        errors.teamMembers ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.teamMembers && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.teamMembers}
                      </div>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="project_description"
                      className="block text-sm sm:text-base font-medium text-blue-900 mb-2"
                    >
                      Project Description
                    </label>
                    <Textarea
                      id="project_description"
                      name="project_description"
                      value={sessionData.projectDescription}
                      onChange={(e) => {
                        setSessionData({
                          ...sessionData,
                          projectDescription: e.target.value,
                        });
                        validateField('projectDescription', e.target.value);
                      }}
                      rows={3}
                      className={`bg-white/80 border-blue-200 text-blue-900 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400 ${
                        errors.projectDescription ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.projectDescription && (
                      <div className="flex items-center mt-1 text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.projectDescription}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <DialogFooter className="mt-6 sm:mt-8 space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto text-sm sm:text-base bg-white/80 hover:bg-blue-50 text-blue-900 border-blue-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto text-sm sm:text-base bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white transform hover:scale-105 transition-all duration-300"
              >
                Update Session
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionEditDialog;
