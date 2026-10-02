import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
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

type BillingCycle = 'monthly' | 'annual';

interface PlanTier {
  name: string;
  badge?: string;
  badgeColor?: string;
  price: { monthly: number; annual: number };
  desc: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const PLANS: PlanTier[] = [
  {
    name: 'Starter',
    price: { monthly: 0, annual: 0 },
    desc: 'Get started with the core tools. Free forever — no credit card required.',
    icon: 'rocket-outline',
    cta: 'Get Started Free',
    features: [
      'CRM with up to 50 contacts',
      'Transaction pipeline (3 active)',
      'Document vault (500MB)',
      'Property search & browse',
      'Mobile + web access',
      'Community support',
    ],
  },
  {
    name: 'Professional',
    badge: 'MOST POPULAR',
    badgeColor: '#1A8A7E',
    price: { monthly: 79, annual: 63 },
    desc: 'Everything an independent agent needs to dominate their market.',
    icon: 'flash-outline',
    cta: 'Start 14-Day Free Trial',
    highlighted: true,
    features: [
      'Unlimited CRM contacts',
      'Unlimited transactions',
      'AI marketing suite & blog engine',
      'Showing scheduler & calendar sync',
      'Encrypted messaging (Signal protocol)',
      'Document vault (25GB)',
      'Analytics dashboard',
      'Expense & mileage tracking',
      'MLS integration',
      'Media Studio access',
      'TrustLayer blockchain verification',
      'Priority support',
    ],
  },
  {
    name: 'Team',
    price: { monthly: 149, annual: 119 },
    desc: 'Built for team leads managing multiple agents under one roof.',
    icon: 'people-outline',
    cta: 'Start 14-Day Free Trial',
    features: [
      'Everything in Professional',
      'Up to 10 agent seats included',
      'Team analytics & leaderboard',
      'Shared transaction pipeline',
      'Team lead dashboard',
      'Custom branding & QR codes',
      'Dedicated onboarding specialist',
      'Phone & chat support',
    ],
  },
];

const FOUNDERS_PLAN: PlanTier = {
  name: 'Founders Circle',
  badge: 'LIMITED — 100 SEATS',
  badgeColor: '#D4AF37',
  price: { monthly: 49, annual: 39 },
  desc: 'Lock in founder pricing permanently. First 100 agents get lifetime access at this rate — it will never increase.',
  icon: 'diamond-outline',
  cta: 'Claim Founders Pricing',
  highlighted: true,
  features: [
    'Full Professional tier — everything included',
    'Locked-in pricing for life',
    'Founding member badge on profile',
    'Direct line to the development team',
    'Early access to all new features',
    'Priority feature requests',
  ],
};

const COMPARISON_ITEMS = [
  { label: 'Typical CRM (Follow Up Boss, KVCore)', cost: '$70–150/mo' },
  { label: 'Transaction Management (Dotloop, SkySlope)', cost: '$30–50/mo' },
  { label: 'Marketing & Social (Canva, Buffer, etc.)', cost: '$25–40/mo' },
  { label: 'Document Storage (Dropbox, Google)', cost: '$10–20/mo' },
  { label: 'Analytics (Altos, various)', cost: '$30–50/mo' },
];

const FAQ_ITEMS = [
  {
    q: 'What happens after my 14-day trial?',
    a: 'Your trial converts to a paid subscription. You can cancel anytime before the trial ends — no charge, no questions asked.',
  },
  {
    q: 'Can I switch plans later?',
    a: 'Yes. Upgrade or downgrade at any time. If you upgrade mid-cycle, we prorate the difference.',
  },
  {
    q: 'Is there a contract or commitment?',
    a: 'No long-term contracts. Monthly plans are month-to-month. Annual plans are billed yearly with a 20% discount.',
  },
  {
    q: 'What MLS boards are supported?',
    a: 'We support RESO Web API and RETS-based MLS boards. During onboarding, we configure your specific board connection.',
  },
  {
    q: 'I run a brokerage with 50+ agents. Is this the right page?',
    a: 'For teams of 10+, we offer enterprise white-label deployment with custom branding and volume pricing. Visit our Enterprise page for details.',
  },
];

export default function PricingScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';

  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const savingsPercent = 20;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: 'transparent' }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
      showsVerticalScrollIndicator={false}
    >
      <Header title="Pricing" showBack  rightAction={<InfoButton onPress={() => setShowHelp(true)} />}/>

      {/* ─── HERO ─── */}
      <View style={styles.heroSection}>
        <Animated.View entering={FadeInDown.delay(100).duration(800)} style={[styles.heroInner, isWeb && { maxWidth: 700, alignSelf: 'center' as const }]}>
          <Text style={[styles.heroTitle, isWeb && { fontSize: 48 }]}>
            One Platform.{'\n'}
            <Text style={{ color: '#1A8A7E' }}>Half the Cost.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Replace your fragmented tech stack with a single, unified ecosystem. 
            CRM, transactions, marketing, documents, analytics — all in one place.
          </Text>
        </Animated.View>
      </View>

      <View style={[styles.content, isWeb && { maxWidth: 960, alignSelf: 'center' as const, width: '100%' }]}>

        {/* ─── BILLING TOGGLE ─── */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.billingToggle}>
          <Pressable
            style={[styles.toggleBtn, billing === 'monthly' && styles.toggleActive]}
            onPress={() => setBilling('monthly')}
          >
            <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, billing === 'annual' && styles.toggleActive]}
            onPress={() => setBilling('annual')}
          >
            <Text style={[styles.toggleText, billing === 'annual' && styles.toggleTextActive]}>Annual</Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save {savingsPercent}%</Text>
            </View>
          </Pressable>
        </Animated.View>

        {/* ─── FOUNDERS CIRCLE ─── */}
        <Animated.View entering={FadeInDown.delay(250).duration(600)}>
          <LinearGradient
            colors={['rgba(212,175,55,0.12)', 'rgba(212,175,55,0.02)']}
            style={styles.foundersWrap}
          >
            <View style={styles.foundersBadge}>
              <Ionicons name="diamond" size={12} color="#D4AF37" />
              <Text style={styles.foundersBadgeText}>{FOUNDERS_PLAN.badge}</Text>
            </View>
            <View style={isWeb ? { flexDirection: 'row', gap: 32, alignItems: 'flex-start' } : undefined}>
              <View style={{ flex: 1 }}>
                <Text style={styles.foundersName}>{FOUNDERS_PLAN.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.foundersPrice}>${FOUNDERS_PLAN.price[billing]}</Text>
                  <Text style={styles.pricePeriod}>/mo</Text>
                  {billing === 'annual' && <Text style={styles.billedAnnually}>billed annually</Text>}
                </View>
                <Text style={styles.foundersDesc}>{FOUNDERS_PLAN.desc}</Text>
              </View>
              <View style={[styles.foundersFeatures, isWeb && { flex: 1 }]}>
                {FOUNDERS_PLAN.features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#D4AF37" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
                <Pressable style={({ pressed }) => [styles.foundersBtn, pressed && { opacity: 0.85 }]}>
                  <Text style={styles.foundersBtnText}>{FOUNDERS_PLAN.cta}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#000" />
                </Pressable>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ─── PLAN CARDS ─── */}
        <View style={isWeb ? styles.plansRow : undefined}>
          {PLANS.map((plan, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(300 + i * 100).duration(600)} style={[isWeb && { flex: 1 }]}>
              <GlassCard style={[
                styles.planCard,
                plan.highlighted && styles.planHighlighted,
              ]}>
                {plan.badge && (
                  <View style={[styles.planBadge, { backgroundColor: `${plan.badgeColor}15`, borderColor: `${plan.badgeColor}30` }]}>
                    <Text style={[styles.planBadgeText, { color: plan.badgeColor }]}>{plan.badge}</Text>
                  </View>
                )}
                <View style={styles.planIconWrap}>
                  <Ionicons name={plan.icon} size={24} color={plan.highlighted ? '#1A8A7E' : '#71717A'} />
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceRow}>
                  {plan.price.monthly === 0 ? (
                    <Text style={styles.planPrice}>Free</Text>
                  ) : (
                    <>
                      <Text style={styles.planPrice}>${plan.price[billing]}</Text>
                      <Text style={styles.pricePeriod}>/mo</Text>
                    </>
                  )}
                </View>
                {billing === 'annual' && plan.price.annual > 0 && (
                  <Text style={styles.billedAnnually}>billed annually</Text>
                )}
                <Text style={styles.planDesc}>{plan.desc}</Text>

                <View style={styles.divider} />

                {plan.features.map((f, fi) => (
                  <View key={fi} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={plan.highlighted ? '#1A8A7E' : '#52525B'} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}

                <Pressable style={({ pressed }) => [
                  styles.planBtn,
                  plan.highlighted && styles.planBtnHighlighted,
                  pressed && { opacity: 0.85 },
                ]}>
                  <Text style={[styles.planBtnText, plan.highlighted && styles.planBtnTextHighlighted]}>{plan.cta}</Text>
                </Pressable>
              </GlassCard>
            </Animated.View>
          ))}
        </View>

        {/* ─── ENTERPRISE CTA ─── */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Pressable onPress={() => router.push('/enterprise')}>
            <GlassCard style={styles.enterpriseCta}>
              <View style={styles.enterpriseCtaInner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.enterpriseCtaTitle}>Running a Brokerage?</Text>
                  <Text style={styles.enterpriseCtaDesc}>
                    Enterprise white-label deployment with custom branding, volume pricing, and dedicated support for teams of 10+.
                  </Text>
                </View>
                <View style={styles.enterpriseCtaBtn}>
                  <Text style={styles.enterpriseCtaBtnText}>Learn More</Text>
                  <Ionicons name="arrow-forward" size={16} color="#D4AF37" />
                </View>
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>

        {/* ─── COST COMPARISON ─── */}
        <View style={[styles.sectionHeader, { marginTop: 48 }]}>
          <Text style={styles.sectionEyebrow}>THE MATH</Text>
          <Text style={styles.sectionTitle}>What You're Paying Now</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(650).duration(600)}>
          <GlassCard style={styles.comparisonCard}>
            {COMPARISON_ITEMS.map((item, i) => (
              <View key={i} style={[styles.compRow, i < COMPARISON_ITEMS.length - 1 && styles.compRowBorder]}>
                <Text style={styles.compLabel}>{item.label}</Text>
                <Text style={styles.compCost}>{item.cost}</Text>
              </View>
            ))}
            <View style={styles.compTotal}>
              <Text style={styles.compTotalLabel}>Typical Monthly Spend</Text>
              <Text style={styles.compTotalValue}>$165–310/mo</Text>
            </View>
            <View style={styles.compSavings}>
              <View style={styles.compSavingsInner}>
                <Ionicons name="arrow-down-circle" size={20} color="#1A8A7E" />
                <Text style={styles.compSavingsText}>TrustHome Professional replaces all of this for <Text style={{ fontWeight: '800', color: '#1A8A7E' }}>$79/mo</Text></Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* ─── FAQ ─── */}
        <View style={[styles.sectionHeader, { marginTop: 48 }]}>
          <Text style={styles.sectionEyebrow}>QUESTIONS</Text>
          <Text style={styles.sectionTitle}>Frequently Asked</Text>
        </View>

        {FAQ_ITEMS.map((faq, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(700 + i * 60).duration(600)}>
            <Pressable onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}>
              <View style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <Ionicons
                    name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#71717A"
                  />
                </View>
                {expandedFaq === i && (
                  <Text style={styles.faqAnswer}>{faq.a}</Text>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {/* ─── FOOTER ─── */}
        <Animated.View entering={FadeIn.delay(900)} style={styles.footer}>
          <View style={styles.trustBadge}>
            <Ionicons name="shield-checkmark" size={14} color="#1A8A7E" />
            <Text style={styles.trustBadgeText}>TrustLayer Verified</Text>
          </View>
          <Text style={styles.footerText}>All plans include 256-bit encryption & blockchain verification</Text>
        </Animated.View>
      </View>
            <Footer />

</ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { paddingHorizontal: 24, paddingTop: 20 },
  heroInner: { width: '100%', alignItems: 'center' },
  heroTitle: { fontSize: 38, fontWeight: '900', color: '#FFF', letterSpacing: -1.5, lineHeight: 46, marginBottom: 16, textAlign: 'center' },
  heroSubtitle: { fontSize: 17, color: '#A1A1AA', lineHeight: 28, textAlign: 'center', maxWidth: 520 },
  content: { paddingHorizontal: 24 },
  billingToggle: {
    flexDirection: 'row', alignSelf: 'center', backgroundColor: 'rgba(9,9,11,0.6)',
    borderRadius: 14, padding: 4, marginTop: 32, marginBottom: 32, borderWidth: 1, borderColor: '#27272A',
  },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  toggleActive: { backgroundColor: 'rgba(26,138,126,0.15)' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#71717A' },
  toggleTextActive: { color: '#FFF' },
  saveBadge: { backgroundColor: 'rgba(26,138,126,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  saveText: { fontSize: 10, fontWeight: '700', color: '#1A8A7E', textTransform: 'uppercase' },
  foundersWrap: {
    borderRadius: 20, padding: 28, marginBottom: 32, borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  foundersBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
    backgroundColor: 'rgba(212,175,55,0.1)', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', marginBottom: 16,
  },
  foundersBadgeText: { color: '#D4AF37', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  foundersName: { fontSize: 26, fontWeight: '800', color: '#FFF', marginBottom: 8 },
  foundersPrice: { fontSize: 40, fontWeight: '900', color: '#D4AF37' },
  foundersDesc: { fontSize: 14, color: '#A1A1AA', lineHeight: 22, marginTop: 8, marginBottom: 16 },
  foundersFeatures: { marginTop: 8 },
  foundersBtn: {
    backgroundColor: '#D4AF37', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 16,
  },
  foundersBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  plansRow: { flexDirection: 'row', gap: 16 },
  planCard: { padding: 28, marginBottom: 16, backgroundColor: 'rgba(9,9,11,0.7)', borderColor: 'rgba(39,39,42,0.6)' },
  planHighlighted: { borderColor: 'rgba(26,138,126,0.3)', borderWidth: 2 },
  planBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1, marginBottom: 16,
  },
  planBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  planIconWrap: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  planName: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  planPrice: { fontSize: 36, fontWeight: '900', color: '#FFF' },
  pricePeriod: { fontSize: 16, color: '#71717A', fontWeight: '500' },
  billedAnnually: { fontSize: 11, color: '#52525B', marginTop: 2, marginLeft: 4 },
  planDesc: { fontSize: 14, color: '#A1A1AA', lineHeight: 21, marginTop: 8 },
  divider: { height: 1, backgroundColor: '#27272A', marginVertical: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  featureText: { fontSize: 13, color: '#D4D4D8', fontWeight: '500', flex: 1 },
  planBtn: {
    borderWidth: 1, borderColor: '#27272A', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, marginTop: 20,
  },
  planBtnHighlighted: { backgroundColor: '#1A8A7E', borderColor: '#1A8A7E' },
  planBtnText: { fontSize: 15, fontWeight: '700', color: '#A1A1AA' },
  planBtnTextHighlighted: { color: '#FFF' },
  enterpriseCta: { padding: 28, marginTop: 16, backgroundColor: 'rgba(212,175,55,0.04)', borderColor: 'rgba(212,175,55,0.15)' },
  enterpriseCtaInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  enterpriseCtaTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  enterpriseCtaDesc: { fontSize: 13, color: '#A1A1AA', lineHeight: 20 },
  enterpriseCtaBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  enterpriseCtaBtnText: { fontSize: 13, fontWeight: '700', color: '#D4AF37' },
  sectionHeader: { marginBottom: 20 },
  sectionEyebrow: { fontSize: 11, color: '#1A8A7E', fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 },
  sectionTitle: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.5, marginBottom: 8 },
  comparisonCard: { padding: 0, backgroundColor: 'rgba(9,9,11,0.7)', borderColor: 'rgba(39,39,42,0.6)', overflow: 'hidden' },
  compRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  compRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(39,39,42,0.4)' },
  compLabel: { fontSize: 13, color: '#A1A1AA', flex: 1 },
  compCost: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  compTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingVertical: 18, borderTopWidth: 1, borderTopColor: '#27272A',
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  compTotalLabel: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  compTotalValue: { fontSize: 18, fontWeight: '800', color: '#EF4444' },
  compSavings: { paddingHorizontal: 24, paddingVertical: 18, backgroundColor: 'rgba(26,138,126,0.06)' },
  compSavingsInner: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  compSavingsText: { fontSize: 14, color: '#D4D4D8', flex: 1, lineHeight: 20 },
  faqItem: {
    backgroundColor: 'rgba(9,9,11,0.5)', borderWidth: 1, borderColor: '#27272A',
    borderRadius: 14, padding: 20, marginBottom: 12,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: '#FFF', flex: 1, marginRight: 12 },
  faqAnswer: { fontSize: 14, color: '#A1A1AA', lineHeight: 22, marginTop: 12 },
  footer: { alignItems: 'center', gap: 12, marginTop: 56 },
  trustBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(26,138,126,0.08)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.2)',
  },
  trustBadgeText: { fontSize: 11, color: '#1A8A7E', fontWeight: '600', letterSpacing: 0.5 },
  footerText: { fontSize: 12, color: '#52525B', fontWeight: '500', letterSpacing: 0.3, textAlign: 'center' },
});
