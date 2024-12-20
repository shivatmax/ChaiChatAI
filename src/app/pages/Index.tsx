import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../integrations/supabase/supabase';
import { User } from '../types/SupabaseTypes';
import LoadingScreen from '../components/LoadingScreen';
import MainContent from '../components/MainContent';
import { motion } from 'framer-motion';
import { createEncryptedUser } from '../utils/encryption';
import { logger } from '../utils/logger';
import ComicBackground from '../components/ComicBackground';

interface IndexProps {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const Index: React.FC<IndexProps> = ({ onLogout, onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Add timeout to handle stuck loading states
    loadingTimeoutRef.current = setTimeout(() => {
      if (loading) {
        // Clear localStorage and redirect to login if loading takes too long
        localStorage.clear();
        onLogout();
        onNavigate('/');
      }
    }, 4000); // 10 second timeout

    const fetchOrCreateUser = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        onLogout();
        onNavigate('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('User')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // User not found, create a new one
            const encryptedData = createEncryptedUser(
              'Jerry Seinfeld',
              'anonymous@user.com'
            );
            const newUser = {
              id: userId,
              ...encryptedData,
              persona:
                'Sarcastic comedian with a love for cereal and a hatred for close-talkers.',
              about:
                "I'm a 23-year-old New York native with a knack for turning everyday situations into comedy gold.",
              knowledge_base:
                'Extensive repertoire of 90s pop culture references, fluent in English and sarcasm.',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { data: createdUser, error: createError } = await supabase
              .from('User')
              .insert([newUser])
              .select()
              .single();

            if (createError) {
              throw createError;
            }

            setUser(createdUser);
          } else {
            throw error;
          }
        } else {
          setUser(data);
        }
      } catch (error) {
        logger.error('Error fetching or creating user:', error);
        // Clear localStorage on error
        localStorage.clear();
        onLogout();
        onNavigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateUser();

    // Cleanup timeout on unmount or when loading completes
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading, onLogout, onNavigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen w-full bg-gradient-to-b from-blue-50 to-blue-100"
    >
      <div className="max-w-[75rem] mx-auto px-4 py-4 relative z-10 h-[calc(100vh-2rem)]">
        <ComicBackground />
        <MainContent user={user} onLogout={onLogout} />
      </div>
    </motion.div>
  );
};

export default Index;
