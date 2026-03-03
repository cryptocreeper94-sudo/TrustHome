import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getApiUrl, queryClient } from '@/lib/query-client';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

const TIER_COLORS: Record<string, string> = {
  base: '#9CA3AF',
  silver: '#C0C0C0',
  gold: '#F59E0B',
  platinum: '#A78BFA',
  diamond: '#22D3EE',
};

const TIER_THRESHOLDS = [
  { name: 'Base', min: 0, rate: '10%', color: '#9CA3AF' },
  { name: 'Silver', min: 5, rate: '12.5%', color: '#C0C0C0' },
  { name: 'Gold', min: 15, rate: '15%', color: '#F59E0B' },
  { name: 'Platinum', min: 30, rate: '17.5%', color: '#A78BFA' },
  { name: 'Diamond', min: 50, rate: '20%', color: '#22D3EE' },
];

export default function AffiliateScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const { data, isLoading } = useQuery({
    queryKey: ['/api/affiliate/dashboard'],
    queryFn: async () => {
      const url = new URL('/api/affiliate/dashboard', getApiUrl());
      const res = await fetch(url.toString(), { credentials: 'include' });
      return res.json();
    },
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const url = new URL('/api/affiliate/request-payout', getApiUrl());
      const res = await fetch(url.toString(), { method: 'POST', credentials: 'include' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/affiliate/dashboard'] });
    },
  });

  const handleCopyLink = async () => {
    if (!data?.referralLink) return;
    await Clipboard.setStringAsync(data.referralLink);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async () => {
    if (!data?.referralLink) return;
    try {
      await Share.share({
        message: `Join me on TrustHome — part of the Trust Layer ecosystem!\n${data.referralLink}`,
      });
    } catch {}
  };

  const tierColor = TIER_COLORS[data?.tier || 'base'] || '#9CA3AF';
  const stats = data?.stats || {};
  const pendingNum = parseFloat(stats.pendingEarnings || '0');
  const canPayout = pendingNum >= 10;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Affiliate Program" showBack />
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </View>
    );
  }

  if (data?.error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Affiliate Program" showBack />
        <View style={styles.loadingWrap}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textTertiary} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Sign in to access the affiliate program</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Share & Earn" showBack />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: isWeb ? 74 : insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View style={styles.heroSection}>
            <LinearGradient
              colors={[tierColor + '20', tierColor + '08', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.tierBadge, { backgroundColor: tierColor + '20', borderColor: tierColor + '40' }]}>
              <Ionicons name="diamond" size={20} color={tierColor} />
            </View>
            <Text style={[styles.tierName, { color: tierColor }]}>
              {(data?.tier || 'base').charAt(0).toUpperCase() + (data?.tier || 'base').slice(1)} Tier
            </Text>
            <Text style={[styles.commRate, { color: colors.text }]}>
              {((data?.commissionRate || 0.1) * 100).toFixed(1)}% Commission
            </Text>
            <Text style={[styles.heroSub, { color: colors.textTertiary }]}>
              Earn SIG across all 32 Trust Layer apps with one link
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <View style={styles.statsRow}>
            <StatCard label="Total Referrals" value={String(stats.totalReferrals || 0)} color="#22d3ee" isDark={isDark} />
            <StatCard label="Converted" value={String(stats.convertedReferrals || 0)} color="#34d399" isDark={isDark} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Pending" value={`${stats.pendingEarnings || '0.00'} SIG`} color="#f59e0b" isDark={isDark} />
            <StatCard label="Paid" value={`${stats.paidEarnings || '0.00'} SIG`} color="#a78bfa" isDark={isDark} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <View style={[styles.linkCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <Text style={[styles.linkLabel, { color: colors.textTertiary }]}>YOUR REFERRAL LINK</Text>
            <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>{data?.referralLink || ''}</Text>
            <View style={styles.linkActions}>
              <Pressable onPress={handleCopyLink} style={({ pressed }) => [styles.linkBtn, { backgroundColor: '#22d3ee20', opacity: pressed ? 0.7 : 1 }]}>
                <Ionicons name="copy-outline" size={16} color="#22d3ee" />
                <Text style={{ color: '#22d3ee', fontSize: 13, fontWeight: '600' }}>Copy</Text>
              </Pressable>
              <Pressable onPress={handleShare} style={({ pressed }) => [styles.linkBtn, { backgroundColor: '#a78bfa20', opacity: pressed ? 0.7 : 1 }]}>
                <Ionicons name="share-outline" size={16} color="#a78bfa" />
                <Text style={{ color: '#a78bfa', fontSize: 13, fontWeight: '600' }}>Share</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
            <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="trending-up-outline" size={14} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: '#f59e0b' }]}>COMMISSION TIERS</Text>
            </View>
            {TIER_THRESHOLDS.map((t) => {
              const isActive = (data?.tier || 'base').toLowerCase() === t.name.toLowerCase();
              return (
                <View key={t.name} style={[styles.tierRow, isActive && { backgroundColor: t.color + '08' }]}>
                  <View style={[styles.tierDot, { backgroundColor: t.color }]} />
                  <Text style={[styles.tierRowName, { color: isActive ? t.color : colors.text }]}>{t.name}</Text>
                  <Text style={[styles.tierRowReq, { color: colors.textTertiary }]}>{t.min}+ referrals</Text>
                  <Text style={[styles.tierRowRate, { color: isActive ? t.color : colors.textSecondary }]}>{t.rate}</Text>
                  {isActive && <Ionicons name="checkmark-circle" size={14} color={t.color} style={{ marginLeft: 4 }} />}
                </View>
              );
            })}
          </View>
        </Animated.View>

        {canPayout && (
          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Pressable
              onPress={() => payoutMutation.mutate()}
              disabled={payoutMutation.isPending}
              style={({ pressed }) => [styles.payoutBtn, { opacity: pressed ? 0.8 : 1 }]}
            >
              <LinearGradient
                colors={['#22d3ee', '#06b6d4']}
                style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
              {payoutMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="wallet-outline" size={18} color="#fff" />
                  <Text style={styles.payoutBtnText}>Request Payout ({stats.pendingEarnings} SIG)</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        )}

        {(data?.referrals?.length || 0) > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(480)}>
            <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
              <View style={[styles.sectionHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="people-outline" size={14} color="#22d3ee" />
                <Text style={[styles.sectionTitle, { color: '#22d3ee' }]}>RECENT REFERRALS</Text>
              </View>
              {data.referrals.slice(0, 10).map((ref: any) => (
                <View key={ref.id} style={styles.refRow}>
                  <View style={[styles.statusDot, { backgroundColor: ref.status === 'converted' ? '#34d399' : '#f59e0b' }]} />
                  <Text style={[styles.refPlatform, { color: colors.text }]}>{ref.platform}</Text>
                  <Text style={[styles.refDate, { color: colors.textTertiary }]}>{new Date(ref.createdAt).toLocaleDateString()}</Text>
                  <View style={[styles.refStatusPill, { backgroundColor: ref.status === 'converted' ? '#34d39920' : '#f59e0b20' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: ref.status === 'converted' ? '#34d399' : '#f59e0b' }}>{ref.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, color, isDark }: { label: string; value: string; color: string; isDark: boolean }) {
  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, maxWidth: 720, alignSelf: 'center', width: '100%' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { fontSize: 14, marginTop: 8 },
  heroSection: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
    marginBottom: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  tierBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 8,
  },
  tierName: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  commRate: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  heroSub: { fontSize: 12, marginTop: 6, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },
  linkCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  linkLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  linkText: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  linkActions: { flexDirection: 'row', gap: 8 },
  linkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
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
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tierDot: { width: 8, height: 8, borderRadius: 4 },
  tierRowName: { fontSize: 13, fontWeight: '600', width: 70 },
  tierRowReq: { fontSize: 11, flex: 1 },
  tierRowRate: { fontSize: 13, fontWeight: '700' },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  payoutBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  refPlatform: { fontSize: 13, fontWeight: '500', flex: 1 },
  refDate: { fontSize: 11 },
  refStatusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
});
