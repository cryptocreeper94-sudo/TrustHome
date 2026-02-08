import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function BrandingScreen() {
  return (
    <PlaceholderScreen
      title="Branding"
      icon="color-palette"
      description="Customize your agent profile and white-label branding."
      features={[
        'Agent profile with photo and bio',
        'Custom accent colors and logo',
        'Shareable agent landing page',
        'QR code for client onboarding',
        'White-label configuration',
      ]}
    />
  );
}
