import { Eye, EyeOff, Star } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { useState } from 'react';
import React from 'react';
import AvatarEditDialog from './AvatarEditDialog';

interface AvatarCardProps {
  id: string;
  name: string;
  creator: string;
  description: string;
  image_url: string;
  interactions: number;
  tags: string[];
  user_id: string;
  public_id?: string;
  is_featured?: boolean;
  isFavorite?: boolean;
  is_public?: boolean;
  className?: string;
  onFavoriteToggle: () => void;
  onPrivacyToggle?: (
    id: string,
    data: {
      name: string;
      description: string;
      tags: string[];
      is_public: boolean;
    }
  ) => void;
  showPrivacyControls?: boolean;
  onUseAsAIFriend?: (id: string) => void;
  isCreator?: boolean;
  isInUse?: boolean;
  hasAIFriend?: boolean;
}

const AvatarCard = ({
  id,
  name,
  creator,
  description,
  image_url,
  interactions,
  tags,
  isFavorite,
  is_public,
  className,
  onFavoriteToggle,
  onPrivacyToggle,
  showPrivacyControls,
  onUseAsAIFriend,
  isCreator,
  isInUse,
  hasAIFriend,
}: AvatarCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditConfirm = (data: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  }) => {
    onPrivacyToggle?.(id, data);
    setShowEditDialog(false);
  };

  const getButtonText = () => {
    if (isInUse) return 'In Use';
    if (isCreator && hasAIFriend) return 'Edit AI Friend';
    return 'Use as AI Friend';
  };

  const getButtonStyle = () => {
    if (isInUse) {
      return 'bg-gray-400 cursor-not-allowed opacity-75';
    }
    return 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600';
  };

  return (
    <>
      <div
        className={cn(
          'group relative bg-white/95 backdrop-blur-md rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] border border-gray-100/50',
          'hover:border-emerald-200/50',
          className
        )}
      >
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={image_url || '/images/comic/1.png'}
            alt={name || 'Avatar'}
            width={500}
            height={375}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            priority={true}
          />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-bold text-base md:text-lg text-gray-800 line-clamp-1 flex-1">
              {name}
            </h3>
            <div className="flex items-center gap-4">
              {showPrivacyControls && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                  className="focus:outline-none hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                >
                  {is_public ? (
                    <Eye className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                  ) : (
                    <EyeOff className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                  )}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle();
                }}
                className="focus:outline-none transition-transform active:scale-95 p-2 rounded-full hover:bg-gray-100"
              >
                <Star
                  className={cn(
                    'w-5 h-5 md:w-6 md:h-6 transition-colors duration-300',
                    isFavorite
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-400 hover:text-yellow-400'
                  )}
                />
              </button>
            </div>
          </div>

          <p className="text-sm md:text-base text-purple-600 font-medium">
            @{creator}
          </p>

          <p className="text-sm md:text-base text-gray-600 line-clamp-2 leading-relaxed">
            {description}
          </p>

          <div className="pt-3 flex flex-col gap-4">
            <div className="text-sm md:text-base text-gray-500 font-semibold">
              {interactions.toLocaleString()} interactions
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 text-xs md:text-sm px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {onUseAsAIFriend && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isInUse) {
                    onUseAsAIFriend?.(id);
                  }
                }}
                disabled={isInUse}
                className={`${getButtonStyle()} text-white text-sm md:text-base px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full font-semibold transform hover:-translate-y-0.5`}
              >
                {getButtonText()}
              </button>
            )}
          </div>
        </div>
      </div>
      <AvatarEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onConfirm={handleEditConfirm}
        initialData={{
          name: name || '',
          description: description || '',
          tags: Array.isArray(tags) ? tags : [],
          is_public: Boolean(is_public),
        }}
      />
    </>
  );
};

export default AvatarCard;
