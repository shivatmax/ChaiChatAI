'use client';

import React from 'react';
import Index from '../pages/Index';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    router.push('/');
  };

  return (
    <Index
      onLogout={handleLogout}
      onNavigate={handleNavigate}
    />
  );
}
