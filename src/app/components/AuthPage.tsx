import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/supabase';
import { v4 as uuidv4 } from 'uuid';
import LoadingScreen from './LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaUserAstronaut } from 'react-icons/fa';
import { Sparkles, Zap, Star } from 'lucide-react';
import { rateLimiter } from '../utils/rateLimiter';
import { handleAuthError } from '../utils/errorHandling';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onNavigate: (path: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onNavigate }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkExistingSession = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        onNavigate('/chat');
      } else {
        setIsInitializing(false);
      }
    };

    checkExistingSession();
  }, [onNavigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => data.ip);

    if (!rateLimiter.attempt(`${ipAddress}:${email}`)) {
      setLoginError('Too many login attempts. Please try again later.');
      setIsLoading(false);
      return;
    }

    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let userId;

      if (existingUser) {
        if (existingUser.name !== username) {
          setLoginError('Username does not match the existing email.');
          return;
        }
        userId = existingUser.id;
      } else {
        // Create new user
        const newUser = {
          id: uuidv4(),
          name: username,
          email: email,
          persona: 'Friendly and curious',
          about: 'New user',
          knowledge_base: 'General knowledge',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedUser, error: insertError } = await supabase
          .from('User')
          .insert([newUser])
          .select()
          .single();

        if (insertError) throw insertError;
        userId = insertedUser.id;
      }

      localStorage.setItem('userId', userId);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      onAuthSuccess();
      onNavigate('/chat');
    } catch (error) {
      handleAuthError(error);
      setLoginError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-comic-yellow comic-bg overflow-hidden'>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className='w-full max-w-md p-8 space-y-8 bg-white rounded-xl comic-border comic-shadow relative'
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              transition: { repeat: Infinity, duration: 5 },
            }}
            className='absolute -top-16 left-1/2 transform -translate-x-1/2'
          >
            <FaRobot
              size={64}
              className='text-comic-darkblue'
            />
          </motion.div>

          {loginError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='text-comic-red text-lg mb-4 p-2 bg-red-100 border-2 border-comic-red rounded comic-shadow'
            >
              {loginError}
            </motion.div>
          )}

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='text-4xl font-extrabold text-center text-comic-purple'
          >
            Welcome to ChitChat AI 🎉
          </motion.h2>

          <form
            className='mt-8 space-y-6'
            onSubmit={handleAuth}
          >
            <div className='rounded-md shadow-sm -space-y-px'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Input
                  type='text'
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder='Username 👤'
                  className='mb-4 text-xl p-4 comic-border comic-shadow'
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Input
                  type='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Email address 📧'
                  className='mb-4 text-xl p-4 comic-border comic-shadow'
                />
              </motion.div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type='submit'
                className='w-full bg-comic-green hover:bg-comic-blue text-black text-2xl font-bold py-4 px-6 rounded-full comic-border comic-shadow transition duration-300 ease-in-out transform hover:-translate-y-1'
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: 'linear',
                    }}
                  >
                    <FaUserAstronaut className='inline-block mr-2' />
                    Blasting Off... 🚀
                  </motion.div>
                ) : (
                  <>Enter Chitchat !!! 🌟</>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            className='absolute -bottom-8 -left-8'
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Sparkles className='text-comic-purple text-4xl' />
          </motion.div>

          <motion.div
            className='absolute -top-8 -right-8'
            animate={{
              y: [0, -10, 0],
              rotate: [0, 360],
            }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          >
            <Zap className='text-comic-yellow text-4xl' />
          </motion.div>

          <motion.div
            className='absolute bottom-4 right-4'
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Star className='text-comic-red text-3xl' />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
