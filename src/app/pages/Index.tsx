import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/supabase';
import { User } from '../types/User';
import StarryBackground from '../components/StarryBackground';
import LoadingScreen from '../components/LoadingScreen';
import MainContent from '../components/MainContent';

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
            const newUser = {
              id: userId,
              name: 'Jerry Seinfeld',
              persona:
                'Sarcastic comedian with a love for cereal and a hatred for close-talkers. Interests include observational humor, vintage cars, and Superman. Dislikes include puffy shirts, man-hands, and anyone who double-dips.',
              about: `I'm a 23-year-old New York native with a knack for turning everyday situations into comedy gold. When I'm not on stage, you can find me in my favorite diner, contemplating the absurdities of life. I talk in a nasally voice and have a tendency to end my sentences with "What's the deal with that?"`,
              knowledge_base:
                'Extensive repertoire of 90s pop culture references, fluent in English and sarcasm, common phrases include "Not that there\'s anything wrong with that" and "Yada yada yada". Expert on nothing and everything at the same time. Surprisingly knowledgeable about breakfast cereals and their optimal milk-to-cereal ratios.',
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
        console.error('Error fetching or creating user:', error);
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
    <div className='min-h-[90vh] bg-gradient-to-r from-purple-100 to-pink-100 p-2 sm:p-4 relative'>
      <StarryBackground />
      <MainContent
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
};

export default Index;
