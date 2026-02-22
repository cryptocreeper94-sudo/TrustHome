import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LicensingPackProps {
  visible: boolean;
  onComplete: () => void;
}

interface SlideData {
  icon: string;
  title: string;
  subtitle: string;
  accent: string;
  type: 'text' | 'pricing' | 'included' | 'timeline' | 'support' | 'roi';
  body?: string;
}

const SLIDES: SlideData[] = [
  {
    icon: 'briefcase',
    title: 'Enterprise Licensing',
    subtitle: 'TrustHome for Large Brokerages',
    body: "This licensing pack is designed for brokerages deploying TrustHome across 100+ agents. It includes volume pricing, dedicated support, custom onboarding, and white-label branding — all included in a single licensing agreement.\n\nThis is not a per-agent signup. It's a single contract covering your entire brokerage — one agreement, one billing relationship, one point of contact. Every agent gets full access to every feature, and your brokerage brand is front and center.\n\nVolume pricing starts at 30% below standard rates and increases with scale. Dedicated onboarding ensures your team is productive from day one.",
    accent: '#1A8A7E',
    type: 'text',
  },
  {
    icon: 'pricetags',
    title: 'Volume Pricing Tiers',
    subtitle: 'Scale Saves More',
    accent: '#4A90D9',
    type: 'pricing',
  },
  {
    icon: 'checkmark-done-circle',
    title: "What's Included",
    subtitle: 'Every Enterprise License Includes',
    accent: '#1A8A7E',
    type: 'included',
  },
  {
    icon: 'calendar',
    title: 'Onboarding Timeline',
    subtitle: 'Live in 6 Weeks or Less',
    accent: '#059669',
    type: 'timeline',
  },
  {
    icon: 'headset',
    title: 'Support Tiers',
    subtitle: 'Choose the Level You Need',
    accent: '#9B59B6',
    type: 'support',
  },
  {
    icon: 'calculator',
    title: 'ROI Calculator',
    subtitle: 'The Numbers Speak for Themselves',
    accent: '#D4AF37',
    type: 'roi',
  },
  {
    icon: 'document-text',
    title: 'Contract Terms',
    subtitle: 'Fair, Transparent, Flexible',
    body: "\u2022 Minimum 12-month contract for enterprise pricing\n\u2022 Annual billing with 10% discount, or monthly billing available\n\u2022 30-day notice for scaling up (add agents anytime)\n\u2022 90-day notice for scaling down or cancellation\n\u2022 Data export included at any time\n\u2022 SLA guarantees: 99.9% uptime\n\u2022 All data encrypted, SOC 2 compliance roadmap in progress\n\u2022 Woman-owned business (WOSB eligible) — qualifies for supplier diversity programs\n\nOur contracts are designed to be fair and transparent. We want long-term partnerships, not lock-in. If TrustHome delivers value, you'll stay because you want to — not because you have to.",
    accent: '#E8715A',
    type: 'text',
  },
  {
    icon: 'rocket',
    title: 'Next Steps',
    subtitle: 'Ready to Get Started?',
    body: "\u2022 Schedule a discovery call — Jennifer will walk you through a live demo of the Command Center\n\u2022 We'll prepare a custom proposal based on your agent count and requirements\n\u2022 Pilot program available — start with 10-20 agents before full commitment\n\u2022 Founders Program applies to enterprise too — first 100 total agent subscribers lock in discounted rates\n\nContact Jennifer Lambert directly to begin the conversation. She'll assess your brokerage's needs and prepare a tailored proposal within 48 hours.\n\nThis licensing pack is always available in Settings > Partner Dashboard.",
    accent: '#D4AF37',
    type: 'text',
  },
];

const INCLUDED_FEATURES = [
  'White-label branding (logo, colors, domain)',
  'Dedicated onboarding manager',
  'Priority support (4-hour SLA)',
  'Custom training materials',
  'Admin dashboard for brokerage management',
  'Agent performance analytics',
  'Bulk agent provisioning',
  'API access for CRM integration',
  'Blockchain verification for all transactions',
  'AI marketing tools for every agent',
  'Signal Chat cross-ecosystem messaging',
  'Media Studio access for property content',
  'Quarterly business reviews',
  'Compliance & audit reporting',
];

const PRICING_TIERS = [
  { range: '100-249 agents', price: '$69/agent/mo', discount: '30% off standard $99' },
  { range: '250-499 agents', price: '$59/agent/mo', discount: '40% off' },
  { range: '500-999 agents', price: '$49/agent/mo', discount: '50% off' },
  { range: '1000+ agents', price: 'Custom', discount: 'Contact for quote' },
];

const ONBOARDING_STEPS = [
  { num: '1', title: 'Discovery Call (Week 1)', desc: 'Understand brokerage needs, agent count, tech stack, branding requirements' },
  { num: '2', title: 'Contract & Setup (Week 2)', desc: 'Licensing agreement signed, white-label configuration begins, Stripe billing connected' },
  { num: '3', title: 'Brand Customization (Week 3)', desc: 'Logo, colors, domain configured. Admin dashboard provisioned. Training materials created' },
  { num: '4', title: 'Pilot Launch (Week 4)', desc: '10-20 agents onboarded first. Feedback collected, adjustments made' },
  { num: '5', title: 'Full Rollout (Weeks 5-6)', desc: 'All agents provisioned. Bulk import from existing CRM. Go-live support' },
  { num: '6', title: 'Ongoing Support', desc: 'Dedicated account manager, quarterly reviews, feature requests prioritized' },
];

const SUPPORT_TIERS_DATA = [
  {
    name: 'Standard',
    tag: 'Included',
    tagColor: '#1A8A7E',
    features: ['Email support', '24hr response', 'Knowledge base', 'Community forum'],
  },
  {
    name: 'Priority',
    tag: 'Included with Enterprise',
    tagColor: '#4A90D9',
    features: ['4hr SLA', 'Phone + email', 'Dedicated account manager', 'Quarterly reviews'],
  },
  {
    name: 'Premium',
    tag: 'Add-on \u00b7 $2,999/mo',
    tagColor: '#D4AF37',
    features: ['1hr SLA', '24/7 phone', 'Dedicated engineer', 'Custom feature development', 'White-glove onboarding'],
  },
];

const ROI_BREAKDOWN = [
  { label: 'CRM', range: '$50-100' },
  { label: 'Transaction Mgmt', range: '$30-50' },
  { label: 'Marketing', range: '$50-100' },
  { label: 'Document Storage', range: '$20-30' },
  { label: 'Communication', range: '$20-30' },
  { label: 'Analytics', range: '$30-60' },
];

export function LicensingPack({ visible, onComplete }: LicensingPackProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setCurrentSlide(0);
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [visible]);

  const animateTransition = (next: number) => {
    const direction = next > currentSlide ? -1 : 1;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: direction * 30, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setCurrentSlide(next);
      slideAnim.setValue(direction * -30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      animateTransition(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      animateTransition(currentSlide - 1);
    }
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;

  const renderSlideContent = () => {
    switch (slide.type) {
      case 'pricing':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {PRICING_TIERS.map((tier, i) => (
              <View key={i} style={[pricingStyles.tierCard, { borderColor: slide.accent + '25', backgroundColor: slide.accent + '08' }]}>
                <View style={pricingStyles.tierRow}>
                  <Text style={[pricingStyles.tierRange, { color: colors.text }]}>{tier.range}</Text>
                  <Text style={[pricingStyles.tierPrice, { color: slide.accent }]}>{tier.price}</Text>
                </View>
                <Text style={[pricingStyles.tierDiscount, { color: colors.textSecondary }]}>{tier.discount}</Text>
              </View>
            ))}
            <View style={[pricingStyles.noteBox, { backgroundColor: '#1A8A7E10', borderColor: '#1A8A7E30' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#1A8A7E" />
              <Text style={[pricingStyles.noteText, { color: colors.text }]}>
                All tiers include white-label branding at no additional cost
              </Text>
            </View>
            <View style={[pricingStyles.noteBox, { backgroundColor: '#D4AF3710', borderColor: '#D4AF3730', marginTop: 6 }]}>
              <Ionicons name="diamond" size={16} color="#D4AF37" />
              <Text style={[pricingStyles.noteText, { color: colors.text }]}>
                Annual contracts get additional 10% discount
              </Text>
            </View>
          </ScrollView>
        );

      case 'included':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <View style={featureStyles.grid}>
              {INCLUDED_FEATURES.map((f, i) => (
                <View key={i} style={[featureStyles.item, { backgroundColor: slide.accent + '10', borderColor: slide.accent + '20' }]}>
                  <Ionicons name="checkmark-circle" size={14} color={slide.accent} />
                  <Text style={[featureStyles.itemText, { color: colors.text }]} numberOfLines={2}>{f}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'timeline':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <View style={stepStyles.steps}>
              {ONBOARDING_STEPS.map((step, i) => (
                <View key={i} style={[stepStyles.step, { borderColor: slide.accent + '25' }]}>
                  <View style={[stepStyles.stepNum, { backgroundColor: slide.accent }]}>
                    <Text style={stepStyles.stepNumText}>{step.num}</Text>
                  </View>
                  <View style={stepStyles.stepContent}>
                    <Text style={[stepStyles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[stepStyles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'support':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {SUPPORT_TIERS_DATA.map((tier, i) => (
              <View key={i} style={[supportStyles.card, { borderColor: tier.tagColor + '25', backgroundColor: tier.tagColor + '06', marginBottom: 8 }]}>
                <View style={supportStyles.cardHeader}>
                  <Text style={[supportStyles.cardName, { color: colors.text }]}>{tier.name}</Text>
                  <View style={[supportStyles.tagBadge, { backgroundColor: tier.tagColor + '18', borderColor: tier.tagColor + '35' }]}>
                    <Text style={[supportStyles.tagText, { color: tier.tagColor }]}>{tier.tag}</Text>
                  </View>
                </View>
                {tier.features.map((feat, j) => (
                  <View key={j} style={supportStyles.featureRow}>
                    <Ionicons name="checkmark" size={14} color={tier.tagColor} />
                    <Text style={[supportStyles.featureText, { color: colors.textSecondary }]}>{feat}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        );

      case 'roi':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: '#E8715A' }]}>TYPICAL AGENT TECH STACK: $200-400/MO</Text>
            <View style={roiStyles.breakdownGrid}>
              {ROI_BREAKDOWN.map((item, i) => (
                <View key={i} style={[roiStyles.breakdownItem, { backgroundColor: '#E8715A08', borderColor: '#E8715A20' }]}>
                  <Text style={[roiStyles.breakdownLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[roiStyles.breakdownRange, { color: colors.text }]}>{item.range}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: '#1A8A7E', marginTop: 14 }]}>TRUSTHOME ENTERPRISE (250 AGENTS)</Text>
            <View style={[roiStyles.highlightCard, { backgroundColor: '#1A8A7E10', borderColor: '#1A8A7E30' }]}>
              <View style={roiStyles.highlightRow}>
                <Text style={[roiStyles.highlightLabel, { color: colors.textSecondary }]}>TrustHome Enterprise</Text>
                <Text style={[roiStyles.highlightValue, { color: '#1A8A7E' }]}>$59/agent/mo</Text>
              </View>
              <View style={roiStyles.highlightRow}>
                <Text style={[roiStyles.highlightLabel, { color: colors.textSecondary }]}>Annual savings per agent</Text>
                <Text style={[roiStyles.highlightValue, { color: '#34C759' }]}>$1,692-4,092</Text>
              </View>
              <View style={[roiStyles.highlightRow, { borderBottomWidth: 0 }]}>
                <Text style={[roiStyles.highlightLabel, { color: colors.textSecondary }]}>Annual savings (250 agents)</Text>
                <Text style={[roiStyles.highlightValue, { color: '#D4AF37' }]}>$423K-$1.02M</Text>
              </View>
            </View>

            <View style={[roiStyles.bonusBox, { backgroundColor: '#4A90D910', borderColor: '#4A90D930', marginTop: 10 }]}>
              <Ionicons name="add-circle" size={16} color="#4A90D9" />
              <Text style={[roiStyles.bonusText, { color: colors.text }]}>
                Plus: blockchain verification, AI tools, ecosystem access — things competitors don't offer at any price
              </Text>
            </View>
          </ScrollView>
        );

      default:
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{slide.body}</Text>
          </ScrollView>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onComplete}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.88)' }]}>
        <View style={[styles.card, {
          backgroundColor: colors.backgroundSecondary,
          paddingTop: Platform.OS === 'web' ? 24 : Math.max(insets.top, 16),
          paddingBottom: Platform.OS === 'web' ? 34 : Math.max(insets.bottom + 12, 24),
          maxHeight: Platform.OS === 'web' ? '90vh' as any : Dimensions.get('window').height * 0.9,
        }]}>
          <View style={styles.topRow}>
            <View style={styles.badgeContainer}>
              <Ionicons name="briefcase" size={16} color="#1A8A7E" />
              <Text style={[styles.badgeText, { color: '#1A8A7E' }]}>Enterprise Licensing</Text>
            </View>
            <Pressable onPress={onComplete} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textTertiary} />
            </Pressable>
          </View>

          <Animated.View style={[styles.slideContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.accent + '15' }]}>
              <Ionicons name={slide.icon as any} size={36} color={slide.accent} />
            </View>

            <Text style={[styles.slideTitle, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.slideSubtitle, { color: slide.accent }]}>{slide.subtitle}</Text>

            {renderSlideContent()}
          </Animated.View>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <Pressable
                key={i}
                onPress={() => { if (i !== currentSlide) animateTransition(i); }}
                hitSlop={6}
              >
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: i === currentSlide ? slide.accent : colors.border,
                      width: i === currentSlide ? 20 : 8,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.navRow}>
            {currentSlide > 0 ? (
              <Pressable onPress={goPrev} style={[styles.navBtn, { borderColor: colors.border }]}>
                <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
              </Pressable>
            ) : (
              <View style={styles.navSpacer} />
            )}

            <Pressable onPress={goNext} style={[styles.primaryBtn, { backgroundColor: isLast ? '#D4AF37' : slide.accent }]}>
              <Text style={styles.primaryBtnText}>{isLast ? "Let's Talk" : 'Next'}</Text>
              {!isLast && <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 24,
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(26,138,126,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.25)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  slideContent: {
    alignItems: 'center' as const,
    flex: 1,
    minHeight: 300,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 14,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  slideSubtitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  bodyScroll: {
    maxHeight: 320,
    width: '100%',
  },
  slideBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'left' as const,
    paddingHorizontal: 2,
  },
  dotsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginVertical: 14,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  navRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  navSpacer: {
    width: 44,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    height: 48,
    borderRadius: 14,
    gap: 6,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});

const pricingStyles = StyleSheet.create({
  tierCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tierRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 2,
  },
  tierRange: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  tierPrice: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  tierDiscount: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  noteBox: {
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    alignItems: 'center' as const,
    marginTop: 4,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});

const featureStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  item: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
  },
  itemText: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
});

const stepStyles = StyleSheet.create({
  steps: {
    gap: 8,
  },
  step: {
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 10,
    alignItems: 'flex-start' as const,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
});

const supportStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  featureRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 3,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});

const roiStyles = StyleSheet.create({
  breakdownGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  breakdownItem: {
    width: '48%' as any,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  breakdownLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  breakdownRange: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  highlightCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  highlightRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    flex: 1,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  bonusBox: {
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    alignItems: 'flex-start' as const,
  },
  bonusText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
