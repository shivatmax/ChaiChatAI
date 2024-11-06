import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="relative w-full lg:w-72">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-avatar-primary h-4 w-4" />
    <Input
      type="text"
      placeholder="Search avatars..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10 pr-4 py-2 w-full bg-white/80 border-avatar-primary/10 rounded-lg focus:ring-avatar-primary focus:border-avatar-primary transition-all duration-300"
    />
  </div>
);

export default SearchBar;
