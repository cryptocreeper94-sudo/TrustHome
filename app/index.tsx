import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { AgentDashboard } from '@/components/screens/AgentDashboard';
import { ClientDashboard } from '@/components/screens/ClientDashboard';
import { NavigationHub } from '@/components/screens/NavigationHub';
import { WelcomeGuide } from '@/components/ui/WelcomeGuide';
import { PartnerOnboardingModal } from '@/components/ui/PartnerOnboardingModal';

type HomeView = 'hub' | 'dashboard';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentRole, isAuthenticated, isLoading, showWelcomeGuide, setShowWelcomeGuide, showPartnerOnboarding, setShowPartnerOnboarding } = useApp();
  const router = useRouter();
  const [view, setView] = useState<HomeView>('hub');

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated]);

  const toggleView = useCallback(() => {
    setView(v => v === 'hub' ? 'dashboard' : 'hub');
  }, []);

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
      <Header
        extraAction={
          <Pressable
            onPress={toggleView}
            style={styles.viewToggle}
          >
            <Ionicons
              name={view === 'hub' ? 'speedometer-outline' : 'grid-outline'}
              size={18}
              color="rgba(255,255,255,0.8)"
            />
          </Pressable>
        }
      />
      {view === 'hub' ? (
        <NavigationHub />
      ) : (
        isAgent ? <AgentDashboard /> : <ClientDashboard />
      )}
      <WelcomeGuide
        visible={showWelcomeGuide}
        onComplete={() => setShowWelcomeGuide(false)}
      />
      <PartnerOnboardingModal
        visible={showPartnerOnboarding && !showWelcomeGuide}
        onComplete={() => setShowPartnerOnboarding(false)}
      />
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
  viewToggle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
