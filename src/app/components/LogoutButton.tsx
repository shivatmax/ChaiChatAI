import React from 'react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { LogOut } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { motion } from 'framer-motion';

const LogoutButton: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('userId');
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account.',
      duration: 3000,
      className: 'bg-comic-green text-black font-bold',
    });
    onLogout();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            className="w-[90%] bg-gradient-to-r from-blue-400 to-sky-500 hover:from-blue-500 hover:to-sky-600 text-white font-bold py-3 px-6 rounded-2xl border border-white/20 shadow-lg shadow-blue-400/30 backdrop-blur-sm transition-all duration-300 ease-in-out text-lg"
          >
            <LogOut className="mr-2 h-5 w-5" /> Logout
          </Button>
        </motion.div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gradient-to-b from-white/95 to-blue-50/95 backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-500 bg-clip-text text-transparent">
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-lg text-gray-600">
            Are you sure you want to end your current session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row items-center justify-center space-x-4">
          <AlertDialogCancel className="w-1/3 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-blue-100 text-blue-600 transition-all duration-300 rounded-xl border border-blue-200 shadow-lg text-lg font-medium">
            Stay
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="w-1/3 bg-gradient-to-r from-blue-400 to-sky-500 hover:from-blue-500 hover:to-sky-600 text-white transition-all duration-300 rounded-xl border border-white/20 shadow-lg text-lg font-medium"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
