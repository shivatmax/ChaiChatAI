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
      <AlertDialogContent className="bg-gradient-to-br from-emerald-50 to-sky-50 max-w-[85vw] sm:max-w-[80vw] md:max-w-xl h-[80vh] sm:h-auto rounded-2xl p-2 sm:p-4 md:p-6 overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm sm:text-base md:text-lg font-bold text-gray-800">
            Avatar Details
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6 my-2 sm:my-3 md:my-4">
          <div className="aspect-square relative rounded-xl overflow-hidden max-h-[150px] sm:max-h-[180px] md:max-h-none">
            <Image
              src={avatar.image_url || '/images/comic/1.png'}
              alt={avatar.name}
              fill
              className="object-cover"
              priority={true}
            />
          </div>

          <div className="space-y-2 sm:space-y-3 md:space-y-4 overflow-y-auto max-h-[200px] sm:max-h-[250px] md:max-h-[300px] pr-2 scrollbar-hide">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">
                {avatar.name}
              </h3>
              <p className="text-xs sm:text-sm text-purple-600 font-medium">
                @{avatar.creator}
              </p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Description
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {avatar.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Tags
              </h4>
              <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                {avatar.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 text-[9px] sm:text-[10px] md:text-xs px-1 sm:px-1.5 md:px-2 py-0.5 rounded-full font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="text-xs sm:text-sm text-gray-500 font-semibold">
              {avatar.interactions.toLocaleString()} interactions
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="w-full text-xs sm:text-sm md:text-base">
            Close
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarViewDialog;
