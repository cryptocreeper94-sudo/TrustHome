import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Modal, ScrollView,
  Animated, Dimensions, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL = SCREEN_HEIGHT < 700;

interface LicensingPackProps {
  visible: boolean;
  onComplete: () => void;
}

type SectionId = 'hero' | 'calculator' | 'included' | 'timeline' | 'support' | 'terms' | 'proposal';

const SECTIONS: { id: SectionId; icon: string; label: string }[] = [
  { id: 'hero', icon: 'briefcase', label: 'Overview' },
  { id: 'calculator', icon: 'calculator', label: 'Calculator' },
  { id: 'included', icon: 'checkmark-done-circle', label: 'Included' },
  { id: 'timeline', icon: 'calendar', label: 'Timeline' },
  { id: 'support', icon: 'headset', label: 'Support' },
  { id: 'terms', icon: 'document-text', label: 'Terms' },
  { id: 'proposal', icon: 'rocket', label: 'Proposal' },
];

const AGENT_PRESETS = [100, 250, 500, 750, 1000];

const INCLUDED_FEATURES = [
  { label: 'White-label branding', icon: 'color-palette' },
  { label: 'Dedicated onboarding', icon: 'person-add' },
  { label: 'Priority support (4hr SLA)', icon: 'headset' },
  { label: 'Custom training materials', icon: 'book' },
  { label: 'Brokerage admin dashboard', icon: 'grid' },
  { label: 'Agent performance analytics', icon: 'bar-chart' },
  { label: 'Bulk agent provisioning', icon: 'people' },
  { label: 'API access & CRM integration', icon: 'code-slash' },
  { label: 'Blockchain verification', icon: 'shield-checkmark' },
  { label: 'AI marketing tools', icon: 'sparkles' },
  { label: 'Signal Chat messaging', icon: 'chatbubbles' },
  { label: 'Media Studio access', icon: 'videocam' },
  { label: 'Quarterly business reviews', icon: 'trending-up' },
  { label: 'Compliance & audit reports', icon: 'document-lock' },
];

const ONBOARDING_STEPS = [
  { week: 'Week 1', title: 'Discovery Call', desc: 'Needs assessment, tech stack review, branding requirements', accent: '#1A8A7E' },
  { week: 'Week 2', title: 'Contract & Setup', desc: 'Agreement signed, white-label config begins, Stripe billing connected', accent: '#4A90D9' },
  { week: 'Week 3', title: 'Brand Customization', desc: 'Logo, colors, domain configured. Admin dashboard. Training materials', accent: '#9B59B6' },
  { week: 'Week 4', title: 'Pilot Launch', desc: '10-20 agents onboarded. Feedback collected, adjustments made', accent: '#D4AF37' },
  { week: 'Weeks 5-6', title: 'Full Rollout', desc: 'All agents provisioned. CRM import. Go-live support', accent: '#059669' },
  { week: 'Ongoing', title: 'Dedicated Support', desc: 'Account manager, quarterly reviews, priority feature requests', accent: '#E8715A' },
];

const SUPPORT_TIERS = [
  {
    name: 'Standard', tag: 'Included', accent: '#1A8A7E',
    features: ['Email support', '24-hour response time', 'Knowledge base access', 'Community forum'],
  },
  {
    name: 'Priority', tag: 'Enterprise', accent: '#4A90D9',
    features: ['4-hour SLA guarantee', 'Phone + email support', 'Dedicated account manager', 'Quarterly business reviews'],
  },
  {
    name: 'Premium', tag: '$2,999/mo', accent: '#D4AF37',
    features: ['1-hour SLA guarantee', '24/7 phone support', 'Dedicated engineer', 'Custom feature development'],
  },
];

const COMPETITOR_STACK = [
  { name: 'CRM Platform', low: 50, high: 100 },
  { name: 'Transaction Management', low: 30, high: 50 },
  { name: 'Marketing Suite', low: 50, high: 100 },
  { name: 'Document Storage', low: 20, high: 30 },
  { name: 'Communication Tools', low: 20, high: 30 },
  { name: 'Analytics & Reporting', low: 30, high: 60 },
];

function getPricePerAgent(count: number): number {
  if (count >= 1000) return 39;
  if (count >= 500) return 49;
  if (count >= 250) return 59;
  return 69;
}

function getDiscount(count: number): number {
  if (count >= 1000) return 60;
  if (count >= 500) return 50;
  if (count >= 250) return 40;
  return 30;
}

function getTierLabel(count: number): string {
  if (count >= 1000) return 'Enterprise Plus';
  if (count >= 500) return 'Enterprise';
  if (count >= 250) return 'Growth';
  return 'Starter';
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function AnimatedCounter({ value, prefix = '$', suffix = '', color, size = 28 }: {
  value: number; prefix?: string; suffix?: string; color: string; size?: number;
}) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = animValue.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(animValue, {
      toValue: value,
      duration: 600,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(id);
  }, [value]);

  const formatted = display >= 1000000
    ? `${(display / 1000000).toFixed(1)}M`
    : display >= 1000
      ? `${Math.round(display / 1000)}K`
      : display.toLocaleString();

  return (
    <Text style={{ fontSize: size, fontWeight: '900', color, fontVariant: ['tabular-nums'] }}>
      {prefix}{formatted}{suffix}
    </Text>
  );
}

export function LicensingPack({ visible, onComplete }: LicensingPackProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeSection, setActiveSection] = useState<SectionId>('hero');
  const [agentCount, setAgentCount] = useState(250);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setActiveSection('hero');
      setAgentCount(250);
      setShowCustom(false);
      setCustomInput('');
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
    }
  }, [visible]);

  const navigateTo = useCallback((section: SectionId) => {
    const currentIdx = SECTIONS.findIndex(s => s.id === activeSection);
    const nextIdx = SECTIONS.findIndex(s => s.id === section);
    const direction = nextIdx > currentIdx ? -1 : 1;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: direction * 20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setActiveSection(section);
      slideAnim.setValue(direction * -20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  }, [activeSection]);

  const goNext = () => {
    const idx = SECTIONS.findIndex(s => s.id === activeSection);
    if (idx < SECTIONS.length - 1) {
      navigateTo(SECTIONS[idx + 1].id);
    } else {
      onComplete();
    }
  };

  const goPrev = () => {
    const idx = SECTIONS.findIndex(s => s.id === activeSection);
    if (idx > 0) navigateTo(SECTIONS[idx - 1].id);
  };

  const currentIdx = SECTIONS.findIndex(s => s.id === activeSection);
  const isLast = currentIdx === SECTIONS.length - 1;

  const pricePerAgent = getPricePerAgent(agentCount);
  const discount = getDiscount(agentCount);
  const tierLabel = getTierLabel(agentCount);
  const monthlyTotal = pricePerAgent * agentCount;
  const annualTotal = monthlyTotal * 12;
  const annualWithDiscount = Math.round(annualTotal * 0.9);
  const competitorLow = COMPETITOR_STACK.reduce((s, c) => s + c.low, 0);
  const competitorHigh = COMPETITOR_STACK.reduce((s, c) => s + c.high, 0);
  const annualSavingsLow = (competitorLow - pricePerAgent) * agentCount * 12;
  const annualSavingsHigh = (competitorHigh - pricePerAgent) * agentCount * 12;

  const handlePresetSelect = (count: number) => {
    setAgentCount(count);
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    const num = parseInt(customInput, 10);
    if (num >= 50 && num <= 10000) {
      setAgentCount(num);
    }
  };

  const renderHero = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <LinearGradient
        colors={['#1A8A7E', '#0F766E', '#115E59']}
        style={s.heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.heroBadgeRow}>
          <View style={s.heroBadge}>
            <Text style={s.heroBadgeText}>ENTERPRISE</Text>
          </View>
        </View>
        <Ionicons name="business" size={IS_SMALL ? 36 : 44} color="rgba(255,255,255,0.9)" />
        <Text style={[s.heroTitle, IS_SMALL && { fontSize: 22 }]}>TrustHome Enterprise</Text>
        <Text style={s.heroSub}>One agreement. One billing relationship.{'\n'}Every agent. Full access.</Text>
      </LinearGradient>

      <View style={s.heroCards}>
        {[
          { icon: 'pricetags', label: 'Volume Pricing', desc: 'Up to 60% below standard rates', accent: '#4A90D9' },
          { icon: 'color-palette', label: 'White-Label', desc: 'Your brand front and center', accent: '#9B59B6' },
          { icon: 'people', label: 'Dedicated Support', desc: 'Account manager included', accent: '#D4AF37' },
          { icon: 'shield-checkmark', label: 'WOSB Eligible', desc: 'Supplier diversity qualified', accent: '#059669' },
        ].map((card, i) => (
          <View key={i} style={[s.heroCard, { borderColor: card.accent + '25', backgroundColor: card.accent + '08' }]}>
            <View style={[s.heroCardIcon, { backgroundColor: card.accent + '18' }]}>
              <Ionicons name={card.icon as any} size={18} color={card.accent} />
            </View>
            <Text style={[s.heroCardLabel, { color: colors.text }]}>{card.label}</Text>
            <Text style={[s.heroCardDesc, { color: colors.textSecondary }]}>{card.desc}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderCalculator = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={[s.calcLabel, { color: colors.textSecondary }]}>HOW MANY AGENTS?</Text>
      <View style={s.presetRow}>
        {AGENT_PRESETS.map(n => (
          <Pressable
            key={n}
            onPress={() => handlePresetSelect(n)}
            style={[
              s.presetBtn,
              {
                backgroundColor: agentCount === n && !showCustom ? '#1A8A7E' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                borderColor: agentCount === n && !showCustom ? '#1A8A7E' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
              },
            ]}
          >
            <Text style={[
              s.presetText,
              { color: agentCount === n && !showCustom ? '#FFF' : colors.text },
            ]}>
              {n === 1000 ? '1K+' : n}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setShowCustom(!showCustom)}
          style={[
            s.presetBtn,
            {
              backgroundColor: showCustom ? '#9B59B6' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
              borderColor: showCustom ? '#9B59B6' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'),
            },
          ]}
        >
          <Ionicons name="pencil" size={14} color={showCustom ? '#FFF' : colors.textSecondary} />
        </Pressable>
      </View>

      {showCustom && (
        <View style={[s.customRow, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
          <TextInput
            style={[s.customInput, { color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]}
            value={customInput}
            onChangeText={setCustomInput}
            placeholder="Enter agent count (50-10,000)"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleCustomSubmit}
          />
          <Pressable onPress={handleCustomSubmit} style={[s.customApply, { backgroundColor: '#9B59B6' }]}>
            <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>Apply</Text>
          </Pressable>
        </View>
      )}

      <View style={[s.tierBanner, { backgroundColor: '#1A8A7E12', borderColor: '#1A8A7E30' }]}>
        <View style={s.tierBannerLeft}>
          <View style={[s.tierDot, { backgroundColor: '#1A8A7E' }]} />
          <View>
            <Text style={[s.tierName, { color: colors.text }]}>{tierLabel} Tier</Text>
            <Text style={[s.tierAgents, { color: colors.textSecondary }]}>{agentCount.toLocaleString()} agents</Text>
          </View>
        </View>
        <View style={[s.discountBadge, { backgroundColor: '#05966915' }]}>
          <Text style={{ color: '#059669', fontWeight: '800', fontSize: 13 }}>{discount}% OFF</Text>
        </View>
      </View>

      <View style={s.priceHero}>
        <AnimatedCounter value={pricePerAgent} prefix="$" suffix="" color="#1A8A7E" size={IS_SMALL ? 40 : 48} />
        <Text style={[s.priceUnit, { color: colors.textSecondary }]}>/agent/month</Text>
        <Text style={[s.priceStandard, { color: colors.textTertiary }]}>Standard rate: $99/agent/mo</Text>
      </View>

      <View style={s.calcGrid}>
        <View style={[s.calcCard, { backgroundColor: isDark ? 'rgba(74,144,217,0.08)' : 'rgba(74,144,217,0.06)', borderColor: '#4A90D925' }]}>
          <Text style={[s.calcCardLabel, { color: colors.textSecondary }]}>Monthly Total</Text>
          <AnimatedCounter value={monthlyTotal} color="#4A90D9" size={22} />
        </View>
        <View style={[s.calcCard, { backgroundColor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.06)', borderColor: '#D4AF3725' }]}>
          <Text style={[s.calcCardLabel, { color: colors.textSecondary }]}>Annual (10% off)</Text>
          <AnimatedCounter value={annualWithDiscount} color="#D4AF37" size={22} />
        </View>
      </View>

      <Text style={[s.calcLabel, { color: '#E8715A', marginTop: 16 }]}>VS. TYPICAL AGENT TECH STACK</Text>
      <View style={[s.vsCard, { backgroundColor: isDark ? 'rgba(232,113,90,0.06)' : 'rgba(232,113,90,0.04)', borderColor: '#E8715A20' }]}>
        {COMPETITOR_STACK.map((item, i) => (
          <View key={i} style={[s.vsRow, i < COMPETITOR_STACK.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]}>
            <Text style={[s.vsLabel, { color: colors.textSecondary }]}>{item.name}</Text>
            <Text style={[s.vsValue, { color: '#E8715A' }]}>${item.low}-{item.high}</Text>
          </View>
        ))}
        <View style={[s.vsTotalRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]}>
          <Text style={[s.vsTotalLabel, { color: colors.text }]}>Total per agent/mo</Text>
          <Text style={[s.vsTotalValue, { color: '#E8715A' }]}>${competitorLow}-{competitorHigh}</Text>
        </View>
      </View>

      <LinearGradient
        colors={isDark ? ['rgba(5,150,105,0.12)', 'rgba(26,138,126,0.08)'] : ['rgba(5,150,105,0.08)', 'rgba(26,138,126,0.04)']}
        style={[s.savingsCard, { borderColor: '#05966930' }]}
      >
        <View style={s.savingsIcon}>
          <Ionicons name="trending-up" size={24} color="#059669" />
        </View>
        <Text style={[s.savingsTitle, { color: '#059669' }]}>Annual Savings</Text>
        <View style={s.savingsRange}>
          <AnimatedCounter value={annualSavingsLow} color="#059669" size={IS_SMALL ? 22 : 26} />
          <Text style={{ color: colors.textTertiary, fontSize: 18, fontWeight: '300', marginHorizontal: 6 }}>to</Text>
          <AnimatedCounter value={annualSavingsHigh} color="#D4AF37" size={IS_SMALL ? 22 : 26} />
        </View>
        <Text style={[s.savingsNote, { color: colors.textSecondary }]}>
          for {agentCount.toLocaleString()} agents — plus blockchain, AI, and ecosystem features competitors can't match
        </Text>
      </LinearGradient>
    </ScrollView>
  );

  const renderIncluded = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={[s.sectionTitle, { color: colors.text }]}>Everything Included</Text>
      <Text style={[s.sectionSub, { color: colors.textSecondary }]}>No add-ons, no hidden fees. Every enterprise license includes:</Text>
      <View style={s.featureGrid}>
        {INCLUDED_FEATURES.map((feat, i) => (
          <View key={i} style={[s.featureItem, {
            backgroundColor: isDark ? 'rgba(26,138,126,0.06)' : 'rgba(26,138,126,0.04)',
            borderColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.1)',
          }]}>
            <View style={[s.featureIcon, { backgroundColor: '#1A8A7E18' }]}>
              <Ionicons name={feat.icon as any} size={16} color="#1A8A7E" />
            </View>
            <Text style={[s.featureLabel, { color: colors.text }]}>{feat.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderTimeline = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={[s.sectionTitle, { color: colors.text }]}>Live in 6 Weeks</Text>
      <Text style={[s.sectionSub, { color: colors.textSecondary }]}>From discovery call to full deployment:</Text>
      <View style={s.timelineTrack}>
        {ONBOARDING_STEPS.map((step, i) => (
          <View key={i} style={s.timelineStep}>
            <View style={s.timelineLeft}>
              <View style={[s.timelineDot, { backgroundColor: step.accent }]}>
                <Text style={s.timelineDotText}>{i + 1}</Text>
              </View>
              {i < ONBOARDING_STEPS.length - 1 && (
                <View style={[s.timelineLine, { backgroundColor: step.accent + '30' }]} />
              )}
            </View>
            <View style={[s.timelineContent, { borderColor: step.accent + '20', backgroundColor: step.accent + '06' }]}>
              <View style={s.timelineHeader}>
                <Text style={[s.timelineWeek, { color: step.accent }]}>{step.week}</Text>
              </View>
              <Text style={[s.timelineTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[s.timelineDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSupport = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={[s.sectionTitle, { color: colors.text }]}>Support Tiers</Text>
      <Text style={[s.sectionSub, { color: colors.textSecondary }]}>Priority support is included with every enterprise license:</Text>
      {SUPPORT_TIERS.map((tier, i) => (
        <View key={i} style={[s.supportCard, { borderColor: tier.accent + '25', backgroundColor: tier.accent + '06' }]}>
          <View style={s.supportHeader}>
            <Text style={[s.supportName, { color: colors.text }]}>{tier.name}</Text>
            <View style={[s.supportTag, { backgroundColor: tier.accent + '18', borderColor: tier.accent + '30' }]}>
              <Text style={[s.supportTagText, { color: tier.accent }]}>{tier.tag}</Text>
            </View>
          </View>
          {tier.features.map((feat, j) => (
            <View key={j} style={s.supportFeature}>
              <Ionicons name="checkmark-circle" size={15} color={tier.accent} />
              <Text style={[s.supportFeatureText, { color: colors.textSecondary }]}>{feat}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  const renderTerms = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={[s.sectionTitle, { color: colors.text }]}>Contract Terms</Text>
      <Text style={[s.sectionSub, { color: colors.textSecondary }]}>Fair, transparent, no lock-in:</Text>
      {[
        { icon: 'time', text: 'Minimum 12-month contract for enterprise pricing', accent: '#1A8A7E' },
        { icon: 'card', text: 'Annual billing (10% discount) or monthly available', accent: '#4A90D9' },
        { icon: 'add-circle', text: '30-day notice to add agents — scale up anytime', accent: '#059669' },
        { icon: 'remove-circle', text: '90-day notice for scaling down or cancellation', accent: '#E8715A' },
        { icon: 'cloud-download', text: 'Full data export included at any time', accent: '#9B59B6' },
        { icon: 'checkmark-done-circle', text: '99.9% uptime SLA guarantee', accent: '#1A8A7E' },
        { icon: 'lock-closed', text: 'End-to-end encryption, SOC 2 roadmap in progress', accent: '#4A90D9' },
        { icon: 'ribbon', text: 'Woman-owned business (WOSB eligible) — supplier diversity qualified', accent: '#D4AF37' },
      ].map((item, i) => (
        <View key={i} style={[s.termRow, { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
          <View style={[s.termIcon, { backgroundColor: item.accent + '12' }]}>
            <Ionicons name={item.icon as any} size={16} color={item.accent} />
          </View>
          <Text style={[s.termText, { color: colors.text }]}>{item.text}</Text>
        </View>
      ))}

      <View style={[s.termNote, { backgroundColor: isDark ? 'rgba(26,138,126,0.08)' : 'rgba(26,138,126,0.05)', borderColor: '#1A8A7E25' }]}>
        <Ionicons name="heart" size={16} color="#1A8A7E" />
        <Text style={[s.termNoteText, { color: colors.textSecondary }]}>
          We want long-term partnerships, not lock-in. If TrustHome delivers value, you'll stay because you want to — not because you have to.
        </Text>
      </View>
    </ScrollView>
  );

  const renderProposal = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <LinearGradient
        colors={['#D4AF37', '#B8860B']}
        style={s.proposalHero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="document-text" size={IS_SMALL ? 28 : 32} color="rgba(255,255,255,0.9)" />
        <Text style={[s.proposalTitle, IS_SMALL && { fontSize: 18 }]}>Your Custom Proposal</Text>
        <Text style={s.proposalSub}>{agentCount.toLocaleString()} Agents · {tierLabel} Tier</Text>
      </LinearGradient>

      <View style={s.proposalGrid}>
        <View style={[s.proposalCard, { borderColor: '#1A8A7E25', backgroundColor: '#1A8A7E08' }]}>
          <Text style={[s.proposalCardLabel, { color: colors.textSecondary }]}>Per Agent</Text>
          <Text style={[s.proposalCardValue, { color: '#1A8A7E' }]}>${pricePerAgent}/mo</Text>
          <Text style={[s.proposalCardNote, { color: colors.textTertiary }]}>{discount}% off standard</Text>
        </View>
        <View style={[s.proposalCard, { borderColor: '#4A90D925', backgroundColor: '#4A90D908' }]}>
          <Text style={[s.proposalCardLabel, { color: colors.textSecondary }]}>Monthly</Text>
          <Text style={[s.proposalCardValue, { color: '#4A90D9' }]}>{formatCurrency(monthlyTotal)}</Text>
          <Text style={[s.proposalCardNote, { color: colors.textTertiary }]}>{agentCount} agents</Text>
        </View>
        <View style={[s.proposalCard, { borderColor: '#D4AF3725', backgroundColor: '#D4AF3708' }]}>
          <Text style={[s.proposalCardLabel, { color: colors.textSecondary }]}>Annual</Text>
          <Text style={[s.proposalCardValue, { color: '#D4AF37' }]}>{formatCurrency(annualWithDiscount)}</Text>
          <Text style={[s.proposalCardNote, { color: colors.textTertiary }]}>with 10% annual discount</Text>
        </View>
        <View style={[s.proposalCard, { borderColor: '#05966925', backgroundColor: '#05966908' }]}>
          <Text style={[s.proposalCardLabel, { color: colors.textSecondary }]}>Annual Savings</Text>
          <Text style={[s.proposalCardValue, { color: '#059669' }]}>{formatCurrency(annualSavingsLow)}-{formatCurrency(annualSavingsHigh)}</Text>
          <Text style={[s.proposalCardNote, { color: colors.textTertiary }]}>vs. separate tools</Text>
        </View>
      </View>

      <View style={[s.proposalIncludes, { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }]}>
        <Text style={[s.proposalIncludesTitle, { color: colors.text }]}>Also Included</Text>
        {['White-label branding', 'Dedicated onboarding manager', 'Priority support (4hr SLA)', 'Blockchain verification', 'AI marketing tools', 'Full ecosystem access'].map((item, i) => (
          <View key={i} style={s.proposalIncludesRow}>
            <Ionicons name="checkmark-circle" size={14} color="#1A8A7E" />
            <Text style={[s.proposalIncludesText, { color: colors.textSecondary }]}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={[s.proposalCta, { backgroundColor: isDark ? 'rgba(212,175,55,0.08)' : 'rgba(212,175,55,0.05)', borderColor: '#D4AF3730' }]}>
        <Ionicons name="call" size={18} color="#D4AF37" />
        <View style={{ flex: 1 }}>
          <Text style={[s.proposalCtaTitle, { color: colors.text }]}>Ready to move forward?</Text>
          <Text style={[s.proposalCtaDesc, { color: colors.textSecondary }]}>
            Jennifer Lambert will prepare a tailored proposal based on these numbers within 48 hours. Pilot program available — start with 10-20 agents before full commitment.
          </Text>
        </View>
      </View>

      <View style={[s.proposalFooterNote, { borderColor: isDark ? 'rgba(155,89,182,0.2)' : 'rgba(155,89,182,0.15)', backgroundColor: isDark ? 'rgba(155,89,182,0.06)' : 'rgba(155,89,182,0.04)' }]}>
        <Ionicons name="diamond" size={14} color="#9B59B6" />
        <Text style={[s.proposalFooterText, { color: colors.textSecondary }]}>
          Founders Program: First 100 agent subscribers lock in discounted rates permanently.
        </Text>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'hero': return renderHero();
      case 'calculator': return renderCalculator();
      case 'included': return renderIncluded();
      case 'timeline': return renderTimeline();
      case 'support': return renderSupport();
      case 'terms': return renderTerms();
      case 'proposal': return renderProposal();
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, 16);
  const bottomPad = Platform.OS === 'web' ? 34 : Math.max(insets.bottom, 16);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onComplete}>
      <View style={[s.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.7)' }]}>
        <View style={[s.container, {
          backgroundColor: colors.background,
          paddingTop: topPad,
          paddingBottom: bottomPad,
        }]}>
          <View style={s.topBar}>
            <View style={s.topBadge}>
              <Ionicons name="briefcase" size={14} color="#D4AF37" />
              <Text style={[s.topBadgeText, { color: '#D4AF37' }]}>Enterprise Licensing</Text>
            </View>
            <Pressable onPress={onComplete} hitSlop={12} style={[s.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={s.navStrip}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.navStripContent}
            >
              {SECTIONS.map((sec, i) => {
                const isActive = sec.id === activeSection;
                const isPast = i < currentIdx;
                return (
                  <Pressable
                    key={sec.id}
                    onPress={() => navigateTo(sec.id)}
                    style={[
                      s.navPill,
                      {
                        backgroundColor: isActive
                          ? '#1A8A7E'
                          : isPast
                            ? (isDark ? 'rgba(26,138,126,0.12)' : 'rgba(26,138,126,0.08)')
                            : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                        borderColor: isActive ? '#1A8A7E' : isPast ? '#1A8A7E30' : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons
                      name={sec.icon as any}
                      size={13}
                      color={isActive ? '#FFF' : isPast ? '#1A8A7E' : colors.textTertiary}
                    />
                    <Text style={[
                      s.navPillText,
                      { color: isActive ? '#FFF' : isPast ? '#1A8A7E' : colors.textTertiary },
                    ]}>
                      {sec.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <Animated.View style={[s.contentArea, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {renderContent()}
          </Animated.View>

          <View style={s.bottomBar}>
            {currentIdx > 0 ? (
              <Pressable onPress={goPrev} style={[s.backBtn, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <Pressable
              onPress={goNext}
              style={[s.nextBtn, { backgroundColor: isLast ? '#D4AF37' : '#1A8A7E' }]}
            >
              <Text style={s.nextBtnText}>
                {isLast ? "Let's Talk" : activeSection === 'calculator' ? 'See What\'s Included' : 'Next'}
              </Text>
              {!isLast && <Ionicons name="chevron-forward" size={16} color="#FFF" />}
              {isLast && <Ionicons name="call" size={16} color="#FFF" />}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 16 : 0,
  },
  container: {
    width: Platform.OS === 'web' ? '100%' : '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    flex: Platform.OS === 'web' ? undefined : 1,
    maxHeight: Platform.OS === 'web' ? ('92vh' as any) : undefined,
    borderRadius: Platform.OS === 'web' ? 20 : 0,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(212,175,55,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  topBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navStrip: {
    marginBottom: 10,
  },
  navStripContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  navPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    gap: 6,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },

  heroGradient: {
    borderRadius: 16,
    padding: IS_SMALL ? 16 : 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  heroBadgeRow: {
    alignSelf: 'flex-start',
    marginBottom: IS_SMALL ? 8 : 12,
  },
  heroBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: IS_SMALL ? 22 : 26,
    fontWeight: '900',
    color: '#FFF',
    marginTop: IS_SMALL ? 6 : 10,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  heroCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroCard: {
    width: '48%' as any,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  heroCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },

  calcLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  presetBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 44,
    alignItems: 'center',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  customRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  customApply: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  tierBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tierAgents: {
    fontSize: 12,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceHero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceUnit: {
    fontSize: 13,
    marginTop: 2,
  },
  priceStandard: {
    fontSize: 11,
    marginTop: 4,
    textDecorationLine: 'line-through',
  },
  calcGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  calcCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  calcCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  vsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  vsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  vsLabel: {
    fontSize: 12,
  },
  vsValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  vsTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
  },
  vsTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  vsTotalValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  savingsCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  savingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5,150,105,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  savingsTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  savingsRange: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  savingsNote: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  sectionTitle: {
    fontSize: IS_SMALL ? 20 : 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 19,
  },
  featureGrid: {
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  timelineTrack: {
    gap: 0,
  },
  timelineStep: {
    flexDirection: 'row',
    gap: 10,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 12,
  },
  timelineContent: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  timelineHeader: {
    marginBottom: 2,
  },
  timelineWeek: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  supportCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportName: {
    fontSize: 16,
    fontWeight: '700',
  },
  supportTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  supportTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  supportFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  supportFeatureText: {
    fontSize: 13,
  },

  termRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  termIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  termText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  termNote: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    alignItems: 'flex-start',
  },
  termNoteText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
    fontStyle: 'italic',
  },

  proposalHero: {
    borderRadius: 14,
    padding: IS_SMALL ? 16 : 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  proposalTitle: {
    fontSize: IS_SMALL ? 18 : 22,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 8,
  },
  proposalSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '600',
  },
  proposalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  proposalCard: {
    width: '48%' as any,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  proposalCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  proposalCardValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  proposalCardNote: {
    fontSize: 10,
    marginTop: 2,
  },
  proposalIncludes: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  proposalIncludesTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  proposalIncludesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proposalIncludesText: {
    fontSize: 12,
  },
  proposalCta: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  proposalCtaTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  proposalCtaDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  proposalFooterNote: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  proposalFooterText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
});
