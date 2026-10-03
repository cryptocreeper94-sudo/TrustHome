/**
 * First-time agent onboarding (shown once, right after creating an account).
 * Welcome/trial → About you → Face ID → First client → How it works → Plan → Done
 */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInRight, FadeInDown } from 'react-native-reanimated';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/query-client';
import { apiErrorMessage } from '@/lib/tenant-api';
import {
  passkeysSupported, biometricName, registerPasskey, useRefreshAccount, PLAN_CARDS, INTENDED_PLAN_KEY, startCheckout,
  type PaidPlan,
} from '@/lib/billing';

type StepKey = 'welcome' | 'profile' | 'faceid' | 'client' | 'tour' | 'plan';

const TOUR = [
  { img: require('@/assets/images/guide-leads.jpg'), title: 'Clients', text: 'Keep every buyer and seller in one list — phone, email, notes, and what they\u2019re looking for.' },
  { img: require('@/assets/images/guide-transactions.jpg'), title: 'Deals', text: 'Follow each sale from first showing to closing day, so nothing slips through the cracks.' },
  { img: require('@/assets/images/guide-documents.jpg'), title: 'Documents', text: 'Upload contracts and disclosures once. Find them in seconds from any device.' },
  { img: require('@/assets/images/guide-messages.jpg'), title: 'Messages', text: 'Text-style chat with clients. They get an email when you write, and it\u2019s free for them.' },
];

const BG = '#0B1021';
const TEAL = '#2DD4BF';

function Field(p: { label: string; value: string; onChange: (v: string) => void; placeholder: string; icon: any; keyboard?: any; testID: string }) {
  return (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{p.label}</Text>
    <View style={styles.inputWrap}>
      <Ionicons name={p.icon} size={18} color="#64748B" />
      <TextInput
        value={p.value} onChangeText={p.onChange} placeholder={p.placeholder} placeholderTextColor="#64748B"
        keyboardType={p.keyboard} autoCapitalize={p.keyboard === 'email-address' ? 'none' : 'words'}
        style={styles.input} testID={p.testID}
      />
    </View>
  </View>
);
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, isRealAgent, isLoading, setShowWelcomeGuide } = useApp();
  const refresh = useRefreshAccount();
  const { width } = useWindowDimensions();
  const contentW = Math.min(width, 560);

  const steps: StepKey[] = useMemo(
    () => ['welcome', 'profile', ...(passkeysSupported() ? (['faceid'] as StepKey[]) : []), 'client', 'tour', 'plan'],
    [],
  );
  const [i, setI] = useState(0);
  const step = steps[i];
  const bio = biometricName();

  const [phone, setPhone] = useState('');
  const [brokerage, setBrokerage] = useState('');
  const [license, setLicense] = useState('');
  const [clientFirst, setClientFirst] = useState('');
  const [clientLast, setClientLast] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [tourIdx, setTourIdx] = useState(0);
  const [faceDone, setFaceDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isRealAgent) router.replace('/team' as any);
  }, [isLoading, isRealAgent]);

  useEffect(() => {
    if (!isRealAgent) return;
    apiRequest('GET', '/api/account/profile').then((r) => r.json()).then((p) => {
      setPhone(p.phone || ''); setBrokerage(p.brokerage || ''); setLicense(p.licenseNumber || '');
    }).catch(() => {});
  }, [isRealAgent]);

  const next = () => { setError(''); setI((n) => Math.min(n + 1, steps.length - 1)); };
  const back = () => { setError(''); setI((n) => Math.max(0, n - 1)); };

  const finish = async (thenPlan?: PaidPlan) => {
    setBusy(true);
    try {
      await apiRequest('POST', '/api/account/onboarding/complete');
      await AsyncStorage.setItem('trusthome_guide_seen', 'true');
      setShowWelcomeGuide(false);
      refresh();
      if (thenPlan) {
        await AsyncStorage.removeItem(INTENDED_PLAN_KEY);
        await startCheckout(thenPlan, 'month');
        return;
      }
      router.replace('/');
    } catch (e) {
      setError(apiErrorMessage(e));
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    setBusy(true); setError('');
    try {
      await apiRequest('PATCH', '/api/account/profile', { phone: phone.trim() || null, brokerage: brokerage.trim() || null, licenseNumber: license.trim() || null });
      next();
    } catch (e) { setError(apiErrorMessage(e)); } finally { setBusy(false); }
  };

  const turnOnFaceId = async () => {
    setBusy(true); setError('');
    try {
      await registerPasskey();
      setFaceDone(true);
      setTimeout(next, 900);
    } catch (e) {
      if (!(e instanceof Error && e.message === 'cancelled')) setError(apiErrorMessage(e));
    } finally { setBusy(false); }
  };

  const saveClient = async () => {
    if (!clientFirst.trim()) { setError('Enter at least a first name, or tap "Skip for now".'); return; }
    setBusy(true); setError('');
    try {
      await apiRequest('POST', '/api/leads', {
        firstName: clientFirst.trim(), lastName: clientLast.trim(),
        email: clientEmail.trim() || null, phone: clientPhone.trim() || null, source: 'Onboarding',
      });
      next();
    } catch (e) { setError(apiErrorMessage(e)); } finally { setBusy(false); }
  };

  const [intended, setIntended] = useState<PaidPlan | null>(null);
  useEffect(() => { AsyncStorage.getItem(INTENDED_PLAN_KEY).then((v) => { if (v === 'founders' || v === 'professional' || v === 'team') setIntended(v); }); }, []);

  if (!isRealAgent) return <View style={[styles.root, { justifyContent: 'center' }]}><ActivityIndicator color={TEAL} /></View>;

  const first = user?.firstName || 'there';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0B1021', '#0F2A2E', '#0B1021']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={[styles.scroll, { width: contentW }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Top bar: back + progress */}
        <View style={styles.topBar}>
          <Pressable onPress={i === 0 ? () => router.replace('/') : back} hitSlop={10} style={styles.backBtn} testID="onboarding-back">
            <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
            <Text style={styles.backText}>{i === 0 ? 'Home' : 'Back'}</Text>
          </Pressable>
          <Text style={styles.stepCount}>Step {i + 1} of {steps.length}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((i + 1) / steps.length) * 100}%` }]} />
        </View>

        <Animated.View key={step} entering={FadeInRight.duration(350)} style={{ marginTop: 24 }}>
          {step === 'welcome' && (
            <>
              <Image source={require('@/assets/images/guide-welcome.jpg')} style={styles.hero} resizeMode="cover" />
              <Text style={styles.h1}>Welcome, {first}!</Text>
              <Text style={styles.body}>TrustHome is your whole business in one place: clients, deals, documents, and messages. Let's get you set up — it takes about 2 minutes.</Text>
              <View style={styles.giftCard}>
                <Ionicons name="gift" size={26} color={TEAL} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.giftTitle}>Your 14-day free trial has started</Text>
                  <Text style={styles.giftText}>Everything is unlocked. No credit card needed. We'll remind you before it ends.</Text>
                </View>
              </View>
              <Pressable style={styles.primaryBtn} onPress={next} testID="onboarding-start"><Text style={styles.primaryBtnText}>Let's go</Text></Pressable>
            </>
          )}

          {step === 'profile' && (
            <>
              <Text style={styles.h1}>A little about you</Text>
              <Text style={styles.body}>This shows on your profile and in messages to clients. You can change it later in Settings.</Text>
              <View style={{ marginTop: 18 }}>
                <Field label="Mobile phone" value={phone} onChange={setPhone} placeholder="(615) 555-1234" icon="call-outline" keyboard="phone-pad" testID="onboarding-phone" />
                <Field label="Brokerage" value={brokerage} onChange={setBrokerage} placeholder="e.g. Keller Williams" icon="business-outline" testID="onboarding-brokerage" />
                <Field label="License number (optional)" value={license} onChange={setLicense} placeholder="Your state license #" icon="card-outline" testID="onboarding-license" />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={styles.primaryBtn} onPress={saveProfile} disabled={busy} testID="onboarding-profile-save">
                {busy ? <ActivityIndicator color="#0B1021" /> : <Text style={styles.primaryBtnText}>Save & continue</Text>}
              </Pressable>
              <Pressable style={styles.skipBtn} onPress={next}><Text style={styles.skipText}>Skip for now</Text></Pressable>
            </>
          )}

          {step === 'faceid' && (
            <>
              <Image source={require('@/assets/images/guide-faceid.jpg')} style={styles.hero} resizeMode="cover" />
              <Text style={styles.h1}>Sign in with {bio}</Text>
              <Text style={styles.body}>
                No more typing your password and waiting for an email code. Next time, just tap "Sign in with {bio}" and look at your phone.
              </Text>
              <View style={styles.bullets}>
                {[
                  ['shield-checkmark-outline', 'Your face or fingerprint never leaves your phone — TrustHome never sees it.'],
                  ['sync-outline', 'Works on your iPad and Mac too, through your Apple account.'],
                  ['key-outline', 'Your email sign-in still works as a backup.'],
                ].map(([icon, t]) => (
                  <View key={t} style={styles.bulletRow}>
                    <Ionicons name={icon as any} size={18} color={TEAL} />
                    <Text style={styles.bulletText}>{t}</Text>
                  </View>
                ))}
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={[styles.primaryBtn, faceDone && { backgroundColor: '#34D399' }]} onPress={turnOnFaceId} disabled={busy || faceDone} testID="onboarding-faceid">
                {busy ? <ActivityIndicator color="#0B1021" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name={faceDone ? 'checkmark-circle' : bio === 'Face ID' ? 'scan' : 'finger-print'} size={20} color="#0B1021" />
                    <Text style={styles.primaryBtnText}>{faceDone ? `${bio} is on` : `Turn on ${bio}`}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={styles.skipBtn} onPress={next}><Text style={styles.skipText}>Maybe later</Text></Pressable>
            </>
          )}

          {step === 'client' && (
            <>
              <Text style={styles.h1}>Add your first client</Text>
              <Text style={styles.body}>Think of someone you're working with right now. Only you can see your clients.</Text>
              <View style={{ marginTop: 18 }}>
                <Field label="First name" value={clientFirst} onChange={setClientFirst} placeholder="Sarah" icon="person-outline" testID="onboarding-client-first" />
                <Field label="Last name" value={clientLast} onChange={setClientLast} placeholder="Johnson" icon="person-outline" testID="onboarding-client-last" />
                <Field label="Email (optional)" value={clientEmail} onChange={setClientEmail} placeholder="sarah@email.com" icon="mail-outline" keyboard="email-address" testID="onboarding-client-email" />
                <Field label="Phone (optional)" value={clientPhone} onChange={setClientPhone} placeholder="(615) 555-5678" icon="call-outline" keyboard="phone-pad" testID="onboarding-client-phone" />
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={styles.primaryBtn} onPress={saveClient} disabled={busy} testID="onboarding-client-save">
                {busy ? <ActivityIndicator color="#0B1021" /> : <Text style={styles.primaryBtnText}>Add client</Text>}
              </Pressable>
              <Pressable style={styles.skipBtn} onPress={next}><Text style={styles.skipText}>Skip for now</Text></Pressable>
            </>
          )}

          {step === 'tour' && (
            <>
              <Text style={styles.h1}>How TrustHome works</Text>
              <Text style={styles.body}>Four places you'll use every day. Tap the arrows to look around.</Text>
              <Animated.View key={tourIdx} entering={FadeInDown.duration(300)} style={styles.tourCard}>
                <Image source={TOUR[tourIdx].img} style={styles.tourImg} resizeMode="cover" />
                <View style={{ padding: 16 }}>
                  <Text style={styles.tourTitle}>{TOUR[tourIdx].title}</Text>
                  <Text style={styles.tourText}>{TOUR[tourIdx].text}</Text>
                </View>
              </Animated.View>
              <View style={styles.tourNav}>
                <Pressable onPress={() => setTourIdx((t) => Math.max(0, t - 1))} style={[styles.arrow, tourIdx === 0 && { opacity: 0.35 }]} disabled={tourIdx === 0} testID="onboarding-tour-prev">
                  <Ionicons name="chevron-back" size={20} color="#E2E8F0" />
                </Pressable>
                <View style={styles.dots}>
                  {TOUR.map((_, d) => (
                    <Pressable key={d} onPress={() => setTourIdx(d)} hitSlop={6}>
                      <View style={[styles.dot, d === tourIdx && styles.dotActive]} />
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={() => setTourIdx((t) => Math.min(TOUR.length - 1, t + 1))} style={[styles.arrow, tourIdx === TOUR.length - 1 && { opacity: 0.35 }]} disabled={tourIdx === TOUR.length - 1} testID="onboarding-tour-next">
                  <Ionicons name="chevron-forward" size={20} color="#E2E8F0" />
                </Pressable>
              </View>
              <Pressable style={styles.primaryBtn} onPress={next} testID="onboarding-tour-done"><Text style={styles.primaryBtnText}>Got it</Text></Pressable>
            </>
          )}

          {step === 'plan' && (
            <>
              <Text style={styles.h1}>You're all set!</Text>
              <Text style={styles.body}>
                Enjoy your free trial. When it ends you can pick a plan, or keep using the free Starter plan — nothing gets deleted.
              </Text>
              {PLAN_CARDS.filter((p) => p.id === (intended || 'founders')).map((p) => (
                <View key={p.id} style={[styles.offer, { borderColor: p.color + '88' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Ionicons name={p.icon as any} size={22} color={p.color} />
                    <Text style={[styles.offerTitle, { color: p.color }]}>{p.name} — ${p.month}/mo</Text>
                  </View>
                  <Text style={styles.offerText}>{p.tagline} {p.id === 'founders' ? 'Lock it in now and you still won\u2019t be charged until your trial ends.' : 'You won\u2019t be charged until your trial ends.'}</Text>
                  <Pressable style={[styles.offerBtn, { backgroundColor: p.color }]} onPress={() => finish(p.id)} disabled={busy} testID="onboarding-choose-plan">
                    <Text style={styles.primaryBtnText}>Lock in {p.name}</Text>
                  </Pressable>
                </View>
              ))}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={styles.primaryBtn} onPress={() => finish()} disabled={busy} testID="onboarding-finish">
                {busy ? <ActivityIndicator color="#0B1021" /> : <Text style={styles.primaryBtnText}>Go to my dashboard</Text>}
              </Pressable>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG, alignItems: 'center' },
  scroll: { padding: 22, paddingBottom: 60, alignSelf: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  stepCount: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(148,163,184,0.2)', marginTop: 12, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: TEAL },
  hero: { width: '100%', height: 190, borderRadius: 20, marginBottom: 20 },
  h1: { color: '#F8FAFC', fontSize: 28, fontWeight: '800', marginBottom: 10 },
  body: { color: '#CBD5E1', fontSize: 16, lineHeight: 24 },
  giftCard: { flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 22, padding: 16, borderRadius: 16, backgroundColor: 'rgba(45,212,191,0.10)', borderWidth: 1, borderColor: 'rgba(45,212,191,0.35)' },
  giftTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  giftText: { color: '#CBD5E1', fontSize: 14, marginTop: 3, lineHeight: 20 },
  primaryBtn: { marginTop: 24, backgroundColor: TEAL, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryBtnText: { color: '#0B1021', fontSize: 17, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
  label: { color: '#CBD5E1', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(148,163,184,0.3)', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 12, paddingHorizontal: 12 },
  input: { flex: 1, color: '#F8FAFC', fontSize: 16, paddingVertical: 13 },
  error: { color: '#F87171', fontSize: 14, marginTop: 10 },
  bullets: { marginTop: 16, gap: 10 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletText: { color: '#CBD5E1', fontSize: 15, lineHeight: 21, flex: 1 },
  tourCard: { marginTop: 18, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)' },
  tourImg: { width: '100%', height: 180 },
  tourTitle: { color: '#F8FAFC', fontSize: 20, fontWeight: '800' },
  tourText: { color: '#CBD5E1', fontSize: 15, lineHeight: 22, marginTop: 6 },
  tourNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 14 },
  arrow: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(148,163,184,0.15)' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(148,163,184,0.4)' },
  dotActive: { width: 22, backgroundColor: TEAL },
  offer: { marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(15,23,42,0.85)' },
  offerTitle: { fontSize: 17, fontWeight: '800' },
  offerText: { color: '#CBD5E1', fontSize: 14, lineHeight: 20, marginTop: 8 },
  offerBtn: { marginTop: 14, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
});
