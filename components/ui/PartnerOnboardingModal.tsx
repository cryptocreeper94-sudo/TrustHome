import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PartnerOnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

interface ProjectionTier {
  label: string;
  agents: number;
  monthlyPerAgent: number;
  brokerages: number;
  monthlyPerBrokerage: number;
  whiteLabel: number;
  monthlyPerWhiteLabel: number;
}

const PROJECTIONS: ProjectionTier[] = [
  { label: 'Launch (Months 1-6)', agents: 25, monthlyPerAgent: 79, brokerages: 2, monthlyPerBrokerage: 499, whiteLabel: 0, monthlyPerWhiteLabel: 2499 },
  { label: 'Growth (Months 7-12)', agents: 100, monthlyPerAgent: 79, brokerages: 8, monthlyPerBrokerage: 499, whiteLabel: 2, monthlyPerWhiteLabel: 2499 },
  { label: 'Scale (Year 2)', agents: 500, monthlyPerAgent: 79, brokerages: 30, monthlyPerBrokerage: 499, whiteLabel: 10, monthlyPerWhiteLabel: 2499 },
  { label: 'Franchise (Year 3+)', agents: 2000, monthlyPerAgent: 79, brokerages: 100, monthlyPerBrokerage: 499, whiteLabel: 50, monthlyPerWhiteLabel: 2499 },
];

function calcMRR(tier: ProjectionTier): number {
  return (tier.agents * tier.monthlyPerAgent) + (tier.brokerages * tier.monthlyPerBrokerage) + (tier.whiteLabel * tier.monthlyPerWhiteLabel);
}

function calcARR(tier: ProjectionTier): number {
  return calcMRR(tier) * 12;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

const COMPLETED_FEATURES = [
  'PIN-Based Authentication',
  'Multi-Tenant Architecture',
  'Agent Dashboard & CRM',
  'Client Portal',
  'Transaction Pipeline',
  'AI Marketing Hub & Blog',
  'Trust Layer Blockchain',
  'Trust Shield Security',
  'DarkWave Media Studio',
  'Signal Chat (Cross-Ecosystem)',
  'Voice AI Assistant (STT/TTS)',
  'WelcomeGuide Onboarding',
  'Contextual Help (9+ Screens)',
  'Demo Mode (Credential-Verified)',
  'Developer Console',
  'Light/Dark Theme',
  'PWA Capabilities',
  'White-Label Branding System',
];

const UPCOMING_FEATURES = [
  'MLS/RESO Web API Integration',
  'DocuSign/Dotloop E-Signatures',
  'Calendar Sync (Google/Apple)',
  'ShowingTime API Sync',
  'Listing Syndication (Zillow, Realtor.com)',
  'Social Media Automation',
  'BoldTrail/kvCORE CRM Sync',
  'Orbit Staffing (HR, Payroll)',
];

interface SlideData {
  icon: string;
  iconLib: 'mci' | 'ion' | 'feather';
  title: string;
  subtitle: string;
  accent: string;
  type: 'text' | 'features' | 'projections' | 'whitelabel' | 'franchise';
  body?: string;
}

const SLIDES: SlideData[] = [
  {
    icon: 'shield-star',
    iconLib: 'mci',
    title: 'Welcome Back, Jennifer',
    subtitle: 'Managing Partner  |  51% Owner',
    body: "TrustHome is your platform. As the majority owner and managing member of DarkWave Studios LLC, everything built here carries your name, your vision, and your industry expertise. This is not just software — it's your business.\n\nThis partner dashboard gives you an up-to-date look at where we stand, what's ready, and how this scales into a real revenue engine.",
    accent: '#D4AF37',
    type: 'text',
  },
  {
    icon: 'checkmark-done',
    iconLib: 'ion',
    title: 'Built & Ready',
    subtitle: `${COMPLETED_FEATURES.length} Features Complete`,
    accent: '#1A8A7E',
    type: 'features',
  },
  {
    icon: 'color-palette',
    iconLib: 'ion',
    title: 'White-Label Ready',
    subtitle: 'Your Brand, Their Business',
    body: "TrustHome is built from the ground up to be white-labeled. Any brokerage or real estate company can run their own branded version — their logo, their colors, their domain — all powered by TrustHome's engine underneath.\n\nThis means every brokerage that signs up gets a premium platform without building anything. They pay monthly, and we handle the tech. Their agents see their brand. We see recurring revenue.\n\nThe multi-tenant architecture is already live. Each agent operates in their own secure space. Branding controls are built into the settings. Custom domains are supported. This isn't a feature on the roadmap — it's done.",
    accent: '#9B59B6',
    type: 'whitelabel',
  },
  {
    icon: 'trending-up',
    iconLib: 'ion',
    title: 'Revenue Projections',
    subtitle: 'Three Revenue Streams',
    accent: '#4A90D9',
    type: 'projections',
  },
  {
    icon: 'storefront',
    iconLib: 'ion',
    title: 'Franchise Model',
    subtitle: 'Scale Without Limits',
    accent: '#E8715A',
    type: 'franchise',
  },
  {
    icon: 'briefcase',
    iconLib: 'ion',
    title: 'Woman-Owned Business',
    subtitle: 'WOSB / WBENC Eligible',
    body: "With your 51% ownership stake, TrustHome qualifies as a Woman-Owned Small Business under both the SBA's WOSB program and WBENC certification. This opens real doors:\n\nGovernment contracts set aside for women-owned businesses. Corporate supplier diversity programs at Fortune 500 companies. Specialized grants and funding through the SBA, SCORE, and WBENC channels. Preferred vendor status in industries that prioritize diversity in their supply chain.\n\nYour name on this business isn't symbolic — it's strategic. As real estate tech grows, having WOSB certification in a PropTech company is a competitive advantage that most startups can't claim.",
    accent: '#9B59B6',
    type: 'text',
  },
  {
    icon: 'rocket',
    iconLib: 'ion',
    title: "Let's Build This",
    subtitle: 'The Foundation Is Set',
    body: "Everything we've built so far is the foundation. The platform works. The architecture scales. The white-label system is ready. The AI assistant is live. The blockchain integration is verified.\n\nNow it's about getting it in front of people. Every agent you know, every broker you've worked with, every title company and lender in your network — they all need what we've built.\n\nYour 51% isn't just ownership. It's the driving force. You know this industry. You know these people. Let's show them what TrustHome can do.\n\nYou can revisit this dashboard anytime from your Settings page.",
    accent: '#1A8A7E',
    type: 'text',
  },
];

function SlideIcon({ slide, size }: { slide: SlideData; size: number }) {
  if (slide.iconLib === 'mci') {
    return <MaterialCommunityIcons name={slide.icon as any} size={size} color={slide.accent} />;
  }
  if (slide.iconLib === 'feather') {
    return <Feather name={slide.icon as any} size={size} color={slide.accent} />;
  }
  return <Ionicons name={slide.icon as any} size={size} color={slide.accent} />;
}

function FeatureList({ features, color, accent }: { features: string[]; color: string; accent: string }) {
  return (
    <View style={featureStyles.grid}>
      {features.map((f, i) => (
        <View key={i} style={[featureStyles.item, { backgroundColor: accent + '10', borderColor: accent + '20' }]}>
          <Ionicons name="checkmark-circle" size={14} color={accent} />
          <Text style={[featureStyles.itemText, { color }]} numberOfLines={1}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

function UpcomingList({ features, color }: { features: string[]; color: string }) {
  return (
    <View style={featureStyles.upcoming}>
      {features.map((f, i) => (
        <View key={i} style={featureStyles.upcomingItem}>
          <Ionicons name="time-outline" size={13} color="#D4AF37" />
          <Text style={[featureStyles.upcomingText, { color }]} numberOfLines={1}>{f}</Text>
        </View>
      ))}
    </View>
  );
}

function ProjectionCard({ tier, color, secondaryColor, accent }: { tier: ProjectionTier; color: string; secondaryColor: string; accent: string }) {
  const mrr = calcMRR(tier);
  const arr = calcARR(tier);
  const jenCut = Math.round(arr * 0.51);

  return (
    <View style={[projStyles.card, { borderColor: accent + '30', backgroundColor: accent + '08' }]}>
      <Text style={[projStyles.tierLabel, { color: accent }]}>{tier.label}</Text>
      <View style={projStyles.metricsRow}>
        <View style={projStyles.metric}>
          <Text style={[projStyles.metricValue, { color }]}>{formatCurrency(mrr)}</Text>
          <Text style={[projStyles.metricLabel, { color: secondaryColor }]}>Monthly</Text>
        </View>
        <View style={[projStyles.metricDivider, { backgroundColor: accent + '20' }]} />
        <View style={projStyles.metric}>
          <Text style={[projStyles.metricValue, { color }]}>{formatCurrency(arr)}</Text>
          <Text style={[projStyles.metricLabel, { color: secondaryColor }]}>Annual</Text>
        </View>
        <View style={[projStyles.metricDivider, { backgroundColor: accent + '20' }]} />
        <View style={projStyles.metric}>
          <Text style={[projStyles.metricValue, { color: '#D4AF37' }]}>{formatCurrency(jenCut)}</Text>
          <Text style={[projStyles.metricLabel, { color: secondaryColor }]}>Your 51%</Text>
        </View>
      </View>
      <View style={projStyles.breakdownRow}>
        <Text style={[projStyles.breakdownText, { color: secondaryColor }]}>
          {tier.agents} agents x ${tier.monthlyPerAgent}/mo
          {tier.brokerages > 0 ? `  +  ${tier.brokerages} brokerages x $${tier.monthlyPerBrokerage}/mo` : ''}
          {tier.whiteLabel > 0 ? `  +  ${tier.whiteLabel} white-label x $${tier.monthlyPerWhiteLabel.toLocaleString()}/mo` : ''}
        </Text>
      </View>
    </View>
  );
}

export function PartnerOnboardingModal({ visible, onComplete }: PartnerOnboardingModalProps) {
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
      case 'features':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionLabel, { color: slide.accent }]}>LIVE NOW</Text>
            <FeatureList features={COMPLETED_FEATURES} color={colors.text} accent={slide.accent} />
            <Text style={[styles.sectionLabel, { color: '#D4AF37', marginTop: 16 }]}>COMING NEXT</Text>
            <UpcomingList features={UPCOMING_FEATURES} color={colors.textSecondary} />
          </ScrollView>
        );

      case 'projections':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <View style={projStyles.pricingHeader}>
              <View style={[projStyles.priceBadge, { backgroundColor: '#1A8A7E15', borderColor: '#1A8A7E30' }]}>
                <Ionicons name="person" size={13} color="#1A8A7E" />
                <Text style={[projStyles.priceText, { color: '#1A8A7E' }]}>Agents: $79/mo</Text>
              </View>
              <View style={[projStyles.priceBadge, { backgroundColor: '#4A90D915', borderColor: '#4A90D930' }]}>
                <Ionicons name="business" size={13} color="#4A90D9" />
                <Text style={[projStyles.priceText, { color: '#4A90D9' }]}>Brokerages: $499/mo</Text>
              </View>
              <View style={[projStyles.priceBadge, { backgroundColor: '#9B59B615', borderColor: '#9B59B630' }]}>
                <Ionicons name="layers" size={13} color="#9B59B6" />
                <Text style={[projStyles.priceText, { color: '#9B59B6' }]}>White-Label: $2,499/mo</Text>
              </View>
            </View>
            {PROJECTIONS.map((tier, i) => (
              <ProjectionCard key={i} tier={tier} color={colors.text} secondaryColor={colors.textSecondary} accent={slide.accent} />
            ))}
            <View style={[projStyles.highlightBox, { backgroundColor: '#D4AF3710', borderColor: '#D4AF3730' }]}>
              <MaterialCommunityIcons name="star-four-points" size={18} color="#D4AF37" />
              <Text style={[projStyles.highlightText, { color: colors.text }]}>
                Year 3 projection: {formatCurrency(calcARR(PROJECTIONS[3]))} ARR with your 51% share at {formatCurrency(Math.round(calcARR(PROJECTIONS[3]) * 0.51))} annually
              </Text>
            </View>
          </ScrollView>
        );

      case 'whitelabel':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{slide.body}</Text>
            <View style={wlStyles.benefitsGrid}>
              {[
                { icon: 'brush-outline', label: 'Custom Branding', desc: 'Their logo, colors, domain' },
                { icon: 'people-outline', label: 'Multi-Tenant', desc: 'Secure agent isolation' },
                { icon: 'server-outline', label: 'Managed Hosting', desc: 'We handle the infrastructure' },
                { icon: 'sync-outline', label: 'Auto Updates', desc: 'New features roll out to all' },
              ].map((b, i) => (
                <View key={i} style={[wlStyles.benefit, { backgroundColor: slide.accent + '08', borderColor: slide.accent + '20' }]}>
                  <Ionicons name={b.icon as any} size={22} color={slide.accent} />
                  <Text style={[wlStyles.benefitLabel, { color: colors.text }]}>{b.label}</Text>
                  <Text style={[wlStyles.benefitDesc, { color: colors.textSecondary }]}>{b.desc}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'franchise':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.slideBody, { color: colors.textSecondary, marginBottom: 16 }]}>
              The franchise model is where TrustHome becomes a national brand. Regional partners license the platform for their market, recruit agents, and grow their own book of business — all running on our technology.
            </Text>
            <View style={franchiseStyles.steps}>
              {[
                { num: '1', title: 'Regional Licensing', desc: 'Partners pay a monthly license fee for exclusive territory rights. They run their own branded TrustHome for their market.' },
                { num: '2', title: 'Agent Recruitment', desc: 'Each regional partner recruits agents in their territory. We provide the onboarding, they provide the relationships.' },
                { num: '3', title: 'Revenue Sharing', desc: 'Partners keep a percentage of agent subscriptions in their territory. We keep the platform fee. Everyone wins.' },
                { num: '4', title: 'National Scale', desc: '50 regional partners x 40 agents each = 2,000 agents nationwide. This is how you build a real estate tech empire.' },
              ].map((step, i) => (
                <View key={i} style={[franchiseStyles.step, { borderColor: slide.accent + '25' }]}>
                  <View style={[franchiseStyles.stepNum, { backgroundColor: slide.accent }]}>
                    <Text style={franchiseStyles.stepNumText}>{step.num}</Text>
                  </View>
                  <View style={franchiseStyles.stepContent}>
                    <Text style={[franchiseStyles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[franchiseStyles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
            <View style={[projStyles.highlightBox, { backgroundColor: '#E8715A10', borderColor: '#E8715A30', marginTop: 12 }]}>
              <Ionicons name="bulb" size={18} color="#E8715A" />
              <Text style={[projStyles.highlightText, { color: colors.text }]}>
                With the franchise model, TrustHome transitions from a product to a platform company — generating revenue even while you sleep.
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
            <View style={styles.partnerBadge}>
              <MaterialCommunityIcons name="shield-star" size={16} color="#D4AF37" />
              <Text style={[styles.partnerBadgeText, { color: '#D4AF37' }]}>Partner Dashboard</Text>
            </View>
            <Pressable onPress={onComplete} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textTertiary} />
            </Pressable>
          </View>

          <Animated.View style={[styles.slideContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.accent + '15' }]}>
              <SlideIcon slide={slide} size={36} />
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
              <Text style={styles.primaryBtnText}>{isLast ? "Let's Go" : 'Next'}</Text>
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
  partnerBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  partnerBadgeText: {
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

const featureStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  upcoming: {
    gap: 4,
  },
  upcomingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 3,
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
});

const projStyles = StyleSheet.create({
  pricingHeader: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
    marginBottom: 12,
    justifyContent: 'center' as const,
  },
  priceBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-around' as const,
  },
  metric: {
    alignItems: 'center' as const,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800' as const,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
  },
  breakdownRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  breakdownText: {
    fontSize: 10,
    textAlign: 'center' as const,
    lineHeight: 16,
  },
  highlightBox: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
});

const wlStyles = StyleSheet.create({
  benefitsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 16,
  },
  benefit: {
    width: '47%' as any,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center' as const,
    gap: 6,
  },
  benefitLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  benefitDesc: {
    fontSize: 11,
    textAlign: 'center' as const,
  },
});

const franchiseStyles = StyleSheet.create({
  steps: {
    gap: 10,
  },
  step: {
    flexDirection: 'row' as const,
    gap: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  stepNumText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  stepContent: {
    flex: 1,
    gap: 3,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
