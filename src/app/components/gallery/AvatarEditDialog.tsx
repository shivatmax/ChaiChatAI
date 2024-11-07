import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';
import { logger } from '@/app/utils/logger';

const AVAILABLE_TAGS = [
  'Anime',
  'Gaming',
  'Education',
  'Lifestyle',
  'Fantasy',
  'Sci-Fi',
  'Professional',
  'Sports',
  'Music',
  'Art',
];

interface AvatarEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  }) => void;
  initialData: {
    name: string;
    description: string;
    tags: string[];
    is_public: boolean;
  };
}

const AvatarEditDialog = ({
  open,
  onOpenChange,
  onConfirm,
  initialData,
}: AvatarEditDialogProps) => {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [tags, setTags] = useState<string[]>(initialData.tags);
  const [isPublic, setIsPublic] = useState(initialData.is_public);

  useEffect(() => {
    if (open) {
      setName(initialData.name);
      setDescription(initialData.description);
      const initialTags = Array.isArray(initialData.tags)
        ? initialData.tags
        : [];
      if (initialTags.length > 2) {
        setTags(initialTags.slice(0, 2));
      } else if (initialTags.length === 0) {
        setTags([AVAILABLE_TAGS[0]]);
      } else {
        setTags(initialTags);
      }
      setIsPublic(Boolean(initialData.is_public));
    }
  }, [initialData, open]);

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      if (tags.length > 1) {
        setTags(tags.filter((t) => t !== tag));
      }
    } else if (tags.length < 2) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = () => {
    logger.debug('Tags:', tags);
    logger.debug('Is Public:', isPublic);
    logger.debug('Name:', name);
    logger.debug('Description:', description);
    const formData = {
      name: name.trim(),
      description: description.trim(),
      tags: tags,
      is_public: isPublic,
    };
    logger.debug('Submitting form data:', formData);
    onConfirm(formData);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white w-[90vw] sm:w-[80vw] md:w-[70vw] lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl transform transition-all duration-300 ease-in-out">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Edit Avatar Details
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-2 sm:space-y-6 my-4 sm:my-6">
          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm sm:text-base font-semibold text-gray-700">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-10 sm:h-12 text-base sm:text-lg rounded-lg sm:rounded-xl border-2 border-purple-100 focus:ring-4 focus:ring-purple-200 focus:border-purple-300 transition-all duration-200"
              placeholder="Enter avatar name"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm sm:text-base font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] sm:min-h-[100px] text-base sm:text-lg p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 border-purple-100 focus:ring-4 focus:ring-purple-200 focus:border-purple-300 transition-all duration-200"
              placeholder="Enter avatar description"
            />
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm sm:text-base font-semibold text-gray-700">
              Tags (1-2 tags required)
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {AVAILABLE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={tags.includes(tag) ? 'default' : 'secondary'}
                  className={`cursor-pointer text-sm sm:text-base py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition-all duration-200 transform hover:scale-105 ${
                    tags.includes(tag)
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border-2 border-purple-100 hover:border-purple-300'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                  {tags.includes(tag) && (
                    <X className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 inline-block" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <label className="text-sm sm:text-base font-semibold text-gray-700">
              Visibility
            </label>
            <div className="flex items-center gap-4 sm:gap-6">
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 focus:ring-purple-400"
                />
                <span className="text-sm sm:text-base text-gray-600 group-hover:text-purple-600 transition-colors">
                  Public
                </span>
              </label>
              <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
                <input
                  type="radio"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 focus:ring-purple-400"
                />
                <span className="text-sm sm:text-base text-gray-600 group-hover:text-purple-600 transition-colors">
                  Private
                </span>
              </label>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
          <AlertDialogCancel className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl bg-gradient-to-r border-gray-200 hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-200 shadow-lg">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
          >
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarEditDialog;
