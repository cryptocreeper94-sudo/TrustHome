import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
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
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { BentoGrid, BentoRow } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { apiRequest, queryClient } from '@/lib/query-client';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type SetupStep = 'provider' | 'credentials' | 'review';

interface MlsProvider {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: [string, string];
  popular: boolean;
  regions: string[];
}

const MLS_PROVIDERS: MlsProvider[] = [
  { id: 'bridge', name: 'Bridge Interactive', description: 'National MLS data aggregation via RESO Web API', icon: 'globe-outline', gradient: ['#1A8A7E', '#0F6B62'], popular: true, regions: ['National'] },
  { id: 'spark', name: 'Spark API (FBS)', description: 'Flexible MLS platform with comprehensive data access', icon: 'flash-outline', gradient: ['#F2994A', '#F2C94C'], popular: true, regions: ['National'] },
  { id: 'trestle', name: 'Trestle (CoreLogic)', description: 'RESO-certified data platform by CoreLogic', icon: 'layers-outline', gradient: ['#4B6CB7', '#182848'], popular: true, regions: ['National'] },
  { id: 'rets', name: 'RETS Server (Legacy)', description: 'Traditional RETS connection for legacy MLS boards', icon: 'server-outline', gradient: ['#834D9B', '#D04ED6'], popular: false, regions: ['Regional'] },
  { id: 'crmls', name: 'CRMLS', description: 'California Regional MLS — largest in the US', icon: 'business-outline', gradient: ['#E44D26', '#F16529'], popular: true, regions: ['California'] },
  { id: 'bright', name: 'Bright MLS', description: 'Mid-Atlantic region covering DC, MD, VA, PA, NJ, DE, WV', icon: 'sunny-outline', gradient: ['#00B4DB', '#0083B0'], popular: true, regions: ['Mid-Atlantic'] },
  { id: 'stellar', name: 'Stellar MLS', description: 'Florida\'s largest MLS covering central and southwest regions', icon: 'star-outline', gradient: ['#11998E', '#38EF7D'], popular: false, regions: ['Florida'] },
  { id: 'nwmls', name: 'Northwest MLS', description: 'Pacific Northwest coverage including Washington state', icon: 'leaf-outline', gradient: ['#3A6073', '#16222A'], popular: false, regions: ['Pacific NW'] },
  { id: 'har', name: 'HAR.com (Houston)', description: 'Houston Association of Realtors MLS', icon: 'home-outline', gradient: ['#6441A5', '#2A0845'], popular: false, regions: ['Texas'] },
  { id: 'custom', name: 'Custom / Other', description: 'Connect to any RESO-compliant MLS with your own credentials', icon: 'construct-outline', gradient: ['#636363', '#a2a2a2'], popular: false, regions: ['Any'] },
];

const RESO_FEATURES = [
  { icon: 'shield-checkmark' as const, label: 'RESO Certified', desc: 'Web API 2.0 compliant', color: '#34C759' },
  { icon: 'sync' as const, label: 'Auto Sync', desc: 'Real-time listing updates', color: '#007AFF' },
  { icon: 'images' as const, label: 'Media Support', desc: 'Photos, virtual tours, docs', color: '#FF9500' },
  { icon: 'analytics' as const, label: 'Market Data', desc: 'Analytics & comparables', color: '#AF52DE' },
];

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]} />;
}

function ProviderCard({ provider, selected, onSelect, index }: {
  provider: MlsProvider;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <AnimatedPressable
        onPress={onSelect}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[animStyle, { width: 200 }]}
      >
        <View style={[
          providerStyles.card,
          {
            backgroundColor: colors.cardGlass,
            borderColor: selected ? colors.primary : colors.cardGlassBorder,
            borderWidth: selected ? 2 : 1,
          },
        ]}>
          <LinearGradient
            colors={provider.gradient as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={providerStyles.iconWrap}
          >
            <Ionicons name={provider.icon} size={22} color="#FFF" />
          </LinearGradient>
          <Text style={[providerStyles.name, { color: colors.text }]} numberOfLines={1}>{provider.name}</Text>
          <Text style={[providerStyles.desc, { color: colors.textSecondary }]} numberOfLines={2}>{provider.description}</Text>
          <View style={providerStyles.tags}>
            {provider.regions.map(r => (
              <View key={r} style={[providerStyles.tag, { backgroundColor: colors.primary + '14' }]}>
                <Text style={[providerStyles.tagText, { color: colors.primary }]}>{r}</Text>
              </View>
            ))}
            {provider.popular && (
              <View style={[providerStyles.tag, { backgroundColor: '#FF950018' }]}>
                <Text style={[providerStyles.tagText, { color: '#FF9500' }]}>Popular</Text>
              </View>
            )}
          </View>
          {selected && (
            <View style={[providerStyles.checkBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function StatCard({ icon, label, value, color, isDark, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  isDark: boolean;
  colors: any;
}) {
  return (
    <GlassCard compact>
      <View style={statStyles.card}>
        <View style={[statStyles.iconWrap, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[statStyles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[statStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </GlassCard>
  );
}

export default function MlsSetupScreen() {
  const { colors, isDark } = useTheme();
  const [showHelp, setShowHelp] = useState(false);
  const [step, setStep] = useState<SetupStep>('provider');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    mlsBoardName: '',
    mlsAgentId: '',
    licenseNumber: '',
    apiKey: '',
    apiSecret: '',
    serverUrl: '',
    loginUrl: '',
    mediaUrl: '',
    notes: '',
  });

  const configQuery = useQuery<any[]>({
    queryKey: ['/api/mls/config?agentId=demo'],
  });

  const existingConfigs = configQuery.data || [];
  const hasExistingConfig = existingConfigs.length > 0;

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/mls/config', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mls/config?agentId=demo'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    },
  });

  const testMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/mls/test-connection', data);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/mls/config/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mls/config?agentId=demo'] });
    },
  });

  const handleSave = useCallback(() => {
    const provider = MLS_PROVIDERS.find(p => p.id === selectedProvider);
    saveMutation.mutate({
      agentId: 'demo',
      provider: selectedProvider,
      mlsBoardName: form.mlsBoardName || provider?.name || '',
      mlsAgentId: form.mlsAgentId || null,
      licenseNumber: form.licenseNumber || null,
      apiKey: form.apiKey || null,
      apiSecret: form.apiSecret || null,
      serverUrl: form.serverUrl || null,
      loginUrl: form.loginUrl || null,
      mediaUrl: form.mediaUrl || null,
      notes: form.notes || null,
      status: 'pending',
      syncEnabled: 'false',
    });
  }, [form, selectedProvider]);

  const handleTestConnection = useCallback(() => {
    testMutation.mutate({
      provider: selectedProvider,
      mlsBoardName: form.mlsBoardName,
      apiKey: form.apiKey,
      serverUrl: form.serverUrl,
    });
  }, [form, selectedProvider]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      'Remove MLS Connection',
      'Are you sure you want to remove this MLS configuration? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  }, []);

  const selectedProviderObj = MLS_PROVIDERS.find(p => p.id === selectedProvider);

  const canProceedToCredentials = !!selectedProvider;
  const canProceedToReview = !!form.mlsBoardName && !!form.apiKey && !!form.serverUrl;

  const statusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#34C759';
      case 'pending': return '#FF9500';
      case 'failed': return '#FF3B30';
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="MLS Integration" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {showSuccess && (
          <Animated.View entering={FadeIn.duration(300)} style={[styles.successBanner, { backgroundColor: '#34C75918' }]}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <Text style={[styles.successText, { color: '#34C759' }]}>MLS configuration saved successfully</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroSection}>
          <GlassCard gradient={isDark ? ['rgba(26,138,126,0.15)', 'rgba(15,107,98,0.08)'] : ['rgba(26,138,126,0.06)', 'rgba(15,107,98,0.03)']}>
            <View style={styles.heroInner}>
              <View style={styles.heroIcon}>
                <LinearGradient
                  colors={['#1A8A7E', '#0F6B62'] as [string, string, ...string[]]}
                  style={styles.heroIconGradient}
                >
                  <MaterialCommunityIcons name="home-search" size={28} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Connect Your MLS</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Link your MLS board to automatically sync listings, market data, and property details directly into TrustHome.
              </Text>
              <View style={styles.heroSteps}>
                {(['provider', 'credentials', 'review'] as SetupStep[]).map((s, i) => (
                  <View key={s} style={styles.heroStepRow}>
                    <View style={[
                      styles.heroStepDot,
                      {
                        backgroundColor: step === s ? colors.primary : (
                          (['provider', 'credentials', 'review'].indexOf(step) > i) ? colors.primary + '60' : colors.border
                        ),
                      }
                    ]}>
                      {['provider', 'credentials', 'review'].indexOf(step) > i ? (
                        <Ionicons name="checkmark" size={10} color="#FFF" />
                      ) : (
                        <Text style={styles.heroStepNum}>{i + 1}</Text>
                      )}
                    </View>
                    <Text style={[
                      styles.heroStepLabel,
                      { color: step === s ? colors.text : colors.textSecondary },
                      step === s && { fontWeight: '700' as const },
                    ]}>{s === 'provider' ? 'Select Provider' : s === 'credentials' ? 'Enter Credentials' : 'Review & Connect'}</Text>
                    {i < 2 && <View style={[styles.heroStepLine, { backgroundColor: colors.border }]} />}
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {hasExistingConfig && (
          <AccordionSection
            title="Active Connections"
            icon="git-network"
            iconColor="#34C759"
            defaultOpen
            badge={existingConfigs.length}
            badgeColor="#34C759"
            style={{ marginHorizontal: 16, marginBottom: 12 }}
          >
            {existingConfigs.map((config: any, idx: number) => {
              const prov = MLS_PROVIDERS.find(p => p.id === config.provider);
              return (
                <View key={config.id} style={[
                  styles.existingRow,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                ]}>
                  <View style={styles.existingLeft}>
                    <LinearGradient
                      colors={(prov?.gradient || ['#636363', '#a2a2a2']) as [string, string, ...string[]]}
                      style={styles.existingIcon}
                    >
                      <Ionicons name={prov?.icon || 'globe-outline'} size={16} color="#FFF" />
                    </LinearGradient>
                    <View style={styles.existingInfo}>
                      <Text style={[styles.existingName, { color: colors.text }]}>{config.mlsBoardName || prov?.name}</Text>
                      <View style={styles.existingMeta}>
                        <PulsingDot color={statusColor(config.status)} />
                        <Text style={[styles.existingStatus, { color: statusColor(config.status) }]}>
                          {config.status === 'connected' ? 'Connected' : config.status === 'pending' ? 'Pending Verification' : 'Not Connected'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDelete(config.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={18} color={colors.error || '#FF3B30'} />
                  </Pressable>
                </View>
              );
            })}
          </AccordionSection>
        )}

        <View style={styles.section}>
          <BentoRow gap={10} style={{ marginHorizontal: 16, marginBottom: 16 }}>
            {RESO_FEATURES.map((feat, i) => (
              <Animated.View key={feat.label} entering={FadeInRight.delay(i * 80).springify()} style={{ flex: 1 }}>
                <GlassCard compact>
                  <View style={statStyles.card}>
                    <View style={[statStyles.iconWrap, { backgroundColor: feat.color + '18' }]}>
                      <Ionicons name={feat.icon} size={16} color={feat.color} />
                    </View>
                    <Text style={[statStyles.value, { color: colors.text, fontSize: 12 }]}>{feat.label}</Text>
                    <Text style={[statStyles.label, { color: colors.textSecondary, fontSize: 10 }]}>{feat.desc}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </BentoRow>
        </View>

        {step === 'provider' && (
          <Animated.View entering={FadeIn.duration(300)}>
            <HorizontalCarousel title="Popular MLS Providers" itemWidth={210}>
              {MLS_PROVIDERS.filter(p => p.popular).map((provider, i) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  selected={selectedProvider === provider.id}
                  onSelect={() => {
                    setSelectedProvider(provider.id);
                    setForm(prev => ({ ...prev, mlsBoardName: provider.name }));
                  }}
                  index={i}
                />
              ))}
            </HorizontalCarousel>

            <AccordionSection
              title="All MLS Providers"
              icon="list"
              iconColor="#007AFF"
              badge={MLS_PROVIDERS.length}
              badgeColor="#007AFF"
              style={{ marginHorizontal: 16, marginTop: 8 }}
            >
              {MLS_PROVIDERS.map((provider, idx) => (
                <Pressable
                  key={provider.id}
                  onPress={() => {
                    setSelectedProvider(provider.id);
                    setForm(prev => ({ ...prev, mlsBoardName: provider.name }));
                  }}
                  style={[
                    styles.providerListRow,
                    idx > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                    selectedProvider === provider.id && { backgroundColor: colors.primary + '0A' },
                  ]}
                >
                  <LinearGradient
                    colors={provider.gradient as [string, string, ...string[]]}
                    style={styles.providerListIcon}
                  >
                    <Ionicons name={provider.icon} size={16} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.providerListInfo}>
                    <Text style={[styles.providerListName, { color: colors.text }]}>{provider.name}</Text>
                    <Text style={[styles.providerListDesc, { color: colors.textSecondary }]} numberOfLines={1}>{provider.description}</Text>
                  </View>
                  {selectedProvider === provider.id ? (
                    <View style={[styles.providerListCheck, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#FFF" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  )}
                </Pressable>
              ))}
            </AccordionSection>

            <View style={styles.navButtons}>
              <View style={{ flex: 1 }} />
              <Pressable
                onPress={() => setStep('credentials')}
                disabled={!canProceedToCredentials}
                style={[
                  styles.nextBtn,
                  { backgroundColor: canProceedToCredentials ? colors.primary : colors.border },
                ]}
              >
                <Text style={styles.nextBtnText}>
                  {selectedProviderObj ? `Continue with ${selectedProviderObj.name}` : 'Select a Provider'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === 'credentials' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.credSection}>
            <View style={styles.credHeader}>
              <Pressable onPress={() => setStep('provider')} style={styles.backStepBtn}>
                <Ionicons name="arrow-back" size={18} color={colors.primary} />
                <Text style={[styles.backStepText, { color: colors.primary }]}>Change Provider</Text>
              </Pressable>
              {selectedProviderObj && (
                <View style={styles.selectedProviderBadge}>
                  <LinearGradient
                    colors={selectedProviderObj.gradient as [string, string, ...string[]]}
                    style={styles.selectedProviderIcon}
                  >
                    <Ionicons name={selectedProviderObj.icon} size={12} color="#FFF" />
                  </LinearGradient>
                  <Text style={[styles.selectedProviderName, { color: colors.text }]}>{selectedProviderObj.name}</Text>
                </View>
              )}
            </View>

            <AccordionSection
              title="MLS Board Details"
              icon="business"
              iconColor="#1A8A7E"
              defaultOpen
              style={{ marginHorizontal: 16 }}
            >
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>MLS Board / Organization Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.mlsBoardName}
                  onChangeText={v => setForm(prev => ({ ...prev, mlsBoardName: v }))}
                  placeholder="e.g. Bay Area MLS"
                  placeholderTextColor={colors.textTertiary}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>MLS Agent ID</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.mlsAgentId}
                  onChangeText={v => setForm(prev => ({ ...prev, mlsAgentId: v }))}
                  placeholder="Your MLS member ID"
                  placeholderTextColor={colors.textTertiary}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Real Estate License Number</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.licenseNumber}
                  onChangeText={v => setForm(prev => ({ ...prev, licenseNumber: v }))}
                  placeholder="e.g. DRE-01234567"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </AccordionSection>

            <AccordionSection
              title="API Credentials"
              icon="key"
              iconColor="#FF9500"
              defaultOpen
              style={{ marginHorizontal: 16 }}
            >
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>API Key</Text>
                  <View style={[styles.requiredBadge, { backgroundColor: '#FF3B3018' }]}>
                    <Text style={[styles.requiredText, { color: '#FF3B30' }]}>Required</Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.apiKey}
                  onChangeText={v => setForm(prev => ({ ...prev, apiKey: v }))}
                  placeholder="Your RESO API key"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  secureTextEntry
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>API Secret</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.apiSecret}
                  onChangeText={v => setForm(prev => ({ ...prev, apiSecret: v }))}
                  placeholder="Your RESO API secret"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  secureTextEntry
                />
              </View>
            </AccordionSection>

            <AccordionSection
              title="Server Endpoints"
              icon="link"
              iconColor="#007AFF"
              defaultOpen
              style={{ marginHorizontal: 16 }}
            >
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Server URL</Text>
                  <View style={[styles.requiredBadge, { backgroundColor: '#FF3B3018' }]}>
                    <Text style={[styles.requiredText, { color: '#FF3B30' }]}>Required</Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.serverUrl}
                  onChangeText={v => setForm(prev => ({ ...prev, serverUrl: v }))}
                  placeholder="https://api.mlsprovider.com/reso/odata"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Login / Auth URL</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.loginUrl}
                  onChangeText={v => setForm(prev => ({ ...prev, loginUrl: v }))}
                  placeholder="https://auth.mlsprovider.com/token"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="url"
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Media Server URL</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.mediaUrl}
                  onChangeText={v => setForm(prev => ({ ...prev, mediaUrl: v }))}
                  placeholder="https://media.mlsprovider.com"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>
            </AccordionSection>

            <AccordionSection
              title="Additional Notes"
              icon="document-text"
              iconColor="#AF52DE"
              style={{ marginHorizontal: 16 }}
            >
              <View style={styles.fieldGroup}>
                <TextInput
                  style={[styles.inputMulti, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.border }]}
                  value={form.notes}
                  onChangeText={v => setForm(prev => ({ ...prev, notes: v }))}
                  placeholder="Any special configuration notes, contact info for your MLS admin, etc."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </AccordionSection>

            <View style={styles.navButtons}>
              <Pressable onPress={() => setStep('provider')} style={[styles.backBtn, { borderColor: colors.border }]}>
                <Ionicons name="arrow-back" size={18} color={colors.text} />
                <Text style={[styles.backBtnText, { color: colors.text }]}>Back</Text>
              </Pressable>
              <Pressable
                onPress={() => setStep('review')}
                disabled={!canProceedToReview}
                style={[
                  styles.nextBtn,
                  { backgroundColor: canProceedToReview ? colors.primary : colors.border, flex: 1 },
                ]}
              >
                <Text style={styles.nextBtnText}>Review Connection</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </Pressable>
            </View>
          </Animated.View>
        )}

        {step === 'review' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.reviewSection}>
            <GlassCard style={{ marginHorizontal: 16 }}>
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  {selectedProviderObj && (
                    <LinearGradient
                      colors={selectedProviderObj.gradient as [string, string, ...string[]]}
                      style={styles.reviewProviderIcon}
                    >
                      <Ionicons name={selectedProviderObj.icon} size={24} color="#FFF" />
                    </LinearGradient>
                  )}
                  <View style={styles.reviewHeaderText}>
                    <Text style={[styles.reviewTitle, { color: colors.text }]}>{form.mlsBoardName}</Text>
                    <Text style={[styles.reviewSubtitle, { color: colors.textSecondary }]}>{selectedProviderObj?.description}</Text>
                  </View>
                </View>

                <View style={[styles.reviewDivider, { backgroundColor: colors.divider }]} />

                <View style={styles.reviewDetails}>
                  {[
                    { label: 'Provider', value: selectedProviderObj?.name, icon: 'globe-outline' as const },
                    { label: 'MLS Agent ID', value: form.mlsAgentId || 'Not provided', icon: 'person-outline' as const },
                    { label: 'License Number', value: form.licenseNumber || 'Not provided', icon: 'card-outline' as const },
                    { label: 'Server URL', value: form.serverUrl, icon: 'server-outline' as const },
                    { label: 'API Key', value: form.apiKey ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + form.apiKey.slice(-4) : 'Not provided', icon: 'key-outline' as const },
                  ].map((item, idx) => (
                    <View key={idx} style={[
                      styles.reviewRow,
                      idx > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                    ]}>
                      <View style={styles.reviewRowLeft}>
                        <View style={[styles.reviewRowIcon, { backgroundColor: colors.primary + '14' }]}>
                          <Ionicons name={item.icon} size={14} color={colors.primary} />
                        </View>
                        <Text style={[styles.reviewRowLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                      </View>
                      <Text style={[styles.reviewRowValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </GlassCard>

            {testMutation.data && (
              <Animated.View entering={FadeIn.duration(300)} style={{ marginHorizontal: 16, marginTop: 12 }}>
                <GlassCard compact gradient={testMutation.data.status === 'success'
                  ? ['rgba(52,199,89,0.08)', 'rgba(52,199,89,0.02)']
                  : ['rgba(255,59,48,0.08)', 'rgba(255,59,48,0.02)']
                }>
                  <View style={styles.testResult}>
                    <Ionicons
                      name={testMutation.data.status === 'success' ? 'checkmark-circle' : 'close-circle'}
                      size={22}
                      color={testMutation.data.status === 'success' ? '#34C759' : '#FF3B30'}
                    />
                    <View style={styles.testResultText}>
                      <Text style={[styles.testResultTitle, {
                        color: testMutation.data.status === 'success' ? '#34C759' : '#FF3B30',
                      }]}>
                        {testMutation.data.status === 'success' ? 'Connection Validated' : 'Connection Issue'}
                      </Text>
                      <Text style={[styles.testResultDesc, { color: colors.textSecondary }]}>
                        {testMutation.data.message}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            <View style={[styles.navButtons, { flexDirection: 'column', gap: 10 }]}>
              <Pressable
                onPress={handleTestConnection}
                disabled={testMutation.isPending}
                style={[styles.testBtn, { borderColor: colors.primary }]}
              >
                {testMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="flash-outline" size={18} color={colors.primary} />
                    <Text style={[styles.testBtnText, { color: colors.primary }]}>Test Connection</Text>
                  </>
                )}
              </Pressable>

              <View style={styles.navButtonsRow}>
                <Pressable onPress={() => setStep('credentials')} style={[styles.backBtn, { borderColor: colors.border }]}>
                  <Ionicons name="arrow-back" size={18} color={colors.text} />
                  <Text style={[styles.backBtnText, { color: colors.text }]}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={handleSave}
                  disabled={saveMutation.isPending}
                  style={[styles.saveBtn, { backgroundColor: colors.primary, flex: 1 }]}
                >
                  {saveMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                      <Text style={styles.saveBtnText}>Save & Connect</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        <AccordionSection
          title="How MLS Integration Works"
          icon="help-circle"
          iconColor="#007AFF"
          style={{ marginHorizontal: 16, marginTop: 16 }}
        >
          <View style={styles.helpContent}>
            {[
              { step: '1', title: 'Get Your Credentials', desc: 'Contact your MLS board or data provider to obtain API access credentials (API key, secret, and server URL).' },
              { step: '2', title: 'Select Your Provider', desc: 'Choose your MLS data provider from our supported list. Most boards use Bridge, Spark, or Trestle.' },
              { step: '3', title: 'Enter & Test', desc: 'Input your credentials and test the connection. We\'ll validate your access before activating the sync.' },
              { step: '4', title: 'Automatic Sync', desc: 'Once connected, TrustHome automatically syncs your listings, market data, and property media on a regular schedule.' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.helpRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <View style={[styles.helpStepBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Text style={[styles.helpStepNum, { color: colors.primary }]}>{item.step}</Text>
                </View>
                <View style={styles.helpTextGroup}>
                  <Text style={[styles.helpTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.helpDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </AccordionSection>

        <AccordionSection
          title="Supported Data Types"
          icon="cube"
          iconColor="#AF52DE"
          style={{ marginHorizontal: 16 }}
        >
          <BentoGrid columns={3} gap={8}>
            {[
              { icon: 'home' as const, label: 'Listings', color: '#1A8A7E' },
              { icon: 'images' as const, label: 'Photos', color: '#007AFF' },
              { icon: 'videocam' as const, label: 'Virtual Tours', color: '#FF9500' },
              { icon: 'people' as const, label: 'Agent Roster', color: '#AF52DE' },
              { icon: 'business' as const, label: 'Office Data', color: '#E44D26' },
              { icon: 'map' as const, label: 'Geo Data', color: '#34C759' },
              { icon: 'newspaper' as const, label: 'Open Houses', color: '#00B4DB' },
              { icon: 'trending-up' as const, label: 'Market Stats', color: '#F2994A' },
              { icon: 'document' as const, label: 'Tax Records', color: '#636363' },
            ].map((dt) => (
              <GlassCard key={dt.label} compact>
                <View style={styles.dataTypeCard}>
                  <View style={[styles.dataTypeIcon, { backgroundColor: dt.color + '18' }]}>
                    <Ionicons name={dt.icon} size={16} color={dt.color} />
                  </View>
                  <Text style={[styles.dataTypeLabel, { color: colors.text }]}>{dt.label}</Text>
                </View>
              </GlassCard>
            ))}
          </BentoGrid>
        </AccordionSection>

        <Footer />
      </ScrollView>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="MLS Integration"
        description="Connect your MLS board to automatically sync listings and market data into TrustHome. Each agent connects their own MLS credentials."
        details={[
          'Select your MLS data provider (Bridge, Spark, Trestle, or other)',
          'Enter your API credentials from your MLS board',
          'Test the connection before activating auto-sync',
          'TrustHome supports RESO Web API 2.0 standard',
          'Listings, photos, market data, and agent rosters all sync automatically',
          'Your credentials are encrypted and stored securely per-agent',
        ]}
      />
    </View>
  );
}

const providerStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    minHeight: 150,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8 },
    }),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  desc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 4,
  },
  tag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  checkBadge: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});

const statStyles = StyleSheet.create({
  card: {
    alignItems: 'center' as const,
    gap: 4,
    paddingVertical: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  value: {
    fontSize: 13,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  },
  label: {
    fontSize: 11,
    textAlign: 'center' as const,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 4,
  },
  successBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 16,
  },
  heroInner: {
    alignItems: 'center' as const,
  },
  heroIcon: {
    marginBottom: 12,
  },
  heroIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 6,
    textAlign: 'center' as const,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  heroSteps: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
  },
  heroStepRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  heroStepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  heroStepNum: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFF',
  },
  heroStepLabel: {
    fontSize: 11,
  },
  heroStepLine: {
    width: 16,
    height: 1.5,
    marginHorizontal: 2,
  },
  existingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 12,
  },
  existingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    flex: 1,
  },
  existingIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  existingInfo: {
    flex: 1,
  },
  existingName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  existingMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginTop: 2,
  },
  existingStatus: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  providerListRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    gap: 10,
  },
  providerListIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  providerListInfo: {
    flex: 1,
  },
  providerListName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  providerListDesc: {
    fontSize: 11,
    marginTop: 1,
  },
  providerListCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  navButtons: {
    flexDirection: 'row' as const,
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  navButtonsRow: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  nextBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    flex: 1,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  backBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  credSection: {
    paddingTop: 4,
  },
  credHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backStepBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  backStepText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  selectedProviderBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(26,138,126,0.08)',
  },
  selectedProviderIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  selectedProviderName: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  fieldGroup: {
    gap: 4,
    paddingTop: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 8,
    marginBottom: 2,
  },
  fieldLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
    marginBottom: 2,
  },
  requiredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  inputMulti: {
    minHeight: 80,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  reviewSection: {
    paddingTop: 4,
  },
  reviewCard: {
    gap: 0,
  },
  reviewHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  reviewProviderIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  reviewSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewDivider: {
    height: 1,
    marginVertical: 4,
  },
  reviewDetails: {
    gap: 0,
  },
  reviewRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 10,
  },
  reviewRowLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  reviewRowIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  reviewRowLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  reviewRowValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    maxWidth: '50%' as any,
    textAlign: 'right' as const,
  },
  testResult: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  testResultText: {
    flex: 1,
  },
  testResultTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  testResultDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  testBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  testBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  saveBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  helpContent: {
    gap: 0,
  },
  helpRow: {
    flexDirection: 'row' as const,
    gap: 10,
    paddingVertical: 10,
  },
  helpStepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  helpStepNum: {
    fontSize: 13,
    fontWeight: '800' as const,
  },
  helpTextGroup: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  helpDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  dataTypeCard: {
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 6,
  },
  dataTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dataTypeLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
});
