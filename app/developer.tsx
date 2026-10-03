import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
  ActivityIndicator, RefreshControl, TextInput, KeyboardAvoidingView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { DevConsoleSkeleton, ListSkeleton } from '@/components/ui/SkeletonLoader';
import { getQueryFn, apiRequest, queryClient } from '@/lib/query-client';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';


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
}

interface BusinessData {
  users: { total: number; agents: number; clients: number; vendors: number; new7d: number; new30d: number; activeAgents30d: number };
  pendingAccessRequests: number;
  signupsByDay: { day: string; n: number }[];
  platform: { leads: number; deals: number; documents: number; threads: number; messages: number; events: number; closedDeals: number; closedVolume: number };
  recentSignups: { id: string; firstName: string; lastName: string; email: string; role: string; brokerage: string | null; createdAt: string }[];
  uptimeSeconds: number;
  generatedAt: string;
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
  environment: string;
  uptime: number;
  registeredUsers: number;
  owner: string;
  ownerUrl: string;
  database: string;
  trustLayer: string;
  securitySuite: string;
}

type TabId = 'business' | 'overview' | 'health' | 'connections' | 'requests' | 'partner';

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
  source: string | null;
  licenseNumber: string | null;
}

export default function DeveloperScreen() {
  const [showHelp, setShowHelp] = useState(false);
  const { colors, isDark } = useTheme();
  const { replayPartnerDashboard, openBrokerPitchDeck, openLicensingPack } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('business');
  const [refreshing, setRefreshing] = useState(false);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [pinValue, setPinValue] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinShake, setPinShake] = useState(false);

  const ownerStatus = useQuery<{ unlocked: boolean; configured: boolean }>({
    queryKey: ['/api/owner/status'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 0,
  });
  const pinUnlocked = !!ownerStatus.data?.unlocked;

  const businessQuery = useQuery<BusinessData>({
    queryKey: ['/api/owner/business'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: pinUnlocked,
    refetchInterval: 60000,
  });

  const overviewQuery = useQuery<OverviewData>({
    queryKey: ['/api/admin/overview'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: pinUnlocked,
  });

  const healthQuery = useQuery<HealthData>({
    queryKey: ['/api/admin/system-health'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: pinUnlocked,
    refetchInterval: 30000,
  });

  const connectionsQuery = useQuery<{ connections: ApiConnection[] }>({
    queryKey: ['/api/admin/api-connections'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: pinUnlocked,
  });

  const requestsQuery = useQuery<AccessRequestItem[]>({
    queryKey: ['/api/admin/access-requests'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: pinUnlocked,
  });

  useEffect(() => {
    pulseRef.current = setInterval(() => setPulseKey(k => k + 1), 3000);
    return () => { if (pulseRef.current) clearInterval(pulseRef.current); };
  }, []);

  const handleLock = useCallback(async () => {
    try { await apiRequest('POST', '/api/owner/lock'); } catch {}
    queryClient.removeQueries({ queryKey: ['/api/owner/business'] });
    await queryClient.invalidateQueries({ queryKey: ['/api/owner/status'] });
    router.replace('/');
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      businessQuery.refetch(),
      overviewQuery.refetch(),
      healthQuery.refetch(),
      connectionsQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [businessQuery, overviewQuery, healthQuery, connectionsQuery]);

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
    { id: 'business', label: 'Business', icon: 'trending-up-outline' },
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'health', label: 'Health', icon: 'pulse-outline' },
    { id: 'connections', label: 'APIs', icon: 'link-outline' },
    { id: 'requests', label: 'Requests', icon: 'people-outline' },
    { id: 'partner', label: 'Partner', icon: 'diamond-outline' },
  ];

  const renderBusiness = () => {
    const data = businessQuery.data;
    if (businessQuery.isLoading) return <DevConsoleSkeleton />;
    if (!data) return <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Unable to load business metrics</Text>;

    const maxDay = Math.max(1, ...data.signupsByDay.map(d => d.n));
    const money = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n / 1e3)}K` : `$${Math.round(n)}`;
    const kpis = [
      { label: 'Agents', value: data.users.agents, icon: 'briefcase-outline' as const, accent: '#1A8A7E' },
      { label: 'Clients', value: data.users.clients, icon: 'people-outline' as const, accent: '#4A90D9' },
      { label: 'New (7d)', value: data.users.new7d, icon: 'person-add-outline' as const, accent: '#8B5CF6' },
      { label: 'New (30d)', value: data.users.new30d, icon: 'calendar-outline' as const, accent: '#22d3ee' },
      { label: 'Active agents (30d)', value: data.users.activeAgents30d, icon: 'flash-outline' as const, accent: '#F59E0B' },
      { label: 'Pending requests', value: data.pendingAccessRequests, icon: 'mail-unread-outline' as const, accent: '#EF4444' },
    ];
    const activity = [
      { label: 'Leads', value: data.platform.leads },
      { label: 'Deals', value: data.platform.deals },
      { label: 'Closed deals', value: data.platform.closedDeals },
      { label: 'Closed volume', value: money(data.platform.closedVolume) },
      { label: 'Documents', value: data.platform.documents },
      { label: 'Conversations', value: data.platform.threads },
      { label: 'Messages', value: data.platform.messages },
      { label: 'Calendar events', value: data.platform.events },
    ];

    return (
      <View style={styles.sectionContent}>
        <Animated.View entering={FadeInDown.delay(80).duration(400)} style={[styles.overviewHero, { backgroundColor: '#1A8A7E' }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}>
              <Ionicons name="trending-up" size={28} color="rgba(255,255,255,0.9)" />
            </View>
            <View style={[styles.envBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Text style={styles.envBadgeText}>OWNER VIEW</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>TrustHome Business</Text>
          <Text style={styles.heroVersion}>DarkWave Studios LLC</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{data.users.total}</Text>
              <Text style={styles.heroStatLabel}>Accounts</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{data.platform.closedDeals}</Text>
              <Text style={styles.heroStatLabel}>Closed</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatUptime(data.uptimeSeconds)}</Text>
              <Text style={styles.heroStatLabel}>Uptime</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.infoGrid}>
          {kpis.map((k, i) => (
            <Animated.View key={k.label} entering={FadeInDown.delay(140 + i * 40).duration(350)} style={[styles.infoCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
              <Ionicons name={k.icon} size={20} color={k.accent} />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{k.label}</Text>
              <Text style={[styles.heroStatValue, { color: colors.text }]}>{k.value}</Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(380).duration(400)} style={[styles.serviceCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 0 }]}>Sign-ups, last 30 days</Text>
          {data.signupsByDay.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No sign-ups yet</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 3, marginTop: 8 }}>
              {data.signupsByDay.map(d => (
                <View key={d.day} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ width: '100%', maxWidth: 14, height: Math.max(4, (d.n / maxDay) * 80), backgroundColor: '#1A8A7E', borderRadius: 3 }} />
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform activity</Text>
        <View style={styles.infoGrid}>
          {activity.map(a => (
            <View key={a.label} style={[styles.infoCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{a.label}</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{a.value}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent sign-ups</Text>
        {data.recentSignups.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No accounts yet</Text>
        ) : data.recentSignups.map(u => (
          <View key={u.id} style={[styles.serviceCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
            <View style={styles.serviceTop}>
              <View style={styles.serviceLeft}>
                <Ionicons name={u.role === 'agent' ? 'briefcase' : 'person'} size={18} color={u.role === 'agent' ? '#1A8A7E' : '#4A90D9'} />
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>{u.firstName} {u.lastName}</Text>
                  <Text style={[styles.serviceEndpoint, { color: colors.textTertiary }]} numberOfLines={1}>{u.email}{u.brokerage ? ` · ${u.brokerage}` : ''}</Text>
                </View>
              </View>
              <View style={styles.serviceRight}>
                <Text style={[styles.latencyText, { color: colors.textTertiary }]}>
                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderOverview = () => {
    const data = overviewQuery.data;
    if (overviewQuery.isLoading) return <DevConsoleSkeleton />;
    if (!data) return <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Unable to load overview</Text>;

    return (
      <View style={styles.sectionContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.overviewHero, { backgroundColor: colors.primaryAction }]}>
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
              <Text style={styles.heroStatValue}>{data.environment === 'production' ? 'Live' : 'Dev'}</Text>
              <Text style={styles.heroStatLabel}>Mode</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Infrastructure</Text>
          <View style={styles.infoGrid}>
            {[
              { label: 'Owner', value: data.owner, icon: 'business-outline' as const },
              { label: 'Database', value: data.database, icon: 'server-outline' as const },
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
    if (healthQuery.isLoading) return <DevConsoleSkeleton />;
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
          <View style={[styles.uptimeBadge, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]}>
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
    if (connectionsQuery.isLoading) return <ListSkeleton count={3} />;
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
          <View style={[styles.connProgress, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]}>
            <View style={[styles.connProgressFill, { backgroundColor: colors.primaryAction, width: `${(configured / data.connections.length) * 100}%` as any }]} />
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
    if (requestsQuery.isLoading) return <ListSkeleton count={4} />;
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
                <View style={styles.reqNameRow}>
                  <Text style={[styles.reqName, { color: colors.text }]}>{req.firstName} {req.lastName}</Text>
                  {req.source === 'demo' && (
                    <View style={[styles.reqSourceBadge, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.reqSourceText, { color: colors.primary }]}>Demo</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.reqEmail, { color: colors.textSecondary }]}>{req.email}</Text>
              </View>
            </View>
            {req.licenseNumber && (
              <View style={styles.reqDetailRow}>
                <Ionicons name="card-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.reqDetailText, { color: colors.textSecondary }]}>License: {req.licenseNumber}</Text>
              </View>
            )}
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
              <View style={[styles.reqMessage, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]}>
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
              <View style={[styles.reqAvatar, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]}>
                <Text style={[styles.reqAvatarText, { color: colors.textTertiary }]}>
                  {req.firstName[0]}{req.lastName[0]}
                </Text>
              </View>
              <View style={styles.reqCardInfo}>
                <View style={styles.reqNameRow}>
                  <Text style={[styles.reqName, { color: colors.text }]}>{req.firstName} {req.lastName}</Text>
                  {req.source === 'demo' && (
                    <View style={[styles.reqSourceBadge, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.reqSourceText, { color: colors.primary }]}>Demo</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.reqEmail, { color: colors.textSecondary }]}>{req.email}</Text>
              </View>
              <View style={[styles.reqStatusBadge, { backgroundColor: req.status === 'contacted' ? colors.success + '20' : colors.textTertiary + '20' }]}>
                <Text style={[styles.reqStatusText, { color: req.status === 'contacted' ? colors.success : colors.textTertiary }]}>
                  {req.status}
                </Text>
              </View>
            </View>
            {req.licenseNumber && (
              <View style={styles.reqDetailRow}>
                <Ionicons name="card-outline" size={14} color={colors.textTertiary} />
                <Text style={[styles.reqDetailText, { color: colors.textSecondary }]}>License: {req.licenseNumber}</Text>
              </View>
            )}
          </Animated.View>
        ))}
      </View>
    );
  };

  const [pinChecking, setPinChecking] = useState(false);

  const submitPin = useCallback(async () => {
    const entered = pinValue.trim();
    if (!entered || pinChecking) return;
    setPinChecking(true);
    setPinError(null);
    try {
      await apiRequest('POST', '/api/owner/unlock', { pin: entered });
      setPinValue('');
      await queryClient.invalidateQueries({ queryKey: ['/api/owner/status'] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setPinError(msg.startsWith('429') ? 'Too many attempts. Try again later.'
        : msg.startsWith('503') ? 'Owner access is not configured on the server.'
        : 'Incorrect PIN. Try again.');
      setPinShake(true);
      setTimeout(() => { setPinValue(''); setPinShake(false); }, 600);
    } finally {
      setPinChecking(false);
    }
  }, [pinValue, pinChecking]);

  if (ownerStatus.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
        <DevConsoleSkeleton />
      </View>
    );
  }

  if (!pinUnlocked) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
        <Header title="Owner Portal" showBack  rightAction={<InfoButton onPress={() => setShowHelp(true)} />}/>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={styles.pinGateContainer}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.pinGateContent}>
            <View style={[styles.pinLockIcon, { backgroundColor: '#1A8A7E22' }]}>
              <Ionicons name="lock-closed" size={36} color="#1A8A7E" />
            </View>
            <Text style={[styles.pinTitle, { color: colors.text }]}>Owner Access</Text>
            <Text style={[styles.pinSubtitle, { color: colors.textSecondary }]}>
              Enter the owner PIN to view business analytics
            </Text>

            <View style={[styles.pinRow, pinShake && styles.pinShake]}>
              <View style={[styles.pinCell, {
                width: 220,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.backgroundTertiary,
                borderColor: pinError ? colors.error : pinValue ? '#1A8A7E' : colors.cardGlassBorder,
              }]}>
                <TextInput
                  testID="owner-pin-input"
                  style={[styles.pinInput, { color: colors.text, letterSpacing: 8 }]}
                  value={pinValue}
                  onChangeText={(t) => { setPinError(null); setPinValue(t.replace(/\s/g, '')); }}
                  onSubmitEditing={submitPin}
                  keyboardType="number-pad"
                  maxLength={32}
                  secureTextEntry
                  autoFocus
                  returnKeyType="go"
                  placeholder="PIN"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <Pressable
              testID="owner-pin-submit"
              onPress={submitPin}
              disabled={!pinValue || pinChecking}
              style={({ pressed }) => ({
                marginTop: 4, marginBottom: 12, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12,
                backgroundColor: '#1A8A7E', opacity: !pinValue || pinChecking ? 0.5 : pressed ? 0.8 : 1,
                flexDirection: 'row', alignItems: 'center', gap: 8,
              })}
            >
              {pinChecking ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="key" size={16} color="#fff" />}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>{pinChecking ? 'Checking…' : 'Unlock'}</Text>
            </Pressable>

            {pinError && (
              <Animated.View entering={FadeInDown.duration(200)}>
                <Text style={[styles.pinErrorText, { color: colors.error }]}>{pinError}</Text>
              </Animated.View>
            )}
          </Animated.View>
        </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  const renderPartner = () => {
    const tools = [
      {
        title: 'Partner Pack',
        desc: 'Your ownership guide — role, payouts, Stripe setup, Trust Layer account, WOSB certification',
        icon: 'document-text' as const,
        accent: '#D4AF37',
        badge: '51% Owner',
        onPress: replayPartnerDashboard,
      },
      {
        title: 'Broker Pitch Deck',
        desc: 'Sales presentation — platform features, pricing, white-label, ecosystem, competitive advantages',
        icon: 'easel' as const,
        accent: '#1A8A7E',
        badge: '9 Slides',
        onPress: openBrokerPitchDeck,
      },
      {
        title: 'Enterprise Licensing',
        desc: 'Volume pricing, onboarding timeline, support tiers, ROI calculator, contract terms for 100+ agents',
        icon: 'briefcase' as const,
        accent: '#4A90D9',
        badge: '8 Slides',
        onPress: openLicensingPack,
      },
      {
        title: 'Orbit Staffing',
        desc: 'Financials, payroll, royalty splits (51/49), bookkeeping — DarkWave Studios LLC',
        icon: 'wallet' as const,
        accent: '#0ea5e9',
        badge: 'External',
        onPress: () => Linking.openURL('https://orbitstaffing.io'),
      },
    ];

    return (
      <View style={styles.sectionContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.overviewHero, { backgroundColor: '#D4AF37' }]}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroIcon}>
                <Ionicons name="diamond" size={28} color="rgba(255,255,255,0.9)" />
              </View>
              <View style={[styles.envBadge, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                <Text style={styles.envBadgeText}>PARTNER TOOLS</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>Jennifer Lambert</Text>
            <Text style={styles.heroVersion}>Managing Partner · 51% Owner</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>4</Text>
                <Text style={styles.heroStatLabel}>Tools</Text>
              </View>
              <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>51%</Text>
                <Text style={styles.heroStatLabel}>Ownership</Text>
              </View>
              <View style={[styles.heroStatDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>WOSB</Text>
                <Text style={styles.heroStatLabel}>Eligible</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {tools.map((tool, i) => (
          <Animated.View
            key={tool.title}
            entering={FadeInDown.delay(200 + i * 80).duration(350)}
          >
            <Pressable
              onPress={tool.onPress}
              style={[styles.serviceCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}
            >
              <View style={styles.serviceTop}>
                <View style={styles.serviceLeft}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tool.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={tool.icon} size={20} color={tool.accent} />
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>{tool.title}</Text>
                    <Text style={[styles.serviceEndpoint, { color: colors.textTertiary }]} numberOfLines={2}>{tool.desc}</Text>
                  </View>
                </View>
                <View style={styles.serviceRight}>
                  <View style={[styles.statusPill, { backgroundColor: tool.accent + '18' }]}>
                    <Text style={[styles.statusPillText, { color: tool.accent }]}>{tool.badge}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(500).duration(350)}>
          <View style={[styles.serviceCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 4 }}>
              <Ionicons name="information-circle" size={18} color={colors.primary} style={{ marginTop: 1 }} />
              <Text style={{ fontSize: 12, lineHeight: 18, color: colors.textSecondary, flex: 1 }}>
                These tools are also available from Settings {'>'} Partner Dashboard.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <Header title="Owner Portal" showBack  rightAction={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Pressable testID="owner-lock" onPress={handleLock} hitSlop={8} style={{ padding: 6 }} accessibilityLabel="Lock owner portal">
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
          </Pressable>
          <InfoButton onPress={() => setShowHelp(true)} />
        </View>
      }/>

      <View style={[styles.tabBar, { backgroundColor: isDark ? '#0B1021' : colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
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
        {activeTab === 'business' && renderBusiness()}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'health' && renderHealth()}
        {activeTab === 'connections' && renderConnections()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'partner' && renderPartner()}
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
  pinShake: {} as any,
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
    minHeight: 44,
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
  reqNameRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 },
  reqSourceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  reqSourceText: { fontSize: 10, fontWeight: '600' as const },
});
