import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import React from 'react';
interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({
  categories,
  selectedCategory,
  onSelect,
}: CategoryFilterProps) => (
  <div className="flex flex-wrap gap-2 pb-4 overflow-x-auto scrollbar-hide">
    {categories.map((category) => (
      <Badge
        key={category}
        variant={selectedCategory === category ? 'default' : 'secondary'}
        className={cn(
          'cursor-pointer px-3 py-1 lg:px-4 lg:py-2 text-sm whitespace-nowrap transition-all duration-300',
          selectedCategory === category
            ? 'bg-avatar-primary hover:bg-avatar-hover shadow-md'
            : 'bg-white/80 hover:bg-avatar-secondary text-avatar-primary'
        )}
        onClick={() => onSelect(category)}
      >
        {category}
      </Badge>
    ))}
  </div>
);

export default CategoryFilter;
