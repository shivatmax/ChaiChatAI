import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from './supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { createEncryptedUser } from '@/app/utils/encryption';
import { logger } from '@/app/utils/logger';

const SupabaseAuthContext = createContext<
  | { session: Session | null; loading: boolean; logout: () => Promise<void> }
  | undefined
>(undefined);

export const SupabaseAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // eslint-disable-next-line react/react-in-jsx-scope
  return <SupabaseAuthProviderInner>{children}</SupabaseAuthProviderInner>;
};

export const SupabaseAuthProviderInner = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          localStorage.setItem('userId', session.user.id);
        } else {
          const storedUserId = localStorage.getItem('userId');
          if (!storedUserId) {
            const encryptedData = createEncryptedUser();
            const newUser = {
              id: uuidv4(),
              ...encryptedData,
              persona: 'Friendly',
              about: 'New user',
              knowledge_base: 'Basic knowledge',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            const { data: insertedUser, error } = await supabase
              .from('User')
              .insert(newUser)
              .select()
              .single();

            if (error) {
              logger.error('Error creating new user:', error);
              throw error;
            }

            if (insertedUser && insertedUser.id) {
              localStorage.setItem('userId', insertedUser.id);
            } else {
              throw new Error('Failed to create new user: No data returned');
            }
          }
        }
      } catch (error) {
        logger.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          localStorage.setItem('userId', session.user.id);
        }
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
      setLoading(false);
    };
  }, [queryClient]);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('userId');
    queryClient.invalidateQueries({ queryKey: ['user'] });
    setLoading(false);
  };

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <SupabaseAuthContext.Provider value={{ session, loading, logout }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  return useContext(SupabaseAuthContext);
};

export const SupabaseAuthUI = () => (
  // eslint-disable-next-line react/react-in-jsx-scope
  <Auth
    supabaseClient={supabase}
    appearance={{ theme: ThemeSupa }}
    theme="default"
    providers={[]}
  />
);
