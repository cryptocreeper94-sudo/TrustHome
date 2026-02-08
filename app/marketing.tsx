import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function MarketingScreen() {
  return (
    <PlaceholderScreen
      title="Marketing Hub"
      icon="megaphone"
      description="Create, schedule, and track marketing content across channels."
      features={[
        'Social media post creator',
        'Email campaign builder',
        'Template library with agent branding',
        'Post scheduling for Facebook and Instagram',
        'Performance tracking and analytics',
      ]}
    />
  );
}
