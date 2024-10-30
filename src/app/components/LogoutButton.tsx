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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex justify-center"
        >
          <Button
            variant="outline"
            className="w-[90%] bg-comic-red hover:bg-comic-purple text-white font-bold py-3 px-6 rounded-full comic-border comic-shadow transition-all duration-300 ease-in-out text-xl"
          >
            <LogOut className="mr-2 h-6 w-6" /> Logout
          </Button>
        </motion.div>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-comic-yellow comic-bg rounded-xl comic-border comic-shadow">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-bold text-comic-purple">
            Are you sure you want to logout?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xl text-comic-darkblue">
            This action will end your current session and return you to the
            login page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-row items-center justify-center space-x-4">
          <AlertDialogCancel className="w-1/3 bg-comic-green text-black hover:bg-comic-blue hover:text-white transition-colors duration-300 comic-border comic-shadow text-xl font-bold">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="w-1/3 bg-comic-red text-white hover:bg-comic-purple transition-colors duration-300 comic-border comic-shadow text-xl font-bold"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
