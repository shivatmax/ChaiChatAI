import { Settings, User, BarChart, Star } from 'lucide-react';
import React from 'react';

type Tab = 'usage' | 'account' | 'settings' | 'beta';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Navbar = ({ activeTab, onTabChange }: NavbarProps) => {
  return (
    <nav className="w-full md:w-64 bg-gray-50 p-4 h-full">
      <div className="space-y-2">
        <button
          className={`nav-item w-full ${activeTab === 'usage' ? 'active' : ''}`}
          onClick={() => onTabChange('usage')}
        >
          <BarChart size={20} />
          Usage
        </button>
        <button
          className={`nav-item w-full ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => onTabChange('account')}
        >
          <User size={20} />
          Account
        </button>
        <button
          className={`nav-item w-full ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <Settings size={20} />
          Settings
        </button>
        <button
          className={`nav-item w-full ${activeTab === 'beta' ? 'active' : ''}`}
          onClick={() => onTabChange('beta')}
        >
          <Star size={20} />
          Beta Features
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
