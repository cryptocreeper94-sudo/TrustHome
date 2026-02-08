import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function PropertiesScreen() {
  return (
    <PlaceholderScreen
      title="Properties"
      icon="business"
      description="Manage listings, shortlists, and property details all in one place."
      features={[
        'MLS data integration',
        'Property shortlist for buyers',
        'Side-by-side comparison tool',
        'Photo galleries and virtual tours',
        'Neighborhood intelligence',
      ]}
    />
  );
}
