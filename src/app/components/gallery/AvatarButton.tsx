import { User } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import AvatarLibrary from './AvatarLibrary';

const AvatarButton = ({ userId }: { userId: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="w-12 h-12 rounded-full border-2 border-avatar-primary hover:border-avatar-secondary transition-colors duration-300 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20"
        >
          <User className="w-6 h-6 text-avatar-primary hover:text-avatar-secondary transition-colors duration-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] h-[90vh] max-w-7xl bg-white/95 backdrop-blur-sm border border-avatar-primary/10 shadow-xl">
        <AvatarLibrary userId={userId} />
      </DialogContent>
    </Dialog>
  );
};

export default AvatarButton;
