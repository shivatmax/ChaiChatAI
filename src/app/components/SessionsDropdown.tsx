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
import { logger } from '../utils/logger';

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
            logger.error('Error deleting session:', error);
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
      <div className="text-sm sm:text-base text-comic-purple font-bold animate-pulse">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-sm sm:text-base text-comic-red font-bold">
        Error loading sessions
      </div>
    );

  const selectedSessionTitle = selectedSession
    ? sessions?.find((s) => s.id === selectedSession)?.title
    : 'Select a session';

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  return (
    <>
      <Select
        value={selectedSession || undefined}
        onValueChange={onSelectSession}
      >
        <SelectTrigger className="w-[80px] sm:w-[250px] bg-gradient-to-r from-blue-400/90 to-sky-400/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-500/90 hover:to-sky-500/90 transition-all duration-300 focus:ring-2 focus:ring-white/40 text-sm font-medium py-2.5 px-4">
          <GlowingComponent isGlowing={isGlowing}>
            <SelectValue>
              <span className="text-white font-medium truncate">
                {truncateText(selectedSessionTitle || '', 5)}
              </span>
            </SelectValue>
          </GlowingComponent>
        </SelectTrigger>
        <SelectContent className="bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-lg rounded-xl border border-blue-200/30 shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
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
              value="no-sessions"
              disabled
              className="text-sm text-blue-400 italic font-medium px-4 py-2"
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
        <AlertDialogContent className="bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-xl rounded-2xl border border-blue-200/30 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-blue-900">
              Delete Session
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-blue-700">
              Are you sure you want to delete the session &quot;
              {truncateText(sessionToDelete?.title || '', 30)}&quot;? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gradient-to-r from-blue-100/90 to-blue-200/90 text-blue-800 hover:from-blue-200/90 hover:to-blue-300/90 transition-all duration-300 rounded-xl border border-blue-300/30 text-sm font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-gradient-to-r from-red-400/90 to-red-500/90 text-white hover:from-red-500/90 hover:to-red-600/90 transition-all duration-300 rounded-xl border border-red-300/30 text-sm font-medium"
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
