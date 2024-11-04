import React from 'react';
import { Switch } from '../../ui/switch';
import { useToast } from '../../ui/use-toast';
import { useEffect, useState } from 'react';
import { useUserData } from '../../../integrations/supabase/hooks/useUserData';
import { supabase } from '../../../integrations/supabase/supabase';

// interface UserSettings {
//   email_notifications: boolean;
//   push_notifications: boolean;
//   share_usage_data: boolean;
//   public_profile: boolean;
//   message_history: boolean;
//   auto_reply: boolean;
// }

const Settings = ({ currentUserId }: { currentUserId: string }) => {
  const { toast } = useToast();
  const { data: userData, isLoading } = useUserData(currentUserId);
  const [settings, setSettings] = useState({
    email_notifications: false,
    push_notifications: false,
    share_usage_data: false,
    public_profile: false,
    message_history: false,
    auto_reply: false,
  });

  useEffect(() => {
    if (userData?.settings) {
      setSettings({
        email_notifications: Boolean(userData.settings.email_notifications),
        push_notifications: Boolean(userData.settings.push_notifications),
        share_usage_data: Boolean(userData.settings.share_usage_data),
        public_profile: Boolean(userData.settings.public_profile),
        message_history: Boolean(userData.settings.message_history),
        auto_reply: Boolean(userData.settings.auto_reply),
      });
    }
  }, [userData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const updateSetting = async (key: keyof typeof settings, value: boolean) => {
    try {
      // First update Supabase
      const updatedSettings = {
        id: userData?.settings?.id,
        user_id: currentUserId,
        ...settings,
        [key]: value,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('UserSettings')
        .upsert(updatedSettings, {
          onConflict: 'id',
        });

      if (error) throw error;

      // If Supabase update succeeds, update local state
      setSettings((prev) => ({ ...prev, [key]: value }));

      toast({
        title: 'Setting updated',
        description: 'Your preference has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error saving setting',
        description:
          error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const SettingItem = ({
    title,
    description,
    settingKey,
  }: {
    title: string;
    description: string;
    settingKey: keyof typeof settings;
  }) => (
    <div className="settings-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-blue-900">{title}</h3>
          <p className="text-sm text-blue-600/70 mt-1">{description}</p>
        </div>
        <Switch
          checked={settings[settingKey]}
          onCheckedChange={(checked) => updateSetting(settingKey, checked)}
          className="custom-switch relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100/50">
        <h1 className="section-title text-2xl md:text-3xl">Settings</h1>
        <p className="text-blue-600/70 mt-2 text-sm md:text-base">
          Configure your application preferences
        </p>
      </div>

      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="section-title text-xl md:text-2xl pl-1">
            Notifications
          </h2>
          <div className="space-y-4">
            <SettingItem
              title="Email Notifications"
              description="Receive email updates about your conversations"
              settingKey="email_notifications"
            />
            <SettingItem
              title="Push Notifications"
              description="Get notified about new messages"
              settingKey="push_notifications"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="section-title text-xl md:text-2xl pl-1">Privacy</h2>
          <div className="space-y-4">
            <SettingItem
              title="Share Usage Data"
              description="Help us improve by sharing anonymous usage data"
              settingKey="share_usage_data"
            />
            <SettingItem
              title="Public Profile"
              description="Make your profile visible to other users"
              settingKey="public_profile"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="section-title text-xl md:text-2xl pl-1">
            Chat Settings
          </h2>
          <div className="space-y-4">
            <SettingItem
              title="Message History"
              description="Keep chat history for future reference"
              settingKey="message_history"
            />
            <SettingItem
              title="Auto-Reply"
              description="Enable AI friends to send automatic responses"
              settingKey="auto_reply"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
