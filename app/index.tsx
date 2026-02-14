import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
  ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { AgentDashboard } from '@/components/screens/AgentDashboard';
import { ClientDashboard } from '@/components/screens/ClientDashboard';
import { NavigationHub } from '@/components/screens/NavigationHub';
import { WelcomeGuide } from '@/components/ui/WelcomeGuide';
import { PartnerOnboardingModal } from '@/components/ui/PartnerOnboardingModal';

type HomeView = 'hub' | 'dashboard';

interface CommandTile {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  route: string;
}

const userTiles: CommandTile[] = [
  {
    label: 'Sign In',
    subtitle: 'Access your account',
    icon: 'log-in-outline',
    gradient: ['#1A8A7E', '#0EA5E9'],
    route: '/auth',
  },
  {
    label: 'Create Account',
    subtitle: 'Get started free',
    icon: 'person-add-outline',
    gradient: ['#0D9488', '#059669'],
    route: '/auth',
  },
  {
    label: 'Browse Properties',
    subtitle: 'Explore listings',
    icon: 'business-outline',
    gradient: ['#7C3AED', '#A855F7'],
    route: '/auth',
  },
  {
    label: 'Learn More',
    subtitle: 'How TrustHome works',
    icon: 'information-circle-outline',
    gradient: ['#2563EB', '#4F46E5'],
    route: '/auth',
  },
];

function UserCommandCenter() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0F14' : '#F8FAFB' }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.publicScroll, { paddingTop: topPad + 20, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)} style={styles.brandArea}>
          <LinearGradient
            colors={isDark ? ['rgba(26,138,126,0.15)', 'rgba(26,138,126,0.03)'] : ['rgba(26,138,126,0.08)', 'rgba(26,138,126,0.02)']}
            style={styles.brandGlow}
          >
            <View style={styles.brandIcon}>
              <Ionicons name="shield-checkmark" size={44} color="#FFFFFF" />
            </View>
          </LinearGradient>
          <Text style={[styles.brandTitle, { color: colors.text }]}>TrustHome</Text>
          <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
            Your Trusted Real Estate Partner
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.heroCard}>
          <LinearGradient
            colors={['#1A8A7E', '#0F766E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>Welcome to the Command Center</Text>
            <Text style={styles.heroSub}>
              Transparent, blockchain-verified real estate transactions. Sign in or create an account to get started.
            </Text>
            <Pressable
              style={styles.heroCta}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.heroCtaText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A8A7E" />
            </Pressable>
          </LinearGradient>
        </Animated.View>

        <View style={styles.tilesGrid}>
          {userTiles.map((tile, i) => (
            <Animated.View
              key={tile.label}
              entering={FadeInDown.delay(250 + i * 60).duration(400)}
              style={styles.tileWrap}
            >
              <Pressable
                style={[
                  styles.tile,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  },
                ]}
                onPress={() => router.push(tile.route as any)}
              >
                <LinearGradient
                  colors={isDark
                    ? [tile.gradient[0] + '25', tile.gradient[1] + '10']
                    : [tile.gradient[0] + '15', tile.gradient[1] + '08']
                  }
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <View style={[styles.tileIcon, { backgroundColor: tile.gradient[0] + (isDark ? '30' : '18') }]}>
                  <Ionicons name={tile.icon} size={20} color={tile.gradient[0]} />
                </View>
                <Text style={[styles.tileLabel, { color: colors.text }]} numberOfLines={1}>{tile.label}</Text>
                <Text style={[styles.tileSub, { color: colors.textSecondary }]} numberOfLines={1}>{tile.subtitle}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.featuresSection}>
          <View style={[styles.featureRow, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(26,138,126,0.12)' }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#1A8A7E" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Blockchain Verified</Text>
              <Text style={[styles.featureSub, { color: colors.textSecondary }]}>Every transaction secured by DarkWave Trust Layer</Text>
            </View>
          </View>
          <View style={[styles.featureRow, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(124,58,237,0.12)' }]}>
              <Ionicons name="sparkles-outline" size={18} color="#7C3AED" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>AI-Powered</Text>
              <Text style={[styles.featureSub, { color: colors.textSecondary }]}>Smart marketing, analytics, and voice assistant</Text>
            </View>
          </View>
          <View style={[styles.featureRow, { borderColor: 'transparent' }]}>
            <View style={[styles.featureIcon, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
              <Ionicons name="globe-outline" size={18} color="#2563EB" />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>Full Ecosystem</Text>
              <Text style={[styles.featureSub, { color: colors.textSecondary }]}>Connected to CRM, media, staffing, and more</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(650).duration(400)} style={styles.adminFooter}>
          <View style={[styles.adminDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
          <View style={styles.adminRow}>
            <Pressable style={styles.adminLink} onPress={() => router.push('/team')}>
              <Ionicons name="briefcase-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.adminText, { color: colors.textTertiary }]}>Agent Login</Text>
            </Pressable>
            <View style={[styles.adminDot, { backgroundColor: colors.textTertiary }]} />
            <Pressable style={styles.adminLink} onPress={() => router.push('/team')}>
              <Ionicons name="diamond-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.adminText, { color: colors.textTertiary }]}>Owner / Partner</Text>
            </Pressable>
            <View style={[styles.adminDot, { backgroundColor: colors.textTertiary }]} />
            <Pressable style={styles.adminLink} onPress={() => router.push('/team')}>
              <Ionicons name="code-slash-outline" size={13} color={colors.textTertiary} />
              <Text style={[styles.adminText, { color: colors.textTertiary }]}>Developer</Text>
            </Pressable>
          </View>

          <View style={styles.copyrightArea}>
            <View style={styles.copyrightRow}>
              <Ionicons name="shield-checkmark-outline" size={12} color={colors.textTertiary} />
              <Text style={[styles.copyrightText, { color: colors.textTertiary }]}>
                Powered by TrustShield
              </Text>
            </View>
            <Text style={[styles.copyrightText, { color: colors.textTertiary }]}>
              2026 DarkWave Studios LLC
            </Text>
          </View>

          <View style={styles.ecosystemLinks}>
            <Pressable onPress={() => Linking.openURL('https://dwtl.io')}>
              <Text style={[styles.ecoLink, { color: colors.textTertiary }]}>dwtl.io</Text>
            </Pressable>
            <View style={[styles.adminDot, { backgroundColor: colors.textTertiary }]} />
            <Pressable onPress={() => Linking.openURL('https://trustshield.tech')}>
              <Text style={[styles.ecoLink, { color: colors.textTertiary }]}>trustshield.tech</Text>
            </Pressable>
            <View style={[styles.adminDot, { backgroundColor: colors.textTertiary }]} />
            <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')}>
              <Text style={[styles.ecoLink, { color: colors.textTertiary }]}>darkwavestudios.io</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { currentRole, isAuthenticated, isLoading, showWelcomeGuide, setShowWelcomeGuide, showPartnerOnboarding, setShowPartnerOnboarding } = useApp();
  const router = useRouter();
  const [view, setView] = useState<HomeView>('hub');

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
    return <UserCommandCenter />;
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
  flex: {
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
  publicScroll: {
    paddingHorizontal: 20,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandGlow: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#1A8A7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '400' as const,
    marginTop: 4,
  },
  heroCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
  },
  heroGradient: {
    padding: 22,
    gap: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  heroCtaText: {
    color: '#1A8A7E',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  tileWrap: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%' as any,
  },
  tile: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 14,
    gap: 6,
    minHeight: 110,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  tileSub: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  featuresSection: {
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  featureSub: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  adminFooter: {
    paddingTop: 4,
  },
  adminDivider: {
    height: 1,
    marginBottom: 16,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  adminText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  adminDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.4,
  },
  copyrightArea: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  copyrightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  ecosystemLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ecoLink: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
});
