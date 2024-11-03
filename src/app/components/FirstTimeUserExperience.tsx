import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface Step {
  title: string;
  content: string;
  emoji: string;
  position: {
    sm: { x: number; y: number };
    md: { x: number; y: number };
    lg: { x: number; y: number };
  };
  targetComponent: string;
}

const steps: Step[] = [
  {
    title: 'Welcome to ChitChat AI!',
    content: "Let's walk you through the main features of our app.",
    emoji: '👋',
    position: {
      sm: { x: 1, y: 1 },
      md: { x: 1, y: 1 },
      lg: { x: 1, y: 1 },
    },
    targetComponent: 'none',
  },
  {
    title: 'Create AI Friends',
    content:
      'Start by creating your own AI friends. Each one can have a unique personality!',
    emoji: '🤖',
    position: {
      sm: { x: 0, y: 0 },
      md: { x: -20, y: 50 },
      lg: { x: -20, y: 60 },
    },
    targetComponent: 'createAIFriend',
  },
  {
    title: 'Update Your Profile',
    content: 'Personalize your experience by updating your user profile.',
    emoji: '👤',
    position: {
      sm: { x: 0, y: 0 },
      md: { x: -20, y: -30 },
      lg: { x: -20, y: -30 },
    },
    targetComponent: 'userProfile',
  },
  {
    title: 'Create a Session',
    content:
      'Create a new conversation session to start chatting with your AI friends.',
    emoji: '💬',
    position: {
      sm: { x: 0, y: 0 },
      md: { x: -50, y: 40 },
      lg: { x: -50, y: 55 },
    },
    targetComponent: 'createSession',
  },
  {
    title: 'View Active Sessions',
    content:
      'View your active sessions to continue chatting with your AI friends.',
    emoji: '💬',
    position: {
      sm: { x: 0, y: 0 },
      md: { x: 0, y: -60 },
      lg: { x: 0, y: -60 },
    },
    targetComponent: 'activeSessions',
  },
  {
    title: 'Start Chatting',
    content:
      'Use emojis and natural language to have fun conversations with your AI friends!',
    emoji: '😊',
    position: {
      sm: { x: 0, y: 0 },
      md: { x: 50, y: 50 },
      lg: { x: 30, y: 60 },
    },
    targetComponent: 'chatInterface',
  },
  {
    title: 'View Insights',
    content:
      'Check the right panel to see detailed insights about your conversations with each AI friend.',
    emoji: '📊',
    position: {
      sm: { x: 0, y: 0 },
      md: { x: 40, y: -60 },
      lg: { x: 40, y: -60 },
    },
    targetComponent: 'conversationInsights',
  },
];

interface FirstTimeUserExperienceProps {
  onComplete: () => void;
  updateGlowingComponent: (component: string) => void;
}

const FirstTimeUserExperience: React.FC<FirstTimeUserExperienceProps> = ({
  onComplete,
  updateGlowingComponent,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('sm');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setScreenSize('sm');
      } else if (window.innerWidth < 1024) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    updateGlowingComponent(steps[currentStep].targetComponent);
    return () => updateGlowingComponent('none');
  }, [currentStep, updateGlowingComponent]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: `${steps[currentStep].position[screenSize].x}%`,
            y: `${steps[currentStep].position[screenSize].y}%`,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full max-w-[90vw] sm:max-w-sm md:max-w-md"
          style={{
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Card className="bg-white/90 border border-blue-200 shadow-lg backdrop-blur-lg overflow-hidden rounded-2xl">
            <CardHeader className="p-4">
              <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent flex items-center justify-between">
                <span>{steps[currentStep].title}</span>
                <span className="text-2xl sm:text-3xl md:text-4xl">
                  {steps[currentStep].emoji}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-xs sm:text-sm md:text-base text-blue-600/70">
                {steps[currentStep].content}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between p-4">
              <Button
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs sm:text-sm"
              >
                <ChevronLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Previous
              </Button>
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white text-xs sm:text-sm"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}{' '}
                <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstTimeUserExperience;
