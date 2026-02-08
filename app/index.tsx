import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { AgentDashboard } from '@/components/screens/AgentDashboard';
import { ClientDashboard } from '@/components/screens/ClientDashboard';
import { Footer } from '@/components/ui/Footer';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentRole } = useApp();

  const isAgent = currentRole === 'agent';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      {isAgent ? <AgentDashboard /> : <ClientDashboard />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
