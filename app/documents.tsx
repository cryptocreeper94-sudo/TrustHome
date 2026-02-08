import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function DocumentsScreen() {
  return (
    <PlaceholderScreen
      title="Documents"
      icon="document-text"
      description="Secure document vault with blockchain verification via Trust Shield."
      features={[
        'All transaction documents in one place',
        'E-signature integration',
        'Blockchain-verified document hashes',
        'Role-based visibility controls',
        'Version history and audit trail',
      ]}
    />
  );
}
