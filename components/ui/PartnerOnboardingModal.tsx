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

interface SlideData {
  icon: string;
  iconLib: 'mci' | 'ion' | 'feather';
  title: string;
  subtitle: string;
  accent: string;
  type: 'text' | 'stripe' | 'howpaid';
  body?: string;
}

const SLIDES: SlideData[] = [
  {
    icon: 'shield-star',
    iconLib: 'mci',
    title: 'Welcome, Jennifer',
    subtitle: 'Managing Partner  \u00b7  51% Owner  \u00b7  DarkWave Studios LLC',
    body: "This is your company. As the majority owner and managing member of DarkWave Studios LLC, TrustHome carries your name, your real estate expertise, and your vision for how this industry should work.\n\nThis partner pack is your personal ownership guide — it covers your role, how you get paid, your action items, and what's next.\n\nFor the broker-facing sales presentation — features, pricing, white-label, competitive advantages — open the Broker Pitch Deck from Settings > Partner Dashboard. That's the deck you'll pull up when you're sitting across from a broker.",
    accent: '#D4AF37',
    type: 'text',
  },
  {
    icon: 'person',
    iconLib: 'ion',
    title: 'Your Role',
    subtitle: '51% Managing Member \u00b7 Decision-Maker',
    body: "As the 51% majority owner and managing member of DarkWave Studios LLC, here's what that means in practice:\n\n\u2022 You have final say on all business decisions — partnerships, pricing changes, strategic direction\n\u2022 You sign contracts and agreements on behalf of the company\n\u2022 Your name is on the operating agreement as managing member\n\u2022 You receive 51% of all revenue — automatically distributed\n\u2022 You are the face of TrustHome when meeting brokers and agents\n\nJason (49%) handles all technology — platform development, infrastructure, integrations, security, AI. You focus on relationships, growth, and business development.\n\nThis isn't a silent partnership. You own the majority. You lead the business side.",
    accent: '#4A90D9',
    type: 'text',
  },
  {
    icon: 'sync',
    iconLib: 'ion',
    title: 'How You Get Paid',
    subtitle: 'Orbit Staffing \u00b7 Automatic Distribution',
    accent: '#059669',
    type: 'howpaid',
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
    body: "As a partner, you should register for a Trust Layer account. This gives you a single identity across all DarkWave ecosystem apps — TrustHome, Happy Eats, Signal, TrustVault, Verdara — and lets you log in from any of them.\n\nTo register, go to the Sign In page and tap 'Create Account.' Your password must meet these requirements:\n\n\u2022 Minimum 8 characters\n\u2022 At least 1 uppercase letter\n\u2022 At least 1 special character (!@#$%^&* etc.)\n\nUse your preferred email address. Once registered, you'll be able to sign in with your Trust Layer ID or email from any DarkWave app. Your ecosystem PIN (7777) will also continue to work for quick access.",
    accent: '#1A8A7E',
    type: 'text',
  },
  {
    icon: 'briefcase',
    iconLib: 'ion',
    title: 'Woman-Owned Business',
    subtitle: 'WOSB / WBENC Certification Eligible',
    body: "With your 51% ownership stake, TrustHome qualifies as a Woman-Owned Small Business under both the SBA's WOSB program and WBENC certification. This opens real doors:\n\n\u2022 Government contracts set aside for women-owned businesses\n\u2022 Corporate supplier diversity programs at Fortune 500 companies\n\u2022 Specialized grants and funding through SBA, SCORE, and WBENC\n\u2022 Preferred vendor status in industries prioritizing supply chain diversity\n\nIn PropTech specifically, this is rare. Most real estate technology companies are not women-owned. That gives us a competitive edge in government contracts, enterprise sales, and grant applications.\n\nYour name on this business isn't symbolic — it's a strategic advantage.",
    accent: '#9B59B6',
    type: 'text',
  },
  {
    icon: 'flag',
    iconLib: 'ion',
    title: "Let's Get Started",
    subtitle: 'Your Next Steps',
    body: "Here's what you need to do:\n\n1. Set up your Stripe account (DarkWave Studios LLC) — see previous slide for steps\n2. Register your Trust Layer account with a strong password\n3. Open the Broker Pitch Deck (Settings > Partner Dashboard) and familiarize yourself with it before meeting with brokers\n4. Pitch TrustHome to your broker — show them the Command Center at trusthome.io\n5. Start identifying agents in your network who would benefit\n\nYour Stripe account collects all payments. Orbit Staffing distributes your 51% automatically. You focus on relationships and growth — the technology handles everything else.\n\nYou can revisit this partner pack anytime from Settings > Partner Dashboard.\nThe Broker Pitch Deck is also there — a separate presentation designed for broker meetings.",
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
      case 'howpaid':
        return (
          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.slideBody, { color: colors.textSecondary, marginBottom: 16 }]}>
              Here's how the money flows — and it's fully automated:
            </Text>
            <View style={stepStyles.steps}>
              {[
                { num: '1', title: 'Agents Subscribe via Stripe', desc: 'Agents and brokerages subscribe to TrustHome. Stripe collects all payments into the DarkWave Studios LLC business account.' },
                { num: '2', title: 'Orbit Staffing Processes Split', desc: 'Orbit Staffing (our bookkeeping integration) automatically processes the revenue split — no invoicing, no manual transfers.' },
                { num: '3', title: 'Your 51% Is Distributed', desc: 'Your 51% share is sent to you automatically. Jason\'s 49% is distributed the same way. Every payment, every month.' },
                { num: '4', title: 'Tax Reporting Handled', desc: 'Orbit Staffing also handles tax reporting for the business. You receive clean documentation for your accountant.' },
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
            <View style={[stepStyles.highlightBox, { backgroundColor: '#05966910', borderColor: '#05966930', marginTop: 12 }]}>
              <Ionicons name="information-circle" size={18} color="#059669" />
              <Text style={[stepStyles.highlightText, { color: colors.text }]}>
                Orbit Staffing is already wired into TrustHome. Once the Orbit server is republished with our credentials, automated distribution begins.
              </Text>
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
            <View style={stepStyles.steps}>
              {[
                { num: '1', title: 'Go to stripe.com/register', desc: 'Create a new Stripe account. Use your DarkWave Studios LLC email if you have one, or your business email.' },
                { num: '2', title: 'Select "Business" Account Type', desc: 'Choose LLC as the business type. Enter DarkWave Studios LLC as the legal business name. Use the company EIN.' },
                { num: '3', title: 'Add Bank Account', desc: 'Connect the DarkWave Studios LLC business bank account. This is where Stripe will deposit collected payments.' },
                { num: '4', title: 'Verify Identity', desc: 'Stripe requires identity verification for the account representative. As managing member, you complete this step.' },
                { num: '5', title: 'Share API Keys', desc: 'Once approved, go to Developers > API Keys in your Stripe dashboard. Share the publishable key and secret key so we can connect it to TrustHome.' },
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

            <View style={[stepStyles.highlightBox, { backgroundColor: '#635BFF10', borderColor: '#635BFF30', marginTop: 12 }]}>
              <Ionicons name="information-circle" size={18} color="#635BFF" />
              <Text style={[stepStyles.highlightText, { color: colors.text }]}>
                Stripe collects all payments. Orbit Staffing handles the bookkeeping and automatically distributes your 51% share. You don't manage the split manually.
              </Text>
            </View>

            <View style={[stepStyles.highlightBox, { backgroundColor: '#FF950010', borderColor: '#FF950030', marginTop: 4 }]}>
              <Ionicons name="alert-circle" size={18} color="#FF9500" />
              <Text style={[stepStyles.highlightText, { color: colors.text }]}>
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
              <Text style={[styles.partnerBadgeText, { color: '#D4AF37' }]}>Partner Pack</Text>
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
  highlightBox: {
    flexDirection: 'row' as const,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    alignItems: 'flex-start' as const,
  },
  highlightText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
});
