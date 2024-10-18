// src/utils/errorHandling.ts

import { toast } from '../hooks/use-toast';

export const handleAuthError = (error: unknown) => {
  console.error('Authentication error:', error);

  let errorMessage = 'An unexpected error occurred. Please try again.';

  if (error instanceof Error) {
    switch (error.message) {
      case 'Invalid email':
        errorMessage = 'Please enter a valid email address.';
        break;
      case 'Invalid password':
        errorMessage = 'Invalid password. Please try again.';
        break;
      case 'User not found':
        errorMessage = 'No account found with this email. Please sign up.';
        break;
      case 'Email already in use':
        errorMessage =
          'This email is already registered. Please log in or use a different email.';
        break;
      // Add more specific error cases as needed
    }
  }

  toast({
    title: 'Authentication Error',
    description: errorMessage,
    variant: 'destructive',
  });
};
