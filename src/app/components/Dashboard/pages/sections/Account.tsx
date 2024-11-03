// import { useToast } from '../../../ui/use-toast';
import { useState, useEffect } from 'react';
// import { supabase } from '../../../../integrations/supabase';
import { useUserData } from '../../../../hooks/useUserData';
import { AccountProfile } from './account/AccountProfile';
import { AccountPlans } from './account/AccountPlans';
import { AccountDangerZone } from './account/AccountDangerZone';
import React from 'react';

const Account = () => {
  const { data: userData, isLoading } = useUserData();
  // const { toast } = useToast();
  const [profile, setProfile] = useState({
    display_name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (userData?.account) {
      setProfile({
        display_name: userData.account.display_name || '',
        email: userData.account.email || '',
        bio: userData.account.bio || '',
      });
    }
  }, [userData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100/50">
        <h1 className="section-title text-2xl md:text-3xl">Account Settings</h1>
        <p className="text-blue-600/70 mt-2">
          Manage your profile and subscription
        </p>
      </div>

      <AccountProfile profile={profile} setProfile={setProfile} />
      <AccountPlans />
      <AccountDangerZone />
    </div>
  );
};

export default Account;
