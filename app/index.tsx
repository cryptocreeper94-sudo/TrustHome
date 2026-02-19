import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { AgentDashboard } from '@/components/screens/AgentDashboard';
import { ClientDashboard } from '@/components/screens/ClientDashboard';
import { CommandCenterHub } from '@/components/screens/CommandCenterHub';
import { WelcomeGuide } from '@/components/ui/WelcomeGuide';
import { PartnerOnboardingModal } from '@/components/ui/PartnerOnboardingModal';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';

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

function FeatureTile({ item, index }: { item: typeof FEATURE_CATEGORIES[0]['items'][0]; index: number }) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 60).duration(400)}
      style={animatedStyle}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.catTile,
          {
            backgroundColor: 'rgba(12,18,36,0.65)',
            borderColor: 'rgba(255,255,255,0.08)',
          },
        ]}
        onPress={() => {
          const router = useRouter();
          router.push('/auth');
        }}
      >
        <View style={[styles.catTileIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <Text style={styles.catTileLabel} numberOfLines={1}>{item.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function CTAButton({ text, icon, onPress, variant = 'primary' }: { text: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void; variant?: 'primary' | 'secondary' }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.ctaButton,
          isPrimary ? styles.ctaButtonPrimary : styles.ctaButtonSecondary,
        ]}
        onPress={onPress}
      >
        <Text style={isPrimary ? styles.ctaButtonTextPrimary : styles.ctaButtonTextSecondary}>
          {text}
        </Text>
        <Ionicons name={icon} size={16} color={isPrimary ? '#1A8A7E' : '#FFFFFF'} />
      </Pressable>
    </Animated.View>
  );
}

function AdminLink({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.adminLink, { minHeight: 44, justifyContent: 'center' }]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={14} color="rgba(255,255,255,0.5)" />
        <Text style={styles.adminText}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function SocialButton({ icon, url }: { icon: keyof typeof Ionicons.glyphMap; url: string }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.socialBadge,
          {
            backgroundColor: 'rgba(12,18,36,0.65)',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            minHeight: 44,
            minWidth: 44,
          },
        ]}
        onPress={() => Linking.openURL(url)}
      >
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}

function UserCommandCenter() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const allTiles = FEATURE_CATEGORIES.flatMap(cat => cat.items);

  return (
    <View style={[styles.container, { backgroundColor: '#020617' }]}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.publicScroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Section */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.brandArea}>
          <LinearGradient
            colors={['rgba(26,138,126,0.25)', 'rgba(26,138,126,0.08)']}
            style={styles.brandGlow}
          >
            <View style={styles.brandIcon}>
              <Ionicons name="shield-checkmark" size={44} color="#FFFFFF" />
            </View>
          </LinearGradient>
          <Text style={styles.brandTitle}>TrustHome</Text>
          <Text style={styles.brandTagline}>
            Your Trusted Real Estate Partner
          </Text>
        </Animated.View>

        {/* Hero Card */}
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
              <CTAButton
                text="Sign In"
                icon="log-in-outline"
                onPress={() => router.push('/auth')}
                variant="primary"
              />
              <CTAButton
                text="Create Account"
                icon="arrow-forward"
                onPress={() => router.push('/auth')}
                variant="secondary"
              />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          <View style={styles.categoryGrid}>
            {allTiles.map((item, index) => (
              <FeatureTile key={item.label} item={item} index={index} />
            ))}
          </View>
        </Animated.View>

        {/* Trust Banner */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.trustBanner}>
          <LinearGradient
            colors={['rgba(26,138,126,0.15)', 'rgba(26,138,126,0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.trustBannerInner,
              {
                backgroundColor: 'rgba(12,18,36,0.65)',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.trustBannerRow}>
              <View style={[styles.trustBadge, { backgroundColor: 'rgba(26,138,126,0.2)' }]}>
                <Ionicons name="shield-checkmark" size={18} color="#1A8A7E" />
              </View>
              <View style={styles.trustBannerText}>
                <Text style={styles.trustBannerTitle}>Blockchain Verified</Text>
                <Text style={styles.trustBannerSub}>Every transaction secured by DarkWave Trust Layer</Text>
              </View>
            </View>
            <View style={styles.trustBannerRow}>
              <View style={[styles.trustBadge, { backgroundColor: 'rgba(124,58,237,0.2)' }]}>
                <Ionicons name="sparkles" size={18} color="#7C3AED" />
              </View>
              <View style={styles.trustBannerText}>
                <Text style={styles.trustBannerTitle}>AI-Powered Platform</Text>
                <Text style={styles.trustBannerSub}>Smart marketing, analytics, and voice assistant</Text>
              </View>
            </View>
            <View style={styles.trustBannerRow}>
              <View style={[styles.trustBadge, { backgroundColor: 'rgba(37,99,235,0.2)' }]}>
                <Ionicons name="globe" size={18} color="#2563EB" />
              </View>
              <View style={styles.trustBannerText}>
                <Text style={styles.trustBannerTitle}>Full Ecosystem</Text>
                <Text style={styles.trustBannerSub}>CRM, media studio, staffing, and cross-platform chat</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Admin Footer */}
        <Animated.View entering={FadeInUp.delay(650).duration(400)} style={styles.adminFooter}>
          <View style={[styles.adminDivider, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
          
          <View style={styles.adminRow}>
            <AdminLink icon="briefcase-outline" label="Agent Login" onPress={() => router.push('/team')} />
            <View style={[styles.adminDot]} />
            <AdminLink icon="diamond-outline" label="Owner / Partner" onPress={() => router.push('/team')} />
            <View style={[styles.adminDot]} />
            <AdminLink icon="code-slash-outline" label="Developer" onPress={() => router.push('/team')} />
          </View>

          <View style={styles.socialSection}>
            <Text style={styles.socialLabel}>TrustHome Demo</Text>
            <View style={styles.socialRow}>
              <SocialButton icon="logo-facebook" url="https://www.facebook.com/profile.php?id=61585553137979" />
              <SocialButton icon="logo-twitter" url="https://x.com/TrustSignal26" />
            </View>
          </View>

          <View style={styles.copyrightArea}>
            <View style={styles.copyrightRow}>
              <Ionicons name="shield-checkmark-outline" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.copyrightText}>Powered by TrustShield</Text>
            </View>
            <Text style={styles.copyrightText}>2026 DarkWave Studios LLC</Text>
          </View>

          <View style={styles.ecosystemLinks}>
            <Pressable onPress={() => Linking.openURL('https://dwtl.io')}>
              <Text style={styles.ecoLink}>dwtl.io</Text>
            </Pressable>
            <View style={[styles.adminDot]} />
            <Pressable onPress={() => Linking.openURL('https://trustshield.tech')}>
              <Text style={styles.ecoLink}>trustshield.tech</Text>
            </Pressable>
            <View style={[styles.adminDot]} />
            <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')}>
              <Text style={styles.ecoLink}>darkwavestudios.io</Text>
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
        <DashboardSkeleton />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <UserCommandCenter />;
  }

  const isAgent = currentRole === 'agent';

  const switchToDashboard = useCallback(() => {
    setView('dashboard');
  }, []);

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
        <CommandCenterHub onSwitchToDashboard={switchToDashboard} />
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
    paddingHorizontal: 16,
  },
  brandArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandGlow: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 28,
  },
  heroGradient: {
    padding: 24,
    gap: 12,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  ctaButtonPrimary: {
    backgroundColor: '#FFFFFF',
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
  },
  ctaButtonTextPrimary: {
    color: '#1A8A7E',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  ctaButtonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  featuresSection: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catTile: {
    width: '48%' as any,
    flexGrow: 1,
    flexBasis: '46%' as any,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  catTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTileLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    flex: 1,
  },
  trustBanner: {
    marginBottom: 28,
  },
  trustBannerInner: {
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  trustBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  trustBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  trustBannerText: {
    flex: 1,
    gap: 2,
  },
  trustBannerTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  trustBannerSub: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.65)',
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminFooter: {
    paddingTop: 8,
  },
  adminDivider: {
    height: 1,
    marginBottom: 18,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  adminText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  adminDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  copyrightArea: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  copyrightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: 'rgba(255,255,255,0.5)',
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
    color: 'rgba(255,255,255,0.5)',
  },
});
