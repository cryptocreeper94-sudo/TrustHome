import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { AgentDashboard } from '@/components/screens/AgentDashboard';
import { ClientDashboard } from '@/components/screens/ClientDashboard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentRole, isAuthenticated, isLoading } = useApp();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
