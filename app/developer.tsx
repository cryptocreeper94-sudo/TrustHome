import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Platform,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { getQueryFn } from '@/lib/query-client';

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

type TabId = 'overview' | 'health' | 'connections';

export default function DeveloperScreen() {
  const { colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const pulseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

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

  if (authLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loader: { marginTop: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 14 },

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
});
