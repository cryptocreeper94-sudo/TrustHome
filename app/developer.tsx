import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { getQueryFn, apiRequest, queryClient } from '@/lib/query-client';

const DEV_PIN = '0424';

interface ServiceStatus {
  name: string;
  endpoint: string;
  status: 'online' | 'offline' | 'degraded' | 'not_configured';
  latency?: number;
  details?: string;
}

interface HealthData {
  overall: 'healthy' | 'degraded' | 'critical';
  services: ServiceStatus[];
  uptime: number;
  timestamp: string;
  environment: string;
  tenantId: string;
}

interface ApiConnection {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  configured: boolean;
  keyMasked: string | null;
  icon: string;
}

interface OverviewData {
  platform: string;
  version: string;
  tenantId: string;
  environment: string;
  uptime: number;
  registeredUsers: number;
  owner: string;
  ownerUrl: string;
  ecosystem: string;
  trustLayer: string;
  securitySuite: string;
}

type TabId = 'overview' | 'health' | 'connections' | 'requests';

interface AccessRequestItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  brokerage: string | null;
  message: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export default function DeveloperScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const pinInputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const overviewQuery = useQuery<OverviewData>({
    queryKey: ['/api/admin/overview'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const healthQuery = useQuery<HealthData>({
    queryKey: ['/api/admin/system-health'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    refetchInterval: 30000,
  });

  const connectionsQuery = useQuery<{ connections: ApiConnection[]; tenantId: string }>({
    queryKey: ['/api/admin/api-connections'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const requestsQuery = useQuery<AccessRequestItem[]>({
    queryKey: ['/api/admin/access-requests'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  useEffect(() => {
    pulseRef.current = setInterval(() => setPulseKey(k => k + 1), 3000);
    return () => { if (pulseRef.current) clearInterval(pulseRef.current); };
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/auth');
    }
  }, [authLoading, isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      overviewQuery.refetch(),
      healthQuery.refetch(),
      connectionsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [overviewQuery, healthQuery, connectionsQuery]);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'online': case 'healthy': return colors.success;
      case 'degraded': return colors.warning;
      case 'offline': case 'critical': return colors.error;
      case 'not_configured': return colors.textTertiary;
      default: return colors.textTertiary;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'degraded': return 'Degraded';
      case 'not_configured': return 'Not Configured';
      case 'healthy': return 'All Systems Go';
      case 'critical': return 'Critical';
      default: return status;
    }
  };

  const statusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'online': case 'healthy': return 'checkmark-circle';
      case 'degraded': return 'warning';
      case 'offline': case 'critical': return 'close-circle';
      case 'not_configured': return 'remove-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const topInset = Platform.OS === 'web' ? 0 : 0;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const tabs: { id: TabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'health', label: 'Health', icon: 'pulse-outline' },
    { id: 'connections', label: 'APIs', icon: 'link-outline' },
    { id: 'requests', label: 'Requests', icon: 'people-outline' },
  ];

  const renderOverview = () => {
    const data = overviewQuery.data;
    if (overviewQuery.isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    if (!data) return <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Unable to load overview</Text>;

    return (
      <View style={styles.sectionContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.overviewHero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Ionicons name="shield-checkmark" size={28} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={[styles.envBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Text style={styles.envBadgeText}>{data.environment.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>{data.platform}</Text>
          <Text style={styles.heroVersion}>v{data.version}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{data.registeredUsers}</Text>
              <Text style={styles.heroStatLabel}>Users</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatUptime(data.uptime)}</Text>
              <Text style={styles.heroStatLabel}>Uptime</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{data.tenantId}</Text>
              <Text style={styles.heroStatLabel}>Tenant</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Infrastructure</Text>
          <View style={styles.infoGrid}>
            {[
              { label: 'Owner', value: data.owner, icon: 'business-outline' as const },
              { label: 'Ecosystem', value: data.ecosystem, icon: 'planet-outline' as const },
              { label: 'Trust Layer', value: data.trustLayer, icon: 'link-outline' as const },
              { label: 'Security', value: data.securitySuite, icon: 'shield-outline' as const },
            ].map((item, i) => (
              <View key={i} style={[styles.infoCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>{item.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    );
  };

  const renderHealth = () => {
    const data = healthQuery.data;
    if (healthQuery.isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    if (!data) return <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Unable to load health data</Text>;

    const onlineCount = data.services.filter(s => s.status === 'online').length;
    const totalConfigured = data.services.filter(s => s.status !== 'not_configured').length;

    return (
      <View style={styles.sectionContent}>
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          style={[styles.healthBanner, { backgroundColor: statusColor(data.overall) + '14', borderColor: statusColor(data.overall) + '40' }]}
        >
          <View style={styles.healthBannerLeft}>
            <View style={[styles.healthDot, { backgroundColor: statusColor(data.overall) }]} key={pulseKey} />
            <View>
              <Text style={[styles.healthBannerTitle, { color: colors.text }]}>{statusLabel(data.overall)}</Text>
              <Text style={[styles.healthBannerSub, { color: colors.textSecondary }]}>
                {onlineCount}/{totalConfigured} services online
              </Text>
            </View>
          </View>
          <View style={[styles.uptimeBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.uptimeText, { color: colors.textSecondary }]}>{formatUptime(data.uptime)}</Text>
          </View>
        </Animated.View>

        {data.services.map((service, i) => (
          <Animated.View
            key={service.name}
            entering={FadeInDown.delay(150 + i * 60).duration(350)}
            style={[styles.serviceCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}
          >
            <View style={styles.serviceTop}>
              <View style={styles.serviceLeft}>
                <Ionicons name={statusIcon(service.status)} size={20} color={statusColor(service.status)} />
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
                  <Text style={[styles.serviceEndpoint, { color: colors.textTertiary }]} numberOfLines={1}>{service.endpoint}</Text>
                </View>
              </View>
              <View style={styles.serviceRight}>
                <View style={[styles.statusPill, { backgroundColor: statusColor(service.status) + '18' }]}>
                  <Text style={[styles.statusPillText, { color: statusColor(service.status) }]}>{statusLabel(service.status)}</Text>
                </View>
              </View>
            </View>
            {(service.latency !== undefined || service.details) && (
              <View style={[styles.serviceBottom, { borderTopColor: colors.divider }]}>
                {service.latency !== undefined && (
                  <View style={styles.latencyRow}>
                    <Ionicons name="speedometer-outline" size={13} color={colors.textTertiary} />
                    <Text style={[styles.latencyText, { color: colors.textTertiary }]}>{service.latency}ms</Text>
                  </View>
                )}
                {service.details && (
                  <Text style={[styles.detailText, { color: colors.textTertiary }]} numberOfLines={1}>{service.details}</Text>
                )}
              </View>
            )}
          </Animated.View>
        ))}

        <View style={styles.timestampRow}>
          <Ionicons name="refresh-outline" size={13} color={colors.textTertiary} />
          <Text style={[styles.timestampText, { color: colors.textTertiary }]}>
            Last checked: {new Date(data.timestamp).toLocaleTimeString()} (auto-refreshes every 30s)
          </Text>
        </View>
      </View>
    );
  };

  const renderConnections = () => {
    const data = connectionsQuery.data;
    if (connectionsQuery.isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    if (!data) return <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Unable to load connections</Text>;

    const configured = data.connections.filter(c => c.configured).length;

    return (
      <View style={styles.sectionContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.connSummary, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
          <View style={styles.connSummaryContent}>
            <Text style={[styles.connSummaryTitle, { color: colors.text }]}>API Integrations</Text>
            <Text style={[styles.connSummaryCount, { color: colors.textSecondary }]}>
              {configured} of {data.connections.length} connected
            </Text>
          </View>
          <View style={[styles.connProgress, { backgroundColor: colors.backgroundTertiary }]}>
            <View style={[styles.connProgressFill, { backgroundColor: colors.primary, width: `${(configured / data.connections.length) * 100}%` as any }]} />
          </View>
        </Animated.View>

        {data.connections.map((conn, i) => (
          <Animated.View
            key={conn.id}
            entering={FadeInDown.delay(150 + i * 60).duration(350)}
            style={[styles.connCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}
          >
            <View style={styles.connCardTop}>
              <View style={[styles.connIcon, { backgroundColor: conn.configured ? colors.primary + '14' : colors.backgroundTertiary }]}>
                <Ionicons name={conn.icon as keyof typeof Ionicons.glyphMap} size={20} color={conn.configured ? colors.primary : colors.textTertiary} />
              </View>
              <View style={styles.connInfo}>
                <View style={styles.connNameRow}>
                  <Text style={[styles.connName, { color: colors.text }]} numberOfLines={1}>{conn.name}</Text>
                  <View style={[styles.connDot, { backgroundColor: conn.configured ? colors.success : colors.textTertiary }]} />
                </View>
                <Text style={[styles.connDesc, { color: colors.textSecondary }]} numberOfLines={2}>{conn.description}</Text>
              </View>
            </View>
            <View style={[styles.connCardBottom, { borderTopColor: colors.divider }]}>
              <View style={styles.connMeta}>
                <Ionicons name="server-outline" size={12} color={colors.textTertiary} />
                <Text style={[styles.connMetaText, { color: colors.textTertiary }]} numberOfLines={1}>{conn.baseUrl}</Text>
              </View>
              {conn.keyMasked && (
                <View style={styles.connMeta}>
                  <Ionicons name="key-outline" size={12} color={colors.textTertiary} />
                  <Text style={[styles.connMetaText, { color: colors.textTertiary }]}>{conn.keyMasked}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        ))}

        <View style={[styles.tenantBox, { backgroundColor: colors.primary + '0A', borderColor: colors.primary + '30' }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <View style={styles.tenantBoxText}>
            <Text style={[styles.tenantLabel, { color: colors.text }]}>Current Tenant Space</Text>
            <Text style={[styles.tenantValue, { color: colors.textSecondary }]}>{data.tenantId} (Demo Space)</Text>
          </View>
        </View>
      </View>
    );
  };

  const handleUpdateRequest = async (id: string, status: string) => {
    try {
      await apiRequest('PUT', `/api/admin/access-requests/${id}`, { status });
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/access-requests'] });
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  const renderRequests = () => {
    const data = requestsQuery.data;
    if (requestsQuery.isLoading) return <ActivityIndicator color={colors.primary} style={styles.loader} />;
    if (!data || data.length === 0) {
      return (
        <View style={styles.sectionContent}>
          <View style={[styles.emptyRequests, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
            <Ionicons name="people-outline" size={36} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No access requests yet</Text>
          </View>
        </View>
      );
    }

    const pending = data.filter(r => r.status === 'pending');
    const reviewed = data.filter(r => r.status !== 'pending');

    return (
      <View style={styles.sectionContent}>
        <View style={[styles.reqSummary, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
          <Text style={[styles.reqSummaryTitle, { color: colors.text }]}>Access Requests</Text>
          <View style={styles.reqSummaryRow}>
            <View style={[styles.reqBadge, { backgroundColor: colors.warning + '20' }]}>
              <Text style={[styles.reqBadgeText, { color: colors.warning }]}>{pending.length} pending</Text>
            </View>
            <View style={[styles.reqBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.reqBadgeText, { color: colors.success }]}>{reviewed.length} reviewed</Text>
            </View>
          </View>
        </View>

        {pending.length > 0 && (
          <Text style={[styles.reqGroupTitle, { color: colors.text }]}>Pending</Text>
        )}
        {pending.map((req, i) => (
          <Animated.View
            key={req.id}
            entering={FadeInDown.delay(100 + i * 50).duration(350)}
            style={[styles.reqCard, { backgroundColor: colors.cardGlass, borderColor: colors.primary + '30' }]}
          >
            <View style={styles.reqCardHeader}>
              <View style={[styles.reqAvatar, { backgroundColor: colors.primary + '14' }]}>
                <Text style={[styles.reqAvatarText, { color: colors.primary }]}>
                  {req.firstName[0]}{req.lastName[0]}
                </Text>
              </View>
              <View style={styles.reqCardInfo}>
                <Text style={[styles.reqName, { color: colors.text }]}>{req.firstName} {req.lastName}</Text>
                <Text style={[styles.reqEmail, { color: colors.textSecondary }]}>{req.email}</Text>
              </View>
            </View>
            {req.phone && (
              <View style={styles.reqDetailRow}>
                <Ionicons name="call-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.reqDetailText, { color: colors.textSecondary }]}>{req.phone}</Text>
              </View>
            )}
            {req.brokerage && (
              <View style={styles.reqDetailRow}>
                <Ionicons name="business-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.reqDetailText, { color: colors.textSecondary }]}>{req.brokerage}</Text>
              </View>
            )}
            {req.message && (
              <View style={[styles.reqMessage, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.reqMessageText, { color: colors.textSecondary }]}>{req.message}</Text>
              </View>
            )}
            <View style={styles.reqDetailRow}>
              <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.reqDetailText, { color: colors.textTertiary }]}>
                {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.reqActions}>
              <Pressable
                style={[styles.reqActionBtn, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }]}
                onPress={() => handleUpdateRequest(req.id, 'contacted')}
              >
                <Ionicons name="checkmark" size={16} color={colors.success} />
                <Text style={[styles.reqActionText, { color: colors.success }]}>Contacted</Text>
              </Pressable>
              <Pressable
                style={[styles.reqActionBtn, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
                onPress={() => handleUpdateRequest(req.id, 'dismissed')}
              >
                <Ionicons name="close" size={16} color={colors.error} />
                <Text style={[styles.reqActionText, { color: colors.error }]}>Dismiss</Text>
              </Pressable>
            </View>
          </Animated.View>
        ))}

        {reviewed.length > 0 && (
          <Text style={[styles.reqGroupTitle, { color: colors.textSecondary, marginTop: 8 }]}>Reviewed</Text>
        )}
        {reviewed.map((req, i) => (
          <Animated.View
            key={req.id}
            entering={FadeInDown.delay(100 + i * 50).duration(350)}
            style={[styles.reqCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder, opacity: 0.7 }]}
          >
            <View style={styles.reqCardHeader}>
              <View style={[styles.reqAvatar, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.reqAvatarText, { color: colors.textTertiary }]}>
                  {req.firstName[0]}{req.lastName[0]}
                </Text>
              </View>
              <View style={styles.reqCardInfo}>
                <Text style={[styles.reqName, { color: colors.text }]}>{req.firstName} {req.lastName}</Text>
                <Text style={[styles.reqEmail, { color: colors.textSecondary }]}>{req.email}</Text>
              </View>
              <View style={[styles.reqStatusBadge, { backgroundColor: req.status === 'contacted' ? colors.success + '20' : colors.textTertiary + '20' }]}>
                <Text style={[styles.reqStatusText, { color: req.status === 'contacted' ? colors.success : colors.textTertiary }]}>
                  {req.status}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    );
  };

  const handlePinDigit = useCallback((text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    if (text && !/^\d$/.test(text)) return;

    setPinError(false);
    const newDigits = [...pinDigits];
    newDigits[index] = text;
    setPinDigits(newDigits);

    if (text && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d.length === 1)) {
      const entered = newDigits.join('');
      if (entered === DEV_PIN) {
        setPinUnlocked(true);
      } else {
        setPinError(true);
        setPinShake(true);
        setTimeout(() => {
          setPinDigits(['', '', '', '']);
          setPinShake(false);
          pinInputRefs.current[0]?.focus();
        }, 600);
      }
    }
  }, [pinDigits]);

  const handlePinKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const newDigits = [...pinDigits];
      newDigits[index - 1] = '';
      setPinDigits(newDigits);
      pinInputRefs.current[index - 1]?.focus();
    }
  }, [pinDigits]);

  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!pinUnlocked) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Developer Console" showBack />
        <View style={styles.pinGateContainer}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.pinGateContent}>
            <View style={[styles.pinLockIcon, { backgroundColor: colors.primary + '14' }]}>
              <Ionicons name="lock-closed" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.pinTitle, { color: colors.text }]}>Restricted Access</Text>
            <Text style={[styles.pinSubtitle, { color: colors.textSecondary }]}>
              Enter your developer PIN to continue
            </Text>

            <View style={[styles.pinRow, pinShake && styles.pinShake]}>
              {pinDigits.map((digit, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinCell,
                    {
                      backgroundColor: colors.backgroundTertiary,
                      borderColor: pinError ? colors.error : digit ? colors.primary : colors.cardGlassBorder,
                    },
                  ]}
                >
                  <TextInput
                    ref={(ref) => { pinInputRefs.current[i] = ref; }}
                    style={[styles.pinInput, { color: colors.text }]}
                    value={digit}
                    onChangeText={(text) => handlePinDigit(text, i)}
                    onKeyPress={(e) => handlePinKeyPress(e, i)}
                    keyboardType="number-pad"
                    maxLength={1}
                    secureTextEntry
                    autoFocus={i === 0}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            {pinError && (
              <Animated.View entering={FadeInDown.duration(200)}>
                <Text style={[styles.pinErrorText, { color: colors.error }]}>
                  Incorrect PIN. Try again.
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Developer Console" showBack />

      <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
        {tabs.map(tab => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tab,
              activeTab === tab.id && [styles.tabActive, { borderBottomColor: colors.primary }],
            ]}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? colors.primary : colors.textTertiary}
            />
            <Text style={[
              styles.tabLabel,
              { color: activeTab === tab.id ? colors.primary : colors.textTertiary },
              activeTab === tab.id && styles.tabLabelActive,
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'health' && renderHealth()}
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'requests' && renderRequests()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },

  pinGateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  pinGateContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  pinLockIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  pinSubtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    marginBottom: 32,
    lineHeight: 20,
  },
  pinRow: {
    flexDirection: 'row' as const,
    gap: 14,
    marginBottom: 20,
  },
  pinShake: {
    ...(Platform.OS === 'web' ? { animation: 'shake 0.4s ease-in-out' } : {}) as any,
  },
  pinCell: {
    width: 56,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  pinInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
    width: '100%' as any,
    height: '100%' as any,
  },
  pinErrorText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabLabel: { fontSize: 13, fontWeight: '500' as const },
  tabLabelActive: { fontWeight: '600' as const },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionContent: { gap: 14 },

  sectionTitle: { fontSize: 17, fontWeight: '700' as const, marginTop: 8, marginBottom: 4 },

  overviewHero: {
    borderRadius: 18,
    padding: 20,
    gap: 4,
  },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  envBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  envBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.8 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.3 },
  heroVersion: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: '500' as const },
  heroStats: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' as const },
  heroStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500' as const, marginTop: 2 },
  heroStatDivider: { width: 1, height: 28 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  infoCard: {
    width: '47%' as any,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  infoLabel: { fontSize: 11, fontWeight: '500' as const, letterSpacing: 0.3 },
  infoValue: { fontSize: 14, fontWeight: '600' as const },

  healthBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthDot: { width: 12, height: 12, borderRadius: 6 },
  healthBannerTitle: { fontSize: 16, fontWeight: '700' as const },
  healthBannerSub: { fontSize: 12, marginTop: 1 },
  uptimeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  uptimeText: { fontSize: 12, fontWeight: '600' as const },

  serviceCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  serviceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  serviceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 14, fontWeight: '600' as const },
  serviceEndpoint: { fontSize: 11, marginTop: 2 },
  serviceRight: {},
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 11, fontWeight: '700' as const },
  serviceBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  latencyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  latencyText: { fontSize: 11, fontWeight: '500' as const },
  detailText: { fontSize: 11, flex: 1, textAlign: 'right' as const },

  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  timestampText: { fontSize: 11 },

  connSummary: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  connSummaryContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  connSummaryTitle: { fontSize: 15, fontWeight: '700' as const },
  connSummaryCount: { fontSize: 12, fontWeight: '500' as const },
  connProgress: { height: 6, borderRadius: 3, overflow: 'hidden' },
  connProgressFill: { height: 6, borderRadius: 3 },

  connCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  connCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  connIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connInfo: { flex: 1 },
  connNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connName: { fontSize: 14, fontWeight: '600' as const, flex: 1 },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  connDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  connCardBottom: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  connMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  connMetaText: { fontSize: 11, flex: 1 },

  tenantBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  tenantBoxText: { flex: 1 },
  tenantLabel: { fontSize: 13, fontWeight: '600' as const },
  tenantValue: { fontSize: 12, marginTop: 2 },

  emptyRequests: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 40,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  reqSummary: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  reqSummaryTitle: { fontSize: 16, fontWeight: '700' as const },
  reqSummaryRow: { flexDirection: 'row' as const, gap: 8 },
  reqBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  reqBadgeText: { fontSize: 12, fontWeight: '600' as const },
  reqGroupTitle: { fontSize: 14, fontWeight: '600' as const, marginBottom: -4 },
  reqCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  reqCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  reqAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  reqAvatarText: { fontSize: 14, fontWeight: '700' as const },
  reqCardInfo: { flex: 1 },
  reqName: { fontSize: 15, fontWeight: '600' as const },
  reqEmail: { fontSize: 13, marginTop: 1 },
  reqDetailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingLeft: 4,
  },
  reqDetailText: { fontSize: 13 },
  reqMessage: {
    padding: 10,
    borderRadius: 8,
    marginTop: 2,
  },
  reqMessageText: { fontSize: 13, lineHeight: 18, fontStyle: 'italic' as const },
  reqActions: {
    flexDirection: 'row' as const,
    gap: 8,
    marginTop: 4,
  },
  reqActionBtn: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  reqActionText: { fontSize: 13, fontWeight: '600' as const },
  reqStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  reqStatusText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
});
