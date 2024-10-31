// src/utils/errorHandling.ts

import { toast } from '../hooks/use-toast';

export const handleAuthError = (error: unknown) => {
  console.error('Authentication error:', error);

  let errorMessage = 'An unexpected error occurred. Please try again.';
  let errorTitle = 'Authentication Error';

  if (error instanceof Error) {
    switch (error.message) {
      case 'Failed to decrypt data':
        errorMessage =
          'Invalid credentials. Please check your username and email.';
        break;
      case 'Invalid email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'User not found':
        errorMessage = 'No account found with this email. Please sign up.';
        break;
      case 'Email already in use':
        errorMessage = 'This email is already registered. Please log in.';
        break;
      default:
        if (error.message.includes('duplicate key')) {
          errorMessage = 'This email is already registered. Please log in.';
        }
    }
  }

  toast({
    title: errorTitle,
    description: errorMessage,
    variant: 'destructive',
  });

  return errorMessage;
};

export const handleError = (error: unknown, context?: string) => {
  if (process.env.NODE_ENV === 'production') {
    // Silently handle errors in production
    return;
  }

  if (error instanceof Error) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`${context ? `[${context}] ` : ''}`, error.message);
    }
  }
};
