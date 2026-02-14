import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking, Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_GAP = 10;
const GRID_PADDING = 16;
const GRID_COLS = 2;
const TILE_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
const TALL_HEIGHT = 150;
const SHORT_HEIGHT = 120;
const WIDE_HEIGHT = 100;

const CARD_IMAGES = {
  team: require('@/assets/images/cards/team.jpg'),
  transaction: require('@/assets/images/cards/transaction.jpg'),
  trust: require('@/assets/images/cards/trust.jpg'),
  leads: require('@/assets/images/cards/leads.jpg'),
  messages: require('@/assets/images/cards/messages.jpg'),
  revenue: require('@/assets/images/cards/revenue.jpg'),
  home1: require('@/assets/images/cards/home1_1.jpg'),
  home2: require('@/assets/images/cards/home1_2.jpg'),
  home3: require('@/assets/images/cards/home1_3.jpg'),
  home4: require('@/assets/images/cards/home1_4.jpg'),
  inspector: require('@/assets/images/cards/inspector.jpg'),
  lender: require('@/assets/images/cards/lender.jpg'),
  title: require('@/assets/images/cards/title.jpg'),
};

interface HubTile {
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  externalUrl?: string;
  onAction?: string;
  gradient: [string, string];
  accentColor: string;
  image?: any;
  badge?: string;
  span?: 'full';
  tall?: boolean;
  agentOnly?: boolean;
}

const AGENT_TILES: HubTile[] = [
  {
    label: 'Dashboard',
    subtitle: 'Your business at a glance',
    icon: 'speedometer-outline',
    route: '/',
    gradient: ['#0F766E', '#0891B2'],
    accentColor: '#1A8A7E',
    image: CARD_IMAGES.revenue,
    span: 'full',
    tall: true,
  },
  {
    label: 'Transactions',
    subtitle: 'Active deals',
    icon: 'swap-horizontal-outline',
    route: '/transactions',
    gradient: ['#115E59', '#134E4A'],
    accentColor: '#0D9488',
    image: CARD_IMAGES.transaction,
    tall: true,
  },
  {
    label: 'Leads',
    subtitle: 'Pipeline & scoring',
    icon: 'flame-outline',
    route: '/leads',
    gradient: ['#B45309', '#92400E'],
    accentColor: '#F59E0B',
    image: CARD_IMAGES.leads,
    badge: '5 new',
    tall: true,
    agentOnly: true,
  },
  {
    label: 'Properties',
    subtitle: 'Listings & shortlists',
    icon: 'business-outline',
    route: '/properties',
    gradient: ['#0E7490', '#0369A1'],
    accentColor: '#06B6D4',
    image: CARD_IMAGES.home1,
  },
  {
    label: 'Showings',
    subtitle: 'Schedule & tours',
    icon: 'calendar-outline',
    route: '/showings',
    gradient: ['#155E75', '#164E63'],
    accentColor: '#22D3EE',
    image: CARD_IMAGES.home2,
  },
  {
    label: 'Messages',
    subtitle: 'Client conversations',
    icon: 'chatbubbles-outline',
    route: '/messages',
    gradient: ['#1E40AF', '#1E3A8A'],
    accentColor: '#3B82F6',
    image: CARD_IMAGES.messages,
    badge: '7',
  },
  {
    label: 'Documents',
    subtitle: 'Secure vault',
    icon: 'lock-closed-outline',
    route: '/documents',
    gradient: ['#047857', '#065F46'],
    accentColor: '#10B981',
  },
  {
    label: 'Marketing Hub',
    subtitle: 'AI-powered campaigns',
    icon: 'rocket-outline',
    route: '/marketing',
    gradient: ['#7C3AED', '#6D28D9'],
    accentColor: '#8B5CF6',
    badge: 'AI',
    span: 'full',
    agentOnly: true,
  },
  {
    label: 'Blog',
    subtitle: 'Content manager',
    icon: 'newspaper-outline',
    route: '/blog',
    gradient: ['#6D28D9', '#7E22CE'],
    accentColor: '#A78BFA',
    agentOnly: true,
  },
  {
    label: 'Media Studio',
    subtitle: 'Video & photos',
    icon: 'film-outline',
    route: '/media-studio',
    gradient: ['#BE185D', '#9D174D'],
    accentColor: '#F472B6',
    badge: 'New',
    agentOnly: true,
  },
  {
    label: 'Analytics',
    subtitle: 'Performance metrics',
    icon: 'bar-chart-outline',
    route: '/analytics',
    gradient: ['#059669', '#047857'],
    accentColor: '#34D399',
    agentOnly: true,
  },
  {
    label: 'Business Suite',
    subtitle: 'Expenses & mileage',
    icon: 'calculator-outline',
    route: '/business',
    gradient: ['#0D9488', '#0F766E'],
    accentColor: '#2DD4BF',
    agentOnly: true,
  },
  {
    label: 'Network',
    subtitle: 'Referrals & partners',
    icon: 'globe-outline',
    route: '/network',
    gradient: ['#4338CA', '#3730A3'],
    accentColor: '#818CF8',
    agentOnly: true,
  },
  {
    label: 'Branding',
    subtitle: 'White-label design',
    icon: 'color-palette-outline',
    route: '/branding',
    gradient: ['#A21CAF', '#86198F'],
    accentColor: '#E879F9',
    agentOnly: true,
  },
  {
    label: 'MLS Connection',
    subtitle: 'Data feed setup',
    icon: 'link-outline',
    route: '/mls-setup',
    gradient: ['#EA580C', '#C2410C'],
    accentColor: '#FB923C',
    badge: 'Setup',
    agentOnly: true,
  },
  {
    label: 'Settings',
    subtitle: 'Account & preferences',
    icon: 'cog-outline',
    route: '/settings',
    gradient: ['#525252', '#404040'],
    accentColor: '#A3A3A3',
  },
  {
    label: 'AI Assistant',
    subtitle: 'Voice & text help',
    icon: 'sparkles-outline',
    onAction: 'ai_assistant',
    gradient: ['#2563EB', '#1D4ED8'],
    accentColor: '#60A5FA',
    badge: 'AI',
  },
  {
    label: 'Signal Chat',
    subtitle: 'Ecosystem messaging',
    icon: 'radio-outline',
    onAction: 'signal_chat',
    gradient: ['#4F46E5', '#4338CA'],
    accentColor: '#A5B4FC',
  },
  {
    label: 'Help & Support',
    subtitle: 'FAQs & contact',
    icon: 'help-circle-outline',
    route: '/support',
    gradient: ['#D97706', '#B45309'],
    accentColor: '#FBBF24',
  },
];

const CLIENT_TILES: HubTile[] = [
  {
    label: 'My Transaction',
    subtitle: 'Track your home journey',
    icon: 'home-outline',
    route: '/',
    gradient: ['#0F766E', '#0891B2'],
    accentColor: '#1A8A7E',
    image: CARD_IMAGES.transaction,
    span: 'full',
    tall: true,
  },
  {
    label: 'Properties',
    subtitle: 'Your shortlist',
    icon: 'business-outline',
    route: '/properties',
    gradient: ['#0E7490', '#0369A1'],
    accentColor: '#06B6D4',
    image: CARD_IMAGES.home1,
    tall: true,
  },
  {
    label: 'Showings',
    subtitle: 'Upcoming tours',
    icon: 'calendar-outline',
    route: '/showings',
    gradient: ['#155E75', '#164E63'],
    accentColor: '#22D3EE',
    image: CARD_IMAGES.home3,
    tall: true,
  },
  {
    label: 'Messages',
    subtitle: 'Chat with your agent',
    icon: 'chatbubbles-outline',
    route: '/messages',
    gradient: ['#1E40AF', '#1E3A8A'],
    accentColor: '#3B82F6',
    image: CARD_IMAGES.messages,
    badge: '3',
  },
  {
    label: 'Documents',
    subtitle: 'Contracts & files',
    icon: 'lock-closed-outline',
    route: '/documents',
    gradient: ['#047857', '#065F46'],
    accentColor: '#10B981',
  },
  {
    label: 'Mortgage Tools',
    subtitle: 'Calculators & rates',
    icon: 'calculator-outline',
    route: '/',
    gradient: ['#059669', '#047857'],
    accentColor: '#34D399',
  },
  {
    label: 'Neighborhood',
    subtitle: 'Schools, safety & more',
    icon: 'map-outline',
    route: '/',
    gradient: ['#D97706', '#B45309'],
    accentColor: '#FBBF24',
  },
  {
    label: 'AI Assistant',
    subtitle: 'Ask anything',
    icon: 'sparkles-outline',
    onAction: 'ai_assistant',
    gradient: ['#2563EB', '#1D4ED8'],
    accentColor: '#60A5FA',
    badge: 'AI',
  },
  {
    label: 'Settings',
    subtitle: 'Account & preferences',
    icon: 'cog-outline',
    route: '/settings',
    gradient: ['#525252', '#404040'],
    accentColor: '#A3A3A3',
  },
  {
    label: 'Help & Support',
    subtitle: 'FAQs & contact',
    icon: 'help-circle-outline',
    route: '/support',
    gradient: ['#D97706', '#B45309'],
    accentColor: '#FBBF24',
  },
];

function HubTileItem({ tile, index, onPress, colors, isDark }: {
  tile: HubTile;
  index: number;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);
  const isFull = tile.span === 'full';
  const w = isFull ? SCREEN_WIDTH - GRID_PADDING * 2 : TILE_WIDTH;
  const h = tile.tall ? TALL_HEIGHT : (isFull ? WIDE_HEIGHT : SHORT_HEIGHT);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const hasImage = !!tile.image;

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(350).springify()}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        onPress={onPress}
      >
        <Animated.View
          style={[
            styles.tile,
            { width: w, height: h },
            animStyle,
            isDark
              ? { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }
              : { backgroundColor: 'rgba(0,0,0,0.02)', borderColor: 'rgba(0,0,0,0.06)' },
            ...Platform.select({
              ios: [{ shadowColor: tile.accentColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: isDark ? 0.25 : 0.12, shadowRadius: 12 }],
              android: [{ elevation: 4 }],
              web: [{ boxShadow: `0px 4px 14px ${isDark ? tile.accentColor + '40' : tile.accentColor + '20'}` } as any],
            }) as any[],
          ]}
        >
          {hasImage ? (
            <>
              <ImageBackground
                source={tile.image}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <LinearGradient
                colors={[tile.gradient[0] + 'CC', tile.gradient[1] + 'EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </>
          ) : (
            <LinearGradient
              colors={isDark
                ? [tile.gradient[0] + '30', tile.gradient[1] + '18']
                : [tile.gradient[0] + '18', tile.gradient[1] + '0C']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}

          {tile.badge && (
            <View style={[styles.tileBadge, { backgroundColor: tile.accentColor }]}>
              <Text style={styles.tileBadgeText}>{tile.badge}</Text>
            </View>
          )}

          <View style={styles.tileContent}>
            <View style={[
              styles.tileIconWrap,
              hasImage
                ? { backgroundColor: 'rgba(255,255,255,0.2)' }
                : { backgroundColor: tile.accentColor + (isDark ? '25' : '18') },
            ]}>
              <Ionicons
                name={tile.icon}
                size={20}
                color={hasImage ? '#FFFFFF' : tile.accentColor}
              />
            </View>
            <View style={styles.tileLabelWrap}>
              <Text style={[
                styles.tileLabel,
                hasImage ? { color: '#FFFFFF' } : { color: colors.text },
              ]} numberOfLines={1}>{tile.label}</Text>
              {tile.subtitle && (
                <Text style={[
                  styles.tileSubtitle,
                  hasImage ? { color: 'rgba(255,255,255,0.7)' } : { color: colors.textSecondary },
                ]} numberOfLines={1}>{tile.subtitle}</Text>
              )}
            </View>
            <Ionicons
              name={tile.externalUrl ? 'open-outline' : 'chevron-forward'}
              size={16}
              color={hasImage ? 'rgba(255,255,255,0.5)' : colors.textTertiary}
              style={styles.tileArrow}
            />
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export function NavigationHub() {
  const { colors, isDark } = useTheme();
  const { currentRole, user, openAiAssistant, openSignalChat, greetingName } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isAgent = currentRole === 'agent';
  const tiles = isAgent ? AGENT_TILES : CLIENT_TILES;
  const displayName = greetingName || user?.firstName || 'there';

  const handleTilePress = useCallback((tile: HubTile) => {
    if (tile.onAction === 'ai_assistant') {
      openAiAssistant();
    } else if (tile.onAction === 'signal_chat') {
      openSignalChat();
    } else if (tile.externalUrl) {
      Linking.openURL(tile.externalUrl);
    } else if (tile.route) {
      router.push(tile.route as any);
    }
  }, [router, openAiAssistant, openSignalChat]);

  const rows: HubTile[][] = [];
  let i = 0;
  while (i < tiles.length) {
    const tile = tiles[i];
    if (tile.agentOnly && !isAgent) { i++; continue; }
    if (tile.span === 'full') {
      rows.push([tile]);
      i++;
    } else if (i + 1 < tiles.length) {
      let next = tiles[i + 1];
      if (next.agentOnly && !isAgent) {
        rows.push([tile]);
        i += 2;
      } else {
        rows.push([tile, next]);
        i += 2;
      }
    } else {
      rows.push([tile]);
      i++;
    }
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: (Platform.OS === 'web' ? 34 : insets.bottom) + 20 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(500)} style={styles.greeting}>
        <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
          {getTimeGreeting()}, {displayName}
        </Text>
        <Text style={[styles.greetingHeadline, { color: colors.text }]}>
          {isAgent ? 'What would you like to work on?' : 'What are you looking for?'}
        </Text>
      </Animated.View>

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((tile, colIndex) => {
              const flatIndex = rows.slice(0, rowIndex).reduce((s, r) => s + r.length, 0) + colIndex;
              return (
                <HubTileItem
                  key={tile.label}
                  tile={tile}
                  index={flatIndex}
                  onPress={() => handleTilePress(tile)}
                  colors={colors}
                  isDark={isDark}
                />
              );
            })}
          </View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.accessSection}>
        <View style={styles.accessHeader}>
          <View style={[styles.accessDivider, { backgroundColor: colors.divider }]} />
          <Text style={[styles.accessDividerText, { color: colors.textTertiary }]}>quick access</Text>
          <View style={[styles.accessDivider, { backgroundColor: colors.divider }]} />
        </View>
        <View style={styles.accessGrid}>
          <Pressable
            style={[styles.accessCard, { backgroundColor: isDark ? 'rgba(26,138,126,0.08)' : 'rgba(26,138,126,0.05)', borderColor: isDark ? 'rgba(26,138,126,0.2)' : 'rgba(26,138,126,0.15)' }]}
            onPress={() => router.push('/team')}
          >
            <View style={[styles.accessIcon, { backgroundColor: 'rgba(26,138,126,0.15)' }]}>
              <Ionicons name="briefcase-outline" size={16} color="#1A8A7E" />
            </View>
            <Text style={[styles.accessLabel, { color: colors.text }]}>Agent</Text>
          </Pressable>
          <Pressable
            style={[styles.accessCard, { backgroundColor: isDark ? 'rgba(212,175,55,0.06)' : 'rgba(212,175,55,0.04)', borderColor: isDark ? 'rgba(212,175,55,0.18)' : 'rgba(212,175,55,0.12)' }]}
            onPress={() => router.push('/team')}
          >
            <View style={[styles.accessIcon, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
              <Ionicons name="diamond-outline" size={16} color="#D4AF37" />
            </View>
            <Text style={[styles.accessLabel, { color: colors.text }]}>Partner</Text>
          </Pressable>
          <Pressable
            style={[styles.accessCard, { backgroundColor: isDark ? 'rgba(124,58,237,0.06)' : 'rgba(124,58,237,0.04)', borderColor: isDark ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.1)' }]}
            onPress={() => router.push('/team')}
          >
            <View style={[styles.accessIcon, { backgroundColor: 'rgba(124,58,237,0.12)' }]}>
              <Ionicons name="code-slash-outline" size={16} color="#7C3AED" />
            </View>
            <Text style={[styles.accessLabel, { color: colors.text }]}>Developer</Text>
          </Pressable>
          <Pressable
            style={[styles.accessCard, { backgroundColor: isDark ? 'rgba(59,130,246,0.05)' : 'rgba(59,130,246,0.03)', borderColor: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', opacity: 0.5 }]}
            disabled
          >
            <View style={[styles.accessIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
              <Ionicons name="layers-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={[styles.accessLabel, { color: colors.text }]}>Verticals</Text>
          </Pressable>
        </View>
      </Animated.View>

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
            <Text style={[styles.trustFooterTitle, { color: colors.text }]}>
              Secured by Trust Shield
            </Text>
            <Text style={[styles.trustFooterSub, { color: colors.textSecondary }]}>
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
  greeting: {
    paddingHorizontal: GRID_PADDING,
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  greetingHeadline: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  grid: {
    paddingHorizontal: GRID_PADDING,
    gap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  tile: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tileBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 5,
  },
  tileBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
  tileContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  tileIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileLabelWrap: {
    gap: 1,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  tileSubtitle: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  tileArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  trustFooter: {
    marginTop: 24,
    marginHorizontal: GRID_PADDING,
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
  accessSection: {
    marginTop: 24,
    paddingHorizontal: GRID_PADDING,
  },
  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  accessDivider: {
    flex: 1,
    height: 1,
  },
  accessDividerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  accessGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  accessCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  accessIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
});
