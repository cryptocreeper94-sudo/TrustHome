import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';

type PropertyStatus = 'Active' | 'Under Contract' | 'Buyer Shortlist' | 'Sold';
type FilterTab = 'All' | 'My Listings' | 'Buyer Shortlist' | 'Under Contract' | 'Sold';

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
  gradient: [string, string];
  description: string;
  features: string[];
  showings: number;
  isMyListing: boolean;
}

const PROPERTIES: Property[] = [
  { id: '1', address: '742 Elm Street', city: 'San Mateo, CA 94401', price: 1295000, beds: 4, baths: 3, sqft: 2450, status: 'Active', daysOnMarket: 12, mls: 'MLS-228491', gradient: ['#1A8A7E', '#0F6B62'], description: 'Beautifully renovated Craftsman with chef\'s kitchen, hardwood floors throughout, and a landscaped backyard with mature fruit trees.', features: ['Central A/C', 'Solar Panels', 'EV Charger', 'Smart Home', 'Wine Cellar'], showings: 8, isMyListing: true },
  { id: '2', address: '1510 Oak Avenue', city: 'Burlingame, CA 94010', price: 1875000, beds: 5, baths: 4, sqft: 3200, status: 'Under Contract', daysOnMarket: 34, mls: 'MLS-227103', gradient: ['#4B6CB7', '#182848'], description: 'Spacious Mediterranean estate on a quiet cul-de-sac. Gourmet kitchen, home theater, and resort-style pool with spa.', features: ['Pool & Spa', 'Home Theater', 'Guest Suite', '3-Car Garage', 'Gated Entry'], showings: 15, isMyListing: true },
  { id: '3', address: '88 Maple Drive', city: 'Redwood City, CA 94061', price: 985000, beds: 3, baths: 2, sqft: 1780, status: 'Sold', daysOnMarket: 21, mls: 'MLS-226840', gradient: ['#834D9B', '#D04ED6'], description: 'Charming mid-century ranch with open floor plan, updated bathrooms, and a detached home office studio.', features: ['Home Office', 'Updated Kitchen', 'Fireplace', 'Patio', 'Fruit Trees'], showings: 11, isMyListing: true },
  { id: '4', address: '3200 Pacific Heights Blvd', city: 'San Francisco, CA 94115', price: 3450000, beds: 4, baths: 3.5, sqft: 2890, status: 'Active', daysOnMarket: 5, mls: 'MLS-229012', gradient: ['#F2994A', '#F2C94C'], description: 'Stunning Pacific Heights Victorian with panoramic bay views, period details, and modern luxury finishes throughout.', features: ['Bay Views', 'Original Moldings', 'Garden', 'Parking', 'Elevator'], showings: 3, isMyListing: false },
  { id: '5', address: '415 Sunset Terrace', city: 'Mill Valley, CA 94941', price: 2190000, beds: 4, baths: 3, sqft: 2650, status: 'Buyer Shortlist', daysOnMarket: 18, mls: 'MLS-228755', gradient: ['#E44D26', '#F16529'], description: 'Contemporary hillside home with walls of glass, open-concept living, chef\'s kitchen, and wraparound deck with Mt. Tam views.', features: ['Mountain Views', 'Deck', 'Radiant Heat', 'Wine Room', 'Mudroom'], showings: 6, isMyListing: false },
  { id: '6', address: '901 Bayside Court #4B', city: 'Foster City, CA 94404', price: 765000, beds: 2, baths: 2, sqft: 1150, status: 'Active', daysOnMarket: 28, mls: 'MLS-228320', gradient: ['#00B4DB', '#0083B0'], description: 'Bright waterfront condo with lagoon views, in-unit laundry, updated kitchen with quartz counters, and community pool access.', features: ['Waterfront', 'In-Unit Laundry', 'Pool Access', 'Gym', 'Secured Parking'], showings: 9, isMyListing: true },
  { id: '7', address: '2775 Hillcrest Road', city: 'Los Altos, CA 94024', price: 4100000, beds: 6, baths: 5, sqft: 4500, status: 'Buyer Shortlist', daysOnMarket: 8, mls: 'MLS-229100', gradient: ['#11998E', '#38EF7D'], description: 'Prestigious Los Altos Hills estate on 1.2 acres with resort pool, outdoor kitchen, guest house, and top-rated schools.', features: ['1.2 Acres', 'Guest House', 'Pool', 'Outdoor Kitchen', 'Home Gym'], showings: 2, isMyListing: false },
  { id: '8', address: '560 Marina Boulevard', city: 'South San Francisco, CA 94080', price: 899000, beds: 3, baths: 2.5, sqft: 1920, status: 'Under Contract', daysOnMarket: 42, mls: 'MLS-227580', gradient: ['#6441A5', '#2A0845'], description: 'Modern townhouse near biotech corridor. Open layout, private rooftop terrace, attached 2-car garage, and walking distance to BART.', features: ['Rooftop Terrace', '2-Car Garage', 'Near BART', 'Dog Park', 'Smart Locks'], showings: 13, isMyListing: true },
];

const FILTER_TABS: FilterTab[] = ['All', 'My Listings', 'Buyer Shortlist', 'Under Contract', 'Sold'];

const statusColors: Record<PropertyStatus, string> = {
  Active: '#34D399',
  'Under Contract': '#FBBF24',
  'Buyer Shortlist': '#60A5FA',
  Sold: '#A78BFA',
};

function formatPrice(price: number): string {
  if (price >= 1000000) return '$' + (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 2) + 'M';
  return '$' + (price / 1000).toFixed(0) + 'K';
}

const STATUS_SECTIONS: { status: PropertyStatus; title: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }[] = [
  { status: 'Active', title: 'Active Listings', icon: 'home', iconColor: '#34D399' },
  { status: 'Under Contract', title: 'Under Contract', icon: 'document-lock', iconColor: '#FBBF24' },
  { status: 'Buyer Shortlist', title: 'Buyer Shortlist', icon: 'heart', iconColor: '#60A5FA' },
  { status: 'Sold', title: 'Sold', icon: 'checkmark-circle', iconColor: '#A78BFA' },
];

function AnimatedFilterPill({ tab, isActive, colors, onPress }: { tab: FilterTab; isActive: boolean; colors: any; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        style={[styles.filterPill, { backgroundColor: isActive ? colors.primary : colors.cardGlass, borderColor: isActive ? colors.primary : colors.border }]}
      >
        <Text style={[styles.filterText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>{tab}</Text>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedPropertyQuickAction({ icon, label, primary, colors, isDark }: { icon: keyof typeof Ionicons.glyphMap; label: string; primary?: boolean; colors: any; isDark: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        style={[styles.qAction, primary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary, borderWidth: 1, borderColor: colors.border }
        ]}
      >
        <Ionicons name={icon} size={16} color={primary ? '#FFFFFF' : colors.primary} />
        <Text style={primary ? styles.qActionText : [styles.qActionTextAlt, { color: colors.primary }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedHeartButton({ isFav, onPress }: { isFav: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[styles.heartBtn, animStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.85, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        style={{ width: 44, height: 44, alignItems: 'center' as const, justifyContent: 'center' as const }}
      >
        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#F87171' : '#FFFFFF'} />
      </Pressable>
    </Animated.View>
  );
}

function PropertyCard({ prop, expanded, onToggle, isFav, onToggleFav, index, colors, isDark }: { prop: Property; expanded: boolean; onToggle: () => void; isFav: boolean; onToggleFav: () => void; index: number; colors: any; isDark: boolean }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <GlassCard onPress={onToggle} style={styles.propCard}>
        <View style={styles.photoWrap}>
          <LinearGradient colors={prop.gradient as [string, string]} style={styles.photoGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="home" size={32} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
          <AnimatedHeartButton isFav={isFav} onPress={onToggleFav} />
          <View style={[styles.statusPill, { backgroundColor: statusColors[prop.status] }]}>
            <Text style={styles.statusPillText}>{prop.status}</Text>
          </View>
        </View>
        <View style={styles.propBody}>
          <View style={styles.propHeader}>
            <View style={styles.propAddrWrap}>
              <Text style={[styles.propAddr, { color: colors.text }]} numberOfLines={1}>{prop.address}</Text>
              <Text style={[styles.propCity, { color: colors.textSecondary }]}>{prop.city}</Text>
            </View>
            <Text style={[styles.propPrice, { color: colors.primary }]}>{formatPrice(prop.price)}</Text>
          </View>
          <View style={styles.propDetails}>
            <View style={styles.detailChip}>
              <Ionicons name="bed" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{prop.beds}</Text>
            </View>
            <View style={styles.detailChip}>
              <Ionicons name="water" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{prop.baths}</Text>
            </View>
            <View style={styles.detailChip}>
              <Ionicons name="resize" size={14} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>{prop.sqft.toLocaleString()} sqft</Text>
            </View>
            <Text style={[styles.domText, { color: colors.textTertiary }]}>{prop.daysOnMarket}d on market</Text>
          </View>
          <Text style={[styles.mlsText, { color: colors.textTertiary }]}>{prop.mls}</Text>

          {expanded && (
            <View style={[styles.expandedSection, { borderTopColor: colors.divider }]}>
              <Text style={[styles.propDesc, { color: colors.text }]}>{prop.description}</Text>
              <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Features</Text>
              <View style={styles.featureWrap}>
                {prop.features.map((f, i) => (
                  <View key={i} style={[styles.featureChip, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.featureText, { color: colors.primary }]}>{f}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.showingRow}>
                <Ionicons name="eye" size={16} color={colors.textSecondary} />
                <Text style={[styles.showingText, { color: colors.textSecondary }]}>{prop.showings} showings scheduled</Text>
              </View>
              <View style={styles.quickActions}>
                <AnimatedPropertyQuickAction icon="call" label="Contact" primary colors={colors} isDark={isDark} />
                <AnimatedPropertyQuickAction icon="share" label="Share" colors={colors} isDark={isDark} />
                <AnimatedPropertyQuickAction icon="calendar" label="Showing" colors={colors} isDark={isDark} />
              </View>
            </View>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function PropertiesScreen() {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['5', '7']));
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const filtered = activeFilter === 'All'
    ? PROPERTIES
    : activeFilter === 'My Listings'
    ? PROPERTIES.filter(p => p.isMyListing)
    : PROPERTIES.filter(p => p.status === activeFilter);

  const activeCount = PROPERTIES.filter(p => p.status === 'Active').length;
  const contractCount = PROPERTIES.filter(p => p.status === 'Under Contract').length;
  const shortlistCount = PROPERTIES.filter(p => p.status === 'Buyer Shortlist').length;
  const soldCount = PROPERTIES.filter(p => p.status === 'Sold').length;

  const featuredProperties = PROPERTIES.filter(p => p.status === 'Active');

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getPropertiesForSection = (status: PropertyStatus): Property[] => {
    if (activeFilter === 'All') return PROPERTIES.filter(p => p.status === status);
    if (activeFilter === 'My Listings') return PROPERTIES.filter(p => p.isMyListing && p.status === status);
    return activeFilter === status ? PROPERTIES.filter(p => p.status === status) : [];
  };

  const visibleSections = STATUS_SECTIONS.filter(section => {
    const props = getPropertiesForSection(section.status);
    if (activeFilter === 'All' || activeFilter === 'My Listings') return props.length > 0;
    return activeFilter === section.status;
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Properties" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <View style={styles.bentoWrap}>
            <BentoGrid columns={3} gap={10}>
              {[
                { label: 'Active Listings', value: activeCount, icon: 'home' as const, color: '#34D399' },
                { label: 'Under Contract', value: contractCount, icon: 'document-lock' as const, color: '#FBBF24' },
                { label: 'Buyer Shortlist', value: shortlistCount, icon: 'heart' as const, color: '#60A5FA' },
              ].map(stat => (
                <GlassCard key={stat.label} compact style={styles.statCard}>
                  <View style={styles.statInner}>
                    <Ionicons name={stat.icon} size={22} color={stat.color} />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                  </View>
                </GlassCard>
              ))}
            </BentoGrid>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <HorizontalCarousel title="Featured" itemWidth={220} style={styles.carouselWrap}>
            {featuredProperties.map(prop => (
              <Pressable key={prop.id} onPress={() => setExpandedId(expandedId === prop.id ? null : prop.id)} style={[styles.featuredCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
                <View style={styles.featuredPhotoWrap}>
                  <LinearGradient colors={prop.gradient as [string, string]} style={styles.featuredPhotoGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Ionicons name="home" size={24} color="rgba(255,255,255,0.3)" />
                  </LinearGradient>
                </View>
                <View style={styles.featuredBody}>
                  <Text style={[styles.featuredAddr, { color: colors.text }]} numberOfLines={1}>{prop.address}</Text>
                  <Text style={[styles.featuredPrice, { color: colors.primary }]}>{formatPrice(prop.price)}</Text>
                  <View style={styles.featuredDetails}>
                    <Ionicons name="bed" size={12} color={colors.textSecondary} />
                    <Text style={[styles.featuredDetailText, { color: colors.textSecondary }]}>{prop.beds}</Text>
                    <Ionicons name="water" size={12} color={colors.textSecondary} />
                    <Text style={[styles.featuredDetailText, { color: colors.textSecondary }]}>{prop.baths}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </HorizontalCarousel>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
            {FILTER_TABS.map(tab => (
              <AnimatedFilterPill
                key={tab}
                tab={tab}
                isActive={activeFilter === tab}
                colors={colors}
                onPress={() => setActiveFilter(tab)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <View style={styles.sectionsWrap}>
            {visibleSections.map(section => {
              const sectionProps = getPropertiesForSection(section.status);
              return (
                <AccordionSection
                  key={section.status}
                  title={section.title}
                  icon={section.icon}
                  iconColor={section.iconColor}
                  badge={sectionProps.length}
                  defaultOpen={sectionProps.length > 0}
                >
                  {sectionProps.map((prop, idx) => (
                    <PropertyCard
                      key={prop.id}
                      prop={prop}
                      expanded={expandedId === prop.id}
                      onToggle={() => setExpandedId(expandedId === prop.id ? null : prop.id)}
                      isFav={favorites.has(prop.id)}
                      onToggleFav={() => toggleFavorite(prop.id)}
                      index={idx}
                      colors={colors}
                      isDark={isDark}
                    />
                  ))}
                </AccordionSection>
              );
            })}
          </View>
        </Animated.View>

        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.properties.title}
        description={SCREEN_HELP.properties.description}
        details={SCREEN_HELP.properties.details}
        examples={SCREEN_HELP.properties.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  bentoWrap: { paddingHorizontal: 16, marginTop: 16 },
  statCard: { minHeight: 84 },
  statInner: { alignItems: 'center' as const, gap: 6 },
  statValue: { fontSize: 24, fontWeight: '800' as const },
  statLabel: { fontSize: 12, fontWeight: '600' as const, textAlign: 'center' as const },
  carouselWrap: { marginTop: 20 },
  featuredCard: { width: 220, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  featuredPhotoWrap: { height: 110, overflow: 'hidden' },
  featuredPhotoGradient: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
  featuredBody: { padding: 12, gap: 3 },
  featuredAddr: { fontSize: 14, fontWeight: '600' as const },
  featuredPrice: { fontSize: 16, fontWeight: '700' as const },
  featuredDetails: { flexDirection: 'row', alignItems: 'center' as const, gap: 6, marginTop: 4 },
  featuredDetailText: { fontSize: 12, fontWeight: '500' as const },
  filterRow: { marginTop: 18, maxHeight: 48 },
  filterContent: { paddingHorizontal: 16, gap: 10 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1, minHeight: 44 },
  filterText: { fontSize: 13, fontWeight: '600' as const },
  sectionsWrap: { paddingHorizontal: 16, marginTop: 16 },
  propCard: { marginTop: 12, minHeight: 0 },
  photoWrap: { height: 140, borderRadius: 14, overflow: 'hidden', marginBottom: 12, position: 'relative' as const },
  photoGradient: { flex: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
  heartBtn: { position: 'absolute' as const, top: 6, right: 6, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.35)' },
  statusPill: { position: 'absolute' as const, bottom: 10, left: 10, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  statusPillText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' as const },
  propBody: { gap: 6 },
  propHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' as const },
  propAddrWrap: { flex: 1, marginRight: 8 },
  propAddr: { fontSize: 16, fontWeight: '600' as const },
  propCity: { fontSize: 13, marginTop: 2 },
  propPrice: { fontSize: 20, fontWeight: '700' as const },
  propDetails: { flexDirection: 'row', alignItems: 'center' as const, gap: 14, marginTop: 6 },
  detailChip: { flexDirection: 'row', alignItems: 'center' as const, gap: 4 },
  detailText: { fontSize: 13, fontWeight: '500' as const },
  domText: { fontSize: 12, marginLeft: 'auto' as any },
  mlsText: { fontSize: 11, marginTop: 2 },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  propDesc: { fontSize: 14, lineHeight: 20 },
  expandedLabel: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.6 },
  featureWrap: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 8 },
  featureChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  featureText: { fontSize: 12, fontWeight: '600' as const },
  showingRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 8 },
  showingText: { fontSize: 13 },
  quickActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  qAction: { flexDirection: 'row', alignItems: 'center' as const, gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minHeight: 44 },
  qActionText: { fontSize: 13, fontWeight: '600' as const, color: '#FFFFFF' },
  qActionTextAlt: { fontSize: 13, fontWeight: '600' as const },
});
