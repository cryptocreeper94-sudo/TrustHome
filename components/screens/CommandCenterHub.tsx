import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform,
  Dimensions, Linking, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { KenBurnsHero } from '@/components/ui/VideoHero';

const HERO_SLIDES = [
  { image: require('@/assets/images/hero-1.jpg'), label: 'Craftsman Homes' },
  { image: require('@/assets/images/hero-2.jpg'), label: 'Classic Brick Ranch' },
  { image: require('@/assets/images/hero-3.jpg'), label: 'Tennessee Neighborhoods' },
  { image: require('@/assets/images/hero-4.jpg'), label: 'Home Showings' },
];

const FEATURES = [
  {
    title: 'Leads & CRM',
    subtitle: 'Never lose a lead again',
    description: 'Track every client from first contact to closing day. Smart lead scoring, automated follow-ups, and a pipeline view that keeps you on top of every deal.',
    image: require('@/assets/images/feature-crm.jpg'),
    emoji: '👥',
    route: '/leads',
    gradient: ['#0EA5E9', '#0284C7'] as [string, string],
  },
  {
    title: 'Marketing Suite',
    subtitle: 'Stand out in every market',
    description: 'AI-powered listing descriptions, social media templates, branded flyers, and a blog manager that positions you as the local expert.',
    image: require('@/assets/images/feature-marketing.jpg'),
    emoji: '📣',
    route: '/marketing',
    gradient: ['#8B5CF6', '#7C3AED'] as [string, string],
  },
  {
    title: 'Analytics & Insights',
    subtitle: 'Data-driven decisions',
    description: 'Real-time performance dashboards, market trend analysis, and transaction metrics that help you understand what\'s working and where to focus.',
    image: require('@/assets/images/feature-analytics.jpg'),
    emoji: '📊',
    route: '/analytics',
    gradient: ['#10B981', '#059669'] as [string, string],
  },
];

const STATS = [
  { value: '15+', label: 'Agent Tools' },
  { value: '24/7', label: 'Always Available' },
  { value: '100%', label: 'White-Label Ready' },
  { value: '0', label: 'Paper Needed' },
];

const TOOLS_QUICK = [
  { emoji: '📋', label: 'Transactions', route: '/transactions', color: '#0EA5E9' },
  { emoji: '🏠', label: 'Properties', route: '/properties', color: '#8B5CF6' },
  { emoji: '📄', label: 'Documents', route: '/documents', color: '#10B981' },
  { emoji: '💬', label: 'Messages', route: '/messages', color: '#F59E0B' },
  { emoji: '🎬', label: 'Media Studio', route: '/media-studio', color: '#EC4899' },
  { emoji: '💼', label: 'Business Suite', route: '/business', color: '#6366F1' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommandCenterHubProps {
  onSwitchToDashboard?: () => void;
}

export function CommandCenterHub({ onSwitchToDashboard }: CommandCenterHubProps) {
  const { colors, isDark } = useTheme();
  const { toggleDrawer, isBrowsing } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const cardWidth = Math.min(SCREEN_WIDTH > 900 ? (SCREEN_WIDTH - 80) / 3 : SCREEN_WIDTH > 600 ? (SCREEN_WIDTH - 60) / 2 : SCREEN_WIDTH - 40, 400);

  // PWA Install
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const isIOS = Platform.OS === 'web' && typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = Platform.OS === 'web' && typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || (window.navigator as any).standalone);

  useEffect(() => {
    if (Platform.OS !== 'web' || isStandalone) return;
    const dismissed = typeof localStorage !== 'undefined' && localStorage.getItem('pwa-dismissed');
    if (dismissed) return;

    if (isIOS) {
      setShowInstallBanner(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      if (result.outcome === 'accepted') setShowInstallBanner(false);
    }
  }, [installPrompt]);

  const dismissBanner = () => {
    setShowInstallBanner(false);
    if (typeof localStorage !== 'undefined') localStorage.setItem('pwa-dismissed', '1');
  };

  return (
    <View style={{ flex: 1 }}>
    {/* Floating menu button */}
    <Pressable
      style={({ pressed }) => [styles.floatingMenuBtn, pressed && { opacity: 0.8 }]}
      onPress={toggleDrawer}
    >
      <View style={styles.floatingMenuInner}>
        <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '700', lineHeight: 24 }}>☰</Text>
      </View>
    </Pressable>

    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#020617' : '#FAFAFA' }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── HERO ─── */}
      <View style={styles.heroWrap}>
        <KenBurnsHero slides={HERO_SLIDES} height={520}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>TrustHome</Text>
            <Text style={styles.heroSubtitle}>Your complete real estate agent platform</Text>
            <View style={styles.heroBtnRow}>
              <Pressable
                style={({ pressed }) => [styles.heroPrimaryBtn, pressed && { opacity: 0.85 }]}
                onPress={() => router.push('/team')}
              >
                <LinearGradient
                  colors={['#1A8A7E', '#0F766E']}
                  style={styles.heroBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.heroBtnText}>Get Started</Text>
                  <Text style={{ color: '#FFF', fontSize: 14 }}> →</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.heroSecondaryBtn, pressed && { opacity: 0.85 }]}
                onPress={toggleDrawer}
              >
                <Text style={{ color: '#FFF', fontSize: 14 }}>⊞ </Text>
                <Text style={styles.heroSecondaryBtnText}>Explore Tools</Text>
              </Pressable>
            </View>
          </View>
        </KenBurnsHero>
      </View>

      {/* ─── INTRO SECTION ─── */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.section}>
        <View style={styles.sectionInner}>
          <Text style={[styles.sectionEyebrow, { color: '#1A8A7E' }]}>BUILT FOR AGENTS</Text>
          <Text style={[styles.sectionHeading, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Everything you need.{'\n'}Nothing you don't.
          </Text>
          <Text style={[styles.sectionBody, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            TrustHome brings your entire real estate business into one platform — leads, transactions, 
            marketing, documents, and analytics. Stop juggling ten different apps and start closing more deals.
          </Text>
        </View>
      </Animated.View>

      {/* ─── FEATURES ─── */}
      {FEATURES.map((feature, index) => (
        <Animated.View
          key={feature.title}
          entering={FadeInDown.delay(300 + index * 150).duration(600)}
          style={[
            styles.featureSection,
            index % 2 === 1 && styles.featureSectionAlt,
            { backgroundColor: index % 2 === 1 ? (isDark ? '#0F172A' : '#F1F5F9') : 'transparent' },
          ]}
        >
          <View style={[styles.featureInner, index % 2 === 1 && styles.featureInnerReversed]}>
            <Pressable
              style={styles.featureImageWrap}
              onPress={() => router.push(feature.route as any)}
            >
              <Image
                source={feature.image}
                style={styles.featureImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)']}
                style={styles.featureImageOverlay}
              />
            </Pressable>
            <View style={styles.featureText}>
              <View style={styles.featureIconRow}>
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.featureIconBg}
                >
                  <Text style={{ fontSize: 18 }}>{feature.emoji}</Text>
                </LinearGradient>
              </View>
              <Text style={[styles.featureTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                {feature.title}
              </Text>
              <Text style={[styles.featureSubtitle, { color: feature.gradient[0] }]}>
                {feature.subtitle}
              </Text>
              <Text style={[styles.featureDescription, { color: isDark ? '#94A3B8' : '#475569' }]}>
                {feature.description}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.featureBtn, pressed && { opacity: 0.8 }]}
                onPress={() => router.push(feature.route as any)}
              >
                <Text style={[styles.featureBtnText, { color: feature.gradient[0] }]}>
                  Learn More
                </Text>
                <Text style={{ color: feature.gradient[0], fontSize: 14 }}> →</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ))}

      {/* ─── STATS BAR ─── */}
      <Animated.View entering={FadeInDown.delay(700).duration(600)}>
        <LinearGradient
          colors={isDark ? ['#0F766E', '#065F46'] : ['#1A8A7E', '#0D9488']}
          style={styles.statsBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {STATS.map((stat, i) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </LinearGradient>
      </Animated.View>

      {/* ─── QUICK ACCESS TOOLS ─── */}
      <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.section}>
        <View style={styles.sectionInner}>
          <Text style={[styles.sectionEyebrow, { color: '#1A8A7E' }]}>QUICK ACCESS</Text>
          <Text style={[styles.sectionHeading, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Your toolkit
          </Text>
          <Text style={[styles.sectionBody, { color: isDark ? '#94A3B8' : '#64748B', marginBottom: 24 }]}>
            Jump straight into any tool. Everything else is in the menu.
          </Text>
        </View>
        <View style={styles.toolsGrid}>
          {TOOLS_QUICK.map((tool) => (
            <Pressable
              key={tool.label}
              style={({ pressed }) => [
                styles.toolCard,
                {
                  backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  ...(pressed ? { transform: [{ scale: 0.97 }] } : {}),
                },
              ]}
              onPress={() => router.push(tool.route as any)}
            >
              <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '15' }]}>
                <Text style={{ fontSize: 18 }}>{tool.emoji}</Text>
              </View>
              <Text style={[styles.toolLabel, { color: isDark ? '#E2E8F0' : '#1E293B' }]}>
                {tool.label}
              </Text>
              <Text style={{ color: isDark ? '#475569' : '#94A3B8', fontSize: 16 }}>›</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* ─── CTA SECTION ─── */}
      <Animated.View entering={FadeInDown.delay(900).duration(600)} style={styles.ctaSection}>
        <LinearGradient
          colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#F1F5F9']}
          style={styles.ctaInner}
        >
          <Text style={{ fontSize: 36 }}>🛡️</Text>
          <Text style={[styles.ctaTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
            Ready to streamline your business?
          </Text>
          <Text style={[styles.ctaBody, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            Join agents who've simplified their workflow with TrustHome. 
            Everything from lead capture to closing — in one place.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.85 }]}
            onPress={() => router.push('/team')}
          >
            <LinearGradient
              colors={['#1A8A7E', '#0F766E']}
              style={styles.ctaBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.ctaBtnText}>Get Started Free</Text>
              <Text style={{ color: '#FFF', fontSize: 14 }}> →</Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </Animated.View>

      {/* ─── PWA INSTALL BANNER ─── */}
      {showInstallBanner && (
        <View style={[styles.installBanner, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
          <View style={styles.installContent}>
            <Text style={{ fontSize: 28 }}>📲</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.installTitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
                Install TrustHome
              </Text>
              <Text style={[styles.installBody, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {isIOS
                  ? 'Tap the Share button (⬆) then "Add to Home Screen"'
                  : 'Add TrustHome to your home screen for quick access'}
              </Text>
            </View>
          </View>
          <View style={styles.installActions}>
            {!isIOS && installPrompt && (
              <Pressable
                style={({ pressed }) => [styles.installBtn, pressed && { opacity: 0.85 }]}
                onPress={handleInstall}
              >
                <LinearGradient
                  colors={['#1A8A7E', '#0F766E']}
                  style={styles.installBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.installBtnText}>Install</Text>
                </LinearGradient>
              </Pressable>
            )}
            <Pressable onPress={dismissBanner}>
              <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 13, fontWeight: '600' }}>
                {isIOS ? 'Got it' : 'Not now'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ─── FOOTER ─── */}
      <View style={[styles.footer, { borderTopColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
        <Text style={[styles.footerBrand, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>
          TrustHome
        </Text>
        <Text style={[styles.footerCopyright, { color: isDark ? '#475569' : '#94A3B8' }]}>
          © {new Date().getFullYear()} DarkWave Studios
        </Text>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')}>
            <Text style={[styles.footerLink, { color: isDark ? '#64748B' : '#94A3B8' }]}>DarkWave Studios</Text>
          </Pressable>
          <Text style={[styles.footerDot, { color: isDark ? '#334155' : '#CBD5E1' }]}> · </Text>
          <Pressable onPress={() => Linking.openURL('https://dwtl.io')}>
            <Text style={[styles.footerLink, { color: isDark ? '#64748B' : '#94A3B8' }]}>Trust Layer</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingMenuBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    right: 20,
    zIndex: 100,
  },
  floatingMenuInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(12px)' } as any : {}),
  },
  scrollContent: { paddingTop: 0 },

  // Hero
  heroWrap: { marginBottom: 0 },
  heroContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 16,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  heroBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  heroPrimaryBtn: { borderRadius: 12, overflow: 'hidden' },
  heroBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  heroBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroSecondaryBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Sections
  section: {
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  sectionInner: {
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 14,
  },
  sectionBody: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },

  // Features
  featureSection: {
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  featureSectionAlt: {},
  featureInner: {
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
    ...(Platform.OS === 'web' ? { flexDirection: 'row' } as any : {}),
    gap: 32,
    alignItems: 'center',
  },
  featureInnerReversed: {
    ...(Platform.OS === 'web' ? { flexDirection: 'row-reverse' } as any : {}),
  },
  featureImageWrap: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 240,
    ...(Platform.OS === 'web' ? { maxWidth: '50%' } as any : {}),
  },
  featureImage: {
    width: '100%',
    height: 280,
    borderRadius: 16,
  },
  featureImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  featureText: {
    flex: 1,
    ...(Platform.OS === 'web' ? { maxWidth: '50%' } as any : {}),
  },
  featureIconRow: { marginBottom: 12 },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  featureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Tools Grid
  toolsGrid: {
    flexDirection: SCREEN_WIDTH > 600 ? 'row' : 'column',
    flexWrap: SCREEN_WIDTH > 600 ? 'wrap' : 'nowrap',
    gap: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  } as any,
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    ...(SCREEN_WIDTH > 600 ? { width: '30%', minWidth: 200 } : {}),
    ...(Platform.OS === 'web' ? { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } as any : {}),
  } as any,
  toolIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  // CTA
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  ctaInner: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  ctaBody: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 24,
  },
  ctaBtn: { borderRadius: 12, overflow: 'hidden' },
  ctaBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  ctaBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    marginTop: 8,
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  footerCopyright: { fontSize: 12, marginBottom: 8 },
  footerLinks: { flexDirection: 'row', alignItems: 'center' },
  footerLink: { fontSize: 12, fontWeight: '500' },
  footerDot: { fontSize: 12 },

  // Install Banner
  installBanner: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  installContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  installTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  installBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  installActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  installBtn: { borderRadius: 10, overflow: 'hidden' },
  installBtnGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  installBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
