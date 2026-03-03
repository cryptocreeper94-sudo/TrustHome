import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';

export default function HallmarkDetailScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const hallmarkId = id || 'TR-00000001';

  const { data, isLoading } = useQuery({
    queryKey: ['/api/hallmark', hallmarkId, 'verify'],
    queryFn: async () => {
      const url = new URL(`/api/hallmark/${hallmarkId}/verify`, getApiUrl());
      const res = await fetch(url.toString(), { credentials: 'include' });
      return res.json();
    },
  });

  const genesisQuery = useQuery({
    queryKey: ['/api/hallmark/genesis'],
    queryFn: async () => {
      const url = new URL('/api/hallmark/genesis', getApiUrl());
      const res = await fetch(url.toString(), { credentials: 'include' });
      return res.json();
    },
    enabled: hallmarkId === 'TR-00000001',
  });

  const hallmark = hallmarkId === 'TR-00000001' && genesisQuery.data?.hallmark
    ? genesisQuery.data.hallmark
    : data?.hallmark;
  const metadata = hallmark?.metadata || {};
  const isGenesis = hallmark?.releaseType === 'genesis';

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Hallmark" showBack />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Hallmark" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isWeb ? 74 : insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={isDark
                ? ['rgba(6,182,212,0.12)', 'rgba(139,92,246,0.08)', 'transparent']
                : ['rgba(6,182,212,0.06)', 'rgba(139,92,246,0.04)', 'transparent']
              }
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.shieldWrap}>
              <LinearGradient
                colors={['rgba(6,182,212,0.3)', 'rgba(139,92,246,0.3)']}
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Ionicons name="shield-checkmark" size={36} color="#22d3ee" />
            </View>
            <Text style={[styles.badgeLabel, { color: colors.textTertiary }]}>
              {isGenesis ? 'Genesis Hallmark' : 'Hallmark'}
            </Text>
            <Text style={[styles.hallmarkIdText, { color: '#22d3ee' }]}>
              {hallmark?.thId || hallmarkId}
            </Text>
            {data?.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#34d399" />
                <Text style={styles.verifiedText}>Verified on Trust Layer</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {hallmark && (
          <>
            <Animated.View entering={FadeInDown.duration(400).delay(160)}>
              <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="information-circle-outline" size={16} color="#22d3ee" />
                  <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>APPLICATION INFO</Text>
                </View>
                <DetailRow label="App Name" value={hallmark.appName} colors={colors} />
                <DetailRow label="Product" value={hallmark.productName} colors={colors} />
                <DetailRow label="Release Type" value={hallmark.releaseType} colors={colors} />
                <DetailRow label="Created" value={new Date(hallmark.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} colors={colors} />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(240)}>
              <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="cube-outline" size={16} color="#a78bfa" />
                  <Text style={[styles.sectionTitle, { color: '#a78bfa' }]}>BLOCKCHAIN RECORD</Text>
                </View>
                <DetailRow label="Data Hash" value={hallmark.dataHash} colors={colors} mono />
                <DetailRow label="Tx Hash" value={hallmark.txHash} colors={colors} mono />
                <DetailRow label="Block Height" value={hallmark.blockHeight} colors={colors} />
              </View>
            </Animated.View>

            {isGenesis && metadata && (
              <Animated.View entering={FadeInDown.duration(400).delay(320)}>
                <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                  <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="globe-outline" size={16} color="#34d399" />
                    <Text style={[styles.sectionTitle, { color: '#34d399' }]}>ECOSYSTEM DETAILS</Text>
                  </View>
                  <DetailRow label="Ecosystem" value={metadata.ecosystem} colors={colors} />
                  <DetailRow label="Operator" value={metadata.operator} colors={colors} />
                  <DetailRow label="Chain" value={metadata.chain} colors={colors} />
                  <DetailRow label="Consensus" value={metadata.consensus} colors={colors} />
                  <DetailRow label="Domain" value={metadata.domain} colors={colors} />
                  <DetailRow label="Native Asset" value={metadata.nativeAsset} colors={colors} />
                  <DetailRow label="Utility Token" value={metadata.utilityToken} colors={colors} />
                  <DetailRow label="Launch Date" value="August 23, 2026" colors={colors} />
                  <DetailRow label="Parent App" value={metadata.parentApp} colors={colors} />
                  <DetailRow label="Parent Genesis" value={metadata.parentGenesis} colors={colors} highlight />
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.duration(400).delay(400)}>
              <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="checkmark-done-outline" size={16} color="#f59e0b" />
                  <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>VERIFICATION</Text>
                </View>
                <Pressable
                  onPress={() => Linking.openURL(`https://trusthome.tlid.io/api/hallmark/${hallmark.thId}/verify`)}
                  style={({ pressed }) => [styles.verifyBtn, { opacity: pressed ? 0.7 : 1, backgroundColor: isDark ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.08)' }]}
                >
                  <Ionicons name="open-outline" size={14} color="#22d3ee" />
                  <Text style={styles.verifyBtnText}>Verify on Trust Layer</Text>
                </Pressable>
                {isGenesis && (
                  <Pressable
                    onPress={() => Linking.openURL('https://trusthub.tlid.io/api/hallmark/TH-00000001/verify')}
                    style={({ pressed }) => [styles.verifyBtn, { opacity: pressed ? 0.7 : 1, backgroundColor: isDark ? 'rgba(167,139,250,0.1)' : 'rgba(167,139,250,0.08)', marginTop: 8 }]}
                  >
                    <Ionicons name="link-outline" size={14} color="#a78bfa" />
                    <Text style={[styles.verifyBtnText, { color: '#a78bfa' }]}>View Hub Genesis (TH-00000001)</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value, colors, mono, highlight }: { label: string; value?: string; colors: any; mono?: boolean; highlight?: boolean }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text
        style={[
          styles.detailValue,
          { color: highlight ? '#22d3ee' : colors.text },
          mono && styles.mono,
        ]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center', width: '100%' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroSection: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  shieldWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  badgeLabel: { fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  hallmarkIdText: { fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(52,211,153,0.1)',
  },
  verifiedText: { fontSize: 11, color: '#34d399', fontWeight: '600' },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 12, fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  verifyBtnText: { fontSize: 13, fontWeight: '600', color: '#22d3ee' },
});
