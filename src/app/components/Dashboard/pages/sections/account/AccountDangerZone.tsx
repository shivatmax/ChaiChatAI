import React, { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { useToast } from '../../../../ui/use-toast';
import { useUserData } from '../../../../../integrations/supabase/hooks/useUserData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../ui/alert-dialog';
import { supabase } from '../../../../../integrations/supabase/supabase';

export const AccountDangerZone = ({
  currentUserId,
}: {
  currentUserId: string;
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const { toast } = useToast();
  const { data: userData } = useUserData(currentUserId);

  const handleDeleteAccount = async () => {
    if (confirmEmail !== userData?.user.email) {
      toast({
        title: "Email doesn't match",
        description:
          'Please enter your correct email address to confirm deletion.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('User')
        .delete()
        .eq('id', currentUserId);

      if (error) throw error;

      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted.',
        variant: 'destructive',
      });
      setIsDialogOpen(false);
      // Redirect to logout or home page
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Error deleting account',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mt-10 md:mt-12 border-t border-red-200 pt-8 md:pt-10">
      <div className="max-w-xl space-y-4">
        <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
        <p className="text-red-600/70 text-sm md:text-base">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button
          variant="destructive"
          onClick={() => setIsDialogOpen(true)}
          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
        >
          Delete Account
        </Button>

        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent
            className="max-w-md bg-gradient-to-b from-gray-900 to-gray-800 border-2 border-red-500/20"
            aria-describedby="delete-account-description"
          >
            <AlertDialogHeader>
              <AlertDialogTitle
                id="alert-dialog-title"
                className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent"
              >
                Delete Account Permanently
              </AlertDialogTitle>
              <AlertDialogDescription
                id="delete-account-description"
                className="space-y-4"
              >
                <p className="text-gray-300">
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Please type your email to confirm:
                    <span className="font-semibold text-red-400 ml-1">
                      {userData?.user.email}
                    </span>
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="w-full bg-gray-800/50 border-red-500/20 focus:border-red-500/40 focus:ring-red-500/20 text-gray-200 placeholder:text-gray-500"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setConfirmEmail('');
                  setIsDialogOpen(false);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white border-none"
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
