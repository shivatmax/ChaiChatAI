import React from 'react';
import { motion } from 'framer-motion';

interface GlowingComponentProps {
  children: React.ReactNode;
  isGlowing: boolean;
  className?: string;
}

const GlowingComponent: React.FC<GlowingComponentProps> = ({
  children,
  isGlowing,
  className,
}) => {
  return (
    <motion.div
      animate={{
        boxShadow: isGlowing
          ? [
              '0 0 0 0px rgba(255, 255, 255, 0)',
              '0 0 20px 10px rgba(255, 255, 0, 0.7)',
              '0 0 30px 15px rgba(255, 165, 0, 0.5)',
            ]
          : '0 0 0 0px rgba(255, 255, 255, 0)',
      }}
      transition={{
        duration: 0.3,
        repeat: isGlowing ? Infinity : 0,
        repeatType: 'reverse',
      }}
      className={`${className} ${isGlowing ? 'z-10 relative' : ''}`}
      style={{
        borderRadius: '10px',
        transition: 'all 1s ease-in-out',
        border: isGlowing ? '3px solid #FF4500' : 'none',
        background: isGlowing
          ? 'linear-gradient(45deg, #FFD700, #FFA500)'
          : 'none',
        transform: isGlowing ? 'rotate(-0.2deg) scale(1.01)' : 'none',
      }}
    >
      <motion.div
        animate={{ rotate: isGlowing ? [0, -2, 2, -2, 0] : 0 }}
        transition={{ duration: 0.5, repeat: isGlowing ? Infinity : 0 }}
      >
        {children}
      </motion.div>
      {isGlowing && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-10px',
            fontSize: '24px',
          }}
        >
          🤖
        </motion.div>
      )}
    </motion.div>
  );
};

export default GlowingComponent;
