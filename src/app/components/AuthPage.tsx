/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/supabase';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';
import { Sparkles, Star, Heart, XCircle, Zap } from 'lucide-react';
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
            setLoginError(
              "Oops! Looks like your email and username don't align! Check your email and username again!"
            );
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

      // Create default user data
      await createDefaultUserData(userId);

      localStorage.setItem('userId', userId);
      toast({
        title: 'Success! 🎉',
        description: 'Welcome aboard the cosmic journey! 🚀',
      });

      onAuthSuccess();
      onNavigate('/');
    } catch (error) {
      handleAuthError(error);
      setLoginError(
        "Whoops! 🌈 Our magical authentication unicorn stumbled! Let's try that again! ✨"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultUserData = async (userId: string) => {
    try {
      // Create default UserSettings
      const defaultSettings = {
        id: crypto.randomUUID(),
        user_id: userId,
        email_notifications: false,
        push_notifications: false,
        share_usage_data: false,
        public_profile: false,
        message_history: false,
        auto_reply: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create default AccountSettings
      const defaultAccount = {
        id: crypto.randomUUID(),
        user_id: userId,
        subscription_plan: 'FREE',
        bio: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create default UsageStatistics
      const defaultUsage = {
        id: crypto.randomUUID(),
        user_id: userId,
        total_conversations: 0,
        total_ai_friends: 0,
        avg_session_time: 0,
        conversations_left: 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert all default data in parallel
      await Promise.all([
        supabase.from('UserSettings').insert([defaultSettings]),
        supabase.from('AccountSettings').insert([defaultAccount]),
        supabase.from('UsageStatistics').insert([defaultUsage]),
      ]);
    } catch (error) {
      logger.error('Error creating default user data:', error);
      throw error;
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="bg-white/90 p-10 rounded-full shadow-xl backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <FaRobot className="text-purple-200 w-20 h-20" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27400%27 height=%27200%27 viewBox=%270 0 160 80%27%3E%3Cg fill=%27%23FFF%27 fill-opacity=%270.2%27%3E%3Cpolygon points=%270 10 0 0 10 0%27/%3E%3Cpolygon points=%270 40 0 30 10 30%27/%3E%3Cpolygon points=%270 30 0 20 10 20%27/%3E%3Cpolygon points=%270 70 0 60 10 60%27/%3E%3Cpolygon points=%270 80 0 70 10 70%27/%3E%3Cpolygon points=%2750 80 50 70 60 70%27/%3E%3Cpolygon points=%2710 20 10 10 20 10%27/%3E%3Cpolygon points=%2710 40 10 30 20 30%27/%3E%3Cpolygon points=%2720 10 20 0 30 0%27/%3E%3Cpolygon points=%2710 10 10 0 20 0%27/%3E%3C/g%3E%3C/svg%3E')] bg-repeat"
        />
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="w-full max-w-md p-8 space-y-6 bg-white/90 rounded-3xl border-4 border-white shadow-2xl relative backdrop-blur-xl"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-24 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-gradient-to-r from-blue-400 to-blue-300 p-5 rounded-full shadow-xl">
              <FaRobot size={80} className="text-purple-100" />
            </div>
          </motion.div>

          {loginError && (
            <motion.div
              initial={{ height: 0, opacity: 0, scale: 0.8 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                type: 'spring',
                bounce: 0.5,
              }}
              className="text-purple-600 text-center font-medium p-4 bg-purple-50 rounded-xl border-2 border-purple-200 flex items-center justify-center space-x-2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <XCircle className="h-5 w-5 text-purple-200" />
              </motion.div>
              <span>{loginError}</span>
            </motion.div>
          )}

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-black text-center bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent"
          >
            Let's Begin Your Adventure! 🚀
          </motion.h1>

          <form onSubmit={handleAuth} className="space-y-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="space-y-4"
            >
              <Input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your Cosmic Username 👾"
                className="w-full text-lg p-6 bg-white/50 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Intergalactic Email 🌌"
                className="w-full text-lg p-6 bg-white/50 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              />
            </motion.div>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white text-xl font-bold py-6 px-8 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex items-center justify-center space-x-2"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 180, 360],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Zap className="h-6 w-6 text-blue-200" />
                    </motion.div>
                    <span>Charging Up... ⚡</span>
                  </motion.div>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Start Your Journey</span>
                    <Star className="h-6 w-6 text-blue-200" />
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute -bottom-6 -left-6"
          >
            <Heart className="text-purple-200 h-12 w-12" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-6 -right-6"
          >
            <Sparkles className="text-purple-200 h-12 w-12" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;
