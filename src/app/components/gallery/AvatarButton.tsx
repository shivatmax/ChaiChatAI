import { User, X } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import AvatarLibrary from './AvatarLibrary';

const AvatarButton = ({ userId }: { userId: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white text-lg py-3 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300">
          <User className="w-6 h-6 mr-2" />
          Avatar Gallery
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[90vw] h-[90vh] max-w-7xl bg-white/95 backdrop-blur-sm border border-avatar-primary/10 shadow-xl"
        aria-describedby="avatar-gallery-description"
      >
        <DialogHeader>
          <DialogTitle>Avatar Gallery</DialogTitle>
          <DialogDescription id="avatar-gallery-description">
            Browse and select avatars from your collection
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={() => {
            const closeButton = document.querySelector(
              '[data-state="open"]'
            ) as HTMLElement;
            if (closeButton) closeButton.click();
          }}
          className="absolute top-4 right-4 z-[200] p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <X className="w-6 h-6 text-avatar-primary" />
        </button>
        <AvatarLibrary userId={userId} />
      </DialogContent>
    </Dialog>
  );
};

export default AvatarButton;
