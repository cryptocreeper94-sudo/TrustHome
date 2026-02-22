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
  type: 'text' | 'features' | 'projections' | 'whitelabel' | 'franchise' | 'founders' | 'stripe';
  body?: string;
}

const SLIDES: SlideData[] = [
  {
    icon: 'shield-star',
    iconLib: 'mci',
    title: 'Welcome, Jennifer',
    subtitle: 'Managing Partner  ·  51% Owner  ·  DarkWave Studios LLC',
    body: "This is your company. As the majority owner and managing member of DarkWave Studios LLC, TrustHome carries your name, your real estate expertise, and your vision for how this industry should work.\n\nWhat you're about to see is a platform that is live, functional, and ready to put in front of brokers, agents, and clients. This isn't a prototype — it's a working product with over 22 built features, blockchain verification, AI tools, and ecosystem integrations.\n\nThis partner pack walks you through everything: what's built, how it works, what the revenue looks like, and what you need to do to get started.",
    accent: '#D4AF37',
    type: 'text',
  },
  {
    icon: 'business',
    iconLib: 'ion',
    title: 'What TrustHome Is',
    subtitle: 'The Platform — In Simple Terms',
    body: "TrustHome is an all-in-one real estate platform that replaces the patchwork of tools agents currently pay for — CRM, transaction management, marketing, document storage, communication, and analytics — with a single, blockchain-verified system.\n\nEvery agent gets their own branded experience. Every transaction is verified on the DarkWave Trust Layer blockchain. Every document is encrypted and immutable. Every interaction is logged and auditable.\n\nFor agents, it's the only platform they need. For brokerages, it's a white-label solution they can deploy under their own brand. For us, it's recurring subscription revenue from every seat.\n\nThe public-facing Command Center lets anyone explore the platform before signing up — no login required. When they're ready, they create an account and unlock everything.",
    accent: '#1A8A7E',
    type: 'text',
  },
  {
    icon: 'checkmark-done',
    iconLib: 'ion',
    title: 'Built & Live Now',
    subtitle: `${22} Features Complete · Ready to Sell`,
    accent: '#1A8A7E',
    type: 'features',
  },
  {
    icon: 'globe',
    iconLib: 'ion',
    title: 'The Ecosystem',
    subtitle: 'Connected DarkWave Services',
    body: "TrustHome doesn't stand alone — it's part of the DarkWave ecosystem, which means agents get access to services that no competitor can match:\n\n• CRM & Analytics — Powered by PaintPros.io infrastructure, shared across ecosystem apps\n• Signal Chat — Cross-app messaging that connects TrustHome users with the entire DarkWave network\n• Media Studio (TrustVault) — Professional video walkthroughs, virtual staging, and property media produced by DarkWave Media\n• Verdara — AI-powered tree and landscape assessment integrated directly into property listings\n• Orbit Staffing — Automated bookkeeping, HR, and payroll that handles revenue distribution (your 51% / Jason's 49%)\n• Trust Layer Blockchain — Every transaction, document, and identity verification recorded on our custom Layer 1 chain\n• Trust Shield — Enterprise-grade security suite protecting every user action\n\nThis ecosystem is the moat. No competitor has blockchain-verified transactions, AI media production, cross-platform chat, AND automated financial distribution — all connected.",
    accent: '#4A90D9',
    type: 'text',
  },
  {
    icon: 'color-palette',
    iconLib: 'ion',
    title: 'White-Label Ready',
    subtitle: 'Their Brand, Our Engine',
    body: "This is the key revenue multiplier. Any brokerage can run their own branded version of TrustHome — their logo, their colors, their domain, their agents' social media profiles in the footer.\n\nThey pay a monthly subscription. We handle all the technology. Their agents see their brokerage brand. We see recurring revenue.\n\nThe multi-tenant architecture is already live. Each agent operates in their own secure, isolated space. Branding controls are built into settings. Custom domains are supported. Social media profiles display in each tenant's footer.\n\nWhen you pitch this to your broker: 'Your brokerage gets a custom-branded, blockchain-verified real estate platform — no development costs, no IT staff needed. Your agents get the most advanced tools in the industry, and it runs under your brand.'",
    accent: '#9B59B6',
    type: 'whitelabel',
  },
  {
    icon: 'trending-up',
    iconLib: 'ion',
    title: 'Revenue Projections',
    subtitle: 'Three Revenue Streams · Your 51%',
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
    icon: 'sync',
    iconLib: 'ion',
    title: 'How You Get Paid',
    subtitle: 'Orbit Staffing · Automatic Distribution',
    body: "Here's how the money flows — and it's fully automated:\n\n1. Agents and brokerages subscribe to TrustHome through Stripe\n2. Stripe collects all subscription payments into the DarkWave Studios LLC business account\n3. Orbit Staffing (our bookkeeping and HR integration) automatically processes the revenue split\n4. Your 51% share is distributed to you automatically — no invoicing, no manual transfers\n5. Jason's 49% is distributed the same way\n\nOrbit Staffing is already wired into TrustHome — the client code, API routes, and webhook handlers are live. Once the Orbit server is republished with TrustHome's app credentials, the automated distribution begins.\n\nWhat you need to do: Set up a Stripe account under DarkWave Studios LLC. That's the single action required on your end. Everything else — payment collection, revenue splitting, tax reporting — is handled automatically.",
    accent: '#059669',
    type: 'text',
  },
  {
    icon: 'card',
    iconLib: 'ion',
    title: 'Stripe Setup',
    subtitle: 'Your One Action Item',
    accent: '#635BFF',
    type: 'stripe',
  },
  {
    icon: 'shield-checkmark',
    iconLib: 'ion',
    title: 'Trust Layer Account',
    subtitle: 'Your Ecosystem Identity',
    body: "As a partner, you should register for a Trust Layer account. This gives you a single identity across all DarkWave ecosystem apps — TrustHome, Happy Eats, Signal, TrustVault, Verdara — and lets you log in from any of them.\n\nTo register, go to the Sign In page and tap 'Create Account.' Your password must meet these requirements:\n\n• Minimum 8 characters\n• At least 1 uppercase letter\n• At least 1 special character (!@#$%^&* etc.)\n\nUse your preferred email address. Once registered, you'll be able to sign in with your Trust Layer ID or email from any DarkWave app. Your ecosystem PIN (7777) will also continue to work for quick access.\n\nThis is the same system every agent and client will use. By registering first, you'll experience exactly what they experience.",
    accent: '#1A8A7E',
    type: 'text',
  },
  {
    icon: 'briefcase',
    iconLib: 'ion',
    title: 'Woman-Owned Business',
    subtitle: 'WOSB / WBENC Certification Eligible',
    body: "With your 51% ownership stake, TrustHome qualifies as a Woman-Owned Small Business under both the SBA's WOSB program and WBENC certification. This opens real doors:\n\n• Government contracts set aside for women-owned businesses\n• Corporate supplier diversity programs at Fortune 500 companies\n• Specialized grants and funding through SBA, SCORE, and WBENC\n• Preferred vendor status in industries prioritizing supply chain diversity\n\nIn PropTech specifically, this is rare. Most real estate technology companies are not women-owned. That gives us a competitive edge in government contracts, enterprise sales, and grant applications that our competitors can't claim.\n\nYour name on this business isn't symbolic — it's a strategic advantage.",
    accent: '#9B59B6',
    type: 'text',
  },
  {
    icon: 'rocket',
    iconLib: 'ion',
    title: 'The Pitch to Your Broker',
    subtitle: 'How to Present TrustHome',
    body: "When you sit down with your broker, here's the value proposition in three sentences:\n\n'TrustHome is a blockchain-verified real estate platform that replaces every tool your agents currently pay for — CRM, transaction management, marketing, documents, communication — with one unified system. It white-labels under your brand, so your agents see your brokerage, not ours. And it costs less than what most agents already spend on their current stack.'\n\nKey points to emphasize:\n\n• 22+ features already built and live — this isn't vaporware\n• White-label means their brand, zero development costs\n• Blockchain verification is a trust differentiator no competitor has\n• AI-powered marketing generates content automatically\n• Voice AI assistant handles questions 24/7\n• The Founders Program gives early brokerages locked-in pricing\n• Your direct involvement as managing partner — they're working with an owner, not a sales rep\n\nShow them the Command Center at trusthome.io — they can explore everything without logging in.",
    accent: '#1A8A7E',
    type: 'text',
  },
  {
    icon: 'flag',
    iconLib: 'ion',
    title: "Let's Launch This",
    subtitle: 'The Foundation Is Set · Time to Grow',
    body: "Everything is built. The platform works. The architecture scales. The white-label system is ready. The AI assistant is live. The blockchain integration is verified. The ecosystem connections are active.\n\nYour next steps:\n\n1. Set up your Stripe account (DarkWave Studios LLC)\n2. Register your Trust Layer account with a strong password\n3. Pitch TrustHome to your broker — show them the Command Center\n4. Start identifying agents in your network who would benefit\n5. Every agent who signs up through Founders Program locks in $49/mo forever\n\nYour Stripe account collects all payments. Orbit Staffing distributes your 51% automatically. You focus on relationships and growth — the technology handles everything else.\n\nYou can revisit this partner pack anytime from Settings > Partner Dashboard.",
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
                { num: '4', title: 'National Scale', desc: '50 regional partners x 40 agents each = 2,000 agents nationwide. With white-label at $2,999/mo per partner, this is where the real scale begins.' },
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
                      <Text style={[founderStyles.priceAmount, { color: '#D4AF37' }]}>${row.founder}{row.founder >= 1000 ? '' : ''}</Text>
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
            <View style={franchiseStyles.steps}>
              {[
                { num: '1', title: 'Launch at Founder Pricing', desc: `First ${FOUNDER_PRICING.milestone} agent subscribers get the discounted rate. They keep that rate forever.` },
                { num: '2', title: 'Hit the Milestone', desc: `Once we reach ${FOUNDER_PRICING.milestone} active agent subscribers, new signups automatically move to standard pricing.` },
                { num: '3', title: 'Founders Stay Locked In', desc: 'Early supporters never see a price increase. Their loyalty is rewarded permanently.' },
                { num: '4', title: 'Creates Urgency', desc: '"Get in now before founder pricing ends" is one of the strongest sales tools you can use.' },
              ].map((step, i) => (
                <View key={i} style={[franchiseStyles.step, { borderColor: '#D4AF3725' }]}>
                  <View style={[franchiseStyles.stepNum, { backgroundColor: '#D4AF37' }]}>
                    <Text style={franchiseStyles.stepNumText}>{step.num}</Text>
                  </View>
                  <View style={franchiseStyles.stepContent}>
                    <Text style={[franchiseStyles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[franchiseStyles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        );

      case 'stripe':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.slideBody, { color: colors.textSecondary, marginBottom: 16 }]}>
              TrustHome needs a Stripe account to collect subscription payments from agents, brokerages, and white-label clients. This should be set up under DarkWave Studios LLC — not a personal account.
            </Text>

            <Text style={[styles.sectionLabel, { color: slide.accent }]}>SETUP STEPS</Text>
            <View style={franchiseStyles.steps}>
              {[
                { num: '1', title: 'Go to stripe.com/register', desc: 'Create a new Stripe account. Use your DarkWave Studios LLC email if you have one, or your business email.' },
                { num: '2', title: 'Select "Business" Account Type', desc: 'Choose LLC as the business type. Enter DarkWave Studios LLC as the legal business name. Use the company EIN.' },
                { num: '3', title: 'Add Bank Account', desc: 'Connect the DarkWave Studios LLC business bank account. This is where Stripe will deposit collected payments.' },
                { num: '4', title: 'Verify Identity', desc: 'Stripe requires identity verification for the account representative. As managing member, you complete this step.' },
                { num: '5', title: 'Share API Keys', desc: 'Once approved, go to Developers > API Keys in your Stripe dashboard. Share the publishable key and secret key so we can connect it to TrustHome.' },
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

            <View style={[projStyles.highlightBox, { backgroundColor: '#635BFF10', borderColor: '#635BFF30', marginTop: 12 }]}>
              <Ionicons name="information-circle" size={18} color="#635BFF" />
              <Text style={[projStyles.highlightText, { color: colors.text }]}>
                Stripe collects all payments. Orbit Staffing handles the bookkeeping and automatically distributes your 51% share. You don't manage the split manually.
              </Text>
            </View>

            <View style={[projStyles.highlightBox, { backgroundColor: '#FF950010', borderColor: '#FF950030', marginTop: 4 }]}>
              <Ionicons name="alert-circle" size={18} color="#FF9500" />
              <Text style={[projStyles.highlightText, { color: colors.text }]}>
                This is separate from any personal Stripe account. TrustHome payments flow through the business account only.
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

const founderStyles = StyleSheet.create({
  comparisonGrid: {
    gap: 8,
    marginBottom: 8,
  },
  compRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  compLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    minWidth: 90,
  },
  compTier: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  compPrices: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  priceCol: {
    alignItems: 'center' as const,
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '500' as const,
    marginTop: 1,
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
