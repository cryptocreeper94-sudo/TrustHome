import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Modal, Dimensions,
  FlatList, Platform, ViewToken, Image, ImageSourcePropType,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn, FadeInDown, FadeInUp, SlideInRight,
  useAnimatedStyle, useSharedValue, withSpring, withTiming, interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_SCREEN = SCREEN_HEIGHT < 700;

interface GuideSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  secondaryIcon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  bullets: string[];
  gradient: [string, string, string];
  accentColor: string;
  image: ImageSourcePropType;
  badge?: string;
}

const SLIDES: GuideSlide[] = [
  {
    id: 'welcome',
    icon: 'shield-checkmark',
    secondaryIcon: 'home',
    title: 'Welcome to\nTrustHome',
    subtitle: 'Your all-in-one real estate command center. Built for agents and partners who demand the best.',
    bullets: [
      'Blockchain-verified trust on every transaction',
      'AI-powered tools that multiply your productivity',
      'Everything you need — one unified platform',
    ],
    gradient: ['rgba(26,138,126,0.92)', 'rgba(15,107,98,0.95)', 'rgba(6,74,68,0.98)'],
    accentColor: '#B3E0DA',
    image: require('@/assets/images/guide-welcome.jpg'),
    badge: 'POWERED BY DARKWAVE TRUST LAYER',
  },
  {
    id: 'dashboard',
    icon: 'grid',
    secondaryIcon: 'pulse',
    title: 'Smart\nDashboard',
    subtitle: 'Your real-time business overview — every metric, every deal, at a glance.',
    bullets: [
      'Live revenue tracking and deal pipeline status',
      'Today\'s schedule with showings, tasks, and deadlines',
      'Quick-access cards to every tool in your suite',
      'Customizable widgets tailored to your workflow',
    ],
    gradient: ['rgba(15,107,98,0.9)', 'rgba(6,74,68,0.93)', 'rgba(3,45,41,0.97)'],
    accentColor: '#80CBC1',
    image: require('@/assets/images/guide-dashboard.jpg'),
  },
  {
    id: 'crm',
    icon: 'people',
    secondaryIcon: 'heart',
    title: 'CRM &\nContacts',
    subtitle: 'Build lasting relationships with a CRM designed for real estate professionals.',
    bullets: [
      'Unified contact database — clients, vendors, partners',
      'Smart tagging and segmentation for targeted outreach',
      'Activity timeline showing every interaction',
      'Automated follow-up reminders so no lead goes cold',
    ],
    gradient: ['rgba(45,52,54,0.9)', 'rgba(99,110,114,0.93)', 'rgba(45,52,54,0.97)'],
    accentColor: '#DFE6E9',
    image: require('@/assets/images/guide-crm.jpg'),
    badge: 'PAINTPROS.IO ECOSYSTEM',
  },
  {
    id: 'leads',
    icon: 'funnel',
    secondaryIcon: 'star',
    title: 'Lead\nManagement',
    subtitle: 'Capture, score, and convert leads with intelligent automation.',
    bullets: [
      'AI lead scoring ranks prospects by likelihood to close',
      'Automated drip campaigns keep leads engaged',
      'Source tracking shows which channels perform best',
      'One-tap conversion from lead to active client',
    ],
    gradient: ['rgba(225,112,85,0.9)', 'rgba(253,203,110,0.85)', 'rgba(225,112,85,0.97)'],
    accentColor: '#FFECD2',
    image: require('@/assets/images/guide-leads.jpg'),
  },
  {
    id: 'transactions',
    icon: 'layers',
    secondaryIcon: 'git-network',
    title: 'Transaction\nPipeline',
    subtitle: 'Visual deal management from first showing to closing day.',
    bullets: [
      'Drag-and-drop pipeline with customizable stages',
      'Deadline tracking with automated countdown alerts',
      'All parties connected — agents, lenders, inspectors, title',
      'Commission tracking and revenue forecasting per deal',
    ],
    gradient: ['rgba(24,40,72,0.92)', 'rgba(75,108,183,0.9)', 'rgba(24,40,72,0.97)'],
    accentColor: '#A8C0FF',
    image: require('@/assets/images/guide-transactions.jpg'),
  },
  {
    id: 'properties',
    icon: 'business',
    secondaryIcon: 'images',
    title: 'Properties &\nListings',
    subtitle: 'Manage your entire portfolio with professional tools.',
    bullets: [
      'Rich property profiles with photos, details, and history',
      'Side-by-side comparison tool for client presentations',
      'Open house scheduling and visitor tracking',
      'Listing status management with instant updates',
    ],
    gradient: ['rgba(26,138,126,0.88)', 'rgba(0,206,201,0.85)', 'rgba(6,74,68,0.97)'],
    accentColor: '#DDFFF9',
    image: require('@/assets/images/guide-properties.jpg'),
  },
  {
    id: 'showings',
    icon: 'calendar',
    secondaryIcon: 'navigate',
    title: 'Showing\nManagement',
    subtitle: 'Schedule, confirm, and track every showing effortlessly.',
    bullets: [
      'One-tap scheduling with client notification',
      'Route optimization for multiple showing days',
      'Client feedback collection after each visit',
      'Calendar sync with Google and Apple Calendar',
    ],
    gradient: ['rgba(108,92,231,0.9)', 'rgba(162,155,254,0.88)', 'rgba(108,92,231,0.97)'],
    accentColor: '#DCD6F7',
    image: require('@/assets/images/guide-showings.jpg'),
  },
  {
    id: 'documents',
    icon: 'document-text',
    secondaryIcon: 'shield-checkmark',
    title: 'Document\nVault',
    subtitle: 'Blockchain-verified document security. Every file, every version, always trusted.',
    bullets: [
      'Upload, organize, and share with one tap',
      'Blockchain verification stamps on critical documents',
      'e-Signature integration with complete audit trail',
      'Per-transaction folders with version history',
    ],
    gradient: ['rgba(45,52,54,0.92)', 'rgba(99,110,114,0.88)', 'rgba(45,52,54,0.97)'],
    accentColor: '#B2BEC3',
    image: require('@/assets/images/guide-documents.jpg'),
    badge: 'BLOCKCHAIN VERIFIED',
  },
  {
    id: 'messages',
    icon: 'chatbubbles',
    secondaryIcon: 'flash',
    title: 'Communication\nHub',
    subtitle: 'Stay connected with every party in the transaction — clients, vendors, and team.',
    bullets: [
      'Direct messaging with read receipts and typing indicators',
      'Transaction-linked threads for organized conversations',
      'Cross-ecosystem Signal Chat via PaintPros.io',
      'File sharing and voice messages built in',
    ],
    gradient: ['rgba(0,184,148,0.9)', 'rgba(0,206,201,0.88)', 'rgba(0,184,148,0.97)'],
    accentColor: '#DDFFF9',
    image: require('@/assets/images/guide-messages.jpg'),
    badge: 'SIGNAL CHAT INTEGRATED',
  },
  {
    id: 'marketing',
    icon: 'megaphone',
    secondaryIcon: 'create',
    title: 'Marketing\nHub',
    subtitle: 'AI-powered content creation and campaign management for modern agents.',
    bullets: [
      'AI generates listing descriptions, blog posts, and social content',
      'Email campaign builder with templates and scheduling',
      'Social media automation for Facebook and Instagram',
      'Brand-consistent content that matches your identity',
    ],
    gradient: ['rgba(225,112,85,0.92)', 'rgba(253,203,110,0.88)', 'rgba(225,112,85,0.97)'],
    accentColor: '#FFECD2',
    image: require('@/assets/images/guide-marketing.jpg'),
  },
  {
    id: 'mls',
    icon: 'globe',
    secondaryIcon: 'sync',
    title: 'MLS\nIntegration',
    subtitle: 'Connect your MLS credentials for live listing data straight into your pipeline.',
    bullets: [
      'Self-service setup — enter your MLS credentials securely',
      'Supports 10+ providers: Bridge, Spark, Trestle, CRMLS, and more',
      'Real-time listing sync keeps your portfolio current',
      'RESO Web API compliant for industry-standard data',
    ],
    gradient: ['rgba(24,40,72,0.92)', 'rgba(75,108,183,0.88)', 'rgba(24,40,72,0.97)'],
    accentColor: '#A8C0FF',
    image: require('@/assets/images/guide-mls.jpg'),
    badge: 'RESO COMPLIANT',
  },
  {
    id: 'analytics',
    icon: 'analytics',
    secondaryIcon: 'trending-up',
    title: 'Performance\nAnalytics',
    subtitle: 'Data-driven insights that help you close more deals and grow faster.',
    bullets: [
      'Revenue, conversion rates, and deal velocity metrics',
      'Lead source ROI analysis to optimize your spend',
      'Year-over-year comparisons and growth trends',
      'Exportable reports for brokerage presentations',
    ],
    gradient: ['rgba(108,92,231,0.9)', 'rgba(162,155,254,0.85)', 'rgba(108,92,231,0.97)'],
    accentColor: '#DCD6F7',
    image: require('@/assets/images/guide-analytics.jpg'),
  },
  {
    id: 'business',
    icon: 'briefcase',
    secondaryIcon: 'calculator',
    title: 'Business\nSuite',
    subtitle: 'Track expenses, mileage, and finances — your back office, simplified.',
    bullets: [
      'Expense tracking with receipt capture and categories',
      'Mileage logging for tax deductions',
      'Commission and income tracking per transaction',
      'Year-end tax summary reports ready for your CPA',
    ],
    gradient: ['rgba(45,52,54,0.92)', 'rgba(99,110,114,0.88)', 'rgba(45,52,54,0.97)'],
    accentColor: '#DFE6E9',
    image: require('@/assets/images/guide-business.jpg'),
  },
  {
    id: 'network',
    icon: 'link',
    secondaryIcon: 'people-circle',
    title: 'Network &\nReferrals',
    subtitle: 'Build your professional network and earn from every referral.',
    bullets: [
      'Vendor directory — inspectors, lenders, title, contractors',
      'Referral tracking with commission split management',
      'Team collaboration with role-based access',
      'Cross-ecosystem connections via the DarkWave network',
    ],
    gradient: ['rgba(0,184,148,0.9)', 'rgba(0,206,201,0.85)', 'rgba(0,184,148,0.97)'],
    accentColor: '#DDFFF9',
    image: require('@/assets/images/guide-network.jpg'),
  },
  {
    id: 'ai',
    icon: 'sparkles',
    secondaryIcon: 'mic',
    title: 'AI\nAssistant',
    subtitle: 'Your voice-capable AI partner — ask anything, get instant answers.',
    bullets: [
      'Voice-enabled — speak naturally, get spoken responses',
      'Transaction guidance and deadline reminders',
      'Market analysis and comparable property data',
      'Draft emails, listing descriptions, and contracts',
    ],
    gradient: ['rgba(26,138,126,0.92)', 'rgba(15,107,98,0.9)', 'rgba(6,74,68,0.97)'],
    accentColor: '#B3E0DA',
    image: require('@/assets/images/guide-ai.jpg'),
    badge: 'VOICE ENABLED',
  },
  {
    id: 'trust',
    icon: 'shield-checkmark',
    secondaryIcon: 'cube',
    title: 'Trust Layer\nBlockchain',
    subtitle: 'Every transaction verified on the DarkWave Trust Layer — immutable, transparent, trusted.',
    bullets: [
      'Document hashing and verification on custom Layer 1',
      'Digital Trust Score for agents and vendors',
      'Membership card and dwtl.io dashboard access',
      'Trust Shield security suite protecting every action',
    ],
    gradient: ['rgba(24,40,72,0.92)', 'rgba(75,108,183,0.88)', 'rgba(24,40,72,0.97)'],
    accentColor: '#A8C0FF',
    image: require('@/assets/images/guide-trust.jpg'),
    badge: 'DARKWAVE TRUST LAYER',
  },
  {
    id: 'media',
    icon: 'videocam',
    secondaryIcon: 'film',
    title: 'Media\nStudio',
    subtitle: 'Professional video walkthroughs and property media — produced for you.',
    bullets: [
      'Request property walkthroughs, voiceovers, and aerial footage',
      'DarkWave Media Studio produces broadcast-quality content',
      'Download completed projects directly from your dashboard',
      'Interior photography and virtual staging capabilities',
    ],
    gradient: ['rgba(45,52,54,0.92)', 'rgba(99,110,114,0.85)', 'rgba(45,52,54,0.97)'],
    accentColor: '#DFE6E9',
    image: require('@/assets/images/guide-media.jpg'),
    badge: 'DARKWAVE MEDIA STUDIO',
  },
  {
    id: 'ready',
    icon: 'rocket',
    secondaryIcon: 'checkmark-circle',
    title: 'You\'re\nAll Set',
    subtitle: 'Your platform is ready. Every tool, every advantage, at your fingertips.',
    bullets: [
      'Access this tour anytime from the Platform Tour menu',
      'Look for info buttons throughout the app for quick help',
      'Your data is secure, verified, and backed by blockchain',
      'Welcome to the future of real estate — welcome to TrustHome',
    ],
    gradient: ['rgba(26,138,126,0.92)', 'rgba(15,107,98,0.9)', 'rgba(6,74,68,0.97)'],
    accentColor: '#B3E0DA',
    image: require('@/assets/images/guide-ready.jpg'),
  },
];

const CONTROLS_HEIGHT = 80;

interface SlideItemProps {
  item: GuideSlide;
  index: number;
  isActive: boolean;
  totalSlides: number;
}

function SlideItem({ item, index, isActive, totalSlides }: SlideItemProps) {
  const insets = useSafeAreaInsets();
  const isFirst = index === 0;
  const isLast = index === totalSlides - 1;
  const topPad = Platform.OS === 'web' ? 67 + 16 : insets.top + 16;
  const bottomPad = Platform.OS === 'web' ? 34 + CONTROLS_HEIGHT + 8 : insets.bottom + CONTROLS_HEIGHT + 8;
  const iconSize = IS_SMALL_SCREEN ? 64 : 76;

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />

      <LinearGradient
        colors={item.gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.slideScroll}
        contentContainerStyle={[
          styles.slideContent,
          { paddingTop: topPad, paddingBottom: bottomPad },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {item.badge && (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={10} color="rgba(255,255,255,0.9)" />
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          </View>
        )}

        <View style={styles.slideNumber}>
          <Text style={styles.slideNumberText}>{String(index + 1).padStart(2, '0')}</Text>
          <View style={styles.slideNumberLine} />
          <Text style={styles.slideNumberTotal}>{String(totalSlides).padStart(2, '0')}</Text>
        </View>

        <View style={styles.iconCluster}>
          <View style={[styles.mainIconCircle, { width: iconSize, height: iconSize, borderRadius: iconSize / 2 }]}>
            <Ionicons name={item.icon} size={IS_SMALL_SCREEN ? 32 : 40} color="#FFFFFF" />
          </View>
          {item.secondaryIcon && (
            <View style={styles.secondaryIconCircle}>
              <Ionicons name={item.secondaryIcon} size={16} color="#FFFFFF" />
            </View>
          )}
        </View>

        <Text style={[styles.slideTitle, IS_SMALL_SCREEN && { fontSize: 24, lineHeight: 30 }]}>{item.title}</Text>

        <View style={styles.subtitleCard}>
          <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
        </View>

        {item.bullets.length > 0 && (
          <View style={styles.bulletCard}>
            {item.bullets.map((bullet, bi) => (
              <View key={bi} style={styles.bulletRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={item.accentColor}
                  style={{ marginTop: 1 }}
                />
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        )}

        {isFirst && (
          <View style={styles.welcomeHint}>
            <View style={styles.swipeIndicator}>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.4)" />
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.6)" style={{ marginLeft: -6 }} />
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.8)" style={{ marginLeft: -6 }} />
            </View>
            <Text style={styles.welcomeHintText}>Swipe to explore all features</Text>
          </View>
        )}

        {isLast && (
          <View style={styles.finalCta}>
            <Ionicons name="sparkles" size={18} color="#1A8A7E" />
            <Text style={styles.finalCtaText}>Your TrustHome journey begins now</Text>
          </View>
        )}
      </ScrollView>
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
      setCurrentIndex(0);
      onComplete();
    }
  }, [currentIndex, onComplete]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  }, [currentIndex]);

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const isFirstSlide = currentIndex === 0;
  const progress = ((currentIndex + 1) / SLIDES.length) * 100;

  const renderItem = useCallback(({ item, index }: { item: GuideSlide; index: number }) => (
    <SlideItem item={item} index={index} isActive={index === currentIndex} totalSlides={SLIDES.length} />
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

        <View style={[
          styles.progressBarContainer,
          { top: Platform.OS === 'web' ? 67 + 6 : insets.top + 6 },
        ]}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` as any }]} />
          </View>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)'] as [string, string, ...string[]]}
          style={[styles.controlsGradient, {
            paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom,
          }]}
          pointerEvents="box-none"
        >
          <View style={styles.controls}>
            <Pressable
              onPress={isFirstSlide ? onComplete : goToPrev}
              style={styles.controlBtn}
              hitSlop={12}
            >
              {isFirstSlide ? (
                <Text style={styles.skipText}>Skip</Text>
              ) : (
                <View style={styles.navCircle}>
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </View>
              )}
            </Pressable>

            <View style={styles.centerNav}>
              <Text style={styles.pageIndicator}>
                <Text style={styles.pageIndicatorCurrent}>{currentIndex + 1}</Text>
                <Text style={styles.pageIndicatorSep}> / </Text>
                <Text style={styles.pageIndicatorTotal}>{SLIDES.length}</Text>
              </Text>
              <View style={styles.miniProgressRow}>
                {Array.from({ length: Math.ceil(SLIDES.length / 3) }).map((_, groupIdx) => {
                  const groupStart = groupIdx * 3;
                  const isCurrentGroup = currentIndex >= groupStart && currentIndex < groupStart + 3;
                  return (
                    <View
                      key={groupIdx}
                      style={[
                        styles.miniDot,
                        isCurrentGroup ? styles.miniDotActive : styles.miniDotInactive,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            <Pressable
              onPress={goToNext}
              style={[styles.controlBtn, { alignItems: 'flex-end' as const }]}
              hitSlop={12}
            >
              {isLastSlide ? (
                <View style={styles.getStartedBtn}>
                  <Text style={styles.getStartedText}>Let's Go</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.navCircle}>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </View>
              )}
            </Pressable>
          </View>
        </LinearGradient>
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
  slideScroll: {
    flex: 1,
  },
  slideContent: {
    paddingHorizontal: 24,
    alignItems: 'stretch',
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 1.2,
  },
  slideNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginBottom: 10,
  },
  slideNumberText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  slideNumberLine: {
    width: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  slideNumberTotal: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
  },
  iconCluster: {
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative' as const,
  },
  mainIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute' as const,
    bottom: -2,
    right: '33%' as any,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitleCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  slideSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 19,
  },
  bulletCard: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
  },
  welcomeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'center',
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeHintText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500' as const,
  },
  finalCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.3)',
  },
  finalCtaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600' as const,
  },
  progressBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 3,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%' as any,
    backgroundColor: '#1A8A7E',
    borderRadius: 2,
  },
  controlsGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlBtn: {
    minWidth: 80,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500' as const,
  },
  navCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  centerNav: {
    alignItems: 'center',
    gap: 6,
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  pageIndicatorCurrent: {
    color: '#FFFFFF',
    fontWeight: '700' as const,
  },
  pageIndicatorSep: {
    color: 'rgba(255,255,255,0.35)',
  },
  pageIndicatorTotal: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500' as const,
  },
  miniProgressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  miniDot: {
    height: 4,
    borderRadius: 2,
  },
  miniDotActive: {
    width: 16,
    backgroundColor: '#1A8A7E',
  },
  miniDotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#1A8A7E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  getStartedText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
