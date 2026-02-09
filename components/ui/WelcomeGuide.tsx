import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, Dimensions,
  FlatList, Platform, ViewToken,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, FadeInUp, useAnimatedStyle,
  useSharedValue, withSpring, withTiming, interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GuideSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  secondaryIcon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  bullets: string[];
  gradient: [string, string];
  accentColor: string;
}

const SLIDES: GuideSlide[] = [
  {
    id: 'welcome',
    icon: 'home',
    secondaryIcon: 'shield-checkmark',
    title: 'Welcome to Your\nCommand Center',
    subtitle: 'Everything you need to manage transactions, clients, and your business — all in one place.',
    bullets: [],
    gradient: ['#1A8A7E', '#0F6B62'],
    accentColor: '#B3E0DA',
  },
  {
    id: 'dashboard',
    icon: 'grid',
    title: 'Smart Dashboard',
    subtitle: 'Your personalized overview updates in real-time.',
    bullets: [
      'Track active deals, leads, and revenue at a glance',
      'Today\'s schedule with upcoming showings and appointments',
      'Quick-access cards to every part of your business',
    ],
    gradient: ['#0F6B62', '#064A44'],
    accentColor: '#80CBC1',
  },
  {
    id: 'transactions',
    icon: 'layers',
    secondaryIcon: 'git-network',
    title: 'Transaction\nPipeline',
    subtitle: 'Follow every deal from first showing to close.',
    bullets: [
      'Visual pipeline with drag-and-drop stages',
      'Deadline tracking with automated reminders',
      'All parties connected — agents, lenders, inspectors, title',
    ],
    gradient: ['#182848', '#4B6CB7'],
    accentColor: '#A8C0FF',
  },
  {
    id: 'properties',
    icon: 'business',
    title: 'Properties &\nListings',
    subtitle: 'Manage your portfolio with powerful tools.',
    bullets: [
      'MLS-synced listings with real-time status',
      'Showing management and open house scheduling',
      'Side-by-side property comparisons for clients',
    ],
    gradient: ['#2D3436', '#636E72'],
    accentColor: '#DFE6E9',
  },
  {
    id: 'documents',
    icon: 'document-text',
    secondaryIcon: 'shield-checkmark',
    title: 'Document Vault',
    subtitle: 'Secure, verified, and always accessible.',
    bullets: [
      'Blockchain-verified document integrity',
      'e-Signature integration with full audit trail',
      'Organized by transaction with version history',
    ],
    gradient: ['#6C5CE7', '#A29BFE'],
    accentColor: '#DCD6F7',
  },
  {
    id: 'communication',
    icon: 'chatbubbles',
    title: 'Communication\nHub',
    subtitle: 'Stay connected with every party in the transaction.',
    bullets: [
      'Direct messaging with clients and vendors',
      'Transaction-linked conversations for context',
      'Cross-ecosystem Signal Chat integration',
    ],
    gradient: ['#00B894', '#00CEC9'],
    accentColor: '#DDFFF9',
  },
  {
    id: 'marketing',
    icon: 'megaphone',
    secondaryIcon: 'analytics',
    title: 'Marketing &\nAnalytics',
    subtitle: 'Grow your business with intelligent tools.',
    bullets: [
      'AI-powered content creation for listings',
      'Social media scheduling and automation',
      'Performance analytics with conversion tracking',
    ],
    gradient: ['#E17055', '#FDCB6E'],
    accentColor: '#FFECD2',
  },
  {
    id: 'ready',
    icon: 'rocket',
    title: 'You\'re All Set',
    subtitle: 'Look for the info buttons throughout the app for feature-specific guidance anytime.',
    bullets: [],
    gradient: ['#1A8A7E', '#0F6B62'],
    accentColor: '#B3E0DA',
  },
];

interface SlideItemProps {
  item: GuideSlide;
  index: number;
  isActive: boolean;
}

function SlideItem({ item, index, isActive }: SlideItemProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <LinearGradient
        colors={item.gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.slideContent, { paddingTop: insets.top + 80 }]}>
        <View style={styles.iconCluster}>
          <View style={[styles.mainIconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Ionicons name={item.icon} size={56} color="#FFFFFF" />
          </View>
          {item.secondaryIcon && (
            <View style={[styles.secondaryIconCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={item.secondaryIcon} size={22} color="#FFFFFF" />
            </View>
          )}
        </View>

        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

        {item.bullets.length > 0 && (
          <View style={styles.bulletList}>
            {item.bullets.map((bullet, bi) => (
              <View key={bi} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: item.accentColor }]} />
                <Text style={[styles.bulletText, { color: 'rgba(255,255,255,0.88)' }]}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}

        {index === 0 && (
          <View style={styles.welcomeHint}>
            <Ionicons name="swap-horizontal" size={18} color="rgba(255,255,255,0.5)" />
            <Text style={styles.welcomeHintText}>Swipe to explore features</Text>
          </View>
        )}

        {index === SLIDES.length - 1 && (
          <View style={styles.infoHintRow}>
            <View style={[styles.infoHintIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="information-circle-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.infoHintText}>Tap these buttons anywhere in the app</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface WelcomeGuideProps {
  visible: boolean;
  onComplete: () => void;
}

export function WelcomeGuide({ visible, onComplete }: WelcomeGuideProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNext = useCallback(() => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      onComplete();
    }
  }, [currentIndex, onComplete]);

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const isFirstSlide = currentIndex === 0;

  const renderItem = useCallback(({ item, index }: { item: GuideSlide; index: number }) => (
    <SlideItem item={item} index={index} isActive={index === currentIndex} />
  ), [currentIndex]);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        <View style={[styles.controls, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
          <Pressable
            onPress={onComplete}
            style={styles.skipBtn}
            hitSlop={12}
          >
            <Text style={styles.skipText}>{isLastSlide ? '' : 'Skip'}</Text>
          </Pressable>

          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === currentIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={goToNext}
            style={[styles.nextBtn, isLastSlide && styles.nextBtnLarge]}
          >
            {isLastSlide ? (
              <Text style={styles.getStartedText}>Get Started</Text>
            ) : (
              <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-start',
  },
  iconCluster: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative' as const,
  },
  mainIconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute' as const,
    bottom: -4,
    right: '30%' as any,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  bulletList: {
    gap: 14,
    paddingHorizontal: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  bulletText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  welcomeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
  },
  welcomeHintText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  infoHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'center',
  },
  infoHintIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoHintText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipBtn: {
    width: 80,
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  nextBtnLarge: {
    width: 'auto' as any,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  getStartedText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
