// src/utils/errorHandling.ts

import { toast } from '../hooks/use-toast';
import { logger } from './logger';

export const handleAuthError = (error: unknown) => {
  logger.error('Authentication error details:', {
    error,
    type: error instanceof Error ? error.constructor.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  let errorMessage = 'An unexpected error occurred. Please try again.';
  let errorTitle = 'Authentication Error';

  if (error instanceof Error) {
    switch (error.message) {
      case 'Failed to decrypt data':
        errorMessage =
          'Invalid credentials. Please check your username and email.';
        break;
      case 'Invalid credentials':
        errorMessage = 'Username does not match the registered email.';
        break;
      case 'Missing required encryption parameters':
        errorMessage = 'Authentication failed. Missing required data.';
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
        logger.error('Unhandled auth error:', error);
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
  if (error instanceof Error) {
    logger.error(`${context ? `[${context}] ` : ''}${error.message}`, error);
  } else {
    logger.error(`${context ? `[${context}] ` : ''}Unknown error`, error);
  }
};
