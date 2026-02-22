import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  Platform, ActivityIndicator, Dimensions, Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/query-client';

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
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  glowColor: string;
  badge?: string;
  badgeGradient?: [string, string];
  featured?: boolean;
}

interface Category {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  description: string;
  cards: LaunchCard[];
}

const categories: Category[] = [
  {
    title: 'Operations Hub',
    icon: 'grid-outline',
    gradient: ['#1A8A7E', '#0EA5E9'],
    description: 'Your core business tools. Manage leads, track transactions, schedule showings, and oversee your entire real estate operation from one place.',
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
      },
      {
        label: 'Lead Management',
        description: 'Track, score & nurture prospects',
        route: '/leads',
        icon: 'people-outline',
        gradient: ['#0E7490', '#0369A1'],
        glowColor: 'rgba(14, 116, 144, 0.3)',
      },
      {
        label: 'Transaction Pipeline',
        description: 'Manage deals from offer to close',
        route: '/transactions',
        icon: 'swap-horizontal-outline',
        gradient: ['#115E59', '#134E4A'],
        glowColor: 'rgba(17, 94, 89, 0.3)',
      },
      {
        label: 'Showing Manager',
        description: 'Schedule & track property showings',
        route: '/showings',
        icon: 'calendar-outline',
        gradient: ['#155E75', '#164E63'],
        glowColor: 'rgba(21, 94, 117, 0.3)',
      },
      {
        label: 'Property Manager',
        description: 'Listings, shortlists & comparisons',
        route: '/properties',
        icon: 'business-outline',
        gradient: ['#0D9488', '#0F766E'],
        glowColor: 'rgba(13, 148, 136, 0.3)',
      },
    ],
  },
  {
    title: 'Marketing & Content',
    icon: 'megaphone-outline',
    gradient: ['#7C3AED', '#DB2777'],
    description: 'AI-powered marketing suite. Generate social posts, manage your blog, produce property media, and customize your brand — all from one place.',
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
      },
      {
        label: 'Blog Manager',
        description: 'Create & publish AI-generated articles',
        route: '/blog',
        icon: 'newspaper-outline',
        gradient: ['#6D28D9', '#7E22CE'],
        glowColor: 'rgba(109, 40, 217, 0.3)',
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
      },
      {
        label: 'Branding Suite',
        description: 'Colors, logos & white-label settings',
        route: '/branding',
        icon: 'color-palette-outline',
        gradient: ['#A21CAF', '#86198F'],
        glowColor: 'rgba(162, 28, 175, 0.3)',
      },
    ],
  },
  {
    title: 'Communication',
    icon: 'chatbubbles-outline',
    gradient: ['#2563EB', '#4F46E5'],
    description: 'Stay connected with clients, partners, and your team. Real-time messaging, cross-ecosystem chat, and AI-powered assistance at your fingertips.',
    cards: [
      {
        label: 'Messages',
        description: 'Direct client & team messaging',
        route: '/messages',
        icon: 'chatbubble-ellipses-outline',
        gradient: ['#2563EB', '#1D4ED8'],
        glowColor: 'rgba(37, 99, 235, 0.35)',
        featured: true,
      },
      {
        label: 'Signal Chat',
        description: 'Cross-ecosystem messaging via PaintPros',
        externalUrl: 'https://paintpros.io',
        icon: 'radio-outline',
        gradient: ['#4338CA', '#3730A3'],
        glowColor: 'rgba(67, 56, 202, 0.3)',
        badge: 'Ecosystem',
        badgeGradient: ['#6366F1', '#4F46E5'],
      },
      {
        label: 'AI Assistant',
        description: 'Voice-capable AI for agents & clients',
        route: '/',
        icon: 'sparkles-outline',
        gradient: ['#1E40AF', '#1E3A8A'],
        glowColor: 'rgba(30, 64, 175, 0.3)',
        badge: 'AI',
        badgeGradient: ['#8B5CF6', '#A855F7'],
      },
      {
        label: 'Network & Referrals',
        description: 'Build your professional referral network',
        route: '/network',
        icon: 'globe-outline',
        gradient: ['#4F46E5', '#4338CA'],
        glowColor: 'rgba(79, 70, 229, 0.3)',
      },
    ],
  },
  {
    title: 'Business & Finance',
    icon: 'briefcase-outline',
    gradient: ['#059669', '#0D9488'],
    description: 'Track your bottom line. Expense management with OCR receipt scanning, mileage tracking, performance analytics, and document management.',
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
      },
      {
        label: 'Document Vault',
        description: 'Encrypted contract & file management',
        route: '/documents',
        icon: 'lock-closed-outline',
        gradient: ['#047857', '#065F46'],
        glowColor: 'rgba(4, 120, 87, 0.3)',
      },
    ],
  },
  {
    title: 'Platform Management',
    icon: 'settings-outline',
    gradient: ['#D97706', '#EA580C'],
    description: 'Configure your platform. MLS data connections, account settings, integrations, and support resources to keep everything running smoothly.',
    cards: [
      {
        label: 'Settings',
        description: 'Account, security & preferences',
        route: '/settings',
        icon: 'cog-outline',
        gradient: ['#D97706', '#B45309'],
        glowColor: 'rgba(217, 119, 6, 0.3)',
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
      },
      {
        label: 'Help & Support',
        description: 'FAQs, contact & feature requests',
        route: '/support',
        icon: 'help-circle-outline',
        gradient: ['#B45309', '#92400E'],
        glowColor: 'rgba(180, 83, 9, 0.3)',
      },
    ],
  },
  {
    title: 'Developer & Security',
    icon: 'code-slash-outline',
    gradient: ['#DC2626', '#BE123C'],
    description: 'Technical tools and security integrations. Manage API access, monitor blockchain verification, and oversee the Trust Shield security layer.',
    cards: [
      {
        label: 'Developer Console',
        description: 'API keys, access requests & system health',
        route: '/developer',
        icon: 'terminal-outline',
        gradient: ['#DC2626', '#B91C1C'],
        glowColor: 'rgba(220, 38, 38, 0.35)',
        featured: true,
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
      },
      {
        label: 'Trust Shield',
        description: 'Ecosystem security monitoring',
        externalUrl: 'https://trustshield.tech',
        icon: 'shield-outline',
        gradient: ['#991B1B', '#7F1D1D'],
        glowColor: 'rgba(153, 27, 27, 0.3)',
      },
    ],
  },
  {
    title: 'Ecosystem',
    icon: 'planet-outline',
    gradient: ['#0284C7', '#0369A1'],
    description: 'Connected services across the DarkWave ecosystem. Access CRM, media production, staffing, and blockchain tools from partner platforms.',
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
      },
      {
        label: 'DarkWave Media',
        description: 'Professional video & photo production',
        externalUrl: 'https://darkwavestudios.io',
        icon: 'videocam-outline',
        gradient: ['#7C3AED', '#6D28D9'],
        glowColor: 'rgba(124, 58, 237, 0.3)',
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
      },
      {
        label: 'Trust Layer Dashboard',
        description: 'Blockchain explorer & membership card',
        externalUrl: 'https://dwtl.io',
        icon: 'layers-outline',
        gradient: ['#1A8A7E', '#0F766E'],
        glowColor: 'rgba(26, 138, 126, 0.3)',
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
          <LinearGradient
            colors={card.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.cardPattern}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.patternCircle, {
                width: 80 + i * 40,
                height: 80 + i * 40,
                right: -20 + i * 10,
                top: -30 + i * 15,
                opacity: 0.06 - i * 0.015,
              }]} />
            ))}
          </View>

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

export default function CommandCenterScreen() {
  const { colors, isDark } = useTheme();
  const { user, isAgentAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [pinChecking, setPinChecking] = useState(false);
  const [userName, setUserName] = useState('');
  const pinRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const handlePinChange = useCallback(async (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;
    const newDigits = [...pinDigits];
    newDigits[index] = text;
    setPinDigits(newDigits);
    setPinError(false);

    if (text && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    const fullPin = newDigits.join('');
    if (fullPin.length === 4) {
      setPinChecking(true);
      try {
        const res = await apiRequest('POST', '/api/auth/pin/verify', { pin: fullPin });
        const data = res as any;
        setUserName(data.name || 'Admin');
        setAuthed(true);
      } catch {
        setPinError(true);
        setPinDigits(['', '', '', '']);
        pinRefs.current[0]?.focus();
      } finally {
        setPinChecking(false);
      }
    }
  }, [pinDigits]);

  const handlePinKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  }, [pinDigits]);

  const handleCardPress = useCallback((card: LaunchCard) => {
    if (card.externalUrl) {
      Linking.openURL(card.externalUrl);
    } else if (card.route) {
      router.push(card.route as any);
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    setAuthed(false);
    setPinDigits(['', '', '', '']);
    setUserName('');
    setPinError(false);
  }, []);

  if (!authed) {
    return (
      <View style={[styles.authContainer, { paddingTop: topInset, paddingBottom: bottomInset }]}>
        {isDark && <LinearGradient
          colors={['#070B16', '#0C1222', '#070B16']}
          style={StyleSheet.absoluteFill}
        />}

        <Pressable onPress={() => router.back()} style={styles.authBackBtn}>
          <Ionicons name="arrow-back" size={22} color={isDark ? 'rgba(255,255,255,0.6)' : colors.textSecondary} />
        </Pressable>

        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.authContent}>
          <View style={styles.authLogoWrap}>
            <LinearGradient
              colors={['#1A8A7E', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.authLogo}
            >
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </LinearGradient>
          </View>

          <Text style={styles.authTitle}>Command Center</Text>
          <Text style={styles.authSubtitle}>Enter your PIN to access mission control</Text>

          <View style={styles.pinRow}>
            {pinDigits.map((digit, i) => (
              <TextInput
                key={i}
                ref={ref => { pinRefs.current[i] = ref; }}
                style={[
                  styles.pinBox,
                  digit ? styles.pinBoxFilled : null,
                  pinError ? styles.pinBoxError : null,
                ]}
                value={digit}
                onChangeText={t => handlePinChange(t, i)}
                onKeyPress={e => handlePinKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                secureTextEntry
                autoFocus={i === 0}
              />
            ))}
          </View>

          {pinChecking && (
            <ActivityIndicator color="#1A8A7E" size="small" style={{ marginTop: 16 }} />
          )}

          {pinError && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.authError}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.authErrorText}>Invalid PIN. Please try again.</Text>
            </Animated.View>
          )}

          <View style={styles.authFooter}>
            <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.25)" />
            <Text style={styles.authFooterText}>Secured by Trust Shield</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: bottomInset, backgroundColor: colors.background }]}>
      {isDark && <LinearGradient
        colors={['#070B16', '#0C1222', '#070B16']}
        style={StyleSheet.absoluteFill}
      />}

      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[styles.stickyHeader, { paddingTop: topInset + 8 }]}
      >
        <LinearGradient
          colors={isDark ? ['rgba(7,11,22,0.95)', 'rgba(7,11,22,0.8)', 'rgba(7,11,22,0)'] : ['rgba(248,250,251,0.95)', 'rgba(248,250,251,0.8)', 'rgba(248,250,251,0)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerBackBtn}>
            <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.7)" />
          </Pressable>

          <View style={styles.headerCenter}>
            <View style={styles.headerLogoSmall}>
              <LinearGradient
                colors={['#1A8A7E', '#0EA5E9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerLogoGradient}
              >
                <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.headerTitle}>Command Center</Text>
          </View>

          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </View>
        <Text style={styles.headerGreeting}>{(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; })()}, {userName}</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: topInset + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
          <Text style={styles.heroTitle}>Mission Control</Text>
          <Text style={styles.heroSubtitle}>
            {categories.reduce((sum, c) => sum + c.cards.length, 0)} tools across {categories.length} categories
          </Text>
        </Animated.View>

        {categories.map((category, catIndex) => (
          <Animated.View
            key={category.title}
            entering={FadeInDown.delay(200 + catIndex * 80).duration(500).springify()}
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
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
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

        <View style={styles.footerSection}>
          <View style={styles.footerDivider} />
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.2)" />
            <Text style={styles.footerText}>TrustHome Command Center</Text>
          </View>
          <Text style={styles.footerCopyright}>2026 DarkWave Studios LLC</Text>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')}>
              <Text style={styles.footerLink}>DarkWave Studios</Text>
            </Pressable>
            <Text style={styles.footerDot}>  </Text>
            <Pressable onPress={() => Linking.openURL('https://dwtl.io')}>
              <Text style={styles.footerLink}>Trust Layer</Text>
            </Pressable>
            <Text style={styles.footerDot}>  </Text>
            <Pressable onPress={() => Linking.openURL('https://trustshield.tech')}>
              <Text style={styles.footerLink}>Trust Shield</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 80 : 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  authContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
    maxWidth: 400,
  },
  authLogoWrap: {
    marginBottom: 24,
  },
  authLogo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 32,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pinBox: {
    width: 52,
    height: 60,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700' as const,
  },
  pinBoxFilled: {
    borderColor: '#1A8A7E',
    backgroundColor: 'rgba(26,138,126,0.08)',
  },
  pinBoxError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  authError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  authErrorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  authFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 40,
  },
  authFooterText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 12,
    fontWeight: '500' as const,
  },

  container: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoSmall: {},
  headerLogoGradient: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGreeting: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginTop: 6,
  },

  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500' as const,
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
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  categoryDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
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

  footerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  footerDivider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  footerCopyright: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 11,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '500' as const,
  },
  footerDot: {
    color: 'rgba(255,255,255,0.15)',
    fontSize: 11,
  },
});
