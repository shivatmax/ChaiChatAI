import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '../hooks/use-toast';
import { useAIFriends } from '../integrations/supabase/hooks/useAIFriend';
import { useUser } from '../integrations/supabase/hooks/useUser';
import {
  useConversationHistories,
  useAddConversationHistory,
} from '../integrations/supabase/hooks/useConversationHistory';
import { MessageCircle } from 'lucide-react';
import {
  routeMessage,
  generateAIResponse,
  generateFriendsSummary,
} from '../services/AIService';
import SessionsDropdown from './SessionsDropdown';
import { motion } from 'framer-motion';
import MessageList from './MessageList';
import ChatInputArea from './ChatInputArea';
import { sanitizeInput } from '../utils/sanitize';
import {
  getLastConversations,
  addConversation,
} from '../utils/conversationStorage';
import { supabase } from '../integrations/supabase/supabase';
import { AIFriend } from '../types/AIFriend';
import { ConversationHistory } from '../types/ConversationHistory';
import { FriendsMemory } from '../services/MessageRoutingService';
import { storageWithExpiry } from '../utils/localStorage';
import { logger } from '../utils/logger';

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
  mode?: string;
  webContent?: string;
  avatar_url?: string;
}

interface ChatInterfaceProps {
  selectedSession: string | null;
  onSelectSession: (sessionId: string) => void;
  isGlowing: boolean;
  isSessionsGlowing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = React.memo(
  ({ selectedSession, onSelectSession, isGlowing, isSessionsGlowing }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [typingFriend, setTypingFriend] = useState('');
    const userId = localStorage.getItem('userId');
    const { data: user } = useUser(userId || '');
    const { data: aiFriends } = useAIFriends(userId || '');
    const { data: conversationHistories } = useConversationHistories();
    const addConversationHistory = useAddConversationHistory();
    const { toast } = useToast();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
      if (conversationHistories && selectedSession && aiFriends) {
        const sessionMessages = conversationHistories.filter(
          (history: ConversationHistory) =>
            history.conversation_id === selectedSession
        );
        const formattedMessages = sessionMessages.map(
          (history: ConversationHistory) => {
            const aiFriend = aiFriends.find(
              (friend: AIFriend) => friend.name === history.sender
            );
            return {
              sender: history.sender,
              content: history.message,
              timestamp: new Date(history.created_at),
              avatar_url: aiFriend?.avatar_url,
            };
          }
        );
        setMessages(formattedMessages);
      }
    }, [conversationHistories, selectedSession, aiFriends]);

    useEffect(() => {
      if (messages.length > 0) {
        scrollToBottom();
      }
    }, [messages, scrollToBottom]);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const fetchConversationsFromSupabase = async (
      sessionId: string,
      limit: number
    ): Promise<string[]> => {
      const { data, error } = await supabase
        .from('ConversationHistory')
        .select('message, sender')
        .eq('conversation_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching conversations from Supabase:', error);
        return [];
      }

      return data.map((entry) => `${entry.sender}: ${entry.message}`).reverse();
    };

    const handleSendMessage = useCallback(async () => {
      if (inputMessage.trim() === '') return;
      const sanitizedMessage = sanitizeInput(inputMessage);

      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found. Please log in.',
          variant: 'destructive',
        });
        return;
      }

      const newMessage: Message = {
        sender: user.name,
        content: sanitizedMessage,
        timestamp: new Date(),
        avatar_url: user.avatar_url,
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');
      try {
        if (!aiFriends || aiFriends.length === 0) {
          throw new Error('No AI friends found');
        }

        await addConversationHistory.mutateAsync({
          user_id: user.id,
          ai_friend_id: aiFriends[0].id,
          message: sanitizedMessage,
          sender: user.name,
          conversation_id: selectedSession || '',
        });

        // Add the user's message to the conversation storage
        addConversation(
          selectedSession || '',
          `${user.name}: ${sanitizedMessage}`
        );

        setIsTyping(true);
        const friendsSummary = await generateFriendsSummary(aiFriends, user);
        const lastConversationsForRoute = getLastConversations(
          selectedSession || ''
        );
        const routeData = await routeMessage(
          sanitizedMessage,
          user,
          aiFriends,
          friendsSummary,
          selectedSession || '',
          lastConversationsForRoute,
          fetchConversationsFromSupabase
        );

        if (!routeData) {
          throw new Error('No route data returned');
        }

        const { friends: respondingFriends, mode, webContent } = routeData;

        for (const friendName of respondingFriends || []) {
          console.log('friendName', friendName);
          const aiFriend = aiFriends.find(
            (friend: AIFriend) => friend.name === friendName
          );
          console.log('aiFriend', aiFriend);
          if (aiFriend) {
            setTypingFriend(aiFriend.name);
            const lastConversations = getLastConversations(
              selectedSession || ''
            );
            const aiResponse = await generateAIResponse(
              sanitizedMessage,
              user,
              aiFriend,
              friendsSummary,
              selectedSession || '',
              lastConversations,
              fetchConversationsFromSupabase,
              mode,
              webContent
            );

            const sentences = aiResponse.split(/(?<=[.!?])\s+/);
            for (const sentence of sentences) {
              await new Promise<void>((resolve) => {
                timeoutRef.current = setTimeout(
                  () => {
                    const aiMessage: Message = {
                      sender: aiFriend.name,
                      content: sentence,
                      timestamp: new Date(),
                      avatar_url: aiFriend.avatar_url,
                      mode: mode,
                      webContent: webContent,
                    };
                    setMessages((prevMessages) => [...prevMessages, aiMessage]);
                    resolve();
                  },
                  Math.random() * 2000 + 1000
                );
              });

              await addConversationHistory.mutateAsync({
                user_id: user.id,
                ai_friend_id: aiFriend.id,
                message: sentence,
                sender: aiFriend.name,
                conversation_id: selectedSession || '',
              });

              // Add the AI's response to the conversation storage
              addConversation(
                selectedSession || '',
                `${aiFriend.name}: ${sentence}`
              );

              // Check localStorage first
              const todaysSummaryDone = storageWithExpiry.getItem(
                `todays_summarys_${user.id}`
              );

              if (!todaysSummaryDone) {
                // Only check database if not in localStorage
                const { data: userData } = await supabase
                  .from('User')
                  .select('todaysSummary')
                  .eq('id', user.id)
                  .single();

                if (userData && !userData.todaysSummary) {
                  // Run FriendsMemory
                  await FriendsMemory(
                    aiFriends || [],
                    user.id,
                    selectedSession || '',
                    await generateFriendsSummary(aiFriends, user),
                    fetchConversationsFromSupabase
                  );

                  // Update todaysSummary in database
                  await supabase
                    .from('User')
                    .update({ todaysSummary: true })
                    .eq('id', user.id);

                  // Store in localStorage with 1 hour expiry
                  storageWithExpiry.setItem(
                    `todaysSummary_${user.id}`,
                    true,
                    3600000
                  );
                }
              }
            }
          } else {
            console.log('aiFriend not found', friendName);
          }
        }
        setIsTyping(false);
        setTypingFriend('');
      } catch (error) {
        logger.error('Error in handleSendMessage:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
        setIsTyping(false);
        setTypingFriend('');
      }
    }, [
      inputMessage,
      user,
      aiFriends,
      selectedSession,
      addConversationHistory,
      toast,
    ]);

    const memoizedMessageList = useMemo(
      () => <MessageList messages={messages} user={user} />,
      [messages, user]
    );

    return (
      <div className="flex flex-col h-[calc(100vh-9rem)] lg:h-[calc(100vh-5.5rem)] bg-gradient-to-b from-blue-50 to-white backdrop-blur-lg">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hidden lg:flex flex-col p-4 lg:p-6 bg-gradient-to-r from-blue-200 to-blue-100 backdrop-blur-md border-b border-white/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 15 }}
                className="p-2 rounded-xl bg-white/70 backdrop-blur-sm"
              >
                <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
                ChitChat Buddy
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full mt-0">
            <span className="text-base sm:text-lg font-medium text-blue-700">
              Active Session:
            </span>
            <div className="flex-grow">
              <SessionsDropdown
                selectedSession={selectedSession}
                onSelectSession={onSelectSession}
                isGlowing={isSessionsGlowing}
                isDisabled={isTyping}
              />
            </div>
          </div>
        </motion.div>
        <ScrollArea className="flex-grow p-4 sm:p-6 h-[calc(100vh-14rem)] sm:h-[calc(100vh-18rem)] bg-gradient-to-b from-blue-50/50 to-white/50">
          {memoizedMessageList}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-base sm:text-lg text-blue-600 italic flex items-center justify-center gap-2 mt-4"
            >
              <div className="p-2 rounded-lg bg-blue-100/60 backdrop-blur-sm">
                {typingFriend
                  ? `${typingFriend} is typing... 💭`
                  : 'Waiting... ⏳'}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <div className="mt-auto p-4 bg-gradient-to-t from-blue-50/30 to-transparent backdrop-blur-sm">
          <ChatInputArea
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            isGlowing={isGlowing}
            isDisabled={!selectedSession || isTyping}
            isTyping={isTyping}
          />
        </div>
      </div>
    );
  }
);

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
