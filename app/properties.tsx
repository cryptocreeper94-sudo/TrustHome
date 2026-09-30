import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = Platform.OS === 'web' ? Math.min(SCREEN_WIDTH * 0.85, 600) : SCREEN_WIDTH * 0.85;
const CARD_MARGIN = 16;
const SNAP_INTERVAL = CARD_WIDTH + (CARD_MARGIN * 2);

type PropertyStatus = 'Active' | 'Under Contract' | 'Buyer Shortlist' | 'Sold';

interface Property {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: PropertyStatus;
  daysOnMarket: number;
  mls: string;
  image: any;
  description: string;
  features: string[];
  showings: number;
}

const PROPERTIES: Property[] = [
  {
    id: '1',
    address: '1428 Elm Street',
    city: 'Beverly Hills, CA',
    price: 4250000,
    beds: 5,
    baths: 6,
    sqft: 6200,
    status: 'Active',
    daysOnMarket: 12,
    mls: 'MLS# 1002345',
    image: require('@/assets/images/hero-1.jpg'),
    description: 'A stunning modern masterpiece featuring panoramic city views, infinity pool, and integrated smart home technology.',
    features: ['Infinity Pool', 'Wine Cellar', 'Smart Home', 'Home Theater'],
    showings: 8,
  },
  {
    id: '2',
    address: '890 Fifth Avenue',
    city: 'New York, NY',
    price: 8900000,
    beds: 4,
    baths: 4.5,
    sqft: 4500,
    status: 'Buyer Shortlist',
    daysOnMarket: 3,
    mls: 'MLS# 1004592',
    image: require('@/assets/images/hero-2.jpg'),
    description: 'Exclusive penthouse with sweeping Central Park views. Completely renovated with imported Italian marble and custom millwork.',
    features: ['Penthouse', 'Park Views', 'Doorman', 'Private Elevator'],
    showings: 14,
  },
  {
    id: '3',
    address: '742 Evergreen Terrace',
    city: 'Aspen, CO',
    price: 12500000,
    beds: 6,
    baths: 8,
    sqft: 8400,
    status: 'Under Contract',
    daysOnMarket: 45,
    mls: 'MLS# 1009841',
    image: require('@/assets/images/hero-3.jpg'),
    description: 'Ski-in/ski-out luxury chalet. Features massive exposed timber beams, three stone fireplaces, and a heated driveway.',
    features: ['Ski-in/Ski-out', 'Heated Driveway', 'Spa', 'Guest House'],
    showings: 22,
  },
  {
    id: '4',
    address: '10086 Sunset Blvd',
    city: 'Los Angeles, CA',
    price: 18900000,
    beds: 8,
    baths: 11,
    sqft: 14000,
    status: 'Active',
    daysOnMarket: 5,
    mls: 'MLS# 1007732',
    image: require('@/assets/images/hero-4.jpg'),
    description: 'Unparalleled luxury on the Sunset Strip. Includes a 20-car subterranean garage, indoor basketball court, and recording studio.',
    features: ['20-Car Garage', 'Basketball Court', 'Recording Studio', 'Guard Gated'],
    showings: 4,
  }
];

function formatPrice(price: number): string {
  if (price >= 1000000) return '$' + (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 2) + 'M';
  return '$' + (price / 1000).toFixed(0) + 'K';
}

const statusColors: Record<PropertyStatus, string> = {
  Active: '#4ADE80',
  'Under Contract': '#FBBF24',
  'Buyer Shortlist': '#60A5FA',
  Sold: '#38BDF8',
};

function AnimatedButton({ icon, label, onPress, primary = false }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress?: () => void, primary?: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.actionBtn, primary ? styles.actionBtnPrimary : styles.actionBtnSecondary]}
      >
        <Ionicons name={icon} size={16} color={primary ? '#000' : '#FFF'} />
        <Text style={[styles.actionBtnText, { color: primary ? '#000' : '#FFF' }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PropertiesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <Header title="Exclusive Listings" showBack transparent={false}
        imageBanner={require('@/assets/images/guide-properties.jpg')} />
      
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled={Platform.OS === 'web' ? false : true}
          snapToInterval={SNAP_INTERVAL}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollContent}
        >
          {PROPERTIES.map((prop, index) => (
            <Animated.View key={prop.id} entering={FadeInDown.delay(index * 150).springify()} style={styles.cardWrapper}>
              <View style={styles.card}>
                <ImageBackground source={prop.image} style={styles.cardImage} imageStyle={styles.cardImageStyle}>
                  <LinearGradient
                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)', '#000000']}
                    locations={[0, 0.5, 1]}
                    style={styles.cardGradient}
                  >
                    {/* Top Status Badge */}
                    <View style={styles.badgeRow}>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors[prop.status] + '20', borderColor: statusColors[prop.status] }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusColors[prop.status] }]} />
                        <Text style={[styles.statusText, { color: statusColors[prop.status] }]}>{prop.status}</Text>
                      </View>
                      <View style={styles.favBtn}>
                        <Ionicons name="heart-outline" size={24} color="#FFF" />
                      </View>
                    </View>

                    {/* Bottom Details */}
                    <View style={styles.cardDetails}>
                      <Text style={styles.price}>{formatPrice(prop.price)}</Text>
                      <Text style={styles.address} numberOfLines={1}>{prop.address}</Text>
                      <Text style={styles.city}>{prop.city}</Text>

                      <View style={styles.metricsRow}>
                        <View style={styles.metric}>
                          <Ionicons name="bed-outline" size={16} color="#A1A1AA" />
                          <Text style={styles.metricText}>{prop.beds} Beds</Text>
                        </View>
                        <View style={styles.metric}>
                          <Ionicons name="water-outline" size={16} color="#A1A1AA" />
                          <Text style={styles.metricText}>{prop.baths} Baths</Text>
                        </View>
                        <View style={styles.metric}>
                          <Ionicons name="resize-outline" size={16} color="#A1A1AA" />
                          <Text style={styles.metricText}>{prop.sqft.toLocaleString()} SqFt</Text>
                        </View>
                      </View>

                      <Text style={styles.description} numberOfLines={2}>{prop.description}</Text>

                      <View style={styles.actionsRow}>
                        <AnimatedButton icon="document-text" label="Details" />
                        <AnimatedButton icon="calendar" label="Tour" primary />
                      </View>
                    </View>
                  </LinearGradient>
                </ImageBackground>
              </View>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Carousel Pagination Dots */}
        <View style={[styles.pagination, { bottom: insets.bottom + 20 }]}>
          {PROPERTIES.map((_, i) => (
            <View key={i} style={[styles.dot, activeIndex === i && styles.dotActive]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN,
    alignItems: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: Platform.OS === 'web' ? SCREEN_HEIGHT * 0.75 : SCREEN_HEIGHT * 0.7,
    marginHorizontal: CARD_MARGIN,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 20,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: '#09090B',
  },
  cardImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cardImageStyle: {
    opacity: 0.8,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    gap: 8,
  },
  price: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  address: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  city: {
    fontSize: 16,
    color: '#A1A1AA',
    fontWeight: '500',
    marginBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    color: '#D4D4D8',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: '#A1A1AA',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnPrimary: {
    backgroundColor: '#FFF',
  },
  actionBtnSecondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  pagination: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: '#FFF',
    width: 24,
  },
});
