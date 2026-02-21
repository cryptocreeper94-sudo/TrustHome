import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking, Dimensions, ImageBackground, ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { VideoHero } from '@/components/ui/VideoHero';

const HERO_VIDEOS = [
  { src: require('@/assets/videos/hero-properties.mp4'), label: 'Properties & Listings', fallbackImage: require('@/assets/images/cards/card-property-manager.jpg') },
  { src: require('@/assets/videos/hero-interior.mp4'), label: 'Home Interiors', fallbackImage: require('@/assets/images/cards/card-browse-properties.jpg') },
  { src: require('@/assets/videos/hero-marketing.mp4'), label: 'Marketing & AI', fallbackImage: require('@/assets/images/cards/card-ai-marketing.jpg') },
  { src: require('@/assets/videos/hero-transactions.mp4'), label: 'Transactions & Deals', fallbackImage: require('@/assets/images/cards/card-transaction-pipeline.jpg') },
  { src: require('@/assets/videos/hero-landscape.mp4'), label: 'Tree & Landscape', fallbackImage: require('@/assets/images/cards/card-tree-services.png') },
  { src: require('@/assets/videos/hero-business.mp4'), label: 'Business & Analytics', fallbackImage: require('@/assets/images/cards/card-analytics-dashboard.jpg') },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(260, SCREEN_WIDTH * 0.72);
const FEATURED_CARD_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);
const CARD_HEIGHT = 170;
const FEATURED_CARD_HEIGHT = 200;

interface LaunchCard {
  label: string;
  description: string;
  route?: string;
  externalUrl?: string;
  onAction?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  glowColor: string;
  badge?: string;
  badgeGradient?: [string, string];
  featured?: boolean;
  image: ImageSourcePropType;
}

interface Category {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  description: string;
  cards: LaunchCard[];
  roles?: string[];
}

const ALL_CATEGORIES: Category[] = [
  {
    title: 'Operations Hub',
    icon: 'grid-outline',
    gradient: ['#1A8A7E', '#0EA5E9'],
    description: 'Core business tools — leads, transactions, showings, and property management.',
    roles: ['agent', 'partner', 'developer'],
    cards: [
      {
        label: 'Agent Dashboard',
        description: 'Real-time business overview & KPIs',
        route: '/',
        icon: 'speedometer-outline',
        gradient: ['#0F766E', '#0891B2'],
        glowColor: 'rgba(26, 138, 126, 0.35)',
        badge: 'Live',
        badgeGradient: ['#10B981', '#059669'],
        featured: true,
        onAction: 'switch_dashboard',
        image: require('@/assets/images/cards/card-agent-dashboard.jpg'),
      },
      {
        label: 'Lead Management',
        description: 'Track, score & nurture prospects',
        route: '/leads',
        icon: 'people-outline',
        gradient: ['#0E7490', '#0369A1'],
        glowColor: 'rgba(14, 116, 144, 0.3)',
        image: require('@/assets/images/cards/card-lead-management.jpg'),
      },
      {
        label: 'Transaction Pipeline',
        description: 'Manage deals from offer to close',
        route: '/transactions',
        icon: 'swap-horizontal-outline',
        gradient: ['#115E59', '#134E4A'],
        glowColor: 'rgba(17, 94, 89, 0.3)',
        image: require('@/assets/images/cards/card-transaction-pipeline.jpg'),
      },
      {
        label: 'Showing Manager',
        description: 'Schedule & track property showings',
        route: '/showings',
        icon: 'calendar-outline',
        gradient: ['#155E75', '#164E63'],
        glowColor: 'rgba(21, 94, 117, 0.3)',
        image: require('@/assets/images/cards/card-showing-manager.jpg'),
      },
      {
        label: 'Property Manager',
        description: 'Listings, shortlists & comparisons',
        route: '/properties',
        icon: 'business-outline',
        gradient: ['#0D9488', '#0F766E'],
        glowColor: 'rgba(13, 148, 136, 0.3)',
        image: require('@/assets/images/cards/card-property-manager.jpg'),
      },
    ],
  },
  {
    title: 'Marketing & Content',
    icon: 'megaphone-outline',
    gradient: ['#7C3AED', '#DB2777'],
    description: 'AI-powered marketing, blog, media production, and brand customization.',
    roles: ['agent', 'partner', 'developer'],
    cards: [
      {
        label: 'AI Marketing Hub',
        description: 'Generate posts, captions & campaigns',
        route: '/marketing',
        icon: 'rocket-outline',
        gradient: ['#7C3AED', '#9333EA'],
        glowColor: 'rgba(124, 58, 237, 0.35)',
        badge: 'AI',
        badgeGradient: ['#8B5CF6', '#A855F7'],
        featured: true,
        image: require('@/assets/images/cards/card-ai-marketing.jpg'),
      },
      {
        label: 'Blog Manager',
        description: 'Create & publish AI-generated articles',
        route: '/blog',
        icon: 'newspaper-outline',
        gradient: ['#6D28D9', '#7E22CE'],
        glowColor: 'rgba(109, 40, 217, 0.3)',
        image: require('@/assets/images/cards/card-blog-manager.jpg'),
      },
      {
        label: 'Media Studio',
        description: 'Video walkthroughs & property media',
        route: '/media-studio',
        icon: 'film-outline',
        gradient: ['#BE185D', '#9D174D'],
        glowColor: 'rgba(190, 24, 93, 0.3)',
        badge: 'New',
        badgeGradient: ['#F43F5E', '#E11D48'],
        image: require('@/assets/images/cards/card-media-studio.jpg'),
      },
      {
        label: 'Tree Services',
        description: 'AI tree assessment & removal estimates',
        route: '/tree-services',
        icon: 'leaf-outline',
        gradient: ['#16A34A', '#15803D'],
        glowColor: 'rgba(22, 163, 74, 0.3)',
        badge: 'Ecosystem',
        badgeGradient: ['#34C759', '#22A047'],
        image: require('@/assets/images/cards/card-tree-services.png'),
      },
      {
        label: 'Branding Suite',
        description: 'Colors, logos & white-label settings',
        route: '/branding',
        icon: 'color-palette-outline',
        gradient: ['#A21CAF', '#86198F'],
        glowColor: 'rgba(162, 28, 175, 0.3)',
        image: require('@/assets/images/cards/card-branding-suite.jpg'),
      },
    ],
  },
  {
    title: 'Communication',
    icon: 'chatbubbles-outline',
    gradient: ['#2563EB', '#4F46E5'],
    description: 'Messaging, cross-ecosystem chat, AI assistant, and your professional network.',
    roles: ['agent', 'partner', 'developer', 'client'],
    cards: [
      {
        label: 'Messages',
        description: 'Direct client & team messaging',
        route: '/messages',
        icon: 'chatbubble-ellipses-outline',
        gradient: ['#2563EB', '#1D4ED8'],
        glowColor: 'rgba(37, 99, 235, 0.35)',
        featured: true,
        image: require('@/assets/images/cards/card-messages.jpg'),
      },
      {
        label: 'Signal Chat',
        description: 'Cross-ecosystem messaging via PaintPros',
        onAction: 'signal_chat',
        icon: 'radio-outline',
        gradient: ['#4338CA', '#3730A3'],
        glowColor: 'rgba(67, 56, 202, 0.3)',
        badge: 'Ecosystem',
        badgeGradient: ['#6366F1', '#4F46E5'],
        image: require('@/assets/images/cards/card-signal-chat.jpg'),
      },
      {
        label: 'AI Assistant',
        description: 'Voice-capable AI for agents & clients',
        onAction: 'ai_assistant',
        icon: 'sparkles-outline',
        gradient: ['#1E40AF', '#1E3A8A'],
        glowColor: 'rgba(30, 64, 175, 0.3)',
        badge: 'AI',
        badgeGradient: ['#8B5CF6', '#A855F7'],
        image: require('@/assets/images/cards/card-ai-assistant.jpg'),
      },
      {
        label: 'Network & Referrals',
        description: 'Build your professional referral network',
        route: '/network',
        icon: 'globe-outline',
        gradient: ['#4F46E5', '#4338CA'],
        glowColor: 'rgba(79, 70, 229, 0.3)',
        image: require('@/assets/images/cards/card-network-referrals.jpg'),
      },
    ],
  },
  {
    title: 'Business & Finance',
    icon: 'briefcase-outline',
    gradient: ['#059669', '#0D9488'],
    description: 'Expenses, mileage tracking, analytics, and document management.',
    roles: ['agent', 'partner', 'developer'],
    cards: [
      {
        label: 'Business Suite',
        description: 'Expenses, mileage & financial tools',
        route: '/business',
        icon: 'calculator-outline',
        gradient: ['#059669', '#047857'],
        glowColor: 'rgba(5, 150, 105, 0.35)',
        badge: 'Earn',
        badgeGradient: ['#10B981', '#059669'],
        featured: true,
        image: require('@/assets/images/cards/card-business-suite.jpg'),
      },
      {
        label: 'Analytics Dashboard',
        description: 'Performance metrics & market insights',
        route: '/analytics',
        icon: 'bar-chart-outline',
        gradient: ['#0D9488', '#0F766E'],
        glowColor: 'rgba(13, 148, 136, 0.3)',
        badge: 'Live',
        badgeGradient: ['#10B981', '#059669'],
        image: require('@/assets/images/cards/card-analytics-dashboard.jpg'),
      },
      {
        label: 'Document Vault',
        description: 'Encrypted contract & file management',
        route: '/documents',
        icon: 'lock-closed-outline',
        gradient: ['#047857', '#065F46'],
        glowColor: 'rgba(4, 120, 87, 0.3)',
        image: require('@/assets/images/cards/card-document-vault.jpg'),
      },
    ],
  },
  {
    title: 'Your Home Journey',
    icon: 'home-outline',
    gradient: ['#0D9488', '#1A8A7E'],
    description: 'Browse properties, schedule showings, and track your transaction.',
    roles: ['client'],
    cards: [
      {
        label: 'Browse Properties',
        description: 'Search listings & build your shortlist',
        route: '/properties',
        icon: 'business-outline',
        gradient: ['#0E7490', '#0369A1'],
        glowColor: 'rgba(14, 116, 144, 0.35)',
        featured: true,
        image: require('@/assets/images/cards/card-browse-properties.jpg'),
      },
      {
        label: 'Schedule Showings',
        description: 'Book & manage property tours',
        route: '/showings',
        icon: 'calendar-outline',
        gradient: ['#155E75', '#164E63'],
        glowColor: 'rgba(21, 94, 117, 0.3)',
        image: require('@/assets/images/cards/card-schedule-showings.jpg'),
      },
      {
        label: 'My Transaction',
        description: 'Track your deal from offer to close',
        route: '/transactions',
        icon: 'swap-horizontal-outline',
        gradient: ['#115E59', '#134E4A'],
        glowColor: 'rgba(17, 94, 89, 0.3)',
        image: require('@/assets/images/cards/card-my-transaction.jpg'),
      },
    ],
  },
  {
    title: 'Tools & Resources',
    icon: 'construct-outline',
    gradient: ['#0369A1', '#047857'],
    description: 'Mortgage calculators, document vault, and neighborhood intelligence.',
    roles: ['client'],
    cards: [
      {
        label: 'Document Vault',
        description: 'Contracts & files, securely stored',
        route: '/documents',
        icon: 'lock-closed-outline',
        gradient: ['#047857', '#065F46'],
        glowColor: 'rgba(4, 120, 87, 0.3)',
        featured: true,
        image: require('@/assets/images/cards/card-document-vault.jpg'),
      },
      {
        label: 'Mortgage Tools',
        description: 'Calculators, rates & pre-approval',
        route: '/',
        icon: 'calculator-outline',
        gradient: ['#059669', '#047857'],
        glowColor: 'rgba(5, 150, 105, 0.3)',
        image: require('@/assets/images/cards/card-mortgage-tools.jpg'),
      },
      {
        label: 'Neighborhood Intel',
        description: 'Schools, safety & local data',
        route: '/',
        icon: 'map-outline',
        gradient: ['#D97706', '#B45309'],
        glowColor: 'rgba(217, 119, 6, 0.3)',
        image: require('@/assets/images/cards/card-neighborhood-intel.jpg'),
      },
    ],
  },
  {
    title: 'Platform Management',
    icon: 'settings-outline',
    gradient: ['#D97706', '#EA580C'],
    description: 'MLS connections, account settings, integrations, and support.',
    roles: ['agent', 'partner', 'developer'],
    cards: [
      {
        label: 'Settings',
        description: 'Account, security & preferences',
        route: '/settings',
        icon: 'cog-outline',
        gradient: ['#D97706', '#B45309'],
        glowColor: 'rgba(217, 119, 6, 0.3)',
        image: require('@/assets/images/cards/card-settings.jpg'),
      },
      {
        label: 'MLS Integration',
        description: 'Connect your MLS data feed',
        route: '/mls-setup',
        icon: 'link-outline',
        gradient: ['#EA580C', '#C2410C'],
        glowColor: 'rgba(234, 88, 12, 0.3)',
        badge: 'Setup',
        badgeGradient: ['#F59E0B', '#D97706'],
        image: require('@/assets/images/cards/card-mls-integration.jpg'),
      },
      {
        label: 'Help & Support',
        description: 'FAQs, contact & feature requests',
        route: '/support',
        icon: 'help-circle-outline',
        gradient: ['#B45309', '#92400E'],
        glowColor: 'rgba(180, 83, 9, 0.3)',
        image: require('@/assets/images/cards/card-help-support.jpg'),
      },
    ],
  },
  {
    title: 'Developer & Security',
    icon: 'code-slash-outline',
    gradient: ['#DC2626', '#BE123C'],
    description: 'API access, blockchain verification, and Trust Shield security.',
    roles: ['developer', 'partner'],
    cards: [
      {
        label: 'Developer Console',
        description: 'API keys, access requests & system health',
        route: '/developer',
        icon: 'terminal-outline',
        gradient: ['#DC2626', '#B91C1C'],
        glowColor: 'rgba(220, 38, 38, 0.35)',
        featured: true,
        image: require('@/assets/images/cards/card-developer-console.jpg'),
      },
      {
        label: 'Trust Layer',
        description: 'Blockchain verification & trust scores',
        externalUrl: 'https://dwtl.io',
        icon: 'shield-checkmark-outline',
        gradient: ['#BE123C', '#9F1239'],
        glowColor: 'rgba(190, 18, 60, 0.3)',
        badge: 'Blockchain',
        badgeGradient: ['#EF4444', '#DC2626'],
        image: require('@/assets/images/cards/card-trust-layer.jpg'),
      },
      {
        label: 'Trust Shield',
        description: 'Ecosystem security monitoring',
        externalUrl: 'https://trustshield.tech',
        icon: 'shield-outline',
        gradient: ['#991B1B', '#7F1D1D'],
        glowColor: 'rgba(153, 27, 27, 0.3)',
        image: require('@/assets/images/cards/card-trust-shield.jpg'),
      },
    ],
  },
  {
    title: 'Ecosystem',
    icon: 'planet-outline',
    gradient: ['#0284C7', '#0369A1'],
    description: 'Connected DarkWave services — CRM, media, staffing, and blockchain.',
    roles: ['agent', 'partner', 'developer'],
    cards: [
      {
        label: 'PaintPros.io',
        description: 'CRM, Marketing Suite & SSO hub',
        externalUrl: 'https://paintpros.io',
        icon: 'color-wand-outline',
        gradient: ['#0284C7', '#0369A1'],
        glowColor: 'rgba(2, 132, 199, 0.3)',
        badge: 'CRM',
        badgeGradient: ['#38BDF8', '#0EA5E9'],
        image: require('@/assets/images/cards/card-paintpros.jpg'),
      },
      {
        label: 'DarkWave Media',
        description: 'Professional video & photo production',
        externalUrl: 'https://darkwavestudios.io',
        icon: 'videocam-outline',
        gradient: ['#7C3AED', '#6D28D9'],
        glowColor: 'rgba(124, 58, 237, 0.3)',
        image: require('@/assets/images/cards/card-darkwave-media.jpg'),
      },
      {
        label: 'Orbit Staffing',
        description: 'Bookkeeping, HR & payroll management',
        externalUrl: 'https://orbitstaffing.io',
        icon: 'earth-outline',
        gradient: ['#059669', '#047857'],
        glowColor: 'rgba(5, 150, 105, 0.3)',
        badge: 'Finance',
        badgeGradient: ['#10B981', '#059669'],
        image: require('@/assets/images/cards/card-orbit-staffing.jpg'),
      },
      {
        label: 'Trust Layer Dashboard',
        description: 'Blockchain explorer & membership card',
        externalUrl: 'https://dwtl.io',
        icon: 'layers-outline',
        gradient: ['#1A8A7E', '#0F766E'],
        glowColor: 'rgba(26, 138, 126, 0.3)',
        image: require('@/assets/images/cards/card-trust-layer-dashboard.jpg'),
      },
    ],
  },
  {
    title: 'Account',
    icon: 'person-outline',
    gradient: ['#525252', '#404040'],
    description: 'Your preferences, help, and support.',
    roles: ['client'],
    cards: [
      {
        label: 'Settings',
        description: 'Account & preferences',
        route: '/settings',
        icon: 'cog-outline',
        gradient: ['#525252', '#404040'],
        glowColor: 'rgba(82, 82, 82, 0.3)',
        image: require('@/assets/images/cards/card-client-settings.jpg'),
      },
      {
        label: 'Help & Support',
        description: 'FAQs & contact',
        route: '/support',
        icon: 'help-circle-outline',
        gradient: ['#D97706', '#B45309'],
        glowColor: 'rgba(217, 119, 6, 0.3)',
        image: require('@/assets/images/cards/card-client-support.jpg'),
      },
    ],
  },
];

function CardItem({ card, index, onPress }: { card: LaunchCard; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const isFeatured = card.featured;
  const w = isFeatured ? FEATURED_CARD_WIDTH : CARD_WIDTH;
  const h = isFeatured ? FEATURED_CARD_HEIGHT : CARD_HEIGHT;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.card,
            { width: w, height: h },
            animStyle,
            ...Platform.select({
              ios: [{ shadowColor: card.glowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16 }],
              android: [{ elevation: 8 }],
              web: [{ boxShadow: `0px 6px 20px ${card.glowColor}` } as any],
            }) as any[],
            isFeatured && styles.cardFeatured,
          ]}
        >
          <ImageBackground
            source={card.image}
            style={StyleSheet.absoluteFill}
            imageStyle={{ borderRadius: 16 }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
            style={StyleSheet.absoluteFill}
          />

          {card.badge && (
            <View style={styles.badgeWrap}>
              <LinearGradient
                colors={(card.badgeGradient || ['#F59E0B', '#D97706']) as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.badgeGradient}
              >
                <Text style={styles.badgeText}>{card.badge}</Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.cardContent}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name={card.icon} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardLabel} numberOfLines={1}>{card.label}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>{card.description}</Text>
            </View>
            {card.externalUrl && (
              <Ionicons name="open-outline" size={14} color="rgba(255,255,255,0.5)" style={styles.externalIcon} />
            )}
          </View>

          {isFeatured && (
            <View style={styles.featuredStripe}>
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

interface CommandCenterHubProps {
  onSwitchToDashboard?: () => void;
}

export function CommandCenterHub({ onSwitchToDashboard }: CommandCenterHubProps) {
  const { colors, isDark } = useTheme();
  const { currentRole, greetingName, user, openAiAssistant, openSignalChat } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isAgent = currentRole === 'agent';
  const isClient = !isAgent;
  const displayName = greetingName || user?.firstName || 'there';

  const roleKey = useMemo(() => {
    if (user?.role === 'developer') return 'developer';
    if (user?.role === 'partner') return 'partner';
    if (isAgent) return 'agent';
    return 'client';
  }, [user?.role, isAgent]);

  const filteredCategories = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => {
      if (!cat.roles) return true;
      if (roleKey === 'developer' || roleKey === 'partner') return true;
      return cat.roles.includes(roleKey);
    });
  }, [roleKey]);

  const handleCardPress = useCallback((card: LaunchCard) => {
    if (card.onAction === 'ai_assistant') {
      openAiAssistant();
    } else if (card.onAction === 'signal_chat') {
      openSignalChat();
    } else if (card.onAction === 'switch_dashboard' && onSwitchToDashboard) {
      onSwitchToDashboard();
    } else if (card.externalUrl) {
      Linking.openURL(card.externalUrl);
    } else if (card.route) {
      router.push(card.route as any);
    }
  }, [router, openAiAssistant, openSignalChat, onSwitchToDashboard]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalTools = filteredCategories.reduce((sum, c) => sum + c.cards.length, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#070B16' : colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 30 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.videoHeroWrap}>
        <VideoHero videos={HERO_VIDEOS} height={280}>
          <View style={styles.videoHeroContent}>
            <Text style={styles.videoHeroGreeting}>{getTimeGreeting()}, {displayName}</Text>
            <Text style={styles.videoHeroHeadline}>Command Center</Text>
            <Text style={styles.videoHeroSub}>{filteredCategories.length} categories · {totalTools} tools</Text>
          </View>
        </VideoHero>
      </Animated.View>

      {filteredCategories.map((category, catIndex) => (
        <Animated.View
          key={category.title}
          entering={FadeInDown.delay(150 + catIndex * 70).duration(500).springify()}
          style={styles.categorySection}
        >
          <View style={styles.categoryHeader}>
            <View style={styles.categoryIconWrap}>
              <LinearGradient
                colors={category.gradient as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryIconGradient}
              >
                <Ionicons name={category.icon} size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.categoryTextWrap}>
              <Text style={[styles.categoryTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>{category.title}</Text>
              <Text style={[styles.categoryDescription, { color: isDark ? 'rgba(255,255,255,0.4)' : colors.textSecondary }]}>
                {category.description}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 12}
          >
            {category.cards.map((card, cardIndex) => (
              <CardItem
                key={card.label}
                card={card}
                index={cardIndex}
                onPress={() => handleCardPress(card)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      ))}

      <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.trustFooter}>
        <LinearGradient
          colors={isDark
            ? ['rgba(26,138,126,0.08)', 'rgba(26,138,126,0.02)']
            : ['rgba(26,138,126,0.06)', 'rgba(26,138,126,0.02)']
          }
          style={styles.trustFooterGradient}
        >
          <Ionicons name="shield-checkmark" size={16} color="#1A8A7E" />
          <View style={styles.trustFooterTextWrap}>
            <Text style={[styles.trustFooterTitle, { color: isDark ? '#FFFFFF' : colors.text }]}>
              Secured by Trust Shield
            </Text>
            <Text style={[styles.trustFooterSub, { color: isDark ? 'rgba(255,255,255,0.5)' : colors.textSecondary }]}>
              Blockchain-verified by DarkWave Trust Layer
            </Text>
          </View>
          <Pressable
            onPress={() => Linking.openURL('https://dwtl.io')}
            style={[styles.trustFooterBtn, { backgroundColor: '#1A8A7E' + (isDark ? '20' : '15') }]}
          >
            <Ionicons name="open-outline" size={14} color="#1A8A7E" />
          </Pressable>
        </LinearGradient>
      </Animated.View>

      <View style={styles.footerSection}>
        <View style={styles.footerDivider} />
        <View style={styles.footerRow}>
          <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.2)" />
          <Text style={[styles.footerText, { color: isDark ? 'rgba(255,255,255,0.25)' : colors.textTertiary }]}>
            TrustHome Command Center
          </Text>
        </View>
        <Text style={[styles.footerCopyright, { color: isDark ? 'rgba(255,255,255,0.15)' : colors.textTertiary }]}>
          2026 DarkWave Studios LLC
        </Text>
        <View style={styles.footerLinks}>
          <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')}>
            <Text style={[styles.footerLink, { color: isDark ? 'rgba(255,255,255,0.3)' : colors.textTertiary }]}>DarkWave Studios</Text>
          </Pressable>
          <Text style={[styles.footerDot, { color: isDark ? 'rgba(255,255,255,0.15)' : colors.textTertiary }]}>  ·  </Text>
          <Pressable onPress={() => Linking.openURL('https://dwtl.io')}>
            <Text style={[styles.footerLink, { color: isDark ? 'rgba(255,255,255,0.3)' : colors.textTertiary }]}>Trust Layer</Text>
          </Pressable>
          <Text style={[styles.footerDot, { color: isDark ? 'rgba(255,255,255,0.15)' : colors.textTertiary }]}>  ·  </Text>
          <Pressable onPress={() => Linking.openURL('https://trustshield.tech')}>
            <Text style={[styles.footerLink, { color: isDark ? 'rgba(255,255,255,0.3)' : colors.textTertiary }]}>Trust Shield</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  videoHeroWrap: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  videoHeroContent: {
    justifyContent: 'flex-end',
    flex: 1,
    paddingBottom: 30,
  },
  videoHeroGreeting: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  videoHeroHeadline: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  videoHeroSub: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  categorySection: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 12,
  },
  categoryIconWrap: {},
  categoryIconGradient: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTextWrap: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  categoryDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardFeatured: {
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cardPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,1)',
  },
  badgeWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
  },
  badgeGradient: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardTextWrap: {
    gap: 2,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  cardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
  },
  externalIcon: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  featuredStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  trustFooter: {
    marginTop: 4,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  trustFooterGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 10,
  },
  trustFooterTextWrap: {
    flex: 1,
  },
  trustFooterTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  trustFooterSub: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  trustFooterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  footerCopyright: {
    fontSize: 11,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLink: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  footerDot: {
    fontSize: 11,
  },
});
