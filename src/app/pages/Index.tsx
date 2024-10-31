import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/supabase';
import { User } from '../types/SupabaseTypes';
import LoadingScreen from '../components/LoadingScreen';
import MainContent from '../components/MainContent';
import ComicBackground from '../components/ComicBackground';
import { motion } from 'framer-motion';
import { createEncryptedUser } from '../utils/encryption';
import { logger } from '../utils/logger';

interface IndexProps {
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

const Index: React.FC<IndexProps> = ({ onLogout, onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
                'Sarcastic comedian with a love for cereal and a hatred for close-talkers. Interests include observational humor, vintage cars, and Superman. Dislikes include puffy shirts, man-hands, and anyone who double-dips.',
              about:
                "I'm a 23-year-old New York native with a knack for turning everyday situations into comedy gold. When I'm not on stage, you can find me in my favorite diner, contemplating the absurdities of life.",
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
        onLogout();
        onNavigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateUser();
  }, [onLogout, onNavigate]);

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
      className="relative"
    >
      <ComicBackground />
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 py-2 relative z-10">
        <MainContent user={user} onLogout={onLogout} />
      </div>
    </motion.div>
  );
};

export default Index;
