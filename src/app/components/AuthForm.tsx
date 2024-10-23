import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/supabase';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import { FaUserAstronaut } from 'react-icons/fa';
import { rateLimiter } from '../utils/rateLimiter';
import { sanitizeInput } from '../utils/sanitize';
import { validateEmail } from '../utils/email_valid';

interface AuthFormProps {
  onAuthSuccess: () => void;
  onEmailValidation?: (email: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onAuthSuccess,
  // onEmailValidation,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);

    if (!(await validateEmail(sanitizedEmail))) {
      console.log('Invalid email address. Please enter a valid email.');
      setLoginError('Invalid email address. Please enter a valid email.');
      return;
    }

    setIsLoading(true);
    setLoginError(null);

    const ipAddress = await fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => data.ip);

    if (!rateLimiter.attempt(`${ipAddress}:${sanitizedEmail}`)) {
      setLoginError('Too many login attempts. Please try again later.');
      setIsLoading(false);
      return;
    }

    // // Validate email
    // const isEmailValid = await validateEmail(sanitizedEmail);
    // if (!isEmailValid) {
    //   setLoginError('Invalid email address. Please enter a valid email.');
    //   setIsLoading(false);
    //   return;
    // }

    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('User')
        .select('*')
        .eq('email', sanitizedEmail)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let userId;

      if (existingUser) {
        if (existingUser.name !== sanitizedUsername) {
          setLoginError('Username does not match the existing email.');
          return;
        }
        userId = existingUser.id;
      } else if (!(await validateEmail(sanitizedEmail))) {
        setLoginError('Invalid email address. Please enter a valid email.');
        return;
      } else {
        // Create new user
        const newUser = {
          id: uuidv4(),
          name: sanitizedUsername,
          email: sanitizedEmail,
          persona: 'Enthusiastic and Funny, loves to chat and like ice cream',
          about: '21 year old, loves to eat and play games',
          knowledge_base:
            'Knows a lot about AI, loves to talk about it and learn new things',
          avatar_url: null, // Placeholder for future avatar implementation
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
        // console.log('New user created:', userId);
      }

      localStorage.setItem('userId', userId);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      onAuthSuccess();
      navigate('/');
    } catch (error) {
      console.error('Error during authentication:', error);
      setLoginError(
        'An error occurred during authentication. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleEmailChange');
    const email = e.target.value;
    console.log('email', email);

    if (!(await validateEmail(email))) {
      console.log('Invalid email address. Please enter a valid email.');
      setLoginError('Invalid email address. Please enter a valid email.');
      return;
    }
    console.log('Valid email address. Setting email.');
    setEmail(email);
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleAuth}>
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

      <div className="rounded-md shadow-sm -space-y-px">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username 👤"
            className="mb-4 text-xl p-4 comic-border comic-shadow"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => handleEmailChange(e)}
            placeholder="Email address 📧"
            className="mb-4 text-xl p-4 comic-border comic-shadow"
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
  );
};

export default AuthForm;
