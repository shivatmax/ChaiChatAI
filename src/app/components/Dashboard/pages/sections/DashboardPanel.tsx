import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Usage from './../Usage';
import Account from './Account';
import Settings from './../Settings';
import BetaFeatures from './BetaFeatures';
import { ArrowLeft, Menu } from 'lucide-react';
import { ScrollArea } from '../../../ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '../../../ui/sheet';
import React from 'react';
import { useUserData } from '../../../../integrations/supabase/hooks/useUserData';
import { updateUsageStats } from '../../../../integrations/supabase/hooks/useUpdateUsageStats';
import { logger } from '@/app/utils/logger';

type Tab = 'usage' | 'account' | 'settings' | 'beta';

const DashboardPanel = ({
  onClose,
  currentUserId,
}: {
  onClose: () => void;
  currentUserId: string;
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('usage');
  const { data: userData, isLoading, error } = useUserData(currentUserId);

  logger.debug('DashboardPanel - userData:', userData);
  logger.debug('DashboardPanel - isLoading:', isLoading);
  logger.debug('DashboardPanel - error:', error);
  logger.debug('DashboardPanel - currentUserId:', currentUserId);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key && event.key.toLowerCase() === 'escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const updateStats = async () => {
      if (currentUserId) {
        await updateUsageStats(currentUserId);
      }
    };
    updateStats();
  }, [currentUserId]);

  const renderContent = () => {
    if (error) {
      return (
        <div className="p-4 text-red-600">
          Error loading dashboard:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      );
    }

    if (!userData?.user?.id) {
      return null;
    }

    switch (activeTab) {
      case 'usage':
        return <Usage currentUserId={userData.user.id} />;
      case 'account':
        return <Account currentUserId={userData.user.id} />;
      case 'settings':
        return <Settings currentUserId={userData.user.id} />;
      case 'beta':
        return <BetaFeatures currentUserId={userData.user.id} />;
      default:
        return null;
    }
  };

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>
      </SheetTrigger>
      <SheetContent
        side="top"
        className="p-0 h-auto max-h-[300px] w-full animate-slide-down border-b"
      >
        <div className="h-full bg-white">
          <Navbar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              const trigger = document.querySelector(
                '[data-state="open"]'
              ) as HTMLElement;
              if (trigger) trigger.click();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center">
      <div className="dashboard-panel flex flex-col md:flex-row w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-[1400px] md:m-4">
        <div className="hidden md:block">
          <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <ScrollArea className="flex-1 h-full">
          <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 md:p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onClose}
                className="flex items-center gap-2.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-100/80 rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-x-0.5 hover:shadow-sm group"
              >
                <ArrowLeft
                  size={20}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                <span className="font-medium">Back</span>
              </button>
              <MobileNav />
            </div>
          </div>
          <div className="p-4 md:p-6">{renderContent()}</div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashboardPanel;
