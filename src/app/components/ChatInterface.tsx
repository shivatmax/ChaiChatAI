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

interface Message {
  sender: string;
  content: string;
  timestamp: Date;
  mode?: string;
  webContent?: string;
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
      if (conversationHistories && selectedSession) {
        const sessionMessages = conversationHistories.filter(
          (history: ConversationHistory) =>
            history.conversation_id === selectedSession
        );
        const formattedMessages = sessionMessages.map(
          (history: ConversationHistory) => ({
            sender: history.sender,
            content: history.message,
            timestamp: new Date(history.created_at),
          })
        );
        setMessages(formattedMessages);
      }
    }, [conversationHistories, selectedSession]);

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
        console.error('Error fetching conversations from Supabase:', error);
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
          lastConversationsForRoute,
          fetchConversationsFromSupabase
        );

        if (!routeData) {
          throw new Error('No route data returned');
        }

        const { friends: respondingFriends, mode, webContent } = routeData;

        for (const friendName of respondingFriends || []) {
          const aiFriend = aiFriends.find(
            (friend: AIFriend) => friend.name === friendName
          );
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
            }
          }
        }
        setIsTyping(false);
        setTypingFriend('');
      } catch (error) {
        console.error('Error in handleSendMessage:', error);
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
      <div className="flex flex-col h-[calc(100vh-9rem)] lg:h-[calc(100vh-5.5rem)] bg-comic-yellow comic-bg">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col p-3 lg:p-4 bg-comic-blue comic-border"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Chat Interface
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 w-full">
            <span className="text-sm sm:text-base font-medium text-white">
              Active Session:
            </span>
            <div className="flex-grow">
              <SessionsDropdown
                selectedSession={selectedSession}
                onSelectSession={onSelectSession}
                isGlowing={isSessionsGlowing}
              />
            </div>
          </div>
        </motion.div>
        <ScrollArea className="flex-grow p-2 sm:p-3 h-[calc(100vh-14rem)] sm:h-[calc(100vh-18rem)] ">
          {memoizedMessageList}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm sm:text-base text-comic-purple italic animate-pulse text-center mt-2"
            >
              {typingFriend
                ? `${typingFriend} is typing... 💭`
                : 'Waiting... ⏳'}
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <div className="mt-auto">
          <ChatInputArea
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            isGlowing={isGlowing}
            isDisabled={!selectedSession}
          />
        </div>
      </div>
    );
  }
);

ChatInterface.displayName = 'ChatInterface';

export default ChatInterface;
