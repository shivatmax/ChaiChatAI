import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useUser } from '../integrations/supabase/hooks/useUser';
import {
  getSessions,
  // deleteSession,
  updateSession,
} from '../services/SessionService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Session } from '../types/Session';
import SessionItem from './SessionItem';
import SessionEditDialog from './SessionEditDialog';
import GlowingComponent from './GlowingComponent';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useDeleteSession } from '../integrations/supabase/hooks/useSession';
import { toast } from '../hooks/use-toast';

interface SessionsDropdownProps {
  selectedSession: string | null;
  onSelectSession: (sessionId: string) => void;
  isGlowing: boolean;
}

const SessionsDropdown: React.FC<SessionsDropdownProps> = ({
  selectedSession,
  onSelectSession,
  isGlowing,
}) => {
  const userId = localStorage.getItem('userId');
  const { data: user } = useUser(userId || '');
  const queryClient = useQueryClient();
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const deleteSessionMutation = useDeleteSession();

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: () => getSessions(user?.id || ''),
    enabled: !!user,
  });

  // const deleteMutation = useMutation({
  //   mutationFn: deleteSession,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] });
  //   },
  // });

  const updateMutation = useMutation({
    mutationFn: (updatedSession: Partial<Session> & { id: string }) =>
      updateSession(updatedSession.id, updatedSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] });
    },
  });

  const handleDelete = (session: Session) => {
    setSessionToDelete(session);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate(
        { id: sessionToDelete.id, userId: user?.id || '' },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] });
            setSessionToDelete(null);
            if (selectedSession === sessionToDelete.id) {
              onSelectSession('');
            }
          },
          onError: (error) => {
            console.error('Error deleting session:', error);
            toast({
              title: 'Error',
              description: 'Failed to delete session. Please try again.',
              variant: 'destructive',
            });
          },
        }
      );
    }
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
  };

  const handleUpdate = (updatedSession: Partial<Session>) => {
    if (editingSession) {
      updateMutation.mutate({ ...editingSession, ...updatedSession });
      setEditingSession(null);
    }
  };

  if (isLoading)
    return (
      <div className='text-sm sm:text-base text-comic-purple font-bold animate-pulse'>
        Loading...
      </div>
    );
  if (error)
    return (
      <div className='text-sm sm:text-base text-comic-red font-bold'>
        Error loading sessions
      </div>
    );

  const selectedSessionTitle = selectedSession
    ? sessions?.find((s) => s.id === selectedSession)?.title
    : 'Select a session';

  return (
    <>
      <Select
        value={selectedSession || undefined}
        onValueChange={onSelectSession}
      >
        <SelectTrigger className='w-full sm:w-[200px] bg-comic-yellow border-2 sm:border-4 border-black rounded-lg sm:rounded-xl shadow-comic hover:bg-comic-green transition-all duration-300 focus:ring-2 focus:ring-comic-purple focus:border-comic-purple text-xs sm:text-sm font-bold py-1 sm:py-2 px-2 sm:px-3'>
          <GlowingComponent isGlowing={isGlowing}>
            <SelectValue>
              <span className='text-comic-darkblue font-bold truncate'>
                {selectedSessionTitle}
              </span>
            </SelectValue>
          </GlowingComponent>
        </SelectTrigger>
        <SelectContent className='bg-comic-yellow rounded-lg sm:rounded-xl shadow-comic border-2 sm:border-4 border-black overflow-hidden max-h-48 sm:max-h-60 overflow-y-auto'>
          {sessions && sessions.length > 0 ? (
            sessions.map((session: Session) => (
              <SessionItem
                key={session.id}
                session={session}
                onSelect={onSelectSession}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <SelectItem
              value='no-sessions'
              disabled
              className='text-xs sm:text-sm text-comic-purple italic font-bold'
            >
              No sessions available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {editingSession && (
        <SessionEditDialog
          isOpen={!!editingSession}
          onClose={() => setEditingSession(null)}
          session={editingSession}
          onUpdate={handleUpdate}
        />
      )}

      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={() => setSessionToDelete(null)}
      >
        <AlertDialogContent className='bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-3xl font-bold text-comic-purple'>
              Delete Session
            </AlertDialogTitle>
            <AlertDialogDescription className='text-xl text-comic-darkblue'>
              Are you sure you want to delete the session &quot;
              {sessionToDelete?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow text-xl font-bold'>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow text-xl font-bold'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SessionsDropdown;
