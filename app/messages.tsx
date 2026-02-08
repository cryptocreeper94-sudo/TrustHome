import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function MessagesScreen() {
  return (
    <PlaceholderScreen
      title="Messages"
      icon="chatbubbles"
      description="Communicate with all parties through secure Signal Chat integration."
      features={[
        'End-to-end encrypted messaging',
        'Transaction-specific conversations',
        'File and photo sharing',
        'Read receipts and delivery status',
        'Connected to Signal Chat ecosystem',
      ]}
    />
  );
}
