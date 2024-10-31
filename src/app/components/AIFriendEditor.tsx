import React, { useState } from 'react';
import { AIFriend } from '../types/AIFriend';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useUpdateAIFriend } from '../integrations/supabase/hooks/useAIFriend';
import { User, Save } from 'lucide-react';

interface AIFriendEditorProps {
  friend: AIFriend;
  onAIFriendUpdated: () => void;
  children: React.ReactNode;
  userId: string;
}

const AIFriendEditor: React.FC<AIFriendEditorProps> = ({
  friend,
  onAIFriendUpdated,
  children,
  userId,
}) => {
  const [editedFriend, setEditedFriend] = useState(friend);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const updateAIFriend = useUpdateAIFriend();

  const handleSave = async () => {
    try {
      await updateAIFriend.mutateAsync({
        updatedAIFriend: editedFriend,
        userId: userId,
      });
      toast({
        title: 'AI Friend Updated',
        description: `${friend.name}'s profile has been updated!`,
        className: 'bg-comic-green text-black font-bold',
      });
      onAIFriendUpdated();
      setIsOpen(false);
      localStorage.removeItem('aiFriendsSummary');
      localStorage.removeItem('cachedAIFriendsData');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI Friend. Please try again.',
        variant: 'destructive',
        className: 'bg-comic-red text-white font-bold',
      });
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, 12);
    setEditedFriend({ ...editedFriend, name: newName });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-0">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px] max-h-[90vh] overflow-y-auto bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-comic-purple">
            Edit AI Friend
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-3"
        >
          <div>
            <label
              htmlFor="name"
              className="text-base font-medium text-comic-darkblue"
            >
              Name (max 12 characters)
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-comic-purple text-2xl" />
              <Input
                id="name"
                value={editedFriend.name}
                onChange={handleNameChange}
                maxLength={12}
                className="w-full pl-10 pr-3 py-3 text-xl bg-white bg-opacity-50 rounded-md comic-border comic-shadow"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="persona"
              className="text-base font-medium text-comic-darkblue"
            >
              Persona
            </label>
            <Textarea
              id="persona"
              value={editedFriend.persona}
              onChange={(e) =>
                setEditedFriend({ ...editedFriend, persona: e.target.value })
              }
              className="mt-1 text-base p-2 comic-border comic-shadow"
              rows={2}
            />
          </div>
          <div>
            <label
              htmlFor="about"
              className="text-base font-medium text-comic-darkblue"
            >
              About (comma-separated)
            </label>
            <Textarea
              id="about"
              value={editedFriend.about}
              onChange={(e) =>
                setEditedFriend({ ...editedFriend, about: e.target.value })
              }
              className="mt-1 text-base p-2 comic-border comic-shadow"
              rows={2}
            />
          </div>
          <div>
            <label
              htmlFor="knowledgeBase"
              className="text-base font-medium text-comic-darkblue"
            >
              Knowledge Base
            </label>
            <Textarea
              id="knowledgeBase"
              value={editedFriend.knowledge_base}
              onChange={(e) =>
                setEditedFriend({
                  ...editedFriend,
                  knowledge_base: e.target.value,
                })
              }
              className="mt-1 text-base p-2 comic-border comic-shadow"
              rows={2}
            />
          </div>
          <DialogFooter className="flex flex-row justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="w-1/2 bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-1/2 bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow"
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIFriendEditor;
