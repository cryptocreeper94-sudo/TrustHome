import React, { useState, useRef, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, ImageBackground, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { SampleDataBanner } from '@/components/ui/SampleDataBanner';
import { useTenantList, apiErrorMessage } from '@/lib/tenant-api';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Calculate to exactly fit 3 cards with margins on web, keeping original mobile calculation
const CARD_MARGIN = 16;
const CARD_WIDTH = Platform.OS === 'web'
  ? Math.max(300, (SCREEN_WIDTH - (CARD_MARGIN * 6)) / 3)
  : SCREEN_WIDTH * 0.85;
const SNAP_INTERVAL = CARD_WIDTH + (CARD_MARGIN * 2);
const TEAL = '#1A8A7E';

type PropertyStatus = 'Active' | 'Under Contract' | 'Buyer Shortlist' | 'Sold';
const STATUSES: PropertyStatus[] = ['Active', 'Buyer Shortlist', 'Under Contract', 'Sold'];

interface Property {
  id: string;
  address: string;
  city: string;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  status: PropertyStatus;
  daysOnMarket: number;
  mls: string;
  image: any;
  description: string;
  features: string[];
  showings: number;
}

interface ApiProperty {
  id: string;
  address: string;
  city: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  status: PropertyStatus;
  mls: string | null;
  imageUrl: string | null;
  description: string | null;
  features: string | string[] | null;
  showingCount: number;
  listedAt?: string;
  createdAt?: string;
}

const HERO_IMAGES = [
  require('@/assets/images/hero-1.jpg'),
  require('@/assets/images/hero-2.jpg'),
  require('@/assets/images/hero-3.jpg'),
  require('@/assets/images/hero-4.jpg'),
];

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 's1',
    address: '4821 Cedar Ridge Dr',
    city: 'Franklin, TN',
    price: 875000,
    beds: 4,
    baths: 3.5,
    sqft: 3400,
    status: 'Active',
    daysOnMarket: 12,
    mls: 'MLS# 2587341',
    image: HERO_IMAGES[0],
    description: 'Stunning craftsman in the heart of Westhaven. Open floor plan with hardwood floors throughout, gourmet kitchen with quartz island, and a resort-style backyard with heated pool.',
    features: ['Heated Pool', 'Smart Home', 'Walk-in Pantry', 'Covered Patio'],
    showings: 8,
  },
  {
    id: 's2',
    address: '1012 Montrose Ave',
    city: 'Nashville, TN',
    price: 1150000,
    beds: 5,
    baths: 4,
    sqft: 4200,
    status: 'Buyer Shortlist',
    daysOnMarket: 3,
    mls: 'MLS# 2591204',
    image: HERO_IMAGES[1],
    description: 'Completely renovated East Nashville showpiece. Chef\'s kitchen with Wolf range, custom millwork, primary suite with spa bath, and detached guest house with full kitchen.',
    features: ['Guest House', 'Chef\'s Kitchen', 'Spa Bath', 'Fenced Yard'],
    showings: 14,
  },
  {
    id: 's3',
    address: '308 Autumn Glen Dr',
    city: 'Murfreesboro, TN',
    price: 485000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    status: 'Under Contract',
    daysOnMarket: 21,
    mls: 'MLS# 2584917',
    image: HERO_IMAGES[2],
    description: 'Move-in ready in sought-after Salem Creek. New roof 2025, updated HVAC, granite countertops, bonus room above garage, and a level lot backing to mature trees.',
    features: ['New Roof', 'Bonus Room', 'Level Lot', 'Updated HVAC'],
    showings: 11,
  },
  {
    id: 's4',
    address: '7204 Pembrooke Farms Blvd',
    city: 'Brentwood, TN',
    price: 1475000,
    beds: 6,
    baths: 5.5,
    sqft: 5600,
    status: 'Active',
    daysOnMarket: 5,
    mls: 'MLS# 2593108',
    image: HERO_IMAGES[3],
    description: 'Brick estate on 1.2 acres in the Brentwood school district. Three-car garage, theater room, wine cellar, and an outdoor kitchen with stone fireplace overlooking the private backyard.',
    features: ['Wine Cellar', 'Theater Room', 'Outdoor Kitchen', '3-Car Garage'],
    showings: 4,
  }
];

function parseFeatures(f: ApiProperty['features']): string[] {
  if (!f) return [];
  if (Array.isArray(f)) return f;
  try { const v = JSON.parse(f); return Array.isArray(v) ? v.map(String) : []; } catch { return []; }
}

function fromApi(p: ApiProperty, index: number): Property {
  const listed = p.listedAt || p.createdAt;
  const days = listed ? Math.max(0, Math.floor((Date.now() - new Date(listed).getTime()) / 86400000)) : 0;
  return {
    id: p.id,
    address: p.address,
    city: p.city || '',
    price: p.price,
    beds: p.beds,
    baths: p.baths,
    sqft: p.sqft,
    status: p.status,
    daysOnMarket: days,
    mls: p.mls || '',
    image: p.imageUrl ? { uri: p.imageUrl } : HERO_IMAGES[index % HERO_IMAGES.length],
    description: p.description || '',
    features: parseFeatures(p.features),
    showings: p.showingCount || 0,
  };
}

function formatPrice(price: number | null): string {
  if (price === null || price === undefined || !Number.isFinite(price)) return 'Price TBD';
  if (price >= 1000000) return '$' + (price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 2) + 'M';
  return '$' + (price / 1000).toFixed(0) + 'K';
}

const statusColors: Record<PropertyStatus, string> = {
  Active: '#4ADE80',
  'Under Contract': '#FBBF24',
  'Buyer Shortlist': '#60A5FA',
  Sold: '#38BDF8',
};

function AnimatedButton({ icon, label, onPress, primary = false, testID }: { icon: keyof typeof Ionicons.glyphMap, label: string, onPress?: () => void, primary?: boolean, testID?: string }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, { flex: 1 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.92); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.actionBtn, primary ? styles.actionBtnPrimary : styles.actionBtnSecondary]}
        testID={testID}
      >
        <Ionicons name={icon} size={16} color="#FFF" />
        <Text style={[styles.actionBtnText, { color: '#FFF' }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const EMPTY_FORM = { address: '', city: '', price: '', beds: '', baths: '', sqft: '', mls: '', description: '', features: '', imageUrl: '', status: 'Active' as PropertyStatus };

export default function PropertiesScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const { colors, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const api = useTenantList<ApiProperty>('/api/properties');
  const [sample, setSample] = useState<Property[]>(SAMPLE_PROPERTIES);
  const [selected, setSelected] = useState<Property | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [pageError, setPageError] = useState('');

  const props = useMemo<Property[]>(
    () => (api.isLive ? api.items.map(fromApi) : sample),
    [api.isLive, api.items, sample],
  );

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    setActiveIndex(Math.min(Math.max(index, 0), Math.max(props.length - 1, 0)));
  };

  const scrollNext = () => {
    if (activeIndex < props.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * SNAP_INTERVAL, animated: true });
    }
  };

  const scrollPrev = () => {
    if (activeIndex > 0) {
      scrollRef.current?.scrollTo({ x: (activeIndex - 1) * SNAP_INTERVAL, animated: true });
    }
  };

  const setStatus = async (p: Property, status: PropertyStatus) => {
    setPageError('');
    setSelected({ ...p, status });
    if (!api.isLive) { setSample(prev => prev.map(x => x.id === p.id ? { ...x, status } : x)); return; }
    try { await api.update.mutateAsync({ id: p.id, status }); } catch (e) { setPageError(apiErrorMessage(e)); }
  };

  const removeProperty = async (p: Property) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.confirm(`Remove ${p.address} from your listings?`)) return;
    setPageError('');
    setSelected(null);
    if (!api.isLive) { setSample(prev => prev.filter(x => x.id !== p.id)); return; }
    try { await api.remove.mutateAsync(p.id); } catch (e) { setPageError(apiErrorMessage(e)); }
  };

  const addProperty = async () => {
    if (!form.address.trim()) { setFormError('Please enter the street address.'); return; }
    setSaving(true); setFormError('');
    const num = (s: string) => { const v = Number(s.replace(/[$,\s]/g, '')); return s.trim() && Number.isFinite(v) ? v : null; };
    const features = form.features.split(',').map(s => s.trim()).filter(Boolean);
    try {
      if (api.isLive) {
        await api.create.mutateAsync({
          address: form.address.trim(),
          city: form.city.trim() || null,
          price: num(form.price),
          beds: num(form.beds),
          baths: num(form.baths),
          sqft: num(form.sqft),
          status: form.status,
          mls: form.mls.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          description: form.description.trim() || null,
          features,
        });
      } else {
        setSample(prev => [...prev, {
          id: `s${Date.now()}`,
          address: form.address.trim(),
          city: form.city.trim(),
          price: num(form.price),
          beds: num(form.beds),
          baths: num(form.baths),
          sqft: num(form.sqft),
          status: form.status,
          daysOnMarket: 0,
          mls: form.mls.trim(),
          image: form.imageUrl.trim() ? { uri: form.imageUrl.trim() } : HERO_IMAGES[prev.length % HERO_IMAGES.length],
          description: form.description.trim(),
          features,
          showings: 0,
        }]);
      }
      setShowAdd(false); setForm(EMPTY_FORM);
    } catch (e) { setFormError(apiErrorMessage(e)); } finally { setSaving(false); }
  };

  const help = SCREEN_HELP.properties;
  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }];
  const field = (key: keyof typeof EMPTY_FORM, label: string, placeholder: string, extra?: object) => (
    <View style={{ flex: 1, minWidth: 120 }}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput value={String(form[key])} onChangeText={t => setForm(f => ({ ...f, [key]: t }))} placeholder={placeholder}
        placeholderTextColor={colors.textTertiary} style={inputStyle} testID={`property-${key}`} {...extra} />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0B1021' : colors.background }]}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <Header
        imageBanner={require('@/assets/images/guide-properties.jpg')}
        title={api.isLive ? 'My Listings' : 'Exclusive Listings'}
        subtitle={api.isLive ? 'Your properties, all in one place' : 'Curated Nashville market properties'}
        showBack
        transparent={false}
        rightAction={<InfoButton onPress={() => setShowHelp(true)} />}
      />

      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <SampleDataBanner live={api.isLive} count={props.length} noun="listings" />
        </View>
        <Pressable style={styles.addBtn} onPress={() => { setFormError(''); setShowAdd(true); }} testID="properties-add-btn">
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add Listing</Text>
        </Pressable>
      </View>
      {pageError ? <Text style={styles.errorText}>{pageError}</Text> : null}

      <View style={styles.carouselContainer}>
        {api.isLoading ? <ActivityIndicator color={TEAL} style={{ marginVertical: 60 }} /> : null}
        {!api.isLoading && props.length === 0 ? (
          <View style={[styles.emptyCard, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF' }]}>
            <Ionicons name="home-outline" size={44} color={TEAL} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No listings yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Tap "Add Listing" to add a home you're selling or one your buyer loves. It stays private to your workspace.
            </Text>
            <Pressable style={[styles.addBtn, { marginTop: 8 }]} onPress={() => { setFormError(''); setShowAdd(true); }}>
              <Ionicons name="add" size={18} color="#FFF" />
              <Text style={styles.addBtnText}>Add your first listing</Text>
            </Pressable>
          </View>
        ) : null}

        {props.length > 0 ? (
          <>
            <ScrollView
              ref={scrollRef}
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
              {props.map((prop, index) => (
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
                          <View style={styles.domBadge}>
                            <Text style={styles.domText}>{prop.daysOnMarket === 0 ? 'New' : `${prop.daysOnMarket}d on market`}</Text>
                          </View>
                        </View>

                        {/* Bottom Details */}
                        <View style={styles.cardDetails}>
                          <Text style={styles.price}>{formatPrice(prop.price)}</Text>
                          <Text style={styles.address} numberOfLines={1}>{prop.address}</Text>
                          {prop.city ? <Text style={styles.city}>{prop.city}</Text> : null}

                          <View style={styles.metricsRow}>
                            {prop.beds !== null ? (
                              <View style={styles.metric}>
                                <Ionicons name="bed-outline" size={16} color="#A1A1AA" />
                                <Text style={styles.metricText}>{prop.beds} Beds</Text>
                              </View>
                            ) : null}
                            {prop.baths !== null ? (
                              <View style={styles.metric}>
                                <Ionicons name="water-outline" size={16} color="#A1A1AA" />
                                <Text style={styles.metricText}>{prop.baths} Baths</Text>
                              </View>
                            ) : null}
                            {prop.sqft !== null ? (
                              <View style={styles.metric}>
                                <Ionicons name="resize-outline" size={16} color="#A1A1AA" />
                                <Text style={styles.metricText}>{prop.sqft.toLocaleString()} SqFt</Text>
                              </View>
                            ) : null}
                          </View>

                          {prop.description ? <Text style={styles.description} numberOfLines={2}>{prop.description}</Text> : <View style={{ height: 12 }} />}

                          <View style={styles.actionsRow}>
                            <AnimatedButton icon="document-text" label="Details" onPress={() => setSelected(prop)} testID={`property-details-${prop.id}`} />
                            <AnimatedButton icon="calendar" label="Tour" primary onPress={() => router.push('/showings')} testID={`property-tour-${prop.id}`} />
                          </View>
                        </View>
                      </LinearGradient>
                    </ImageBackground>
                  </View>
                </Animated.View>
              ))}
            </ScrollView>

            {/* Carousel Navigation */}
            <View style={styles.carouselNav}>
              <Pressable onPress={scrollPrev} style={[styles.navArrowBtn, { opacity: activeIndex === 0 ? 0.3 : 1 }]}>
                <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : '#000'} />
              </Pressable>
              <View style={styles.pagination}>
                {props.map((p, i) => (
                  <View
                    key={p.id}
                    style={[
                      styles.dot,
                      activeIndex === i && styles.dotActive,
                      { backgroundColor: activeIndex === i ? (isDark ? '#FFF' : '#000') : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)') }
                    ]}
                  />
                ))}
              </View>
              <Pressable onPress={scrollNext} style={[styles.navArrowBtn, { opacity: activeIndex >= props.length - 1 ? 0.3 : 1 }]}>
                <Ionicons name="chevron-forward" size={24} color={isDark ? '#FFF' : '#000'} />
              </Pressable>
            </View>
          </>
        ) : null}
      </View>
      <Footer />
    </ScrollView>

      {/* Details sheet */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.overlay}>
          {selected ? (
            <ScrollView style={[styles.modal, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]} contentContainerStyle={{ paddingBottom: 6 }}>
              <View style={styles.modalHead}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selected.address}</Text>
                  {selected.city ? <Text style={{ color: colors.textSecondary, marginTop: 2 }}>{selected.city}</Text> : null}
                </View>
                <Pressable onPress={() => setSelected(null)} hitSlop={8}><Ionicons name="close" size={24} color={colors.textSecondary} /></Pressable>
              </View>

              <Text style={[styles.detailPrice, { color: colors.text }]}>{formatPrice(selected.price)}</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 6 }}>
                {[selected.beds !== null ? `${selected.beds} beds` : '', selected.baths !== null ? `${selected.baths} baths` : '', selected.sqft !== null ? `${selected.sqft.toLocaleString()} sq ft` : ''].filter(Boolean).join(' · ')}
              </Text>
              <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
                {[selected.mls, `${selected.showings} showings`, selected.daysOnMarket === 0 ? 'Listed today' : `${selected.daysOnMarket} days on market`].filter(Boolean).join(' · ')}
              </Text>

              {selected.description ? <Text style={{ color: colors.text, marginTop: 14, lineHeight: 22 }}>{selected.description}</Text> : null}

              {selected.features.length > 0 ? (
                <View style={styles.featureWrap}>
                  {selected.features.map(f => (
                    <View key={f} style={[styles.featureChip, { borderColor: colors.border }]}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{f}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              <Text style={[styles.label, { color: colors.textSecondary, marginTop: 18 }]}>Status — tap to change</Text>
              <View style={styles.featureWrap}>
                {STATUSES.map(s => (
                  <Pressable key={s} onPress={() => setStatus(selected, s)} style={[styles.statusChip, { borderColor: statusColors[s], backgroundColor: selected.status === s ? statusColors[s] : 'transparent' }]} testID={`property-status-${s}`}>
                    <Text style={{ color: selected.status === s ? '#0B1021' : statusColors[s], fontWeight: '700', fontSize: 12 }}>{s}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                <Pressable style={[styles.saveBtn, { flex: 1, marginTop: 0 }]} onPress={() => { setSelected(null); router.push('/showings'); }}>
                  <Text style={styles.saveBtnText}>Schedule a showing</Text>
                </Pressable>
                <Pressable style={[styles.deleteBtn, { borderColor: '#F87171' }]} onPress={() => removeProperty(selected)} testID="property-delete">
                  <Ionicons name="trash-outline" size={18} color="#F87171" />
                </Pressable>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </Modal>

      {/* Add listing */}
      <Modal visible={showAdd} transparent animationType="fade" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.overlay}>
          <ScrollView style={[styles.modal, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]} contentContainerStyle={{ paddingBottom: 6 }}>
            <View style={styles.modalHead}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add a Listing</Text>
              <Pressable onPress={() => setShowAdd(false)} hitSlop={8}><Ionicons name="close" size={24} color={colors.textSecondary} /></Pressable>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Only the address is required — fill in the rest whenever you like.</Text>

            {field('address', 'Street address *', 'e.g. 4821 Cedar Ridge Dr')}
            <View style={styles.formRow}>
              {field('city', 'City, State', 'Franklin, TN')}
              {field('price', 'Price', '875000', { keyboardType: 'numeric' })}
            </View>
            <View style={styles.formRow}>
              {field('beds', 'Beds', '4', { keyboardType: 'numeric' })}
              {field('baths', 'Baths', '3.5', { keyboardType: 'numeric' })}
              {field('sqft', 'Sq Ft', '3400', { keyboardType: 'numeric' })}
            </View>
            {field('mls', 'MLS # (optional)', 'MLS# 2587341')}
            {field('description', 'Description', 'What makes this home special?', { multiline: true, style: [...inputStyle, { minHeight: 80, textAlignVertical: 'top' }] })}
            {field('features', 'Highlights (separate with commas)', 'Pool, Bonus Room, New Roof')}
            {field('imageUrl', 'Photo link (optional)', 'https://…', { autoCapitalize: 'none' })}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Status</Text>
            <View style={styles.featureWrap}>
              {STATUSES.map(s => (
                <Pressable key={s} onPress={() => setForm(f => ({ ...f, status: s }))} style={[styles.statusChip, { borderColor: statusColors[s], backgroundColor: form.status === s ? statusColors[s] : 'transparent' }]}>
                  <Text style={{ color: form.status === s ? '#0B1021' : statusColors[s], fontWeight: '700', fontSize: 12 }}>{s}</Text>
                </Pressable>
              ))}
            </View>

            {formError ? <Text style={[styles.errorText, { marginHorizontal: 0 }]}>{formError}</Text> : null}
            <Pressable style={styles.saveBtn} onPress={addProperty} disabled={saving} testID="property-save">
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Listing</Text>}
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={help?.title ?? 'Listings'}
        description={help?.description ?? 'Keep every home you are selling or showing in one place. Tap Details to change its status, or Tour to schedule a showing.'}
        details={help?.details}
        examples={help?.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: TEAL,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  errorText: { color: '#F87171', marginHorizontal: 16, marginTop: 8 },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    padding: 32,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 24,
    maxWidth: 520,
    alignSelf: 'center',
  },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Math.max(CARD_MARGIN, (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_MARGIN),
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
  domBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  domText: { color: '#E4E4E7', fontSize: 12, fontWeight: '600' },
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
    backgroundColor: TEAL,
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
  carouselNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  navArrowBtn: {
    padding: 8,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modal: { borderRadius: 16, borderWidth: 1, padding: 18, maxWidth: 560, width: '100%', alignSelf: 'center', maxHeight: '90%', flexGrow: 0 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  detailPrice: { fontSize: 32, fontWeight: '900', marginTop: 8, letterSpacing: -1 },
  featureWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  featureChip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  statusChip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  formRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  saveBtn: { marginTop: 18, backgroundColor: TEAL, paddingVertical: 13, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  deleteBtn: { width: 50, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
