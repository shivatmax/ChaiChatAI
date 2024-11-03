import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './ChatInterface';
import AIFriendCreator from './AIFriendCreator';
import AIFriendList from './AIFriendList';
import ConversationInsights from './ConversationInsights';
import UserProfile from './UserProfile';
import { User } from '../types/SupabaseTypes';
import { X, Plus, Menu, Sparkles, Star, Coffee, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { AIFriend } from '../types/AIFriend';
import { getLatestSession } from '../services/SessionService';
import CreateSessionDialog from './CreateSessionDialog';
import LogoutButton from './LogoutButton';
import { motion, AnimatePresence } from 'framer-motion';
import FirstTimeUserExperience from './FirstTimeUserExperience';
import { useAIFriends } from '../integrations/supabase/hooks/useAIFriend';
import GlowingComponent from './GlowingComponent';
import { useQueryClient } from '@tanstack/react-query';
import { handleError } from '../utils/errorHandling';
import { logger } from '../utils/logger';
import SessionsDropdown from './SessionsDropdown';
import DashboardPanel from './Dashboard/pages/sections/DashboardPanel';

const MainContent: React.FC<{ user: User; onLogout: () => void }> = ({
  user,
  onLogout,
}) => {
  const [aiFriends, setAIFriends] = useState<AIFriend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<AIFriend | null>(null);
  const [desktopLeftPanelOpen] = useState(true);
  const [desktopRightPanelOpen] = useState(true);
  const [mobileLeftPanelOpen, setMobileLeftPanelOpen] = useState(false);
  const [mobileRightPanelOpen, setMobileRightPanelOpen] = useState(false);
  const [isAIFriendCreatorOpen, setIsAIFriendCreatorOpen] = useState(false);
  const [isCreateSessionDialogOpen, setIsCreateSessionDialogOpen] =
    useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showFirstTimeExperience, setShowFirstTimeExperience] = useState(false);
  const [glowingComponent, setGlowingComponent] = useState('none');
  const [showDashboard, setShowDashboard] = useState(false);
  const { data: aiFriendsData, isLoading: isLoadingAIFriends } = useAIFriends(
    user.id
  );
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchLatestSession = async () => {
      try {
        const latestSession = await getLatestSession(user.id);
        if (latestSession) {
          setSelectedSession(latestSession.id);
        }
      } catch (error) {
        handleError(error, 'fetchLatestSession');
      }
    };

    fetchLatestSession();
  }, [user.id]);

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        const latestSession = await getLatestSession(user.id);
        const hasNoSessions = !latestSession;
        const hasNoAIFriends = !aiFriendsData || aiFriendsData.length === 0;

        if (hasNoSessions && hasNoAIFriends && !isLoadingAIFriends) {
          setShowFirstTimeExperience(true);
        }
      } catch (error) {
        logger.error('Error checking first-time user status:', error);
      }
    };

    checkFirstTimeUser();
  }, [user.id, aiFriendsData, isLoadingAIFriends]);

  const memoizedAddAIFriend = useCallback(
    (friend: AIFriend) => {
      if (aiFriends.length < 5) {
        setAIFriends([...aiFriends, friend]);
      }
    },
    [aiFriends]
  );

  const toggleMobileLeftPanel = () =>
    setMobileLeftPanelOpen(!mobileLeftPanelOpen);
  const toggleMobileRightPanel = () =>
    setMobileRightPanelOpen(!mobileRightPanelOpen);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSession(sessionId);
  };
  const updateGlowingComponent = (component: string) => {
    setGlowingComponent(component);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="rounded-2xl backdrop-blur-lg bg-white/80 shadow-lg overflow-hidden border border-blue-100"
        >
          <div className="flex h-[calc(100vh-6rem)]">
            {/* Left Sidebar */}
            <AnimatePresence>
              {(desktopLeftPanelOpen || window.innerWidth >= 1280) && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="hidden lg:block w-full lg:w-[28%] bg-gradient-to-b from-blue-50 to-blue-100 backdrop-blur-md border-r border-blue-100"
                >
                  <div className="h-full flex flex-col">
                    <div className="flex justify-center py-2 pt-2">
                      <div className="w-[90%]">
                        <UserProfile
                          user={user}
                          isGlowing={glowingComponent === 'userProfile'}
                        />
                      </div>
                    </div>
                    <div className="flex-grow overflow-hidden flex flex-col">
                      <h2 className="text-3xl font-bold mb-2 text-blue-600 border-b border-blue-100 pb-2 px-4 sticky top-0 backdrop-blur-sm z-10">
                        Friends
                      </h2>
                      <div className="overflow-y-hidden flex-grow">
                        <AIFriendList
                          onSelectFriend={setSelectedFriend}
                          userId={user.id}
                        />
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <GlowingComponent
                        isGlowing={glowingComponent === 'createAIFriend'}
                      >
                        <Button
                          onClick={() => setIsAIFriendCreatorOpen(true)}
                          className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-lg py-3 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                        >
                          <Plus className="mr-2 h-6 w-6" /> Create AI Friend
                        </Button>
                      </GlowingComponent>
                      <GlowingComponent
                        isGlowing={glowingComponent === 'createSession'}
                      >
                        <Button
                          onClick={() => setIsCreateSessionDialogOpen(true)}
                          className="w-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                        >
                          Create Session
                        </Button>
                      </GlowingComponent>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Chat Window */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex-grow flex flex-col w-full lg:w-1/2 bg-gradient-to-b from-white to-blue-50 backdrop-blur-lg"
            >
              <div className="flex items-center justify-between pb-4 pt-2 bg-gradient-to-r from-blue-100 to-blue-200 backdrop-blur-md border-b border-blue-100 lg:hidden">
                <Button
                  onClick={toggleMobileLeftPanel}
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/70 hover:bg-white/80 border-blue-200"
                >
                  <Menu className="h-6 w-6 text-blue-600" />
                </Button>
                <h1 className="text-lg font-bold text-blue-600">
                  ChitChat Buddy
                </h1>
                <div className="space-x-2">
                  <SessionsDropdown
                    selectedSession={selectedSession}
                    onSelectSession={handleSelectSession}
                    isGlowing={glowingComponent === 'activeSessions'}
                  />
                </div>
                <Button
                  onClick={toggleMobileRightPanel}
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white/70 hover:bg-white/80 border-blue-200"
                >
                  <Menu className="h-6 w-6 text-blue-600" />
                </Button>
              </div>
              <ChatInterface
                selectedSession={selectedSession}
                onSelectSession={handleSelectSession}
                isGlowing={glowingComponent === 'chatInterface'}
                isSessionsGlowing={glowingComponent === 'activeSessions'}
              />
            </motion.div>

            {/* Right Sidebar */}
            <AnimatePresence>
              {(desktopRightPanelOpen || window.innerWidth >= 1280) && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="hidden lg:block w-full lg:w-1/4 bg-gradient-to-b from-blue-50 to-blue-100 backdrop-blur-md border-l border-blue-100"
                >
                  <div className="h-[calc(100vh-5.5rem)] p-4 flex flex-col">
                    <div className="flex-grow overflow-hidden rounded-xl h-[calc(100vh-11rem)]">
                      <GlowingComponent
                        isGlowing={glowingComponent === 'conversationInsights'}
                      >
                        <div className="h-full overflow-auto">
                          <ConversationInsights
                            userId={user.id}
                            aiFriendId={selectedFriend?.id || ''}
                            aiFriendName={selectedFriend?.name || ''}
                          />
                        </div>
                      </GlowingComponent>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        onClick={() => setShowDashboard(true)}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-lg py-2 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                      >
                        <Settings className="mr-2 h-5 w-5" /> Settings
                      </Button>
                      <LogoutButton onLogout={onLogout} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Left Sidebar Overlay */}
            <AnimatePresence>
              {mobileLeftPanelOpen && (
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="lg:hidden fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-lg"
                >
                  <div className="h-full overflow-y-auto p-6 flex flex-col">
                    <button
                      onClick={toggleMobileLeftPanel}
                      className="absolute top-4 right-4 p-2 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-600 backdrop-blur-sm transform hover:rotate-90 transition-all duration-300 z-50"
                    >
                      <X size={20} />
                    </button>
                    <UserProfile
                      user={user}
                      isGlowing={glowingComponent === 'userProfile'}
                    />
                    <AIFriendList
                      onSelectFriend={setSelectedFriend}
                      userId={user.id}
                    />
                    <div className="mt-auto space-y-3">
                      <Button
                        onClick={() => setIsAIFriendCreatorOpen(true)}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-lg py-3 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                      >
                        <Plus className="mr-2 h-6 w-6" /> Create AI Friend
                      </Button>
                      <Button
                        onClick={() => setIsCreateSessionDialogOpen(true)}
                        className="w-full bg-gradient-to-r from-blue-300 to-blue-400 hover:from-blue-400 hover:to-blue-500 text-white text-lg py-3 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                      >
                        Create Session
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Right Sidebar Overlay */}
            <AnimatePresence>
              {mobileRightPanelOpen && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  className="lg:hidden fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-lg"
                >
                  <div className="h-[calc(100vh-12rem)] p-6">
                    <button
                      onClick={toggleMobileRightPanel}
                      className="absolute top-4 left-4 p-2 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-600 backdrop-blur-sm transform hover:rotate-90 transition-all duration-300 z-[51]"
                    >
                      <X size={20} />
                    </button>
                    <ConversationInsights
                      userId={user.id}
                      aiFriendId={selectedFriend?.id || ''}
                      aiFriendName={selectedFriend?.name || ''}
                    />
                    <div className="mt-4 space-y-2">
                      <Button
                        onClick={() => setShowDashboard(true)}
                        className="w-full bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-lg py-2 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300"
                      >
                        <Settings className="mr-2 h-5 w-5" /> Settings
                      </Button>
                      <LogoutButton onLogout={onLogout} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {showFirstTimeExperience && (
        <FirstTimeUserExperience
          onComplete={() => {
            setShowFirstTimeExperience(false);
          }}
          updateGlowingComponent={updateGlowingComponent}
        />
      )}

      {showDashboard && (
        <DashboardPanel onClose={() => setShowDashboard(false)} />
      )}

      <AIFriendCreator
        onAIFriendCreated={memoizedAddAIFriend}
        friendCount={aiFriends.length}
        isOpen={isAIFriendCreatorOpen}
        onClose={() => setIsAIFriendCreatorOpen(false)}
        userId={user.id}
      />

      <CreateSessionDialog
        isOpen={isCreateSessionDialogOpen}
        onClose={() => setIsCreateSessionDialogOpen(false)}
        userId={user.id}
        onSessionCreated={(newSession) => {
          setSelectedSession(newSession.id);
          setIsCreateSessionDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ['sessions', user.id] });
        }}
      />

      <motion.div
        className="fixed bottom-6 left-6 z-50"
        animate={{
          rotate: [0, 15, -15, 15, 0],
          scale: [1, 1.2, 1, 1.2, 1],
          transition: { repeat: Infinity, duration: 6 },
        }}
      >
        <Sparkles className="text-blue-300 text-5xl filter drop-shadow-lg" />
      </motion.div>

      <motion.div
        className="fixed top-6 left-6 z-50"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
          transition: { repeat: Infinity, duration: 3 },
        }}
      >
        <Star className="text-blue-200 text-5xl filter drop-shadow-lg" />
      </motion.div>

      <motion.div
        className="fixed top-6 right-6 z-50"
        animate={{
          y: [0, -15, 0],
          x: [0, 5, 0],
          transition: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
        }}
      >
        <Coffee className="text-blue-400 text-5xl filter drop-shadow-lg" />
      </motion.div>
    </motion.div>
  );
};

export default MainContent;
