import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ECOSYSTEM_APPS = [
  { name: 'TrustHome', slug: 'trusthome', url: 'https://trusthome.replit.app', desc: 'White-label real estate platform', category: 'Real Estate', icon: 'home', color: '#1A8A7E', active: true },
  { name: 'Trust Vault', slug: 'trust-vault', url: 'https://trustvault.tlid.io', desc: 'Multi-chain wallet with multi-sig security', category: 'Finance', icon: 'wallet', color: '#8B5CF6', active: true },
  { name: 'TL Driver Connect', slug: 'driver-connect', url: 'https://driverconnect.tlid.io', desc: 'Blockchain-verified driver coordination', category: 'Transportation', icon: 'car', color: '#3B82F6', active: true },
  { name: 'THE VOID', slug: 'the-void', url: 'https://thevoid.tlid.io', desc: 'Premium membership identity system', category: 'Entertainment', icon: 'planet', color: '#EC4899', active: true },
  { name: 'Happy Eats', slug: 'happy-eats', url: 'https://happyeats.app', desc: 'Trust-verified food & dining platform', category: 'Food & Dining', icon: 'restaurant', color: '#F59E0B', active: true },
  { name: 'Verdara', slug: 'verdara', url: 'https://dwsc.io', desc: 'AI-powered outdoor recreation super-app', category: 'Outdoors', icon: 'leaf', color: '#10B981', active: true },
  { name: 'Orbit Staffing', slug: 'orbit-staffing', url: 'https://orbitstaffing.io', desc: 'Payroll, bookkeeping, HR management', category: 'Business', icon: 'people', color: '#6366F1', active: true },
  { name: 'TrustShield', slug: 'trustshield', url: 'https://trustshield.tech', desc: 'Ecosystem security & threat protection', category: 'Security', icon: 'shield-checkmark', color: '#EF4444', active: true },
];

const FEATURES = [
  {
    icon: 'finger-print' as const,
    title: 'Single Sign-On',
    desc: 'One set of credentials across all DarkWave apps. No redirects — each app has its own login, synced behind the scenes.',
    color: '#22d3ee',
  },
  {
    icon: 'flash' as const,
    title: 'Blockchain Verified',
    desc: 'Identity and credentials anchored on-chain. Tamper-proof verification for users, organizations, and digital assets.',
    color: '#a78bfa',
  },
  {
    icon: 'code-slash' as const,
    title: 'Open API',
    desc: 'Ecosystem API lets connected apps share data and alerts securely via authenticated endpoints.',
    color: '#34d399',
  },
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

export default function EcosystemScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Ecosystem" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: isWeb ? 34 + 40 : insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={isDark
                ? ['rgba(6,182,212,0.08)', 'rgba(139,92,246,0.06)', 'transparent']
                : ['rgba(6,182,212,0.05)', 'rgba(139,92,246,0.03)', 'transparent']
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />

            <View style={styles.heroHeader}>
              <View style={styles.heroIconBadge}>
                <LinearGradient
                  colors={['rgba(6,182,212,0.25)', 'rgba(139,92,246,0.25)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name="shield-checkmark" size={28} color="#22d3ee" />
              </View>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroTitle}>
                  <Text style={styles.heroTitleAccent}>Trust Layer </Text>
                  <Text style={{ color: isDark ? 'rgba(255,255,255,0.85)' : colors.text }}>Ecosystem</Text>
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textTertiary }]}>
                  Powered by DarkWave Studios
                </Text>
              </View>
            </View>

            <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
              TrustHome is part of the Trust Layer ecosystem — a network of apps built on
              verified identity, shared credentials, and blockchain-backed trust. Your single
              login works across every connected platform.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <View style={[styles.widgetCard, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderColor: 'rgba(6,182,212,0.15)',
          }]}>
            <View style={[styles.widgetHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="globe-outline" size={16} color="#22d3ee" />
              <Text style={[styles.widgetTitle, { color: '#22d3ee' }]}>CONNECTED APPS</Text>
            </View>

            {isWeb && <EcosystemWidget />}

            <View style={styles.appGrid}>
              {ECOSYSTEM_APPS.map((app, i) => (
                <Animated.View
                  key={app.slug}
                  entering={FadeInDown.duration(300).delay(300 + i * 50)}
                >
                  <Pressable
                    onPress={() => Linking.openURL(app.url)}
                    style={({ pressed }) => [
                      styles.appCard,
                      {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.appIcon, { backgroundColor: app.color + '18' }]}>
                      <Ionicons name={app.icon as any} size={20} color={app.color} />
                    </View>
                    <View style={styles.appInfo}>
                      <View style={styles.appNameRow}>
                        <Text style={[styles.appName, { color: colors.text }]} numberOfLines={1}>{app.name}</Text>
                        {app.slug === 'trusthome' && (
                          <View style={[styles.youBadge, { backgroundColor: '#1A8A7E20' }]}>
                            <Text style={[styles.youBadgeText, { color: '#1A8A7E' }]}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.appDesc, { color: colors.textTertiary }]} numberOfLines={1}>{app.desc}</Text>
                    </View>
                    <View style={[styles.categoryPill, { backgroundColor: app.color + '12' }]}>
                      <Text style={[styles.categoryText, { color: app.color }]}>{app.category}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <View style={styles.featureGrid}>
            {FEATURES.map((feat, i) => (
              <View
                key={feat.title}
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  },
                ]}
              >
                <View style={[styles.featureIcon, { backgroundColor: feat.color + '15', borderColor: feat.color + '25' }]}>
                  <Ionicons name={feat.icon} size={16} color={feat.color} />
                </View>
                <Text style={[styles.featureTitle, { color: colors.text }]}>{feat.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.textTertiary }]}>{feat.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)}>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => Linking.openURL('https://dwsc.io')} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Text style={[styles.footerLink, { color: colors.textTertiary }]}>dwsc.io</Text>
            </Pressable>
            <Text style={[styles.footerDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
            <Pressable onPress={() => Linking.openURL('https://tlid.io')} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Text style={[styles.footerLink, { color: colors.textTertiary }]}>tlid.io</Text>
            </Pressable>
            <Text style={[styles.footerDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
            <Pressable onPress={() => Linking.openURL('https://dwtl.io')} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Text style={[styles.footerLink, { color: colors.textTertiary }]}>dwtl.io</Text>
            </Pressable>
            <Text style={[styles.footerDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
            <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Text style={[styles.footerLink, { color: colors.textTertiary }]}>darkwavestudios.io</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  heroSection: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  heroIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    overflow: 'hidden',
  },
  heroTitleWrap: { flex: 1, paddingTop: 2 },
  heroTitle: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  heroTitleAccent: {
    color: '#22d3ee',
  },
  heroSubtitle: { fontSize: 13, marginTop: 2 },
  heroDesc: { fontSize: 14, lineHeight: 22 },
  widgetCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  widgetTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  appGrid: { gap: 8 },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: { flex: 1 },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appName: { fontSize: 14, fontWeight: '600' },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  appDesc: { fontSize: 11, marginTop: 2 },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: { fontSize: 10, fontWeight: '600' },
  featureGrid: {
    gap: 10,
    marginBottom: 24,
  },
  featureCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  featureDesc: { fontSize: 12, lineHeight: 18 },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 16,
  },
  footerLink: { fontSize: 12 },
  footerDot: { fontSize: 12 },
});
