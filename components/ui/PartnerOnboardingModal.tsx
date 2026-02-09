import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, ScrollView, Animated, Dimensions, Linking } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PartnerOnboardingModalProps {
  visible: boolean;
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: 'handshake' as const,
    iconLib: 'mci' as const,
    title: 'Welcome, Jennifer',
    subtitle: 'Managing Partner — 51%',
    body: 'As the majority owner and managing member of TrustHome, you are the face and driving force of this platform. Your real-world insight into the industry is what makes this product real — not just technology, but a tool that actually helps people.',
    accent: '#1A8A7E',
  },
  {
    icon: 'school-outline' as const,
    iconLib: 'ion' as const,
    title: 'Learn the Platform',
    subtitle: 'Know it inside and out',
    body: 'Take time to explore every feature — the agent dashboard, client portal, transaction pipeline, marketing tools, and Trust Layer integration. The more you know, the better you can show others what it does and how it can transform their business.',
    accent: '#4A90D9',
  },
  {
    icon: 'people-outline' as const,
    iconLib: 'ion' as const,
    title: 'Spread the Word',
    subtitle: 'Share it with anyone it could help',
    body: 'Think about every agent, broker, inspector, lender, and title company you know. If TrustHome could make their work easier, tell them about it. Your personal connections and industry credibility are our most powerful growth engine.',
    accent: '#D4AF37',
  },
  {
    icon: 'construct-outline' as const,
    iconLib: 'ion' as const,
    title: 'Help Shape It',
    subtitle: 'Your feedback builds the product',
    body: "By using TrustHome daily and sharing it with real professionals, you'll discover what works and what doesn't. Every piece of feedback helps us build a platform that truly fits the industry — and maybe even personalize it for specific needs and niches.",
    accent: '#E8715A',
  },
  {
    icon: 'briefcase-outline' as const,
    iconLib: 'ion' as const,
    title: 'Woman-Owned Business',
    subtitle: 'WOSB / WBENC Eligible',
    body: 'With your 51% ownership, TrustHome qualifies as a Woman-Owned Small Business. This opens doors to government contracts, corporate supplier diversity programs, and specialized funding. Your name is on this — it matters.',
    accent: '#9B59B6',
  },
  {
    icon: 'rocket-outline' as const,
    iconLib: 'ion' as const,
    title: "What's Coming",
    subtitle: 'Orbit Staffing & beyond',
    body: "We'll soon connect to Orbit Staffing for bookkeeping and HR — your 51/49 ownership split will be built into those systems. MLS integration, e-signatures, and listing syndication are on the roadmap. The foundation is set — now we grow it together.",
    accent: '#1A8A7E',
  },
];

function SlideIcon({ slide, size }: { slide: typeof SLIDES[0]; size: number }) {
  if (slide.iconLib === 'mci') {
    return <MaterialCommunityIcons name={slide.icon as any} size={size} color={slide.accent} />;
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

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onComplete}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
        <View style={[styles.card, {
          backgroundColor: colors.backgroundSecondary,
          paddingTop: Platform.OS === 'web' ? 24 : Math.max(insets.top, 16),
          paddingBottom: Platform.OS === 'web' ? 34 : Math.max(insets.bottom + 12, 24),
        }]}>
          <View style={styles.topRow}>
            <View style={styles.partnerBadge}>
              <MaterialCommunityIcons name="shield-star" size={16} color="#D4AF37" />
              <Text style={[styles.partnerBadgeText, { color: '#D4AF37' }]}>Partner</Text>
            </View>
            <Pressable onPress={onComplete} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textTertiary} />
            </Pressable>
          </View>

          <Animated.View style={[styles.slideContent, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            <View style={[styles.iconCircle, { backgroundColor: slide.accent + '15' }]}>
              <SlideIcon slide={slide} size={40} />
            </View>

            <Text style={[styles.slideTitle, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.slideSubtitle, { color: slide.accent }]}>{slide.subtitle}</Text>

            <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.slideBody, { color: colors.textSecondary }]}>{slide.body}</Text>
            </ScrollView>
          </Animated.View>

          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentSlide ? slide.accent : colors.border,
                    width: i === currentSlide ? 20 : 8,
                  },
                ]}
              />
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

            <Pressable onPress={goNext} style={[styles.primaryBtn, { backgroundColor: isLast ? '#D4AF37' : colors.primary }]}>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 20,
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
    minHeight: 280,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 20,
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    textAlign: 'center' as const,
    marginBottom: 6,
  },
  slideSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  bodyScroll: {
    maxHeight: 140,
  },
  slideBody: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center' as const,
    paddingHorizontal: 4,
  },
  dotsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginVertical: 20,
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
