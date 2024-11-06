import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import React, { useState } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full lg:w-72 group">
      <Search
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 z-10 ${
          isFocused ? 'text-avatar-hover' : 'text-avatar-primary'
        }`}
      />
      <Input
        type="text"
        placeholder="Search avatars..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          pl-10 pr-4 py-2 w-full
          bg-white/90 backdrop-blur-sm
          border-avatar-primary/10 
          rounded-lg
          shadow-sm
          placeholder:text-avatar-primary/50
          transition-all duration-300
          focus:ring-2 focus:ring-avatar-hover/30
          focus:border-avatar-hover
          focus:bg-white
          focus:shadow-avatar-hover/10
          group-hover:border-avatar-hover/30
          group-hover:shadow-avatar-hover/5
        `}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-avatar-primary/40 hover:text-avatar-hover transition-colors duration-200"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchBar;
