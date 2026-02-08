import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function NetworkScreen() {
  return (
    <PlaceholderScreen
      title="Professional Network"
      icon="globe"
      description="Your trusted vendor directory with blockchain-verified ratings."
      features={[
        'Inspector, lender, and title company directory',
        'Trust Score ratings verified on blockchain',
        'Assign vendors to transactions',
        'Referral tracking and management',
        'Contractor and service provider listings',
      ]}
    />
  );
}
