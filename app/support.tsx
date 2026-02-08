import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function SupportScreen() {
  return (
    <PlaceholderScreen
      title="Help & Support"
      icon="help-circle"
      description="Get help, browse FAQs, and contact the TrustHome team."
      features={[
        'FAQ and knowledge base',
        'Contact support team',
        'Video tutorials',
        'Feature request submissions',
        'Community forum',
      ]}
    />
  );
}
