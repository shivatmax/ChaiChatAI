import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot } from 'react-icons/fa';
import { Sparkles, Zap, Star } from 'lucide-react';

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => {
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

          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold text-center text-comic-purple"
          >
            Welcome to ChitChat AI 🎉
          </motion.h2>

          {children}

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

export default AuthPageLayout;
