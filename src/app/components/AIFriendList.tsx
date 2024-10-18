import React, { useState, useCallback } from 'react';
import { AIFriend } from '../types/AIFriend';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { Switch } from './ui/switch';
import AIFriendEditor from './AIFriendEditor';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useAIFriends,
  useUpdateAIFriend,
  useDeleteAIFriend,
} from '../integrations/supabase/hooks/useAIFriend';
import { motion } from 'framer-motion';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
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

interface AIFriendListProps {
  onSelectFriend: (friend: AIFriend) => void;
  userId: string;
}

const AIFriendList: React.FC<AIFriendListProps> = React.memo(
  ({ onSelectFriend, userId }) => {
    const { data: aiFriends, isLoading, error } = useAIFriends(userId);
    const updateAIFriendMutation = useUpdateAIFriend();
    const deleteAIFriendMutation = useDeleteAIFriend();
    const { toast } = useToast();
    const [friendToDelete, setFriendToDelete] = useState<AIFriend | null>(null);

    const toggleFriendStatus = useCallback(
      (friend: AIFriend) => {
        updateAIFriendMutation.mutate({
          updatedAIFriend: { ...friend, status: !friend.status },
          userId,
        });
        invalidateFriendsSummaryCache();
      },
      [updateAIFriendMutation, userId]
    );

    const handleDeleteFriend = useCallback((friend: AIFriend) => {
      setFriendToDelete(friend);
      invalidateFriendsSummaryCache();
    }, []);

    const confirmDeleteFriend = useCallback(async () => {
      if (friendToDelete) {
        try {
          await deleteAIFriendMutation.mutateAsync({
            id: friendToDelete.id,
            userId,
          });
          toast({
            title: 'AI Friend Deleted',
            description: `${friendToDelete.name} has been deleted successfully.`,
            className: 'bg-comic-green text-black font-bold',
          });
          invalidateFriendsSummaryCache();
          setFriendToDelete(null);
        } catch (error) {
          console.error('Error deleting AI Friend:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete AI Friend. Please try again.',
            variant: 'destructive',
            className: 'bg-comic-red text-white font-bold',
          });
        }
      }
    }, [friendToDelete, deleteAIFriendMutation, userId, toast]);

    const truncateName = (name: string, limit: number) => {
      return name.length > limit ? name.substring(0, limit) + '...' : name;
    };

    if (isLoading)
      return (
        <div className='text-center py-4 text-3xl font-bold text-comic-purple'>
          Loading...
        </div>
      );
    if (error)
      return (
        <div className='text-center py-4 text-3xl font-bold text-comic-red'>
          Error: {error.message}
        </div>
      );

    return (
      <ScrollArea className='h-[calc(100vh-500px)] w-full hide-scrollbar'>
        <div className='space-y-2 pt-2 pb-5 pr-2'>
          {aiFriends &&
            aiFriends.map((friend: AIFriend) => (
              <TooltipProvider key={friend.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center p-3 rounded-lg bg-comic-yellow hover:bg-comic-green cursor-pointer transition-all duration-200 comic-border comic-shadow w-11/12 mx-auto`}
                      onClick={() => onSelectFriend(friend)}
                    >
                      <Avatar className='w-12 h-12 flex-shrink-0'>
                        <AvatarFallback
                          className={`bg-comic-purple text-white text-2xl font-bold ${
                            friend.status
                              ? 'ring-4 ring-comic-green ring-opacity-50'
                              : ''
                          }`}
                        >
                          {friend.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-grow min-w-0'>
                        <p className='font-bold text-lg text-comic-darkblue'>
                          {truncateName(friend.name, 8)}
                        </p>
                        <p className='text-sm text-comic-purple truncate'>
                          {friend.persona.split(' ').slice(0, 2).join(' ')}
                        </p>
                      </div>
                      <div className='flex items-center space-x-1 flex-shrink-0'>
                        {friend.status && (
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              backgroundColor: [
                                'rgba(105, 240, 174, 0.5)',
                                'rgba(105, 240, 174, 1)',
                                'rgba(105, 240, 174, 0.5)',
                              ],
                              boxShadow: [
                                '0 0 5px rgba(105, 240, 174, 0.5)',
                                '0 0 20px rgba(105, 240, 174, 1)',
                                '0 0 5px rgba(105, 240, 174, 0.5)',
                              ],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className='w-4 h-4 rounded-full'
                          ></motion.div>
                        )}
                        <Switch
                          checked={friend.status}
                          onCheckedChange={() => toggleFriendStatus(friend)}
                          disabled={updateAIFriendMutation.isPending}
                          className='transition-opacity duration-200'
                        />
                        <AIFriendEditor
                          friend={friend}
                          onAIFriendUpdated={() => {}}
                          userId={userId}
                        >
                          <Pencil className='h-6 w-6 text-comic-darkblue hover:text-comic-purple transition-colors duration-200' />
                        </AIFriendEditor>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFriend(friend);
                          }}
                          className='p-1 hover:bg-comic-red hover:text-white transition-colors duration-200'
                        >
                          <Trash2 className='h-5 w-5' />
                        </Button>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent className='bg-comic-purple text-white p-2 rounded comic-border comic-shadow'>
                    <p className='text-lg font-medium'>{friend.persona}</p>
                    <p className='text-sm text-comic-yellow'>
                      Click to view details
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
        </div>
        <AlertDialog
          open={!!friendToDelete}
          onOpenChange={() => setFriendToDelete(null)}
        >
          <AlertDialogContent className='bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow'>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-3xl font-bold text-comic-purple'>
                Delete AI Friend
              </AlertDialogTitle>
              <AlertDialogDescription className='text-xl text-comic-darkblue'>
                Are you sure you want to delete {friendToDelete?.name}? This
                action cannot be undone. And also all the conversation and
                messages of {friendToDelete?.name} will be deleted from all the
                sessions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow text-xl font-bold'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteFriend}
                className='bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow text-xl font-bold'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ScrollArea>
    );
  }
);

AIFriendList.displayName = 'AIFriendList';

const invalidateFriendsSummaryCache = () => {
  localStorage.removeItem('aiFriendsSummary');
  localStorage.removeItem('cachedAIFriendsData');
};

export default AIFriendList;
