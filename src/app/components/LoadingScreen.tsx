import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-100 to-pink-100">
      <div className="text-2xl font-bold text-gray-800">Loading...</div>
    </div>
  );
};

export default LoadingScreen;