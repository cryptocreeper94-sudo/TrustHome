import React from 'react';
import { PlaceholderScreen } from '@/components/screens/PlaceholderScreen';

export default function ShowingsScreen() {
  return (
    <PlaceholderScreen
      title="Showings & Open Houses"
      icon="calendar"
      description="Schedule showings, manage open houses, and collect feedback."
      features={[
        'Calendar view with all events',
        'Open house creation and RSVP',
        'Post-showing feedback forms',
        'Attendance tracking',
        'Calendar sync integration',
      ]}
    />
  );
}
