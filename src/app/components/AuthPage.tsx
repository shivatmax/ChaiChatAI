/* eslint-disable */
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
// import { rateLimiter } from '../utils/rateLimiter';
import { handleAuthError } from '../utils/errorHandling';
import {
  hashEmail,
  decrypt,
  encrypt,
  generateSalt,
  generateEncryptionKey,
} from '../utils/encryption';
import { logger } from '../utils/logger';

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
        onNavigate('/');
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

    try {
      const sanitizedEmail = email.toLowerCase().trim();
      const emailHash = hashEmail(sanitizedEmail);

      const { data: existingUser, error: fetchError } = await supabase
        .from('User')
        .select('*')
        .eq('email_hash', emailHash)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let userId;

      if (existingUser) {
        try {
          const key = Buffer.from(existingUser.encryption_key, 'hex');
          logger.debug('Encryption details:', {
            storedKey: existingUser.encryption_key,
            iv: existingUser.iv,
            tag: existingUser.tag,
            encryptedName: existingUser.encrypted_name,
          });

          const decryptedUsername = decrypt(
            existingUser.encrypted_name,
            key,
            existingUser.iv,
            existingUser.tag
          );

          logger.debug('Decryption result:', {
            decryptedUsername,
            providedUsername: username,
            match: decryptedUsername.toLowerCase() === username.toLowerCase(),
          });

          if (decryptedUsername.toLowerCase() !== username.toLowerCase()) {
            setLoginError('Username does not match the existing email.');
            return;
          }
          userId = existingUser.id;
        } catch (error) {
          logger.error('Decryption failed:', error);
          throw new Error('Failed to decrypt user data');
        }
      } else {
        // Create new user with encryption
        const salt = generateSalt();
        const encryptionKey = generateEncryptionKey(
          sanitizedEmail + username,
          salt
        );
        const encryptedEmail = encrypt(sanitizedEmail, encryptionKey);
        const encryptedUsername = encrypt(username, encryptionKey);

        // Store the encryption key in hex format
        const keyHex = encryptionKey.toString('hex');

        const newUser = {
          id: uuidv4(),
          encrypted_name: encryptedUsername.encryptedData,
          encrypted_email: encryptedEmail.encryptedData,
          email_hash: emailHash,
          encryption_salt: salt,
          encryption_key: keyHex,
          iv: encryptedUsername.iv,
          tag: encryptedUsername.tag,
          persona: 'Energetic and tech-savvy',
          about: '23-year-old guy who loves gaming and coding',
          knowledge_base: 'Extensive knowledge of latest tech trends',
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
      onNavigate('/');
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
    <div className="flex items-center justify-center min-h-screen bg-comic-yellow comic-bg overflow-hidden">
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl comic-border comic-shadow relative"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              transition: { repeat: Infinity, duration: 5 },
            }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2"
          >
            <FaRobot size={64} className="text-comic-darkblue" />
          </motion.div>

          {loginError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-comic-red text-lg mb-4 p-2 bg-red-100 border-2 border-comic-red rounded comic-shadow"
            >
              {loginError}
            </motion.div>
          )}

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-center text-comic-purple"
          >
            Welcome to ChitChat AI 🎉
          </motion.h2>

          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="rounded-md shadow-sm space-y-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center"
              >
                <Input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username 👤"
                  className="w-full text-xl p-4 comic-border comic-shadow"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center"
              >
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address 📧"
                  className="w-full text-xl p-4 comic-border comic-shadow"
                />
              </motion.div>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-full bg-comic-green hover:bg-comic-blue text-black text-2xl font-bold py-4 px-6 rounded-full comic-border comic-shadow transition duration-300 ease-in-out transform hover:-translate-y-1"
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
                    <FaUserAstronaut className="inline-block mr-2" />
                    Blasting Off... 🚀
                  </motion.div>
                ) : (
                  <>Enter Chitchat !!! 🌟</>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div
            className="absolute -bottom-8 -left-8"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Sparkles className="text-comic-purple text-4xl" />
          </motion.div>

          <motion.div
            className="absolute -top-8 -right-8"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 360],
            }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
          >
            <Zap className="text-comic-yellow text-4xl" />
          </motion.div>

          <motion.div
            className="absolute bottom-4 right-4"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Star className="text-comic-red text-3xl" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
