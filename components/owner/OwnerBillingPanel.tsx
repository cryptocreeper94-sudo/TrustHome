/**
 * Owner portal — subscriptions overview: MRR, plan counts, Founders seats, every agent's status,
 * and a "Comp" switch to give an agent Professional for free (e.g. Jennifer, the founders).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { apiRequest, getQueryFn } from '@/lib/query-client';
import { apiErrorMessage, formatMoney } from '@/lib/tenant-api';
import { formatDate } from '@/lib/billing';

interface OwnerBilling {
  configured: boolean;
  mode: 'live' | 'test' | null;
  mrr: number;
  counts: Record<string, number>;
  foundersUsed: number;
  foundersCap: number;
  agents: { id: string; email: string; name: string; status: string; plan: string | null; interval: string | null; trialEndsAt: string; comped: boolean; onboarded: boolean; cancelAtPeriodEnd: boolean }[];
}

const STATUS: Record<string, { label: string; color: string }> = {
  paying: { label: 'Paying', color: '#34D399' },
  paid_trial: { label: 'Card on file (trial)', color: '#2DD4BF' },
  past_due: { label: 'Payment failed', color: '#F87171' },
  comped: { label: 'Comped', color: '#D4AF37' },
  team_member: { label: 'Team seat', color: '#818CF8' },
  trial: { label: 'Free trial', color: '#60A5FA' },
  starter: { label: 'Starter (free)', color: '#94A3B8' },
};

export function OwnerBillingPanel() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const q = useQuery<OwnerBilling | null>({ queryKey: ['/api/owner/billing'], queryFn: getQueryFn({ on401: 'returnNull' }) });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const toggleComp = async (id: string, comped: boolean) => {
    setBusyId(id); setError('');
    try {
      await apiRequest('POST', `/api/owner/agents/${id}/comp`, { comped, note: 'Comped by owner' });
      await qc.invalidateQueries({ queryKey: ['/api/owner/billing'] });
    } catch (e) { setError(apiErrorMessage(e)); } finally { setBusyId(null); }
  };

  if (q.isLoading) return <ActivityIndicator color="#2DD4BF" style={{ marginVertical: 20 }} />;
  const d = q.data;
  if (!d) return null;

  const tiles = [
    { label: 'Monthly revenue', value: formatMoney(d.mrr), color: '#34D399', icon: 'cash-outline' },
    { label: 'Paying agents', value: String(d.counts.paying ?? 0), color: '#2DD4BF', icon: 'card-outline' },
    { label: 'On free trial', value: String(d.counts.trialing ?? 0), color: '#60A5FA', icon: 'gift-outline' },
    { label: 'Founders seats', value: `${d.foundersUsed}/${d.foundersCap}`, color: '#D4AF37', icon: 'diamond-outline' },
  ];

  return (
    <View style={[styles.wrap, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]} testID="owner-billing-panel">
      <View style={styles.head}>
        <Ionicons name="card" size={20} color="#2DD4BF" />
        <Text style={[styles.title, { color: colors.text }]}>Subscriptions</Text>
        <View style={[styles.mode, { backgroundColor: !d.configured ? 'rgba(248,113,113,0.15)' : d.mode === 'live' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)' }]}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: !d.configured ? '#F87171' : d.mode === 'live' ? '#34D399' : '#FBBF24' }}>
            {!d.configured ? 'STRIPE NOT SET' : d.mode === 'live' ? 'LIVE' : 'TEST MODE'}
          </Text>
        </View>
      </View>

      <View style={styles.tiles}>
        {tiles.map((t) => (
          <View key={t.label} style={[styles.tile, { borderColor: t.color + '44' }]}>
            <Ionicons name={t.icon as any} size={16} color={t.color} />
            <Text style={[styles.tileValue, { color: colors.text }]}>{t.value}</Text>
            <Text style={[styles.tileLabel, { color: colors.textSecondary }]}>{t.label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        {d.counts.professional ?? 0} Professional · {d.counts.teamPlan ?? 0} Team · {d.counts.founders ?? 0} Founders · {d.counts.comped ?? 0} comped · {d.counts.starter ?? 0} on Starter
        {(d.counts.pastDue ?? 0) > 0 ? ` · ${d.counts.pastDue} payment failed` : ''}
      </Text>
      {error ? <Text style={{ color: '#F87171', marginTop: 8 }}>{error}</Text> : null}

      <Text style={[styles.listTitle, { color: colors.text }]}>Agents ({d.agents.length})</Text>
      {d.agents.length === 0 && <Text style={{ color: colors.textTertiary }}>No agents yet.</Text>}
      {d.agents.map((a, i) => {
        const st = STATUS[a.status] || STATUS.starter;
        return (
          <View key={a.id} style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{a.name || a.email}</Text>
              <Text style={[styles.meta, { color: colors.textTertiary }]} numberOfLines={1}>{a.email}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <View style={[styles.pill, { backgroundColor: st.color + '22' }]}>
                  <Text style={[styles.pillText, { color: st.color }]}>{st.label}{a.plan && (a.status === 'paying' || a.status === 'paid_trial') ? ` · ${a.plan}${a.interval === 'year' ? ' (yearly)' : ''}` : ''}</Text>
                </View>
                {a.status === 'trial' && <Text style={[styles.meta, { color: colors.textTertiary }]}>ends {formatDate(a.trialEndsAt)}</Text>}
                {a.cancelAtPeriodEnd && <Text style={[styles.meta, { color: '#FBBF24' }]}>canceling</Text>}
                {!a.onboarded && <Text style={[styles.meta, { color: colors.textTertiary }]}>not set up yet</Text>}
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              {busyId === a.id ? <ActivityIndicator color="#D4AF37" /> : (
                <Switch value={a.comped} onValueChange={(v) => toggleComp(a.id, v)} trackColor={{ false: colors.border, true: '#D4AF3788' }} thumbColor={a.comped ? '#D4AF37' : '#CBD5E1'} testID={`owner-comp-${i}`} />
              )}
              <Text style={[styles.meta, { color: colors.textTertiary }]}>Comp</Text>
            </View>
          </View>
        );
      })}
      <Pressable onPress={() => q.refetch()} style={styles.refresh}>
        <Ionicons name="refresh" size={14} color="#2DD4BF" />
        <Text style={{ color: '#2DD4BF', fontWeight: '600' }}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '800', flex: 1 },
  mode: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { flexGrow: 1, flexBasis: '45%', borderWidth: 1, borderRadius: 14, padding: 12 },
  tileValue: { fontSize: 22, fontWeight: '900', marginTop: 6 },
  tileLabel: { fontSize: 12, marginTop: 2 },
  sub: { fontSize: 12, marginTop: 10, lineHeight: 17 },
  listTitle: { fontSize: 15, fontWeight: '800', marginTop: 16, marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  name: { fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 11 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: '700' },
  refresh: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 12 },
});
