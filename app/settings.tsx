import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function SettingsScreen() {
  return (
    <PlaceholderScreen
      title="Profile & Settings"
      icon="person"
      description="Manage your account, notifications, and preferences."
      features={[
        'Profile management',
        'Notification preferences',
        'Theme and display settings',
        'Account security',
        'Subscription management',
      ]}
    />
  );
}
