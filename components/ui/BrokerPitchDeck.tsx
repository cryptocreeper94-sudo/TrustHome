import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, ScrollView, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BrokerPitchDeckProps {
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

const FOUNDER_PRICING = {
  agent: 49,
  brokerage: 299,
  whiteLabel: 1499,
  milestone: 100,
};

const STANDARD_PRICING = {
  agent: 99,
  brokerage: 599,
  whiteLabel: 2999,
};

const PROJECTIONS: ProjectionTier[] = [
  { label: 'Founders Phase (Months 1-6)', agents: 25, monthlyPerAgent: FOUNDER_PRICING.agent, brokerages: 2, monthlyPerBrokerage: FOUNDER_PRICING.brokerage, whiteLabel: 0, monthlyPerWhiteLabel: FOUNDER_PRICING.whiteLabel },
  { label: 'Milestone Hit (Months 7-12)', agents: 100, monthlyPerAgent: FOUNDER_PRICING.agent, brokerages: 8, monthlyPerBrokerage: FOUNDER_PRICING.brokerage, whiteLabel: 2, monthlyPerWhiteLabel: FOUNDER_PRICING.whiteLabel },
  { label: 'Standard Pricing (Year 2)', agents: 500, monthlyPerAgent: STANDARD_PRICING.agent, brokerages: 30, monthlyPerBrokerage: STANDARD_PRICING.brokerage, whiteLabel: 10, monthlyPerWhiteLabel: STANDARD_PRICING.whiteLabel },
  { label: 'Franchise Scale (Year 3+)', agents: 2000, monthlyPerAgent: STANDARD_PRICING.agent, brokerages: 100, monthlyPerBrokerage: STANDARD_PRICING.brokerage, whiteLabel: 50, monthlyPerWhiteLabel: STANDARD_PRICING.whiteLabel },
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
  'PIN-Based & Trust Layer Ecosystem Auth',
  'Multi-Tenant Architecture (Agent Isolation)',
  'Agent Dashboard & CRM (PaintPros.io)',
  'Client Portal (Shortlists, Showings, Docs)',
  'Transaction Pipeline (Full Lifecycle)',
  'AI Marketing Hub & Blog System',
  'DarkWave Trust Layer Blockchain (DWTL)',
  'Trust Shield Security Suite',
  'DarkWave Media Studio (Connected)',
  'Signal Chat (Cross-Ecosystem Messaging)',
  'Voice AI Assistant (STT/TTS, OpenAI)',
  'WelcomeGuide & Contextual Help (9+ Screens)',
  'Browse Mode (Public Command Center)',
  'Trust Layer Ecosystem Login (Cross-App)',
  'MLS Self-Service Setup (10+ Providers)',
  'Verdara Tree Services Integration',
  'Orbit Staffing (Wired, Pending Publish)',
  'Developer Console & Access Management',
  'Demo Mode (License-Verified)',
  'White-Label Branding & Custom Domains',
  'Light/Dark Theme with Glassmorphism UI',
  'PWA Capabilities',
];

const UPCOMING_FEATURES = [
  'MLS/RESO Live Data Sync',
  'DocuSign/Dotloop E-Signatures',
  'Calendar Sync (Google/Apple)',
  'ShowingTime API Sync',
  'Listing Syndication (Zillow, Realtor.com)',
  'Social Media Automation (Facebook, Instagram)',
  'BoldTrail/kvCORE CRM Data Sync',
  'Home Inspector & Vendor Vertical Portals',
  'Mortgage Broker & Lender Integration',
  'Client Mobile Push Notifications',
];

interface SlideData {
  icon: string;
  iconLib: 'mci' | 'ion' | 'feather';
  title: string;
  subtitle: string;
  accent: string;
  type: 'text' | 'features' | 'projections' | 'whitelabel' | 'franchise' | 'founders' | 'competitive';
  body?: string;
}

const SLIDES: SlideData[] = [
  {
    icon: 'business',
    iconLib: 'ion',
    title: 'What TrustHome Is',
    subtitle: 'The Elevator Pitch',
    body: "TrustHome is an all-in-one, blockchain-verified real estate platform that replaces the patchwork of tools agents currently pay for — CRM, transaction management, marketing, document storage, communication, and analytics — with a single unified system.\n\nEvery agent gets their own branded experience. Every transaction is verified on the DarkWave Trust Layer blockchain. Every document is encrypted and immutable.\n\nFor agents, it's the only platform they need. For brokerages, it's a white-label solution they can deploy under their own brand — zero development costs, zero IT staff.\n\nThe public Command Center lets anyone explore the platform before signing up. When they're ready, they create an account and unlock everything.",
    accent: '#1A8A7E',
    type: 'text',
  },
  {
    icon: 'checkmark-done',
    iconLib: 'ion',
    title: 'Built & Live Now',
    subtitle: `${22} Features Complete · Not a Prototype`,
    accent: '#1A8A7E',
    type: 'features',
  },
  {
    icon: 'globe',
    iconLib: 'ion',
    title: 'The Ecosystem Advantage',
    subtitle: 'What No Competitor Can Match',
    body: "TrustHome is part of the DarkWave ecosystem — agents get access to services no competitor offers:\n\n\u2022 CRM & Analytics — Powered by PaintPros.io infrastructure, shared across ecosystem apps\n\u2022 Signal Chat — Cross-app messaging connecting TrustHome users with the entire DarkWave network\n\u2022 Media Studio (TrustVault) — Professional video walkthroughs, virtual staging, and property media\n\u2022 Verdara — AI-powered tree and landscape assessment integrated into property listings\n\u2022 Orbit Staffing — Automated bookkeeping, HR, and payroll\n\u2022 Trust Layer Blockchain — Every transaction, document, and identity verification on a custom Layer 1 chain\n\u2022 Trust Shield — Enterprise-grade security suite\n\nThis ecosystem is the moat. No competitor has blockchain-verified transactions, AI media production, cross-platform chat, AND automated financial distribution — all connected.",
    accent: '#4A90D9',
    type: 'text',
  },
  {
    icon: 'color-palette',
    iconLib: 'ion',
    title: 'White-Label Ready',
    subtitle: 'Their Brand, Our Engine',
    body: "This is the key revenue multiplier. Any brokerage can run their own branded version of TrustHome — their logo, their colors, their domain, their agents' profiles in the footer.\n\nThey pay a monthly subscription. We handle all the technology. Their agents see their brokerage brand. We see recurring revenue.\n\nThe multi-tenant architecture is already live. Each agent operates in their own secure, isolated space. Branding controls are built into settings. Custom domains are supported.\n\nThe pitch to a broker: 'Your brokerage gets a custom-branded, blockchain-verified real estate platform — no development costs, no IT staff needed. Your agents get the most advanced tools in the industry, and it runs under your brand.'",
    accent: '#9B59B6',
    type: 'whitelabel',
  },
  {
    icon: 'trending-up',
    iconLib: 'ion',
    title: 'Revenue Projections',
    subtitle: 'Three Revenue Streams · Recurring Monthly',
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
    icon: 'diamond',
    iconLib: 'ion',
    title: 'Founders Program',
    subtitle: 'First 100 Agents Get Locked-In Pricing',
    accent: '#D4AF37',
    type: 'founders',
  },
  {
    icon: 'shield-checkmark',
    iconLib: 'ion',
    title: 'Competitive Edge',
    subtitle: 'Why TrustHome Wins',
    accent: '#1A8A7E',
    type: 'competitive',
  },
  {
    icon: 'megaphone',
    iconLib: 'ion',
    title: 'Talking Points',
    subtitle: 'How to Present This to a Broker',
    body: "Open with the three-sentence pitch:\n\n\"TrustHome is a blockchain-verified real estate platform that replaces every tool your agents currently pay for — CRM, transaction management, marketing, documents, communication — with one unified system. It white-labels under your brand, so your agents see your brokerage, not ours. And it costs less than what most agents already spend on their current stack.\"\n\nKey points to hit:\n\n\u2022 22+ features already built and live — this isn't vaporware, show them the Command Center\n\u2022 White-label means their brand, zero development costs\n\u2022 Blockchain verification is a trust differentiator no competitor has\n\u2022 AI-powered marketing generates content automatically\n\u2022 Voice AI assistant handles questions 24/7\n\u2022 Founders Program gives early brokerages locked-in pricing\n\u2022 You're an owner, not a sales rep — they're working directly with leadership\n\nShow them trusthome.io — they can explore everything without logging in.\n\nThis pitch deck is always available in Settings > Partner Dashboard > Broker Pitch Deck.",
    accent: '#D4AF37',
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

export function BrokerPitchDeck({ visible, onComplete }: BrokerPitchDeckProps) {
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
              <View style={[projStyles.priceBadge, { backgroundColor: '#D4AF3715', borderColor: '#D4AF3730' }]}>
                <Ionicons name="diamond" size={13} color="#D4AF37" />
                <Text style={[projStyles.priceText, { color: '#D4AF37' }]}>Founder Rates (First 100)</Text>
              </View>
            </View>
            <View style={projStyles.pricingHeader}>
              <View style={[projStyles.priceBadge, { backgroundColor: '#1A8A7E15', borderColor: '#1A8A7E30' }]}>
                <Ionicons name="person" size={13} color="#1A8A7E" />
                <Text style={[projStyles.priceText, { color: '#1A8A7E' }]}>Agents: ${FOUNDER_PRICING.agent} then ${STANDARD_PRICING.agent}/mo</Text>
              </View>
              <View style={[projStyles.priceBadge, { backgroundColor: '#4A90D915', borderColor: '#4A90D930' }]}>
                <Ionicons name="business" size={13} color="#4A90D9" />
                <Text style={[projStyles.priceText, { color: '#4A90D9' }]}>Brokerages: ${FOUNDER_PRICING.brokerage} then ${STANDARD_PRICING.brokerage}/mo</Text>
              </View>
              <View style={[projStyles.priceBadge, { backgroundColor: '#9B59B615', borderColor: '#9B59B630' }]}>
                <Ionicons name="layers" size={13} color="#9B59B6" />
                <Text style={[projStyles.priceText, { color: '#9B59B6' }]}>White-Label: ${FOUNDER_PRICING.whiteLabel.toLocaleString()} then ${STANDARD_PRICING.whiteLabel.toLocaleString()}/mo</Text>
              </View>
            </View>
            {PROJECTIONS.map((tier, i) => (
              <ProjectionCard key={i} tier={tier} color={colors.text} secondaryColor={colors.textSecondary} accent={i < 2 ? '#D4AF37' : slide.accent} />
            ))}
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
            <View style={stepStyles.steps}>
              {[
                { num: '1', title: 'Regional Licensing', desc: 'Partners pay a monthly license fee for exclusive territory rights. They run their own branded TrustHome for their market.' },
                { num: '2', title: 'Agent Recruitment', desc: 'Each regional partner recruits agents in their territory. We provide the onboarding, they provide the relationships.' },
                { num: '3', title: 'Revenue Sharing', desc: 'Partners keep a percentage of agent subscriptions in their territory. We keep the platform fee. Everyone wins.' },
                { num: '4', title: 'National Scale', desc: '50 regional partners x 40 agents each = 2,000 agents nationwide. With white-label at $2,999/mo per partner, this is where the real scale begins.' },
              ].map((step, i) => (
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

      case 'founders':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.slideBody, { color: colors.textSecondary, marginBottom: 16 }]}>
              The Founders Program rewards agents and brokerages who believe in TrustHome early. They get locked-in pricing that never increases — and once we hit {FOUNDER_PRICING.milestone} agent subscribers, new signups pay the standard rate.
            </Text>

            <Text style={[styles.sectionLabel, { color: '#D4AF37' }]}>FOUNDER PRICING (First {FOUNDER_PRICING.milestone} Agents)</Text>
            <View style={founderStyles.comparisonGrid}>
              {[
                { tier: 'Agent', founder: FOUNDER_PRICING.agent, standard: STANDARD_PRICING.agent, icon: 'person' as const },
                { tier: 'Brokerage', founder: FOUNDER_PRICING.brokerage, standard: STANDARD_PRICING.brokerage, icon: 'business' as const },
                { tier: 'White-Label', founder: FOUNDER_PRICING.whiteLabel, standard: STANDARD_PRICING.whiteLabel, icon: 'layers' as const },
              ].map((row, i) => (
                <View key={i} style={[founderStyles.compRow, { borderColor: '#D4AF3720', backgroundColor: '#D4AF3708' }]}>
                  <View style={founderStyles.compLeft}>
                    <Ionicons name={row.icon} size={16} color="#D4AF37" />
                    <Text style={[founderStyles.compTier, { color: colors.text }]}>{row.tier}</Text>
                  </View>
                  <View style={founderStyles.compPrices}>
                    <View style={founderStyles.priceCol}>
                      <Text style={[founderStyles.priceAmount, { color: '#D4AF37' }]}>${row.founder}</Text>
                      <Text style={[founderStyles.priceLabel, { color: colors.textSecondary }]}>Founder</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                    <View style={founderStyles.priceCol}>
                      <Text style={[founderStyles.priceAmount, { color: colors.text }]}>${row.standard}</Text>
                      <Text style={[founderStyles.priceLabel, { color: colors.textSecondary }]}>Standard</Text>
                    </View>
                    <View style={[founderStyles.savingsBadge, { backgroundColor: '#34C75915' }]}>
                      <Text style={[founderStyles.savingsText, { color: '#34C759' }]}>Save {Math.round((1 - row.founder / row.standard) * 100)}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: slide.accent, marginTop: 16 }]}>HOW IT WORKS</Text>
            <View style={stepStyles.steps}>
              {[
                { num: '1', title: 'Launch at Founder Pricing', desc: `First ${FOUNDER_PRICING.milestone} agent subscribers get the discounted rate. They keep that rate forever.` },
                { num: '2', title: 'Hit the Milestone', desc: `Once we reach ${FOUNDER_PRICING.milestone} active agent subscribers, new signups automatically move to standard pricing.` },
                { num: '3', title: 'Founders Stay Locked In', desc: 'Early supporters never see a price increase. Their loyalty is rewarded permanently.' },
                { num: '4', title: 'Creates Urgency', desc: '"Get in now before founder pricing ends" is one of the strongest sales tools you can use.' },
              ].map((step, i) => (
                <View key={i} style={[stepStyles.step, { borderColor: '#D4AF3725' }]}>
                  <View style={[stepStyles.stepNum, { backgroundColor: '#D4AF37' }]}>
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

      case 'competitive':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <View style={compStyles.grid}>
              {[
                { us: 'Blockchain-verified transactions', them: 'No blockchain verification', icon: 'cube' },
                { us: 'White-label under broker brand', them: 'Fixed branding, limited customization', icon: 'color-palette' },
                { us: 'AI voice assistant + marketing', them: 'Basic CRM, no AI tools', icon: 'mic' },
                { us: 'Cross-ecosystem chat & services', them: 'Siloed, single-purpose apps', icon: 'globe' },
                { us: 'Video walkthroughs & virtual staging', them: 'Third-party media integrations', icon: 'videocam' },
                { us: 'Automated bookkeeping via Orbit', them: 'Manual revenue tracking', icon: 'sync' },
                { us: 'All-in-one: CRM + docs + marketing', them: 'Pay for each tool separately', icon: 'apps' },
                { us: 'Woman-owned (WOSB eligible)', them: 'No diversity certification', icon: 'ribbon' },
              ].map((row, i) => (
                <View key={i} style={[compStyles.row, { borderColor: colors.border + '40' }]}>
                  <View style={compStyles.iconCol}>
                    <Ionicons name={row.icon as any} size={16} color="#1A8A7E" />
                  </View>
                  <View style={compStyles.content}>
                    <View style={compStyles.usRow}>
                      <Ionicons name="checkmark-circle" size={13} color="#34C759" />
                      <Text style={[compStyles.usText, { color: colors.text }]}>{row.us}</Text>
                    </View>
                    <View style={compStyles.themRow}>
                      <Ionicons name="close-circle" size={13} color="#FF3B30" />
                      <Text style={[compStyles.themText, { color: colors.textTertiary }]}>{row.them}</Text>
                    </View>
                  </View>
                </View>
              ))}
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
            <View style={[styles.deckBadge, { backgroundColor: 'rgba(26,138,126,0.12)', borderColor: 'rgba(26,138,126,0.25)' }]}>
              <Ionicons name="easel" size={16} color="#1A8A7E" />
              <Text style={[styles.deckBadgeText, { color: '#1A8A7E' }]}>Broker Pitch Deck</Text>
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

            <Pressable onPress={goNext} style={[styles.primaryBtn, { backgroundColor: isLast ? '#1A8A7E' : slide.accent }]}>
              <Text style={styles.primaryBtnText}>{isLast ? 'Close Deck' : 'Next'}</Text>
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
  deckBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  deckBadgeText: {
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
});

const wlStyles = StyleSheet.create({
  benefitsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 14,
  },
  benefit: {
    width: '47%' as any,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center' as const,
    gap: 4,
  },
  benefitLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  benefitDesc: {
    fontSize: 11,
    textAlign: 'center' as const,
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

const founderStyles = StyleSheet.create({
  comparisonGrid: {
    gap: 6,
    marginBottom: 8,
  },
  compRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  compLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  compTier: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  compPrices: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  priceCol: {
    alignItems: 'center' as const,
  },
  priceAmount: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '500' as const,
  },
  savingsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
});

const compStyles = StyleSheet.create({
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 10,
    alignItems: 'flex-start' as const,
  },
  iconCol: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(26,138,126,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  usRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  usText: {
    fontSize: 12,
    fontWeight: '600' as const,
    flex: 1,
  },
  themRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  themText: {
    fontSize: 11,
    flex: 1,
  },
});
