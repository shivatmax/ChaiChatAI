import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import Image from 'next/image';
// import { X } from 'lucide-react';

interface AvatarViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatar: {
    name: string;
    description: string;
    tags: string[];
    creator: string;
    image_url: string;
    interactions: number;
  };
}

const AvatarViewDialog = ({
  open,
  onOpenChange,
  avatar,
}: AvatarViewDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gradient-to-br from-emerald-50 to-sky-50 max-w-[90vw] md:max-w-2xl rounded-2xl p-6 overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg md:text-xl font-bold text-gray-800">
            Avatar Details
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <div className="aspect-square relative rounded-xl overflow-hidden">
            <Image
              src={avatar.image_url || '/images/comic/1.png'}
              alt={avatar.name}
              fill
              className="object-cover"
              priority={true}
            />
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{avatar.name}</h3>
              <p className="text-sm text-purple-600 font-medium">
                @{avatar.creator}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {avatar.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {avatar.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500 font-semibold">
              {avatar.interactions.toLocaleString()} interactions
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="w-full">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarViewDialog;
