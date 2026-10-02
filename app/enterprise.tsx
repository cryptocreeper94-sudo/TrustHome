import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { GlassCard } from '@/components/ui/GlassCard';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';

const COMPETITIVE_ADVANTAGES = [
  {
    icon: 'people' as const,
    title: 'Recruiting Magnet',
    desc: 'Offer your agents a proprietary technology ecosystem that no competing brokerage can match. Recruit top producers by giving them tools their current brokerage cannot.',
    metric: '3×',
    metricLabel: 'Avg. agent retention increase',
  },
  {
    icon: 'layers' as const,
    title: 'Revenue Engine',
    desc: 'Monetize your tech stack. Charge agents a competitive tech fee that covers your costs and generates profit — all while delivering 10× the value of fragmented tools.',
    metric: '$12K+',
    metricLabel: 'Monthly revenue at 500 seats',
  },
  {
    icon: 'shield-checkmark' as const,
    title: 'Trust-Verified Transactions',
    desc: 'Every document, inspection, and closing is blockchain-stamped through TrustLayer. Offer your clients a level of transaction integrity that no other brokerage provides.',
    metric: '100%',
    metricLabel: 'Audit trail transparency',
  },
  {
    icon: 'color-palette' as const,
    title: 'Your Brand, Your Platform',
    desc: 'Full white-label deployment under your brokerage identity. Your domain, your logo, your colors. Agents and clients never see TrustHome — they see your brand.',
    metric: '0',
    metricLabel: 'Third-party branding visible',
  },
];

const PLATFORM_CAPABILITIES = [
  { icon: 'people-outline' as const, label: 'CRM & Lead Management' },
  { icon: 'swap-horizontal' as const, label: 'Transaction Pipeline' },
  { icon: 'megaphone-outline' as const, label: 'AI Marketing Suite' },
  { icon: 'document-text-outline' as const, label: 'Document Vault' },
  { icon: 'calendar-outline' as const, label: 'Showing Scheduler' },
  { icon: 'chatbubble-outline' as const, label: 'Encrypted Messaging' },
  { icon: 'bar-chart-outline' as const, label: 'Analytics Dashboard' },
  { icon: 'film-outline' as const, label: 'Media Production Studio' },
  { icon: 'globe-outline' as const, label: 'MLS Integration' },
  { icon: 'card-outline' as const, label: 'Expense & Mileage Tracking' },
  { icon: 'finger-print-outline' as const, label: 'Blockchain Verification' },
  { icon: 'newspaper-outline' as const, label: 'AI Blog & Content Engine' },
];

const SCALE_STATS = [
  { value: '500+', label: 'Agents Supported' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '<200ms', label: 'Avg. Response Time' },
  { value: '∞', label: 'Scalability' },
];

export default function EnterpriseScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const [form, setForm] = useState({ name: '', email: '', company: '', agents: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.company) return;
    setSubmitted(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      showsVerticalScrollIndicator={false}
    >
      <Header title="Enterprise" showBack  rightAction={<InfoButton onPress={() => setShowHelp(true)} />}/>

      {/* ─── HERO ─── */}
      <View style={[styles.heroSection, { paddingTop: 20 }]}>
        <Animated.View entering={FadeInDown.delay(100).duration(800)} style={[styles.heroInner, isWeb && { maxWidth: 800, alignSelf: 'center' as const }]}>
          <View style={styles.heroBadge}>
            <Ionicons name="diamond" size={12} color="#D4AF37" />
            <Text style={styles.heroBadgeText}>Enterprise Solutions</Text>
          </View>
          <Text style={[styles.heroTitle, isWeb && { fontSize: 52 }]}>
            Your Brokerage.{'\n'}Your Platform.{'\n'}
            <Text style={{ color: '#1A8A7E' }}>Your Advantage.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Deploy a fully branded, AI-powered real estate operating system 
            under your identity. Give your agents tools no competitor can match — 
            and turn your technology into a profit center.
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.content, isWeb && { maxWidth: 900, alignSelf: 'center' as const, width: '100%' }]}>

        {/* ─── SCALE STATS ─── */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsBar}>
          {SCALE_STATS.map((stat, i) => (
            <View key={i} style={[styles.statItem, i < SCALE_STATS.length - 1 && styles.statDivider]}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ─── COMPETITIVE ADVANTAGES ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>WHY ENTERPRISE</Text>
          <Text style={styles.sectionTitle}>A Competitive Weapon, Not Just Software</Text>
          <Text style={styles.sectionDesc}>
            The top-producing teams in the country aren't winning with better agents — 
            they're winning with better systems. TrustHome Enterprise is that system.
          </Text>
        </View>

        {COMPETITIVE_ADVANTAGES.map((adv, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(300 + i * 80).duration(600)}>
            <GlassCard style={styles.advantageCard}>
              <View style={styles.advantageTop}>
                <View style={styles.advantageIcon}>
                  <Ionicons name={adv.icon} size={24} color="#1A8A7E" />
                </View>
                <View style={styles.advantageMetric}>
                  <Text style={styles.metricValue}>{adv.metric}</Text>
                  <Text style={styles.metricLabel}>{adv.metricLabel}</Text>
                </View>
              </View>
              <Text style={styles.advantageTitle}>{adv.title}</Text>
              <Text style={styles.advantageDesc}>{adv.desc}</Text>
            </GlassCard>
          </Animated.View>
        ))}

        {/* ─── PLATFORM CAPABILITIES ─── */}
        <View style={[styles.sectionHeader, { marginTop: 48 }]}>
          <Text style={styles.sectionEyebrow}>WHAT'S INCLUDED</Text>
          <Text style={styles.sectionTitle}>One Platform. Every Tool.</Text>
          <Text style={styles.sectionDesc}>
            Replace your entire fragmented tech stack with a single, unified ecosystem 
            — fully branded to your brokerage.
          </Text>
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(600)}>
          <GlassCard style={styles.capabilitiesCard}>
            <View style={styles.capGrid}>
              {PLATFORM_CAPABILITIES.map((cap, i) => (
                <View key={i} style={styles.capItem}>
                  <View style={styles.capIconWrap}>
                    <Ionicons name={cap.icon} size={18} color="#1A8A7E" />
                  </View>
                  <Text style={styles.capLabel}>{cap.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── HOW IT WORKS ─── */}
        <View style={[styles.sectionHeader, { marginTop: 48 }]}>
          <Text style={styles.sectionEyebrow}>THE PROCESS</Text>
          <Text style={styles.sectionTitle}>From Handshake to Launch</Text>
        </View>

        {[
          { step: '01', title: 'Discovery Call', desc: 'We learn your brokerage, your agents, your market, your goals. We align the platform to your vision.' },
          { step: '02', title: 'Custom Deployment', desc: 'Your branded instance is configured — domain, MLS integrations, team structure, branding, and onboarding flow.' },
          { step: '03', title: 'Agent Onboarding', desc: 'White-glove onboarding for your team. Training materials, live walkthroughs, and dedicated support.' },
          { step: '04', title: 'Launch & Scale', desc: 'Your agents go live. We monitor performance, iterate on feedback, and continuously deploy improvements.' },
        ].map((item, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(600 + i * 80).duration(600)}>
            <View style={styles.processStep}>
              <View style={styles.processNumber}>
                <Text style={styles.processNumText}>{item.step}</Text>
              </View>
              <View style={styles.processContent}>
                <Text style={styles.processTitle}>{item.title}</Text>
                <Text style={styles.processDesc}>{item.desc}</Text>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* ─── CONTACT FORM ─── */}
        <View style={[styles.sectionHeader, { marginTop: 56 }]}>
          <Text style={styles.sectionEyebrow}>GET STARTED</Text>
          <Text style={styles.sectionTitle}>Schedule a Private Demo</Text>
          <Text style={styles.sectionDesc}>
            See the full platform configured for your brokerage. No obligation, no pressure — 
            just a clear look at what your technology could become.
          </Text>
        </View>

        <Animated.View entering={FadeInDown.delay(700).duration(600)}>
          <GlassCard style={styles.contactCard}>
            {submitted ? (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={36} color="#000" />
                </View>
                <Text style={styles.successTitle}>Request Received</Text>
                <Text style={styles.successDesc}>
                  We'll be in touch within 24 hours to schedule your private demo.
                </Text>
              </View>
            ) : (
              <>
                <View style={isWeb ? styles.formRow : undefined}>
                  <View style={[styles.inputGroup, isWeb && { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Your Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Full name"
                      placeholderTextColor="#52525B"
                      value={form.name}
                      onChangeText={t => setForm({ ...form, name: t })}
                    />
                  </View>
                  <View style={[styles.inputGroup, isWeb && { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="you@brokerage.com"
                      placeholderTextColor="#52525B"
                      keyboardType="email-address"
                      value={form.email}
                      onChangeText={t => setForm({ ...form, email: t })}
                    />
                  </View>
                </View>

                <View style={isWeb ? styles.formRow : undefined}>
                  <View style={[styles.inputGroup, isWeb && { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Brokerage / Team Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ashton Real Estate Group"
                      placeholderTextColor="#52525B"
                      value={form.company}
                      onChangeText={t => setForm({ ...form, company: t })}
                    />
                  </View>
                  <View style={[styles.inputGroup, isWeb && { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Number of Agents</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 150"
                      placeholderTextColor="#52525B"
                      keyboardType="numeric"
                      value={form.agents}
                      onChangeText={t => setForm({ ...form, agents: t })}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tell Us About Your Goals (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What challenges are you looking to solve?"
                    placeholderTextColor="#52525B"
                    multiline
                    textAlignVertical="top"
                    value={form.message}
                    onChangeText={t => setForm({ ...form, message: t })}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitText}>Request Private Demo</Text>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                </Pressable>
              </>
            )}
          </GlassCard>
        </Animated.View>

        {/* ─── FOOTER ─── */}
        <Animated.View entering={FadeIn.delay(800)} style={styles.footer}>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#1A8A7E" />
            <Text style={styles.trustBadgeText}>TrustLayer Verified</Text>
          </View>
          <Text style={styles.footerText}>A DarkWave Studios Product</Text>
        </Animated.View>
      </View>
            <Footer />

</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { paddingHorizontal: 24 },
  heroInner: { width: '100%' },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginBottom: 24,
  },
  heroBadgeText: { color: '#D4AF37', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { fontSize: 38, fontWeight: '900', color: '#FFF', letterSpacing: -1.5, lineHeight: 46, marginBottom: 20 },
  heroSubtitle: { fontSize: 17, color: '#A1A1AA', lineHeight: 28, maxWidth: 560 },
  content: { paddingHorizontal: 24 },
  statsBar: {
    flexDirection: 'row', backgroundColor: 'rgba(26,138,126,0.06)', borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.15)', borderRadius: 16, padding: 20, marginTop: 40, marginBottom: 48,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.06)' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  statLabel: { fontSize: 10, color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  sectionHeader: { marginBottom: 24 },
  sectionEyebrow: { fontSize: 11, color: '#1A8A7E', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: -0.5, marginBottom: 10 },
  sectionDesc: { fontSize: 15, color: '#A1A1AA', lineHeight: 24 },
  advantageCard: { padding: 28, marginBottom: 16, backgroundColor: 'rgba(9,9,11,0.7)', borderColor: 'rgba(39,39,42,0.6)' },
  advantageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  advantageIcon: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(26,138,126,0.1)',
    borderWidth: 1, borderColor: 'rgba(26,138,126,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  advantageMetric: { alignItems: 'flex-end' },
  metricValue: { fontSize: 28, fontWeight: '900', color: '#1A8A7E' },
  metricLabel: { fontSize: 10, color: '#71717A', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'right', maxWidth: 120 },
  advantageTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  advantageDesc: { fontSize: 14, color: '#A1A1AA', lineHeight: 22 },
  capabilitiesCard: { padding: 28, backgroundColor: 'rgba(9,9,11,0.7)', borderColor: 'rgba(39,39,42,0.6)' },
  capGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  capItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '47%', paddingVertical: 10 },
  capIconWrap: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(26,138,126,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  capLabel: { fontSize: 13, color: '#D4D4D8', fontWeight: '500', flex: 1 },
  processStep: { flexDirection: 'row', gap: 16, marginBottom: 24, alignItems: 'flex-start' },
  processNumber: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(26,138,126,0.1)',
    borderWidth: 1, borderColor: 'rgba(26,138,126,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  processNumText: { fontSize: 16, fontWeight: '800', color: '#1A8A7E' },
  processContent: { flex: 1 },
  processTitle: { fontSize: 17, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  processDesc: { fontSize: 14, color: '#A1A1AA', lineHeight: 21 },
  contactCard: { padding: 32, backgroundColor: 'rgba(9,9,11,0.8)', borderColor: 'rgba(39,39,42,0.6)' },
  formRow: { flexDirection: 'row', gap: 16 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, color: '#A1A1AA', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#18181B', borderWidth: 1, borderColor: '#27272A', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, color: '#FFF', fontSize: 15,
  },
  textArea: { minHeight: 100, paddingTop: 14 },
  submitBtn: {
    backgroundColor: '#D4AF37', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 16, marginTop: 8,
  },
  submitText: { color: '#000', fontSize: 16, fontWeight: '700' },
  successState: { alignItems: 'center', paddingVertical: 40 },
  successIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#D4AF37',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  successDesc: { fontSize: 15, color: '#A1A1AA', textAlign: 'center', maxWidth: 300 },
  footer: { alignItems: 'center', gap: 12, marginTop: 56 },
  trustBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(26,138,126,0.08)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.2)',
  },
  trustBadgeText: { fontSize: 11, color: '#1A8A7E', fontWeight: '600', letterSpacing: 0.5 },
  footerText: { fontSize: 12, color: '#52525B', fontWeight: '500', letterSpacing: 0.5 },
});
