import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  TextInput,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { getApiUrl, apiRequest } from '@/lib/query-client';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const IMAGES = {
  hero: require('@/assets/images/verdara-hero.png'),
  assess: require('@/assets/images/verdara-assess.png'),
  identify: require('@/assets/images/verdara-identify.png'),
  removal: require('@/assets/images/verdara-removal.png'),
  species: require('@/assets/images/verdara-species.png'),
  estimate: require('@/assets/images/verdara-estimate.png'),
};

const SERVICES = [
  {
    id: 'assess',
    icon: 'clipboard-outline' as const,
    label: 'Property Assessment',
    desc: 'Full tree & landscape assessment for any property address',
    gradient: ['#1A8A7E', '#0F6B62'] as [string, string],
    image: IMAGES.assess,
  },
  {
    id: 'identify',
    icon: 'leaf-outline' as const,
    label: 'Tree Identification',
    desc: 'AI-powered tree & plant species identification',
    gradient: ['#34C759', '#22A047'] as [string, string],
    image: IMAGES.identify,
  },
  {
    id: 'removal',
    icon: 'construct-outline' as const,
    label: 'Removal Planning',
    desc: 'Get professional removal plans with cost estimates',
    gradient: ['#F59E0B', '#D97706'] as [string, string],
    image: IMAGES.removal,
  },
  {
    id: 'species',
    icon: 'search-outline' as const,
    label: 'Species Lookup',
    desc: 'Detailed species info, growth patterns & care guides',
    gradient: ['#6366F1', '#4F46E5'] as [string, string],
    image: IMAGES.species,
  },
];

const CAPABILITIES = [
  { icon: 'leaf' as const, label: 'AI Identification', color: '#34C759' },
  { icon: 'construct' as const, label: 'Removal Plans', color: '#F59E0B' },
  { icon: 'clipboard' as const, label: 'Assessments', color: '#1A8A7E' },
  { icon: 'search' as const, label: 'Species Database', color: '#6366F1' },
  { icon: 'cash' as const, label: 'Cost Estimates', color: '#E44D26' },
  { icon: 'location' as const, label: 'Property Mapping', color: '#2563EB' },
];

function AssessModal({ visible, onClose, colors, isDark }: { visible: boolean; onClose: () => void; colors: any; isDark: boolean }) {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter a property address.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resp = await apiRequest('POST', '/api/verdara/assess', {
        propertyAddress: address.trim(),
        agentId: 'demo',
      });
      const data = await resp.json();
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to assess property');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAddress('');
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={[ms.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[ms.sheet, { backgroundColor: colors.backgroundSecondary, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
          <View style={ms.handle}><View style={[ms.handleBar, { backgroundColor: colors.border }]} /></View>
          <View style={ms.mHeader}>
            <Text style={[ms.mTitle, { color: colors.text }]}>Property Assessment</Text>
            <Pressable onPress={handleClose} style={ms.closeBtn}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={ms.mBody} showsVerticalScrollIndicator={false}>
            <Image source={IMAGES.assess} style={ms.mImage} resizeMode="cover" />
            <Text style={[ms.mDesc, { color: colors.textSecondary }]}>
              Get a comprehensive tree and landscape assessment for any property. Our AI analyzes the property's trees, identifies potential hazards, estimates maintenance costs, and provides detailed reports.
            </Text>
            <Text style={[ms.mLabel, { color: colors.text }]}>Property Address</Text>
            <TextInput
              style={[ms.mInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
              placeholder="e.g. 123 Oak Street, Austin, TX 78701"
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
              multiline
            />
            {result && (
              <Animated.View entering={FadeIn.duration(300)} style={[ms.resultBox, { backgroundColor: isDark ? 'rgba(26,138,126,0.1)' : 'rgba(26,138,126,0.06)', borderColor: '#1A8A7E30' }]}>
                <View style={ms.resultHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={[ms.resultTitle, { color: colors.text }]}>Assessment Complete</Text>
                </View>
                <Text style={[ms.resultText, { color: colors.textSecondary }]}>
                  {JSON.stringify(result, null, 2)}
                </Text>
              </Animated.View>
            )}
            <Pressable onPress={handleSubmit} disabled={loading} style={ms.mBtn}>
              <LinearGradient colors={['#1A8A7E', '#0F6B62'] as [string, string, ...string[]]} style={ms.mBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {loading ? <ActivityIndicator size={18} color="#FFF" /> : <Ionicons name="clipboard-outline" size={18} color="#FFF" />}
                <Text style={ms.mBtnText}>{loading ? 'Assessing...' : 'Run Assessment'}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function RemovalModal({ visible, onClose, colors, isDark }: { visible: boolean; onClose: () => void; colors: any; isDark: boolean }) {
  const insets = useSafeAreaInsets();
  const [address, setAddress] = useState('');
  const [treeIds, setTreeIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter a property address.');
      return;
    }
    const ids = treeIds.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      Alert.alert('Required', 'Please enter at least one tree ID or description.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resp = await apiRequest('POST', '/api/verdara/removal-plan', {
        propertyAddress: address.trim(),
        treeIds: ids,
      });
      const data = await resp.json();
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create removal plan');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAddress('');
    setTreeIds('');
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={[ms.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[ms.sheet, { backgroundColor: colors.backgroundSecondary, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
          <View style={ms.handle}><View style={[ms.handleBar, { backgroundColor: colors.border }]} /></View>
          <View style={ms.mHeader}>
            <Text style={[ms.mTitle, { color: colors.text }]}>Removal Planning</Text>
            <Pressable onPress={handleClose} style={ms.closeBtn}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={ms.mBody} showsVerticalScrollIndicator={false}>
            <Image source={IMAGES.removal} style={[ms.mImage, { height: 160 }]} resizeMode="cover" />
            <Text style={[ms.mDesc, { color: colors.textSecondary }]}>
              Generate a professional tree removal plan with cost estimates, timeline, permits needed, and recommended contractors. Perfect for pre-listing or buyer due diligence.
            </Text>
            <Text style={[ms.mLabel, { color: colors.text }]}>Property Address</Text>
            <TextInput
              style={[ms.mInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
              placeholder="e.g. 456 Elm Drive, Dallas, TX 75201"
              placeholderTextColor={colors.textTertiary}
              value={address}
              onChangeText={setAddress}
            />
            <Text style={[ms.mLabel, { color: colors.text }]}>Tree IDs or Descriptions</Text>
            <TextInput
              style={[ms.mInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
              placeholder="e.g. large oak front yard, dead pine backyard"
              placeholderTextColor={colors.textTertiary}
              value={treeIds}
              onChangeText={setTreeIds}
              multiline
            />
            {result && (
              <Animated.View entering={FadeIn.duration(300)} style={[ms.resultBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.06)', borderColor: '#F59E0B30' }]}>
                <View style={ms.resultHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={[ms.resultTitle, { color: colors.text }]}>Removal Plan Ready</Text>
                </View>
                <Text style={[ms.resultText, { color: colors.textSecondary }]}>
                  {JSON.stringify(result, null, 2)}
                </Text>
              </Animated.View>
            )}
            <Pressable onPress={handleSubmit} disabled={loading} style={ms.mBtn}>
              <LinearGradient colors={['#F59E0B', '#D97706'] as [string, string, ...string[]]} style={ms.mBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {loading ? <ActivityIndicator size={18} color="#FFF" /> : <Ionicons name="construct-outline" size={18} color="#FFF" />}
                <Text style={ms.mBtnText}>{loading ? 'Planning...' : 'Generate Plan'}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SpeciesModal({ visible, onClose, colors, isDark }: { visible: boolean; onClose: () => void; colors: any; isDark: boolean }) {
  const insets = useSafeAreaInsets();
  const [speciesId, setSpeciesId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!speciesId.trim()) {
      Alert.alert('Required', 'Please enter a species name or ID.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const resp = await apiRequest('GET', `/api/verdara/species/${encodeURIComponent(speciesId.trim())}`);
      const data = await resp.json();
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to look up species');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSpeciesId('');
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={[ms.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[ms.sheet, { backgroundColor: colors.backgroundSecondary, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
          <View style={ms.handle}><View style={[ms.handleBar, { backgroundColor: colors.border }]} /></View>
          <View style={ms.mHeader}>
            <Text style={[ms.mTitle, { color: colors.text }]}>Species Lookup</Text>
            <Pressable onPress={handleClose} style={ms.closeBtn}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={ms.mBody} showsVerticalScrollIndicator={false}>
            <Image source={IMAGES.species} style={[ms.mImage, { height: 160 }]} resizeMode="cover" />
            <Text style={[ms.mDesc, { color: colors.textSecondary }]}>
              Look up detailed information about any tree or plant species — growth patterns, root systems, maintenance needs, common diseases, estimated value, and more.
            </Text>
            <Text style={[ms.mLabel, { color: colors.text }]}>Species Name or ID</Text>
            <TextInput
              style={[ms.mInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
              placeholder="e.g. Quercus alba, Red Maple, Live Oak"
              placeholderTextColor={colors.textTertiary}
              value={speciesId}
              onChangeText={setSpeciesId}
            />
            {result && (
              <Animated.View entering={FadeIn.duration(300)} style={[ms.resultBox, { backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)', borderColor: '#6366F130' }]}>
                <View style={ms.resultHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  <Text style={[ms.resultTitle, { color: colors.text }]}>Species Found</Text>
                </View>
                <Text style={[ms.resultText, { color: colors.textSecondary }]}>
                  {JSON.stringify(result, null, 2)}
                </Text>
              </Animated.View>
            )}
            <Pressable onPress={handleSubmit} disabled={loading} style={ms.mBtn}>
              <LinearGradient colors={['#6366F1', '#4F46E5'] as [string, string, ...string[]]} style={ms.mBtnInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                {loading ? <ActivityIndicator size={18} color="#FFF" /> : <Ionicons name="search-outline" size={18} color="#FFF" />}
                <Text style={ms.mBtnText}>{loading ? 'Searching...' : 'Look Up Species'}</Text>
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function TreeServicesScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [showInfo, setShowInfo] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const statusQuery = useQuery<any>({
    queryKey: ['/api/verdara/status'],
    refetchInterval: 60000,
  });

  const isConnected = statusQuery.data?.connected === true;
  const capabilities = statusQuery.data?.capabilities || [];

  const handleServicePress = (serviceId: string) => {
    if (!isConnected) {
      Alert.alert('Not Connected', 'Verdara tree services are not currently available. Please check your connection.');
      return;
    }
    if (serviceId === 'identify') {
      Alert.alert('Coming Soon', 'Photo-based tree identification will be available in the next update. Use Property Assessment for now.');
      return;
    }
    setActiveModal(serviceId);
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Header title="Tree Services" showBack />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <View style={s.heroWrap}>
            <GlassCard style={{ overflow: 'hidden' }}>
              <Image source={IMAGES.hero} style={s.heroImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)'] as [string, string, ...string[]]}
                style={s.heroOverlay}
              />
              <View style={s.heroContent}>
                <View style={s.heroTitleRow}>
                  <MaterialCommunityIcons name="tree" size={28} color="#34C759" />
                  <Text style={s.heroTitle}>Verdara Tree Services</Text>
                </View>
                <Text style={s.heroSubtitle}>AI-powered tree & landscape intelligence for real estate</Text>
                <View style={s.heroBadgeRow}>
                  <View style={[s.statusDot, { backgroundColor: isConnected ? '#34C759' : '#F44' }]} />
                  <Text style={s.heroStatusText}>{isConnected ? 'Connected' : 'Offline'}</Text>
                  <InfoButton onPress={() => setShowInfo(true)} />
                </View>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <View style={s.statsRow}>
            <GlassCard compact style={s.statCard}>
              <View style={s.statInner}>
                <Ionicons name="leaf" size={22} color="#34C759" />
                <Text style={[s.statValue, { color: colors.text }]}>{capabilities.length}</Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>Capabilities</Text>
              </View>
            </GlassCard>
            <GlassCard compact style={s.statCard}>
              <View style={s.statInner}>
                <Ionicons name={isConnected ? 'cloud-done' : 'cloud-offline'} size={22} color={isConnected ? '#1A8A7E' : '#F44'} />
                <Text style={[s.statValue, { color: colors.text }]}>{isConnected ? 'Live' : 'Down'}</Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>Status</Text>
              </View>
            </GlassCard>
            <GlassCard compact style={s.statCard}>
              <View style={s.statInner}>
                <MaterialCommunityIcons name="shield-check" size={22} color="#6366F1" />
                <Text style={[s.statValue, { color: colors.text }]}>HMAC</Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>Security</Text>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <HorizontalCarousel title="Services" itemWidth={width >= 768 ? 200 : 170}>
            {SERVICES.map((svc, idx) => (
              <AnimatedPressable
                key={svc.id}
                onPress={() => handleServicePress(svc.id)}
                style={s.serviceCard}
              >
                <GlassCard compact>
                  <Image source={svc.image} style={s.serviceImage} resizeMode="cover" />
                  <LinearGradient
                    colors={[...svc.gradient, svc.gradient[1] + '00'] as [string, string, ...string[]]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={s.serviceOverlay}
                  />
                  <View style={s.serviceInfo}>
                    <View style={[s.serviceIconWrap, { backgroundColor: svc.gradient[0] + '30' }]}>
                      <Ionicons name={svc.icon} size={18} color="#FFF" />
                    </View>
                    <Text style={s.serviceLabel} numberOfLines={1}>{svc.label}</Text>
                    <Text style={s.serviceDesc} numberOfLines={2}>{svc.desc}</Text>
                  </View>
                </GlassCard>
              </AnimatedPressable>
            ))}
          </HorizontalCarousel>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <BentoGrid columns={3} gap={10} style={s.bentoGrid}>
            <GlassCard
              span={2}
              onPress={() => handleServicePress('assess')}
            >
              <View style={s.bentoCardWide}>
                <Image source={IMAGES.assess} style={s.bentoImageWide} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'] as [string, string, ...string[]]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.bentoContentWide}>
                  <View style={[s.bentoIconWrap, { backgroundColor: '#1A8A7E40' }]}>
                    <Ionicons name="clipboard-outline" size={20} color="#FFF" />
                  </View>
                  <Text style={s.bentoTitle}>Property Assessment</Text>
                  <Text style={s.bentoDesc}>Full tree & landscape analysis for any address</Text>
                </View>
              </View>
            </GlassCard>
            <GlassCard
              span={1}
              onPress={() => handleServicePress('removal')}
            >
              <View style={s.bentoCardTall}>
                <Image source={IMAGES.removal} style={s.bentoImageTall} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'] as [string, string, ...string[]]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.bentoContentTall}>
                  <View style={[s.bentoIconWrap, { backgroundColor: '#F59E0B40' }]}>
                    <Ionicons name="construct-outline" size={20} color="#FFF" />
                  </View>
                  <Text style={s.bentoTitle}>Removal</Text>
                  <Text style={s.bentoDesc}>Plan & estimate</Text>
                </View>
              </View>
            </GlassCard>
          </BentoGrid>

          <BentoGrid columns={3} gap={10} style={[s.bentoGrid, { marginTop: 0 }]}>
            <GlassCard
              span={1}
              onPress={() => handleServicePress('species')}
            >
              <View style={s.bentoCardTall}>
                <Image source={IMAGES.species} style={s.bentoImageTall} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'] as [string, string, ...string[]]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.bentoContentTall}>
                  <View style={[s.bentoIconWrap, { backgroundColor: '#6366F140' }]}>
                    <Ionicons name="search-outline" size={20} color="#FFF" />
                  </View>
                  <Text style={s.bentoTitle}>Species</Text>
                  <Text style={s.bentoDesc}>Database lookup</Text>
                </View>
              </View>
            </GlassCard>
            <GlassCard
              span={2}
              onPress={() => handleServicePress('identify')}
            >
              <View style={s.bentoCardWide}>
                <Image source={IMAGES.identify} style={s.bentoImageWide} resizeMode="cover" />
                <LinearGradient
                  colors={['transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'] as [string, string, ...string[]]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.bentoContentWide}>
                  <View style={[s.bentoIconWrap, { backgroundColor: '#34C75940' }]}>
                    <Ionicons name="leaf-outline" size={20} color="#FFF" />
                  </View>
                  <Text style={s.bentoTitle}>AI Tree Identification</Text>
                  <Text style={s.bentoDesc}>Photo-based species recognition (coming soon)</Text>
                </View>
              </View>
            </GlassCard>
          </BentoGrid>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <AccordionSection
            title="Capabilities"
            icon="flash"
            iconColor="#1A8A7E"
            defaultOpen
            badge={capabilities.length || CAPABILITIES.length}
            badgeColor="#1A8A7E"
            style={{ marginHorizontal: 16, marginTop: 8 }}
          >
            <View style={s.capGrid}>
              {(capabilities.length > 0 ? capabilities : CAPABILITIES.map(c => c.label.toLowerCase().replace(/\s+/g, '-'))).map((cap: string, idx: number) => {
                const info = CAPABILITIES[idx] || { icon: 'checkmark' as const, label: cap, color: '#1A8A7E' };
                return (
                  <View key={cap} style={[s.capPill, { backgroundColor: info.color + (isDark ? '18' : '0C') }]}>
                    <Ionicons name={info.icon} size={13} color={info.color} />
                    <Text style={[s.capText, { color: info.color }]}>{info.label}</Text>
                  </View>
                );
              })}
            </View>
          </AccordionSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <AccordionSection
            title="How It Works"
            icon="information-circle"
            iconColor="#2563EB"
            defaultOpen={false}
            style={{ marginHorizontal: 16 }}
          >
            <View style={s.howItWorks}>
              {[
                { step: '1', title: 'Enter Property Address', desc: 'Type or paste the property address you want to assess.' },
                { step: '2', title: 'AI Analysis', desc: 'Verdara AI scans satellite imagery, public records, and species databases.' },
                { step: '3', title: 'Get Your Report', desc: 'Receive a detailed tree inventory, risk assessment, and cost estimates.' },
                { step: '4', title: 'Share with Clients', desc: 'Include tree reports in your listing materials or buyer packages.' },
              ].map((item, idx) => (
                <View key={idx} style={[s.howStep, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#222' : '#eee' }]}>
                  <View style={[s.stepNumber, { backgroundColor: '#1A8A7E18' }]}>
                    <Text style={[s.stepNumberText, { color: '#1A8A7E' }]}>{item.step}</Text>
                  </View>
                  <View style={s.stepInfo}>
                    <Text style={[s.stepTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[s.stepDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </AccordionSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <AccordionSection
            title="Use Cases for Agents"
            icon="briefcase"
            iconColor="#E44D26"
            defaultOpen={false}
            style={{ marginHorizontal: 16 }}
          >
            <View style={s.howItWorks}>
              {[
                { icon: 'home-outline' as const, title: 'Pre-Listing Assessment', desc: 'Know your property\'s tree situation before listing. Identify potential issues and marketable features.' },
                { icon: 'cash-outline' as const, title: 'Buyer Due Diligence', desc: 'Help buyers understand tree-related costs — dead tree removal, root damage risks, maintenance estimates.' },
                { icon: 'document-text-outline' as const, title: 'Insurance & Liability', desc: 'Document hazardous trees for insurance purposes. Protect your clients with proper documentation.' },
                { icon: 'trending-up-outline' as const, title: 'Property Value Impact', desc: 'Mature trees can add 10-20% to property value. Show clients the landscape asset value.' },
              ].map((item, idx) => (
                <View key={idx} style={[s.howStep, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#222' : '#eee' }]}>
                  <View style={[s.stepNumber, { backgroundColor: '#E44D2618' }]}>
                    <Ionicons name={item.icon} size={16} color="#E44D26" />
                  </View>
                  <View style={s.stepInfo}>
                    <Text style={[s.stepTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[s.stepDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </AccordionSection>
        </Animated.View>

        <View style={s.poweredByWrap}>
          <LinearGradient
            colors={[isDark ? 'rgba(26,138,126,0.08)' : 'rgba(26,138,126,0.04)', 'transparent'] as [string, string, ...string[]]}
            style={s.poweredBy}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="tree" size={18} color="#34C759" />
            <Text style={[s.poweredByText, { color: colors.textSecondary }]}>
              Powered by Verdara / DarkWave Trust Layer Ecosystem
            </Text>
          </LinearGradient>
        </View>

        <Footer />
      </ScrollView>

      <InfoModal
        visible={showInfo}
        onClose={() => setShowInfo(false)}
        title="Verdara Tree Services"
        description="Verdara is an AI-powered tree and landscape intelligence platform, part of the DarkWave Trust Layer ecosystem. It provides real estate professionals with comprehensive tree assessments, species identification, removal planning, and cost estimates."
        details={[
          'Connected via secure HMAC-SHA256 authentication',
          'Real-time AI analysis of property landscapes',
          'Species database with growth patterns and care guides',
          'Removal cost estimates with contractor recommendations',
          'Integrated with Trust Layer for verified reports',
        ]}
        examples={[
          'Run a property assessment before listing',
          'Get removal cost estimates for buyer negotiations',
          'Look up species information for disclosure documents',
          'Identify unknown trees on a property',
        ]}
      />

      <AssessModal visible={activeModal === 'assess'} onClose={() => setActiveModal(null)} colors={colors} isDark={isDark} />
      <RemovalModal visible={activeModal === 'removal'} onClose={() => setActiveModal(null)} colors={colors} isDark={isDark} />
      <SpeciesModal visible={activeModal === 'species'} onClose={() => setActiveModal(null)} colors={colors} isDark={isDark} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  heroWrap: { marginHorizontal: 16, marginTop: 8 },
  heroImage: { width: '100%', height: 180, position: 'absolute', top: 0, left: 0, right: 0, borderRadius: 18 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
  heroContent: { paddingTop: 80, gap: 6 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  heroBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  heroStatusText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  statCard: { flex: 1 },
  statInner: { alignItems: 'center', gap: 4, paddingVertical: 4 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  sectionTitle: { fontSize: 17, fontWeight: '700', paddingHorizontal: 16, marginTop: 18, marginBottom: 10, letterSpacing: 0.2 },

  serviceCard: { width: 170 },
  serviceImage: { width: '100%', height: 100, position: 'absolute', top: 0, borderRadius: 14 },
  serviceOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 14 },
  serviceInfo: { paddingTop: 50, gap: 4 },
  serviceIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  serviceLabel: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  serviceDesc: { fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 14 },

  bentoGrid: { paddingHorizontal: 16, marginBottom: 10 },
  bentoCardWide: { height: 140, overflow: 'hidden' },
  bentoImageWide: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bentoContentWide: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, gap: 4 },
  bentoCardTall: { height: 140, overflow: 'hidden' },
  bentoImageTall: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bentoContentTall: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, gap: 3 },
  bentoIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  bentoTitle: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  bentoDesc: { fontSize: 10, color: 'rgba(255,255,255,0.8)', lineHeight: 14 },

  capGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 4 },
  capPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  capText: { fontSize: 11, fontWeight: '600' },

  howItWorks: { gap: 0 },
  howStep: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  stepNumber: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 14, fontWeight: '800' },
  stepInfo: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 14, fontWeight: '700' },
  stepDesc: { fontSize: 12, lineHeight: 17 },

  poweredByWrap: { marginHorizontal: 16, marginTop: 16 },
  poweredBy: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14 },
  poweredByText: { fontSize: 11, flex: 1 },
});

const ms = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  handle: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handleBar: { width: 40, height: 4, borderRadius: 2 },
  mHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10 },
  mTitle: { fontSize: 20, fontWeight: '800' },
  closeBtn: { padding: 4 },
  mBody: { paddingHorizontal: 20 },
  mImage: { width: '100%', height: 140, borderRadius: 14, marginBottom: 14 },
  mDesc: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  mLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  mInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, marginBottom: 14, minHeight: 48 },
  mBtn: { marginTop: 4, marginBottom: 20 },
  mBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  mBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  resultBox: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 14 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultTitle: { fontSize: 15, fontWeight: '700' },
  resultText: { fontSize: 12, lineHeight: 18, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
});
