import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Platform, Dimensions, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';

const ECOSYSTEM_APPS = [
  { name: 'TrustHome', slug: 'trusthome', url: 'https://trusthome.replit.app', desc: 'White-label real estate platform', category: 'Real Estate', icon: 'home', color: '#1A8A7E' },
  { name: 'Trust Vault', slug: 'trust-vault', url: 'https://trustvault.tlid.io', desc: 'Multi-chain wallet & multi-sig', category: 'Finance', icon: 'wallet', color: '#8B5CF6' },
  { name: 'TL Driver Connect', slug: 'driver-connect', url: 'https://driverconnect.tlid.io', desc: 'Blockchain-verified drivers', category: 'Transport', icon: 'car', color: '#3B82F6' },
  { name: 'THE VOID', slug: 'the-void', url: 'https://thevoid.tlid.io', desc: 'Premium membership identity', category: 'Entertainment', icon: 'planet', color: '#EC4899' },
  { name: 'Happy Eats', slug: 'happy-eats', url: 'https://happyeats.app', desc: 'Trust-verified food & dining', category: 'Dining', icon: 'restaurant', color: '#F59E0B' },
  { name: 'Verdara', slug: 'verdara', url: 'https://dwsc.io', desc: 'AI outdoor recreation super-app', category: 'Outdoors', icon: 'leaf', color: '#10B981' },
  { name: 'Orbit Staffing', slug: 'orbit-staffing', url: 'https://orbitstaffing.io', desc: 'Payroll, bookkeeping, HR', category: 'Business', icon: 'people', color: '#6366F1' },
  { name: 'TrustShield', slug: 'trustshield', url: 'https://trustshield.tech', desc: 'Ecosystem security suite', category: 'Security', icon: 'shield-checkmark', color: '#EF4444' },
];

const FEATURES = [
  { icon: 'finger-print' as const, title: 'Single Sign-On', desc: 'One set of credentials across all DarkWave apps. No redirects — synced behind the scenes.', color: '#22d3ee' },
  { icon: 'flash' as const, title: 'Blockchain Verified', desc: 'Identity and credentials anchored on-chain. Tamper-proof verification for all assets.', color: '#a78bfa' },
  { icon: 'code-slash' as const, title: 'Open API', desc: 'Connected apps share data securely via JWT-authenticated endpoints.', color: '#34d399' },
];

function EcosystemWidget() {
  const widgetRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const node = (widgetRef.current as any)?.__internalInstanceHandle?.stateNode
      ?? (widgetRef.current as any);
    if (!node || !node.appendChild) return;

    const dirDiv = document.createElement('div');
    dirDiv.id = 'dw-ecosystem-directory';
    node.appendChild(dirDiv);

    const existingScript = document.querySelector(
      'script[src="https://dwsc.io/api/ecosystem/directory.js"]'
    );
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.src = 'https://dwsc.io/api/ecosystem/directory.js';
    script.setAttribute('data-theme', 'dark');
    script.async = true;
    node.appendChild(script);

    return () => {
      const s = document.querySelector(
        'script[src="https://dwsc.io/api/ecosystem/directory.js"]'
      );
      if (s) s.remove();
      if (dirDiv.parentNode) dirDiv.parentNode.removeChild(dirDiv);
    };
  }, []);

  if (Platform.OS !== 'web') return null;

  return <View ref={widgetRef} style={{ minHeight: 200 }} />;
}

function AppCard({ app, colors, isDark, isCompact }: { app: typeof ECOSYSTEM_APPS[0]; colors: any; isDark: boolean; isCompact: boolean }) {
  const isSelf = app.slug === 'trusthome';

  return (
    <Pressable
      onPress={() => Linking.openURL(app.url)}
      style={({ pressed }) => [
        styles.appCard,
        {
          backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)',
          borderColor: isSelf
            ? 'rgba(26,138,126,0.3)'
            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          opacity: pressed ? 0.7 : 1,
          padding: isCompact ? 10 : 12,
        },
      ]}
    >
      <View style={[styles.appIcon, { backgroundColor: app.color + '18', width: isCompact ? 36 : 40, height: isCompact ? 36 : 40 }]}>
        <Ionicons name={app.icon as any} size={isCompact ? 18 : 20} color={app.color} />
      </View>
      <View style={styles.appInfo}>
        <View style={styles.appNameRow}>
          <Text style={[styles.appName, { color: colors.text, fontSize: isCompact ? 13 : 14 }]} numberOfLines={1}>{app.name}</Text>
          {isSelf && (
            <View style={[styles.youBadge, { backgroundColor: '#1A8A7E20' }]}>
              <Text style={[styles.youBadgeText, { color: '#1A8A7E' }]}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={[styles.appDesc, { color: colors.textTertiary, fontSize: isCompact ? 10 : 11 }]} numberOfLines={1}>{app.desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={colors.textTertiary} style={{ marginLeft: 4 }} />
    </Pressable>
  );
}

export default function EcosystemScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { width } = useWindowDimensions();
  const isCompact = width < 400;
  const isWide = width >= 600;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Ecosystem" showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: isWeb ? 74 : insets.bottom + 40,
            paddingHorizontal: isWide ? 24 : 14,
            maxWidth: 720,
            alignSelf: 'center' as const,
            width: '100%',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View style={[styles.heroSection, { padding: isCompact ? 16 : 20 }]}>
            <LinearGradient
              colors={isDark
                ? ['rgba(6,182,212,0.08)', 'rgba(139,92,246,0.06)', 'transparent']
                : ['rgba(6,182,212,0.05)', 'rgba(139,92,246,0.03)', 'transparent']
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={[styles.heroHeader, { gap: isCompact ? 10 : 14 }]}>
              <View style={[styles.heroIconBadge, { width: isCompact ? 44 : 52, height: isCompact ? 44 : 52, borderRadius: isCompact ? 12 : 14 }]}>
                <LinearGradient
                  colors={['rgba(6,182,212,0.25)', 'rgba(139,92,246,0.25)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: isCompact ? 12 : 14 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="shield-checkmark" size={isCompact ? 22 : 28} color="#22d3ee" />
              </View>
              <View style={styles.heroTitleWrap}>
                <Text style={[styles.heroTitle, { fontSize: isCompact ? 20 : 24 }]}>
                  <Text style={styles.heroTitleAccent}>Trust Layer </Text>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.85)' : colors.text }}>Ecosystem</Text>
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textTertiary, fontSize: isCompact ? 11 : 13 }]}>
                  Powered by DarkWave Studios
                </Text>
              </View>
            </View>

            <Text style={[styles.heroDesc, { color: colors.textSecondary, fontSize: isCompact ? 13 : 14 }]}>
              TrustHome is part of the Trust Layer ecosystem — a network of apps built on
              verified identity, shared credentials, and blockchain-backed trust.
            </Text>

            <View style={styles.statRow}>
              <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.08)' }]}>
                <Text style={[styles.statValue, { color: '#22d3ee' }]}>{ECOSYSTEM_APPS.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Apps</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(167,139,250,0.08)' }]}>
                <Text style={[styles.statValue, { color: '#a78bfa' }]}>SSO</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Enabled</Text>
              </View>
              <View style={[styles.statPill, { backgroundColor: isDark ? 'rgba(52,211,153,0.1)' : 'rgba(52,211,153,0.08)' }]}>
                <Text style={[styles.statValue, { color: '#34d399' }]}>L1</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>Chain</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <View style={[styles.widgetCard, {
            backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)',
            borderColor: isDark ? 'rgba(6,182,212,0.15)' : 'rgba(0,0,0,0.06)',
            padding: isCompact ? 12 : 16,
          }]}>
            <View style={[styles.widgetHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="globe-outline" size={14} color="#22d3ee" />
              <Text style={[styles.widgetTitle, { color: '#22d3ee' }]}>CONNECTED APPS</Text>
              <View style={{ flex: 1 }} />
              <View style={[styles.liveDot, { backgroundColor: '#34d399' }]} />
              <Text style={[styles.liveText, { color: colors.textTertiary }]}>Live</Text>
            </View>

            {isWeb && <EcosystemWidget />}

            <View style={[styles.appGrid, { gap: isCompact ? 6 : 8 }]}>
              {ECOSYSTEM_APPS.map((app, i) => (
                <Animated.View
                  key={app.slug}
                  entering={FadeInDown.duration(250).delay(200 + i * 40)}
                >
                  <AppCard app={app} colors={colors} isDark={isDark} isCompact={isCompact} />
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={[styles.featureGrid, { flexDirection: isWide ? 'row' : 'column' }]}>
            {FEATURES.map((feat) => (
              <View
                key={feat.title}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.72)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    flex: isWide ? 1 : undefined,
                    padding: isCompact ? 14 : 16,
                  },
                ]}
              >
                <View style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: feat.color + '15', borderColor: feat.color + '25' }]}>
                    <Ionicons name={feat.icon} size={16} color={feat.color} />
                  </View>
                  <View style={styles.featureTextWrap}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>{feat.title}</Text>
                    <Text style={[styles.featureDesc, { color: colors.textTertiary }]}>{feat.desc}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(380)}>
          <View style={styles.footerLinks}>
            {[
              { label: 'dwsc.io', url: 'https://dwsc.io' },
              { label: 'tlid.io', url: 'https://tlid.io' },
              { label: 'dwtl.io', url: 'https://dwtl.io' },
            ].map((link, i) => (
              <React.Fragment key={link.label}>
                {i > 0 && <Text style={[styles.footerDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>}
                <Pressable
                  onPress={() => Linking.openURL(link.url)}
                  style={({ pressed }) => [styles.footerLinkBtn, { opacity: pressed ? 0.5 : 1 }]}
                  hitSlop={8}
                >
                  <Text style={[styles.footerLink, { color: colors.textTertiary }]}>{link.label}</Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {},
  heroSection: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    marginTop: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    overflow: 'hidden',
  },
  heroTitleWrap: { flex: 1, paddingTop: 2 },
  heroTitle: { fontWeight: '700', letterSpacing: -0.5 },
  heroTitleAccent: { color: '#22d3ee' },
  heroSubtitle: { marginTop: 2 },
  heroDesc: { lineHeight: 20, marginBottom: 14 },
  statRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 1 },
  widgetCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  widgetTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: { fontSize: 10, marginLeft: 2 },
  appGrid: {},
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    minHeight: 52,
  },
  appIcon: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: { flex: 1, minWidth: 0 },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  appName: { fontWeight: '600' },
  youBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  youBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  appDesc: { marginTop: 1 },
  featureGrid: {
    gap: 8,
    marginBottom: 20,
  },
  featureCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureTextWrap: { flex: 1, minWidth: 0 },
  featureTitle: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  featureDesc: { fontSize: 12, lineHeight: 17 },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 12,
  },
  footerLinkBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  footerLink: { fontSize: 12 },
  footerDot: { fontSize: 12 },
});
