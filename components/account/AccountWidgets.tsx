/**
 * Dashboard widgets for real signed-in agents:
 *  - PlanBanner: trial countdown / Starter upgrade / payment problem
 *  - FaceIdNudge: one-tap "sign in faster next time" (until set up or dismissed)
 *  - GettingStartedCard: checklist that links to each screen
 *  - useOnboardingRedirect: sends agents who haven't finished onboarding to /onboarding
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import {
  useBillingStatus, useChecklist, usePasskeys, passkeysSupported, biometricName, registerPasskey, useRefreshAccount, formatDate,
} from '@/lib/billing';
import { apiErrorMessage } from '@/lib/tenant-api';

export function useOnboardingRedirect() {
  const { isRealAgent } = useApp();
  const status = useBillingStatus();
  const router = useRouter();
  useEffect(() => {
    if (isRealAgent && status.data && status.data.onboardingCompleted === false) {
      router.replace('/onboarding' as any);
    }
  }, [isRealAgent, status.data?.onboardingCompleted]);
}

export function PlanBanner() {
  const { isRealAgent } = useApp();
  const { data: s } = useBillingStatus();
  const router = useRouter();
  if (!isRealAgent || !s) return null;

  let icon: any = 'gift';
  let color = '#2DD4BF';
  let title = '';
  let text = '';
  let cta = 'See plans';

  if (s.source === 'trial') {
    title = `${s.trialDaysLeft} day${s.trialDaysLeft === 1 ? '' : 's'} left in your free trial`;
    text = `Everything is unlocked until ${formatDate(s.trialEndsAt)}. No card needed yet.`;
    if (s.trialDaysLeft <= 3) color = '#FBBF24';
  } else if (s.source === 'starter') {
    icon = 'leaf'; color = '#94A3B8';
    title = 'You\u2019re on the free Starter plan';
    text = 'Upgrade any time to get unlimited clients and deals again. Nothing was deleted.';
    cta = 'Upgrade';
  } else if (s.subStatus === 'past_due') {
    icon = 'alert-circle'; color = '#F87171';
    title = 'Your last payment didn\u2019t go through';
    text = 'Update your card to keep everything running.';
    cta = 'Fix it';
  } else {
    return null;
  }

  return (
    <Pressable onPress={() => router.push('/billing' as any)} style={[styles.banner, { borderColor: color + '66', backgroundColor: color + '14' }]} testID="dashboard-plan-banner">
      <Ionicons name={icon} size={22} color={color} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.bannerTitle, { color }]}>{title}</Text>
        <Text style={styles.bannerText}>{text}</Text>
      </View>
      <View style={[styles.bannerCta, { backgroundColor: color }]}>
        <Text style={styles.bannerCtaText}>{cta}</Text>
      </View>
    </Pressable>
  );
}

const NUDGE_KEY = 'trusthome_faceid_nudge_dismissed';

export function FaceIdNudge() {
  const { isRealAgent } = useApp();
  const { colors } = useTheme();
  const passkeys = usePasskeys();
  const refresh = useRefreshAccount();
  const [dismissed, setDismissed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => { AsyncStorage.getItem(NUDGE_KEY).then((v) => setDismissed(!!v)); }, []);

  if (!isRealAgent || !passkeysSupported() || dismissed || !passkeys.data || (passkeys.data.length > 0 && !done)) return null;
  const bio = biometricName();

  const turnOn = async () => {
    setBusy(true); setErr('');
    try {
      await registerPasskey();
      setDone(true);
      refresh();
      setTimeout(() => { AsyncStorage.setItem(NUDGE_KEY, '1'); setDismissed(true); }, 2500);
    } catch (e) {
      if (!(e instanceof Error && e.message === 'cancelled')) setErr(apiErrorMessage(e));
    } finally { setBusy(false); }
  };

  return (
    <LinearGradient colors={['#0F2A2E', '#111827']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.nudge}>
      <Ionicons name={done ? 'checkmark-circle' : bio === 'Face ID' ? 'scan' : 'finger-print'} size={30} color={done ? '#34D399' : '#2DD4BF'} />
      <View style={{ flex: 1 }}>
        <Text style={styles.nudgeTitle}>{done ? `${bio} is on!` : `Sign in faster with ${bio}`}</Text>
        <Text style={styles.nudgeText}>{done ? 'Next time, just tap the button and look at your phone.' : 'No password or email code next time. Takes 5 seconds.'}</Text>
        {err ? <Text style={styles.err}>{err}</Text> : null}
      </View>
      {!done && (
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Pressable onPress={turnOn} disabled={busy} style={styles.nudgeBtn} testID="dashboard-faceid-btn">
            {busy ? <ActivityIndicator color="#0B1021" size="small" /> : <Text style={styles.nudgeBtnText}>Turn on</Text>}
          </Pressable>
          <Pressable onPress={() => { AsyncStorage.setItem(NUDGE_KEY, '1'); setDismissed(true); }} hitSlop={6}>
            <Text style={{ color: colors.textTertiary || '#94A3B8', fontSize: 12 }}>Not now</Text>
          </Pressable>
        </View>
      )}
    </LinearGradient>
  );
}

const CHECK_ICON: Record<string, any> = {
  profile: 'person-circle-outline', client: 'person-add-outline', deal: 'git-branch-outline', document: 'document-attach-outline',
  message: 'chatbubbles-outline', passkey: 'finger-print-outline', plan: 'card-outline',
};

export function GettingStartedCard() {
  const { isRealAgent } = useApp();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { data } = useChecklist();
  const [hidden, setHidden] = useState(false);
  if (!isRealAgent || !data || hidden || data.completed >= data.total) return null;
  const items = data.items.filter((it) => it.key !== 'passkey' || passkeysSupported());
  const done = items.filter((i) => i.done).length;

  return (
    <View style={[styles.checkCard, { backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : '#FFFFFF', borderColor: colors.border }]} testID="dashboard-getting-started">
      <View style={styles.checkHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.checkTitle, { color: colors.text }]}>Getting started</Text>
          <Text style={[styles.checkSub, { color: colors.textSecondary }]}>{done} of {items.length} done — tap any step</Text>
        </View>
        <Pressable onPress={() => setHidden(true)} hitSlop={8}>
          <Ionicons name="close" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <View style={[styles.fill, { width: `${(done / Math.max(1, items.length)) * 100}%` }]} />
      </View>
      {items.map((it) => (
        <Pressable key={it.key} onPress={() => router.push(it.route as any)} style={styles.checkRow} testID={`checklist-${it.key}`}>
          <Ionicons name={it.done ? 'checkmark-circle' : CHECK_ICON[it.key] || 'ellipse-outline'} size={22} color={it.done ? '#34D399' : '#2DD4BF'} />
          <Text style={[styles.checkLabel, { color: it.done ? colors.textTertiary : colors.text, textDecorationLine: it.done ? 'line-through' : 'none' }]}>{it.label}</Text>
          {!it.done && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />}
        </Pressable>
      ))}
      <Pressable onPress={() => router.push('/guide' as any)} style={styles.guideLink} testID="checklist-guide">
        <Ionicons name="book-outline" size={16} color="#2DD4BF" />
        <Text style={styles.guideLinkText}>See the picture guide: How TrustHome works</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '800' },
  bannerText: { fontSize: 13, color: '#94A3B8', marginTop: 2, lineHeight: 18 },
  bannerCta: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  bannerCtaText: { color: '#0B1021', fontWeight: '800', fontSize: 13 },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(45,212,191,0.35)' },
  nudgeTitle: { color: '#F8FAFC', fontSize: 15, fontWeight: '800' },
  nudgeText: { color: '#CBD5E1', fontSize: 13, marginTop: 2, lineHeight: 18 },
  nudgeBtn: { backgroundColor: '#2DD4BF', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, minWidth: 76, alignItems: 'center' },
  nudgeBtnText: { color: '#0B1021', fontWeight: '800', fontSize: 13 },
  err: { color: '#F87171', fontSize: 12, marginTop: 4 },
  checkCard: { marginHorizontal: 16, marginBottom: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  checkHead: { flexDirection: 'row', alignItems: 'flex-start' },
  checkTitle: { fontSize: 17, fontWeight: '800' },
  checkSub: { fontSize: 13, marginTop: 2 },
  track: { height: 6, borderRadius: 3, overflow: 'hidden', marginVertical: 12 },
  fill: { height: 6, borderRadius: 3, backgroundColor: '#2DD4BF' },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  checkLabel: { flex: 1, fontSize: 15 },
  guideLink: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 10 },
  guideLinkText: { color: '#2DD4BF', fontSize: 14, fontWeight: '600' },
});
