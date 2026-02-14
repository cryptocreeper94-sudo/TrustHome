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

interface FeatureCategory {
  title: string;
  items: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
  }[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    title: 'Your Home Journey',
    items: [
      { icon: 'business-outline', label: 'Browse Properties', color: '#0E7490' },
      { icon: 'calendar-outline', label: 'Schedule Showings', color: '#1A8A7E' },
      { icon: 'swap-horizontal-outline', label: 'Track Transactions', color: '#0D9488' },
      { icon: 'map-outline', label: 'Neighborhood Intel', color: '#059669' },
    ],
  },
  {
    title: 'Tools & Security',
    items: [
      { icon: 'lock-closed-outline', label: 'Document Vault', color: '#047857' },
      { icon: 'calculator-outline', label: 'Mortgage Tools', color: '#0369A1' },
      { icon: 'chatbubbles-outline', label: 'Direct Messaging', color: '#1E40AF' },
      { icon: 'sparkles-outline', label: 'AI Assistant', color: '#7C3AED' },
    ],
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
            <Text style={styles.heroTitle}>Your Command Center</Text>
            <Text style={styles.heroSub}>
              Transparent, blockchain-verified real estate — from first showing to closing day. Everything you need, all in one place.
            </Text>
            <View style={styles.heroActions}>
              <Pressable
                style={styles.heroCta}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.heroCtaText}>Sign In</Text>
                <Ionicons name="log-in-outline" size={16} color="#1A8A7E" />
              </Pressable>
              <Pressable
                style={styles.heroCtaSecondary}
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.heroCtaSecondaryText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </Pressable>
            </View>
          </LinearGradient>
        </Animated.View>

        {FEATURE_CATEGORIES.map((cat, catIndex) => (
          <Animated.View
            key={cat.title}
            entering={FadeInDown.delay(300 + catIndex * 120).duration(400)}
            style={styles.categorySection}
          >
            <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>{cat.title}</Text>
            <View style={styles.categoryGrid}>
              {cat.items.map((item) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.catTile,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    },
                  ]}
                  onPress={() => router.push('/auth')}
                >
                  <View style={[styles.catTileIcon, { backgroundColor: item.color + (isDark ? '25' : '14') }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <Text style={[styles.catTileLabel, { color: colors.text }]} numberOfLines={1}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.trustBanner}>
          <LinearGradient
            colors={isDark
              ? ['rgba(26,138,126,0.1)', 'rgba(26,138,126,0.03)']
              : ['rgba(26,138,126,0.07)', 'rgba(26,138,126,0.02)']
            }
            style={styles.trustBannerInner}
          >
            <View style={styles.trustBannerRow}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#1A8A7E" />
              </View>
              <View style={styles.trustBannerText}>
                <Text style={[styles.trustBannerTitle, { color: colors.text }]}>Blockchain Verified</Text>
                <Text style={[styles.trustBannerSub, { color: colors.textSecondary }]}>Every transaction secured by DarkWave Trust Layer</Text>
              </View>
            </View>
            <View style={styles.trustBannerRow}>
              <View style={[styles.trustBadge, { backgroundColor: 'rgba(124,58,237,0.12)' }]}>
                <Ionicons name="sparkles" size={16} color="#7C3AED" />
              </View>
              <View style={styles.trustBannerText}>
                <Text style={[styles.trustBannerTitle, { color: colors.text }]}>AI-Powered Platform</Text>
                <Text style={[styles.trustBannerSub, { color: colors.textSecondary }]}>Smart marketing, analytics, and voice assistant</Text>
              </View>
            </View>
            <View style={styles.trustBannerRow}>
              <View style={[styles.trustBadge, { backgroundColor: 'rgba(37,99,235,0.12)' }]}>
                <Ionicons name="globe" size={16} color="#2563EB" />
              </View>
              <View style={styles.trustBannerText}>
                <Text style={[styles.trustBannerTitle, { color: colors.text }]}>Full Ecosystem</Text>
                <Text style={[styles.trustBannerSub, { color: colors.textSecondary }]}>CRM, media studio, staffing, and cross-platform chat</Text>
              </View>
            </View>
          </LinearGradient>
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

          <View style={styles.socialSection}>
            <Text style={[styles.socialLabel, { color: colors.textTertiary }]}>TrustHome Demo</Text>
            <View style={styles.socialRow}>
              <Pressable
                style={[styles.socialBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
                onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61585553137979')}
              >
                <Ionicons name="logo-facebook" size={16} color={isDark ? '#8B9CF7' : '#1877F2'} />
              </Pressable>
              <Pressable
                style={[styles.socialBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
                onPress={() => Linking.openURL('https://x.com/TrustSignal26')}
              >
                <Ionicons name="logo-twitter" size={16} color={isDark ? '#A0AEC0' : '#14171A'} />
              </Pressable>
            </View>
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
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  heroCtaText: {
    color: '#1A8A7E',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  heroCtaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 5,
  },
  heroCtaSecondaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catTile: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%' as any,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  catTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTileLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  trustBanner: {
    marginBottom: 24,
  },
  trustBannerInner: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  trustBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(26,138,126,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBannerText: {
    flex: 1,
    gap: 1,
  },
  trustBannerTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  trustBannerSub: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  socialLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
