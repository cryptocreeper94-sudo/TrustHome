/**
 * Settings card: Face ID / Touch ID / fingerprint sign-in + Plan & Billing shortcut.
 * Only shown with live data for real signed-in users (demo shows an explainer).
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  usePasskeys, passkeysSupported, biometricName, registerPasskey, removePasskey,
  useRefreshAccount, useBillingStatus, PLAN_LABEL,
} from '@/lib/billing';
import { apiErrorMessage, timeAgo } from '@/lib/tenant-api';

function confirmAction(message: string): boolean {
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.confirm(message);
  return true;
}

export function BiometricSettingsCard() {
  const { colors } = useTheme();
  const { isRealAgent, demoMode, browseMode } = useApp();
  const router = useRouter();
  const passkeys = usePasskeys();
  const billing = useBillingStatus();
  const refresh = useRefreshAccount();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const supported = passkeysSupported();
  const bio = biometricName();
  const live = !demoMode && !browseMode;
  const devices = live ? passkeys.data || [] : [];

  const add = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await registerPasskey();
      refresh();
      setMessage({ kind: 'ok', text: `${bio} is on. Next time, just tap "Sign in with ${bio}".` });
    } catch (e) {
      if (e instanceof Error && e.message === 'cancelled') return;
      setMessage({ kind: 'err', text: apiErrorMessage(e) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, label: string) => {
    if (!confirmAction(`Stop using ${label} to sign in?`)) return;
    try {
      await removePasskey(id);
      refresh();
    } catch (e) {
      setMessage({ kind: 'err', text: apiErrorMessage(e) });
    }
  };

  const plan = billing.data;
  const planLabel = !plan ? '' :
    plan.source === 'trial' ? `Free trial · ${plan.trialDaysLeft} day${plan.trialDaysLeft === 1 ? '' : 's'} left` :
    plan.source === 'comped' ? 'Professional (complimentary)' :
    plan.source === 'team' ? `Professional · ${plan.teamOwnerName || 'Team'}'s team` :
    plan.source === 'subscription' ? PLAN_LABEL[plan.plan || plan.tier] :
    'Starter (free)';

  return (
    <GlassCard testID="settings-security-card">
      {/* Face ID */}
      <View style={styles.headRow}>
        <View style={[styles.iconBubble, { backgroundColor: 'rgba(45,212,191,0.14)' }]}>
          <Ionicons name={bio === 'Face ID' ? 'scan' : 'finger-print'} size={22} color="#2DD4BF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{bio} sign-in</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Skip the password and email code. Your face or fingerprint never leaves your device.
          </Text>
        </View>
      </View>

      {!live ? (
        <Text style={[styles.note, { color: colors.textTertiary }]}>Create your account to turn this on.</Text>
      ) : !supported ? (
        <Text style={[styles.note, { color: colors.textTertiary }]}>
          This browser can't use {bio}. Open TrustHome in Safari or Chrome on your phone to set it up.
        </Text>
      ) : (
        <>
          {devices.map((d, i) => (
            <View key={d.id} style={[styles.deviceRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <Ionicons name="phone-portrait-outline" size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.deviceName, { color: colors.text }]}>{d.deviceLabel || 'Device'}</Text>
                <Text style={[styles.deviceMeta, { color: colors.textTertiary }]}>
                  Added {timeAgo(d.createdAt)}{d.lastUsedAt ? ` · last used ${timeAgo(d.lastUsedAt)}` : ''}
                </Text>
              </View>
              <Pressable onPress={() => remove(d.id, d.deviceLabel || 'this device')} hitSlop={8} testID={`passkey-remove-${i}`}>
                <Text style={{ color: '#F87171', fontWeight: '600' }}>Remove</Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={add}
            disabled={busy}
            style={({ pressed }) => [styles.addBtn, { opacity: busy ? 0.7 : pressed ? 0.85 : 1 }]}
            testID="passkey-add-btn"
          >
            {busy ? <ActivityIndicator color="#FFFFFF" /> : (
              <>
                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>{devices.length ? `Add another device` : `Turn on ${bio}`}</Text>
              </>
            )}
          </Pressable>
        </>
      )}
      {message && (
        <Text style={[styles.message, { color: message.kind === 'ok' ? '#34D399' : '#F87171' }]}>
          {message.text}
        </Text>
      )}

      {/* Plan & Billing */}
      {isRealAgent && (
        <Pressable
          onPress={() => router.push('/billing' as any)}
          style={[styles.planRow, { borderTopColor: colors.divider }]}
          testID="settings-billing-row"
        >
          <View style={[styles.iconBubble, { backgroundColor: 'rgba(212,175,55,0.14)' }]}>
            <Ionicons name="card" size={20} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Plan & Billing</Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>{planLabel || 'View your plan'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBubble: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  sub: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  note: { fontSize: 13, lineHeight: 18 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  deviceName: { fontSize: 14, fontWeight: '600' },
  deviceMeta: { fontSize: 12, marginTop: 1 },
  addBtn: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 12, backgroundColor: '#1A8A7E',
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  message: { marginTop: 10, fontSize: 13, lineHeight: 18 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: 1 },
});
