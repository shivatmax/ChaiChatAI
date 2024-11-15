'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from './pages/Index';
import AuthPage from './components/AuthPage';
import LoadingScreen from './components/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getLatestSession } from './services/SessionService';

const queryClient = new QueryClient();

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        setIsAuthenticated(true);
        // Redirect to the latest session or create a new one
        getLatestSession(userId).then((session) => {
          if (session) {
            router.push(`/chat/${session.id}`);
          }
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            {isAuthenticated ? (
              <Index
                onLogout={() => setIsAuthenticated(false)}
                onNavigate={handleNavigate}
              />
            ) : (
              <AuthPage
                onAuthSuccess={() => setIsAuthenticated(true)}
                onNavigate={handleNavigate}
              />
            )}
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
