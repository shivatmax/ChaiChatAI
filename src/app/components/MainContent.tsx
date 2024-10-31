import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './ChatInterface';
import AIFriendCreator from './AIFriendCreator';
import AIFriendList from './AIFriendList';
import ConversationInsights from './ConversationInsights';
import UserProfile from './UserProfile';
import { User } from '../types/SupabaseTypes';
import { X, Plus, Menu, Sparkles, Star, Coffee } from 'lucide-react';
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
        console.error('Error checking first-time user status:', error);
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
      transition={{ duration: 0.5 }}
      className=""
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 py-2 ">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
          className="bg-white rounded-lg comic-border comic-shadow overflow-hidden"
        >
          <div className="flex h-[calc(100vh-6rem)]">
            {/* Left Sidebar */}
            <AnimatePresence>
              {(desktopLeftPanelOpen || window.innerWidth >= 1280) && (
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="hidden lg:block w-full lg:w-1/4 bg-comic-blue border-r-4 border-black"
                >
                  <div className="h-full flex flex-col">
                    <UserProfile
                      user={user}
                      isGlowing={glowingComponent === 'userProfile'}
                    />
                    <div className="flex-grow overflow-hidden flex flex-col">
                      <h2 className="text-2xl font-bold mb-1 text-black border-b-4 border-black pb-1 px-2 sticky top-0 bg-comic-blue z-10">
                        Friends
                      </h2>
                      <div className="overflow-y-hidden flex-grow">
                        <AIFriendList
                          onSelectFriend={setSelectedFriend}
                          userId={user.id}
                        />
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      <GlowingComponent
                        isGlowing={glowingComponent === 'createAIFriend'}
                      >
                        <Button
                          onClick={() => setIsAIFriendCreatorOpen(true)}
                          className="w-full bg-comic-red hover:bg-comic-purple text-white text-lg py-2 comic-border comic-shadow transition-transform transform hover:scale-105"
                        >
                          <Plus className="mr-1 h-5 w-5" /> Create AI Friend
                        </Button>
                      </GlowingComponent>
                      <GlowingComponent
                        isGlowing={glowingComponent === 'createSession'}
                      >
                        <Button
                          onClick={() => setIsCreateSessionDialogOpen(true)}
                          className="w-full bg-comic-green hover:bg-comic-yellow text-black text-lg py-2 comic-border comic-shadow transition-transform transform hover:scale-105"
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
              transition={{ duration: 0.3 }}
              className="flex-grow flex flex-col w-full lg:w-1/2 bg-white"
            >
              <div className="flex justify-between p-1 bg-comic-purple border-b-4 border-black lg:hidden">
                <Button
                  onClick={toggleMobileLeftPanel}
                  variant="outline"
                  size="icon"
                  className="comic-border comic-shadow"
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <Button
                  onClick={toggleMobileRightPanel}
                  variant="outline"
                  size="icon"
                  className="comic-border comic-shadow"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </div>
              <div className="overflow-hidden">
                <ChatInterface
                  selectedSession={selectedSession}
                  onSelectSession={handleSelectSession}
                  isGlowing={glowingComponent === 'chatInterface'}
                  isSessionsGlowing={glowingComponent === 'activeSessions'}
                />
              </div>
            </motion.div>

            {/* Right Sidebar */}
            <AnimatePresence>
              {(desktopRightPanelOpen || window.innerWidth >= 1280) && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="hidden lg:block w-full lg:w-1/4 bg-comic-green border-l-4 border-black"
                >
                  <div className="h-[calc(100vh-8rem)] p-1 flex flex-col">
                    <div className="flex-grow overflow-hidden">
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
                    <div className="mt-1">
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
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="lg:hidden fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-comic-blue"
                >
                  <div className="h-full overflow-y-auto p-4 flex flex-col">
                    <button
                      onClick={toggleMobileLeftPanel}
                      className="absolute top-4 right-4 p-2 rounded-full bg-comic-red text-white hover:bg-comic-purple transition-colors duration-200 comic-border comic-shadow"
                    >
                      <X size={15} />
                    </button>
                    <UserProfile
                      user={user}
                      isGlowing={glowingComponent === 'userProfile'}
                    />
                    <AIFriendList
                      onSelectFriend={setSelectedFriend}
                      userId={user.id}
                    />
                    <div className="mt-auto">
                      <Button
                        onClick={() => setIsAIFriendCreatorOpen(true)}
                        className="mb-2 w-full bg-comic-red hover:bg-comic-purple text-white text-lg py-2 comic-border comic-shadow transition-transform transform hover:scale-105"
                      >
                        <Plus className="mr-2 h-5 w-5" /> Create AI Friend
                      </Button>
                      <Button
                        onClick={() => setIsCreateSessionDialogOpen(true)}
                        className="w-full bg-comic-green hover:bg-comic-yellow text-black text-lg py-2 comic-border comic-shadow transition-transform transform hover:scale-105"
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
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="lg:hidden fixed inset-y-0 right-0 z-50 w-full sm:w-80 bg-comic-green"
                >
                  <div className="h-[calc(100vh-8rem)] p-4">
                    <button
                      onClick={toggleMobileRightPanel}
                      className="absolute top-2 left-2 p-2 rounded-full bg-comic-red text-white hover:bg-comic-purple comic-border comic-shadow"
                    >
                      <X size={15} />
                    </button>
                    <ConversationInsights
                      userId={user.id}
                      aiFriendId={selectedFriend?.id || ''}
                      aiFriendName={selectedFriend?.name || ''}
                    />
                    <LogoutButton onLogout={onLogout} />
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
        className="fixed bottom-4 left-4 z-50"
        animate={{
          rotate: [0, 10, -10, 10, 0],
          transition: { repeat: Infinity, duration: 5 },
        }}
      >
        <Sparkles className="text-comic-yellow text-4xl" />
      </motion.div>

      <motion.div
        className="fixed top-4 left-4 z-50"
        animate={{
          scale: [1, 1.2, 1],
          transition: { repeat: Infinity, duration: 2 },
        }}
      >
        <Star className="text-comic-red text-4xl" />
      </motion.div>

      <motion.div
        className="fixed top-4 right-4 z-50"
        animate={{
          y: [0, -10, 0],
          transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        }}
      >
        <Coffee className="text-comic-green text-4xl" />
      </motion.div>
    </motion.div>
  );
};

export default MainContent;
