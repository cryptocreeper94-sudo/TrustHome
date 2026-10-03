/**
 * Plan & Billing — current plan, trial countdown, usage, choose/manage plan, team seats.
 * Server: server/billing.ts
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { Footer } from '@/components/ui/Footer';
import { apiRequest, getQueryFn } from '@/lib/query-client';
import { apiErrorMessage, formatBytes, formatMoney } from '@/lib/tenant-api';
import {
  useBillingStatus, usePublicPlans, startCheckout, openBillingPortal, confirmCheckout, useRefreshAccount,
  PLAN_CARDS, PLAN_LABEL, STARTER_FEATURES, formatDate, type BillingInterval, type PaidPlan, type BillingStatus,
} from '@/lib/billing';

const CARD_W = 270;

interface TeamInfo {
  isTeamLead: boolean;
  memberOf: string | null;
  seatLimit: number;
  seats: { id: string; email: string; joined: boolean; name: string | null; contacts: number; activeDeals: number; closedDeals: number; closedVolume: number }[];
}

function planSummary(s: BillingStatus): { title: string; detail: string; color: string; icon: any } {
  switch (s.source) {
    case 'trial':
      return {
        title: 'Free trial', color: '#2DD4BF', icon: 'gift',
        detail: `You have every Professional feature free for ${s.trialDaysLeft} more day${s.trialDaysLeft === 1 ? '' : 's'} (until ${formatDate(s.trialEndsAt)}). No card needed. Pick a plan any time — you won't be charged until the trial ends.`,
      };
    case 'comped':
      return { title: 'Professional — complimentary', color: '#D4AF37', icon: 'star', detail: 'Your account is covered by TrustHome. Everything is unlocked.' };
    case 'team':
      return { title: 'Professional — team seat', color: '#818CF8', icon: 'people', detail: `${s.teamOwnerName || 'Your team lead'} covers your plan. Your clients and deals are still private to you.` };
    case 'subscription': {
      const name = PLAN_LABEL[s.plan || s.tier];
      const when = s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : '';
      let detail = s.interval === 'year' ? 'Billed yearly.' : 'Billed monthly.';
      if (s.subStatus === 'trialing') detail = `Your card is saved. First charge on ${formatDate(s.trialEndsAt || s.currentPeriodEnd)}.`;
      else if (s.subStatus === 'past_due') detail = 'Your last payment didn\u2019t go through. Tap "Manage billing" to update your card.';
      else if (s.cancelAtPeriodEnd) detail = `Your plan is set to end on ${when}. You can turn it back on from "Manage billing".`;
      else if (when) detail += ` Renews ${when}.`;
      return { title: name, color: s.subStatus === 'past_due' ? '#F87171' : '#2DD4BF', icon: 'checkmark-circle', detail };
    }
    default:
      return {
        title: 'Starter (free)', color: '#94A3B8', icon: 'leaf',
        detail: 'Your free trial has ended, so you\u2019re on the free plan. Nothing was deleted — upgrade any time to unlock everything again.',
      };
  }
}

function Meter({ label, used, limit, format }: { label: string; used: number; limit: number | null; format?: (n: number) => string }) {
  const { colors } = useTheme();
  const f = format || ((n: number) => String(n));
  const pct = limit ? Math.min(1, used / limit) : 0;
  const barColor = pct >= 1 ? '#F87171' : pct >= 0.8 ? '#FBBF24' : '#2DD4BF';
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.meterHead}>
        <Text style={[styles.meterLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.meterValue, { color: colors.textSecondary }]}>
          {f(used)}{limit ? ` of ${f(limit)}` : ' · unlimited'}
        </Text>
      </View>
      {limit ? (
        <View style={[styles.meterTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.meterFill, { width: `${Math.max(3, pct * 100)}%`, backgroundColor: barColor }]} />
        </View>
      ) : null}
    </View>
  );
}

export default function BillingScreen() {
  const { colors, isDark } = useTheme();
  const { isRealAgent, isLoading: authLoading } = useApp();
  const router = useRouter();
  const params = useLocalSearchParams<{ checkout?: string; session_id?: string }>();
  const qc = useQueryClient();
  const refresh = useRefreshAccount();
  const status = useBillingStatus();
  const plans = usePublicPlans();
  const team = useQuery<TeamInfo | null>({ queryKey: ['/api/team'], queryFn: getQueryFn({ on401: 'returnNull' }), enabled: isRealAgent });

  const [interval, setInterval] = useState<BillingInterval>('month');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [banner, setBanner] = useState<{ kind: 'ok' | 'info'; text: string } | null>(null);
  const [seatEmail, setSeatEmail] = useState('');

  // Returning from Stripe Checkout
  useEffect(() => {
    if (!isRealAgent) return;
    if (params.checkout === 'success' && params.session_id) {
      setBanner({ kind: 'ok', text: 'Finishing up\u2026' });
      confirmCheckout(String(params.session_id))
        .then(() => setBanner({ kind: 'ok', text: 'You\u2019re all set! Your plan is active. Thank you for supporting TrustHome.' }))
        .catch(() => setBanner({ kind: 'ok', text: 'Payment received. Your plan will update in a moment.' }))
        .finally(() => refresh());
    } else if (params.checkout === 'canceled') {
      setBanner({ kind: 'info', text: 'No problem — nothing was charged. You can pick a plan whenever you\u2019re ready.' });
    }
  }, [params.checkout, params.session_id, isRealAgent]);

  const choose = async (plan: PaidPlan) => {
    setError('');
    setBusy(plan);
    try {
      await startCheckout(plan, interval);
    } catch (e) {
      setError(apiErrorMessage(e));
      setBusy(null);
    }
  };

  const manage = async () => {
    setError('');
    setBusy('portal');
    try { await openBillingPortal(); } catch (e) { setError(apiErrorMessage(e)); } finally { setBusy(null); }
  };

  const addSeat = async () => {
    if (!seatEmail.trim()) return;
    setError('');
    setBusy('seat');
    try {
      await apiRequest('POST', '/api/team/seats', { email: seatEmail.trim() });
      setSeatEmail('');
      qc.invalidateQueries({ queryKey: ['/api/team'] });
    } catch (e) { setError(apiErrorMessage(e)); } finally { setBusy(null); }
  };

  const removeSeat = async (id: string, email: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && !window.confirm(`Remove ${email} from your team? Their own data stays with them.`)) return;
    try {
      await apiRequest('DELETE', `/api/team/seats/${id}`);
      qc.invalidateQueries({ queryKey: ['/api/team'] });
    } catch (e) { setError(apiErrorMessage(e)); }
  };

  const s = status.data;
  const summary = s ? planSummary(s) : null;
  const hasPaid = s?.source === 'subscription';
  const foundersLeft = s?.foundersRemaining ?? plans.data?.foundersRemaining ?? 100;
  const stripeReady = plans.data?.configured !== false;

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Header title="Plan & Billing" showBack />

        <View style={styles.section}>
          {!isRealAgent ? (
            <GlassCard>
              <Text style={[styles.h2, { color: colors.text }]}>Sign in to see your plan</Text>
              <Text style={[styles.body, { color: colors.textSecondary }]}>
                Every new agent gets {plans.data?.trialDays ?? 14} days of Professional free — no card needed.
              </Text>
              <Pressable style={styles.primaryBtn} onPress={() => router.push('/team' as any)} testID="billing-signin-btn">
                <Text style={styles.primaryBtnText}>{authLoading ? 'Loading\u2026' : 'Sign in or create account'}</Text>
              </Pressable>
              <Pressable style={styles.linkBtn} onPress={() => router.push('/pricing' as any)}>
                <Text style={{ color: '#2DD4BF', fontWeight: '600' }}>Compare plans</Text>
              </Pressable>
            </GlassCard>
          ) : status.isLoading || !s || !summary ? (
            <ActivityIndicator style={{ marginTop: 40 }} color="#2DD4BF" />
          ) : (
            <>
              {banner && (
                <Animated.View entering={FadeInDown.duration(300)} style={[styles.banner, { backgroundColor: banner.kind === 'ok' ? 'rgba(52,211,153,0.12)' : 'rgba(96,165,250,0.12)', borderColor: banner.kind === 'ok' ? 'rgba(52,211,153,0.4)' : 'rgba(96,165,250,0.4)' }]}>
                  <Ionicons name={banner.kind === 'ok' ? 'checkmark-circle' : 'information-circle'} size={20} color={banner.kind === 'ok' ? '#34D399' : '#60A5FA'} />
                  <Text style={[styles.bannerText, { color: colors.text }]}>{banner.text}</Text>
                </Animated.View>
              )}

              {/* Current plan */}
              <Animated.View entering={FadeInDown.duration(400)}>
                <LinearGradient
                  colors={isDark ? ['#0F2A2E', '#111827'] : ['#E6FFFB', '#FFFFFF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.hero, { borderColor: summary.color + '55' }]}
                >
                  <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>YOUR PLAN</Text>
                  <View style={styles.heroRow}>
                    <View style={[styles.heroIcon, { backgroundColor: summary.color + '22' }]}>
                      <Ionicons name={summary.icon} size={26} color={summary.color} />
                    </View>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>{summary.title}</Text>
                  </View>
                  <Text style={[styles.body, { color: colors.textSecondary }]}>{summary.detail}</Text>
                  {s.source === 'trial' && (
                    <View style={[styles.meterTrack, { backgroundColor: colors.border, marginTop: 14 }]}>
                      <View style={[styles.meterFill, { width: `${Math.max(4, (s.trialDaysLeft / 14) * 100)}%`, backgroundColor: '#2DD4BF' }]} />
                    </View>
                  )}
                  {s.hasBillingAccount && (
                    <Pressable style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={manage} disabled={busy === 'portal'} testID="billing-manage-btn">
                      {busy === 'portal' ? <ActivityIndicator color="#2DD4BF" /> : (
                        <>
                          <Ionicons name="card-outline" size={18} color={colors.text} />
                          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Manage billing</Text>
                        </>
                      )}
                    </Pressable>
                  )}
                  {s.hasBillingAccount && (
                    <Text style={[styles.fine, { color: colors.textTertiary }]}>Update your card, switch plans, see receipts, or cancel.</Text>
                  )}
                </LinearGradient>
              </Animated.View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* Usage */}
              <Animated.View entering={FadeInDown.duration(400).delay(100)} style={{ marginTop: 18 }}>
                <GlassCard>
                  <Text style={[styles.h3, { color: colors.text }]}>What you're using</Text>
                  <Meter label="Clients" used={s.usage.contacts} limit={s.limits.contacts} />
                  <Meter label="Active deals" used={s.usage.activeDeals} limit={s.limits.activeDeals} />
                  <Meter label="Document storage" used={s.usage.storageBytes} limit={s.limits.storageBytes} format={formatBytes} />
                </GlassCard>
              </Animated.View>
            </>
          )}
        </View>

        {/* Plan choices */}
        {isRealAgent && s && !hasPaid && s.source !== 'comped' && s.source !== 'team' && (
          <Animated.View entering={FadeInDown.duration(400).delay(150)}>
            <View style={[styles.section, { paddingBottom: 0 }]}>
              <Text style={[styles.h2, { color: colors.text }]}>{s.source === 'trial' ? 'Keep everything after your trial' : 'Unlock everything again'}</Text>
              {s.source === 'trial' && (
                <Text style={[styles.body, { color: colors.textSecondary, marginBottom: 10 }]}>
                  Choosing a plan now just saves your card. You won't be charged until {formatDate(s.trialEndsAt)}.
                </Text>
              )}
              <View style={[styles.toggleWrap, { backgroundColor: isDark ? '#111827' : '#F1F5F9', borderColor: colors.border }]}>
                {(['month', 'year'] as const).map((iv) => (
                  <Pressable key={iv} onPress={() => setInterval(iv)} style={[styles.toggleBtn, interval === iv && { backgroundColor: '#1A8A7E' }]} testID={`billing-interval-${iv}`}>
                    <Text style={[styles.toggleText, { color: interval === iv ? '#FFFFFF' : colors.textSecondary }]}>
                      {iv === 'month' ? 'Monthly' : 'Yearly · save 20%'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {!stripeReady && <Text style={styles.error}>Online payments aren't switched on yet. Please check back soon.</Text>}
            </View>
            <HorizontalCarousel itemWidth={CARD_W} style={{ marginTop: 6 }}>
              {PLAN_CARDS.map((p) => {
                const full = p.id === 'founders' && foundersLeft <= 0;
                const price = interval === 'month' ? p.month : p.yearMonthly;
                return (
                  <View key={p.id} style={[styles.planCard, { width: CARD_W, backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: p.color + '66' }]}>
                    {p.badge && (
                      <View style={[styles.badge, { backgroundColor: p.color + '22' }]}>
                        <Text style={[styles.badgeText, { color: p.color }]}>{p.id === 'founders' ? `${foundersLeft} of 100 left` : p.badge}</Text>
                      </View>
                    )}
                    <Ionicons name={p.icon as any} size={26} color={p.color} />
                    <Text style={[styles.planName, { color: colors.text }]}>{p.name}</Text>
                    <Text style={[styles.planPrice, { color: colors.text }]}>
                      ${price}<Text style={[styles.planPer, { color: colors.textSecondary }]}>/month</Text>
                    </Text>
                    <Text style={[styles.fine, { color: colors.textTertiary, marginTop: 0 }]}>
                      {interval === 'year' ? `$${p.yearTotal} billed once a year` : 'Billed monthly · cancel any time'}
                    </Text>
                    <Text style={[styles.planTag, { color: colors.textSecondary }]}>{p.tagline}</Text>
                    {p.features.map((f) => (
                      <View key={f} style={styles.featRow}>
                        <Ionicons name="checkmark" size={16} color={p.color} />
                        <Text style={[styles.featText, { color: colors.text }]}>{f}</Text>
                      </View>
                    ))}
                    <Pressable
                      onPress={() => choose(p.id)}
                      disabled={!!busy || full || !stripeReady}
                      style={({ pressed }) => [styles.planBtn, { backgroundColor: full ? '#475569' : p.color, opacity: pressed ? 0.85 : 1 }]}
                      testID={`billing-choose-${p.id}`}
                    >
                      {busy === p.id ? <ActivityIndicator color="#0B1021" /> : (
                        <Text style={styles.planBtnText}>{full ? 'Sold out' : `Choose ${p.name}`}</Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </HorizontalCarousel>
            <View style={styles.section}>
              <GlassCard compact>
                <Text style={[styles.h3, { color: colors.text, marginBottom: 6 }]}>Or stay on Starter — free</Text>
                {STARTER_FEATURES.map((f) => (
                  <View key={f} style={styles.featRow}>
                    <Ionicons name="checkmark" size={16} color="#94A3B8" />
                    <Text style={[styles.featText, { color: colors.textSecondary }]}>{f}</Text>
                  </View>
                ))}
                <Text style={[styles.fine, { color: colors.textTertiary }]}>Your clients and their messages are always free for them.</Text>
              </GlassCard>
            </View>
          </Animated.View>
        )}

        {/* Team */}
        {isRealAgent && team.data && (team.data.isTeamLead || team.data.memberOf) && (
          <View style={styles.section}>
            <GlassCard>
              <View style={styles.heroRow}>
                <Ionicons name="people" size={22} color="#818CF8" />
                <Text style={[styles.h3, { color: colors.text, marginBottom: 0 }]}>Your team</Text>
              </View>
              {team.data.memberOf && !team.data.isTeamLead ? (
                <Text style={[styles.body, { color: colors.textSecondary }]}>You're on {team.data.memberOf}'s team. Your plan is covered.</Text>
              ) : (
                <>
                  <Text style={[styles.body, { color: colors.textSecondary }]}>
                    Add up to {team.data.seatLimit} agents by email. Each gets Professional and their own private workspace. {team.data.seats.length} of {team.data.seatLimit} used.
                  </Text>
                  <View style={styles.seatAddRow}>
                    <TextInput
                      value={seatEmail}
                      onChangeText={setSeatEmail}
                      placeholder="agent@email.com"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#0B1021' : '#F8FAFC' }]}
                      testID="team-seat-email"
                    />
                    <Pressable style={[styles.addSeatBtn, { opacity: busy === 'seat' ? 0.7 : 1 }]} onPress={addSeat} disabled={busy === 'seat'} testID="team-seat-add">
                      {busy === 'seat' ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Add</Text>}
                    </Pressable>
                  </View>
                  {team.data.seats.map((seat) => (
                    <View key={seat.id} style={[styles.seatRow, { borderTopColor: colors.divider }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.seatName, { color: colors.text }]}>{seat.name || seat.email}</Text>
                        <Text style={[styles.fine, { color: colors.textTertiary, marginTop: 2 }]}>
                          {seat.joined
                            ? `${seat.contacts} clients · ${seat.activeDeals} active deals · ${seat.closedDeals} closed (${formatMoney(seat.closedVolume)})`
                            : 'Invite sent — waiting for them to create their account'}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeSeat(seat.id, seat.email)} hitSlop={8}>
                        <Text style={{ color: '#F87171', fontWeight: '600' }}>Remove</Text>
                      </Pressable>
                    </View>
                  ))}
                </>
              )}
            </GlassCard>
          </View>
        )}

        {isRealAgent && (
          <View style={[styles.section, { paddingTop: 0 }]}>
            <Text style={[styles.fine, { color: colors.textTertiary, textAlign: 'center' }]}>
              Payments are handled securely by Stripe. TrustHome never sees your card number.
            </Text>
          </View>
        )}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  h2: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  h3: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 14, lineHeight: 21 },
  fine: { fontSize: 12, lineHeight: 17, marginTop: 8 },
  error: { color: '#F87171', fontSize: 14, marginTop: 12 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 20 },
  hero: { borderRadius: 22, borderWidth: 1, padding: 20 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  heroIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', flexShrink: 1 },
  meterHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  meterLabel: { fontSize: 14, fontWeight: '600' },
  meterValue: { fontSize: 13 },
  meterTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: 4 },
  primaryBtn: { marginTop: 16, backgroundColor: '#1A8A7E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  linkBtn: { alignItems: 'center', paddingVertical: 12 },
  secondaryBtn: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  secondaryBtnText: { fontSize: 15, fontWeight: '700' },
  toggleWrap: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 4, marginTop: 6 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  toggleText: { fontSize: 14, fontWeight: '700' },
  planCard: { borderRadius: 20, borderWidth: 1, padding: 18 },
  badge: { position: 'absolute', top: 14, right: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  planName: { fontSize: 18, fontWeight: '800', marginTop: 10 },
  planPrice: { fontSize: 32, fontWeight: '900', marginTop: 6 },
  planPer: { fontSize: 14, fontWeight: '600' },
  planTag: { fontSize: 13, lineHeight: 19, marginTop: 10, marginBottom: 10 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 3 },
  featText: { fontSize: 14, flexShrink: 1 },
  planBtn: { marginTop: 16, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  planBtnText: { color: '#0B1021', fontSize: 15, fontWeight: '800' },
  seatAddRow: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 6 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  addSeatBtn: { backgroundColor: '#1A8A7E', paddingHorizontal: 18, borderRadius: 12, justifyContent: 'center' },
  seatRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderTopWidth: 1 },
  seatName: { fontSize: 15, fontWeight: '600' },
});
