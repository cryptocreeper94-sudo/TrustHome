import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function AnalyticsScreen() {
  return (
    <PlaceholderScreen
      title="Analytics"
      icon="bar-chart"
      description="Track your performance, revenue, and client satisfaction."
      features={[
        'Closings by period',
        'Revenue tracking and projections',
        'Lead conversion rates',
        'Client satisfaction scores',
        'Average days on market',
      ]}
    />
  );
}
