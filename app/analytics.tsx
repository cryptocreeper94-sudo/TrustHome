import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';

type Period = 'This Month' | 'Quarter' | 'Year';

interface PeriodData {
  closings: number;
  revenue: number;
  avgSalePrice: number;
  avgDOM: number;
  revenueByMonth: { label: string; value: number }[];
  funnel: { leads: number; showings: number; offers: number; closings: number };
  sources: { name: string; value: number; color: string }[];
  recentClosings: { address: string; price: number; date: string; commission: number }[];
  vsLast: { closings: number; revenue: number; avgSalePrice: number; avgDOM: number };
}

const DATA: Record<Period, PeriodData> = {
  'This Month': {
    closings: 3,
    revenue: 128500,
    avgSalePrice: 1425000,
    avgDOM: 24,
    revenueByMonth: [
      { label: 'Sep', value: 72000 },
      { label: 'Oct', value: 95000 },
      { label: 'Nov', value: 88000 },
      { label: 'Dec', value: 110000 },
      { label: 'Jan', value: 145000 },
      { label: 'Feb', value: 128500 },
    ],
    funnel: { leads: 42, showings: 18, offers: 7, closings: 3 },
    sources: [
      { name: 'Referrals', value: 38, color: '#1A8A7E' },
      { name: 'Zillow', value: 24, color: '#007AFF' },
      { name: 'Open House', value: 18, color: '#FF9500' },
      { name: 'Social Media', value: 12, color: '#AF52DE' },
      { name: 'Cold Outreach', value: 8, color: '#FF3B30' },
    ],
    recentClosings: [
      { address: '88 Maple Dr, Redwood City', price: 985000, date: 'Jan 31, 2026', commission: 29550 },
      { address: '220 Cedar Ln, Palo Alto', price: 1650000, date: 'Jan 18, 2026', commission: 49500 },
      { address: '415 Bay Ave, Menlo Park', price: 1640000, date: 'Feb 04, 2026', commission: 49200 },
    ],
    vsLast: { closings: 50, revenue: 12.3, avgSalePrice: 5.2, avgDOM: -8.5 },
  },
  Quarter: {
    closings: 9,
    revenue: 412000,
    avgSalePrice: 1380000,
    avgDOM: 27,
    revenueByMonth: [
      { label: 'Sep', value: 72000 },
      { label: 'Oct', value: 95000 },
      { label: 'Nov', value: 88000 },
      { label: 'Dec', value: 110000 },
      { label: 'Jan', value: 145000 },
      { label: 'Feb', value: 128500 },
    ],
    funnel: { leads: 128, showings: 54, offers: 19, closings: 9 },
    sources: [
      { name: 'Referrals', value: 45, color: '#1A8A7E' },
      { name: 'Zillow', value: 30, color: '#007AFF' },
      { name: 'Open House', value: 22, color: '#FF9500' },
      { name: 'Social Media', value: 18, color: '#AF52DE' },
      { name: 'Cold Outreach', value: 13, color: '#FF3B30' },
    ],
    recentClosings: [
      { address: '88 Maple Dr, Redwood City', price: 985000, date: 'Jan 31, 2026', commission: 29550 },
      { address: '220 Cedar Ln, Palo Alto', price: 1650000, date: 'Jan 18, 2026', commission: 49500 },
      { address: '415 Bay Ave, Menlo Park', price: 1640000, date: 'Feb 04, 2026', commission: 49200 },
      { address: '900 Willow St, San Carlos', price: 1120000, date: 'Dec 15, 2025', commission: 33600 },
    ],
    vsLast: { closings: 28.6, revenue: 18.7, avgSalePrice: 3.1, avgDOM: -12.0 },
  },
  Year: {
    closings: 31,
    revenue: 1420000,
    avgSalePrice: 1310000,
    avgDOM: 29,
    revenueByMonth: [
      { label: 'Sep', value: 72000 },
      { label: 'Oct', value: 95000 },
      { label: 'Nov', value: 88000 },
      { label: 'Dec', value: 110000 },
      { label: 'Jan', value: 145000 },
      { label: 'Feb', value: 128500 },
    ],
    funnel: { leads: 480, showings: 192, offers: 68, closings: 31 },
    sources: [
      { name: 'Referrals', value: 42, color: '#1A8A7E' },
      { name: 'Zillow', value: 28, color: '#007AFF' },
      { name: 'Open House', value: 15, color: '#FF9500' },
      { name: 'Social Media', value: 10, color: '#AF52DE' },
      { name: 'Cold Outreach', value: 5, color: '#FF3B30' },
    ],
    recentClosings: [
      { address: '88 Maple Dr, Redwood City', price: 985000, date: 'Jan 31, 2026', commission: 29550 },
      { address: '220 Cedar Ln, Palo Alto', price: 1650000, date: 'Jan 18, 2026', commission: 49500 },
      { address: '415 Bay Ave, Menlo Park', price: 1640000, date: 'Feb 04, 2026', commission: 49200 },
      { address: '900 Willow St, San Carlos', price: 1120000, date: 'Dec 15, 2025', commission: 33600 },
    ],
    vsLast: { closings: 14.8, revenue: 22.1, avgSalePrice: 6.8, avgDOM: -4.2 },
  },
};

function formatCurrency(val: number): string {
  if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
  if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K';
  return '$' + val.toLocaleString();
}

export default function AnalyticsScreen() {
  const { colors, isDark } = useTheme();
  const [period, setPeriod] = useState<Period>('This Month');
  const data = DATA[period];

  const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.value));
  const maxSource = Math.max(...data.sources.map(s => s.value));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Analytics" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.periodRow}>
          {(['This Month', 'Quarter', 'Year'] as Period[]).map(p => {
            const isActive = period === p;
            return (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[styles.periodPill, { backgroundColor: isActive ? colors.primary : colors.cardGlass, borderColor: isActive ? colors.primary : colors.border }]}
              >
                <Text style={[styles.periodText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Closings', value: data.closings.toString(), icon: 'checkmark-circle' as const, color: '#34C759' },
            { label: 'Revenue', value: formatCurrency(data.revenue), icon: 'cash' as const, color: '#1A8A7E' },
            { label: 'Avg Sale Price', value: formatCurrency(data.avgSalePrice), icon: 'trending-up' as const, color: '#007AFF' },
            { label: 'Avg DOM', value: data.avgDOM + 'd', icon: 'time' as const, color: '#FF9500' },
          ].map(stat => (
            <GlassCard key={stat.label} compact style={styles.statCard}>
              <View style={styles.statInner}>
                <Ionicons name={stat.icon} size={18} color={stat.color} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <GlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue Trend</Text>
          <View style={styles.chartContainer}>
            {data.revenueByMonth.map((m, i) => {
              const heightPct = (m.value / maxRevenue) * 100;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrap}>
                    <View style={[styles.bar, { height: `${heightPct}%` as any, backgroundColor: colors.primary, opacity: 0.6 + (i / data.revenueByMonth.length) * 0.4 }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{m.label}</Text>
                  <Text style={[styles.barValue, { color: colors.textTertiary }]}>{formatCurrency(m.value)}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conversion Funnel</Text>
          {[
            { label: 'Leads', value: data.funnel.leads, pct: null },
            { label: 'Showings', value: data.funnel.showings, pct: ((data.funnel.showings / data.funnel.leads) * 100).toFixed(1) },
            { label: 'Offers', value: data.funnel.offers, pct: ((data.funnel.offers / data.funnel.showings) * 100).toFixed(1) },
            { label: 'Closings', value: data.funnel.closings, pct: ((data.funnel.closings / data.funnel.offers) * 100).toFixed(1) },
          ].map((step, i, arr) => (
            <View key={step.label}>
              <View style={styles.funnelRow}>
                <View style={[styles.funnelBar, { width: `${(step.value / data.funnel.leads) * 100}%` as any, backgroundColor: colors.primary, opacity: 1 - (i * 0.15) }]} />
                <View style={styles.funnelLabelRow}>
                  <Text style={[styles.funnelLabel, { color: colors.text }]}>{step.label}</Text>
                  <Text style={[styles.funnelValue, { color: colors.text }]}>{step.value}</Text>
                  {step.pct && <Text style={[styles.funnelPct, { color: colors.textSecondary }]}>{step.pct}%</Text>}
                </View>
              </View>
              {i < arr.length - 1 && (
                <View style={styles.funnelArrow}>
                  <Ionicons name="arrow-down" size={14} color={colors.textTertiary} />
                </View>
              )}
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Sources</Text>
          {data.sources.map(source => (
            <View key={source.name} style={styles.sourceRow}>
              <Text style={[styles.sourceLabel, { color: colors.text }]}>{source.name}</Text>
              <View style={styles.sourceBarWrap}>
                <View style={[styles.sourceBar, { width: `${(source.value / maxSource) * 100}%` as any, backgroundColor: source.color }]} />
              </View>
              <Text style={[styles.sourcePct, { color: colors.textSecondary }]}>{source.value}%</Text>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Closings</Text>
          {data.recentClosings.map((closing, i) => (
            <View key={i} style={[styles.closingRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={styles.closingInfo}>
                <Text style={[styles.closingAddr, { color: colors.text }]} numberOfLines={1}>{closing.address}</Text>
                <Text style={[styles.closingDate, { color: colors.textSecondary }]}>{closing.date}</Text>
              </View>
              <View style={styles.closingRight}>
                <Text style={[styles.closingPrice, { color: colors.text }]}>{formatCurrency(closing.price)}</Text>
                <Text style={[styles.closingComm, { color: colors.primary }]}>+{formatCurrency(closing.commission)}</Text>
              </View>
            </View>
          ))}
        </GlassCard>

        <GlassCard style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>vs Last Period</Text>
          <View style={styles.compGrid}>
            {[
              { label: 'Closings', value: data.vsLast.closings },
              { label: 'Revenue', value: data.vsLast.revenue },
              { label: 'Avg Sale Price', value: data.vsLast.avgSalePrice },
              { label: 'Avg DOM', value: data.vsLast.avgDOM },
            ].map(item => {
              const isPositive = item.label === 'Avg DOM' ? item.value < 0 : item.value > 0;
              const displayVal = Math.abs(item.value).toFixed(1);
              return (
                <View key={item.label} style={styles.compItem}>
                  <View style={styles.compIconRow}>
                    <Ionicons
                      name={item.value >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={16}
                      color={isPositive ? '#34C759' : '#FF3B30'}
                    />
                    <Text style={[styles.compPct, { color: isPositive ? '#34C759' : '#FF3B30' }]}>{displayVal}%</Text>
                  </View>
                  <Text style={[styles.compLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  periodPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  periodText: { fontSize: 13, fontWeight: '600' as const },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 10, paddingHorizontal: 16, marginTop: 16 },
  statCard: { width: '47%' as any, minHeight: 80, flexGrow: 1 },
  statInner: { alignItems: 'center' as const, gap: 3 },
  statValue: { fontSize: 20, fontWeight: '700' as const },
  statLabel: { fontSize: 10, fontWeight: '500' as const, textAlign: 'center' as const },
  sectionCard: { marginHorizontal: 16, marginTop: 16, minHeight: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 14 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' as const, height: 140, gap: 4 },
  barCol: { flex: 1, alignItems: 'center' as const, gap: 4 },
  barWrap: { flex: 1, width: '70%', justifyContent: 'flex-end' as const },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, fontWeight: '500' as const },
  barValue: { fontSize: 8 },
  funnelRow: { marginVertical: 2, height: 36, justifyContent: 'center' as const, borderRadius: 8, overflow: 'hidden' },
  funnelBar: { position: 'absolute' as const, left: 0, top: 0, bottom: 0, borderRadius: 8 },
  funnelLabelRow: { flexDirection: 'row', alignItems: 'center' as const, paddingHorizontal: 12, gap: 8, zIndex: 1 },
  funnelLabel: { fontSize: 13, fontWeight: '600' as const },
  funnelValue: { fontSize: 13, fontWeight: '700' as const },
  funnelPct: { fontSize: 11, marginLeft: 'auto' as any },
  funnelArrow: { alignItems: 'center' as const, marginVertical: 2 },
  sourceRow: { flexDirection: 'row', alignItems: 'center' as const, marginBottom: 10, gap: 8 },
  sourceLabel: { width: 90, fontSize: 12, fontWeight: '500' as const },
  sourceBarWrap: { flex: 1, height: 12, backgroundColor: 'rgba(128,128,128,0.1)', borderRadius: 6, overflow: 'hidden' },
  sourceBar: { height: '100%', borderRadius: 6 },
  sourcePct: { width: 36, textAlign: 'right' as const, fontSize: 12, fontWeight: '600' as const },
  closingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' as const, paddingVertical: 10 },
  closingInfo: { flex: 1, marginRight: 12 },
  closingAddr: { fontSize: 13, fontWeight: '600' as const },
  closingDate: { fontSize: 11, marginTop: 2 },
  closingRight: { alignItems: 'flex-end' as const },
  closingPrice: { fontSize: 14, fontWeight: '700' as const },
  closingComm: { fontSize: 11, fontWeight: '600' as const },
  compGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12 },
  compItem: { width: '45%' as any, alignItems: 'center' as const, paddingVertical: 10, flexGrow: 1 },
  compIconRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 4 },
  compPct: { fontSize: 18, fontWeight: '700' as const },
  compLabel: { fontSize: 11, fontWeight: '500' as const, marginTop: 4 },
});
