import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function TransactionsScreen() {
  return (
    <PlaceholderScreen
      title="Transactions"
      icon="swap-horizontal"
      description="Track every deal from offer to close with a visual pipeline."
      features={[
        'Visual transaction pipeline',
        'Deadline tracker with alerts',
        'Connected parties per deal',
        'Document management per stage',
        'Blockchain-verified milestones',
      ]}
    />
  );
}
