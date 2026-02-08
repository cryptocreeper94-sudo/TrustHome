import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function LeadsScreen() {
  return (
    <PlaceholderScreen
      title="Lead Management"
      icon="flame"
      description="Capture, qualify, and convert leads from every source."
      features={[
        'Lead pipeline with temperature scoring',
        'Automated follow-up reminders',
        'Source tracking and attribution',
        'One-tap lead to client conversion',
        'Lead activity timeline',
      ]}
    />
  );
}
