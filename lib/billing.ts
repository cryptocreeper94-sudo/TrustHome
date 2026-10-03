/**
 * Plan / billing / onboarding / passkey helpers for the client.
 * Server side: server/billing.ts and server/passkeys.ts
 */
import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest, getQueryFn } from '@/lib/query-client';
import { useApp } from '@/contexts/AppContext';

export type Tier = 'starter' | 'professional' | 'team';
export type PaidPlan = 'professional' | 'team' | 'founders';
export type BillingInterval = 'month' | 'year';

export interface BillingStatus {
  tier: Tier;
  source: 'subscription' | 'comped' | 'team' | 'trial' | 'starter';
  plan: PaidPlan | null;
  interval: BillingInterval | null;
  subStatus: string | null;
  trialEndsAt: string | null;
  trialDaysLeft: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  hasBillingAccount: boolean;
  comped: boolean;
  teamOwnerName: string | null;
  limits: { contacts: number | null; activeDeals: number | null; storageBytes: number };
  usage: { contacts: number; activeDeals: number; storageBytes: number };
  onboardingCompleted: boolean;
  foundersRemaining: number;
}

export interface PublicPlans {
  configured: boolean;
  foundersRemaining: number;
  trialDays: number;
}

export interface ChecklistItem { key: string; label: string; done: boolean; route: string }
export interface Checklist { items: ChecklistItem[]; completed: number; total: number }

export const INTENDED_PLAN_KEY = 'trusthome_intended_plan';

export const PLAN_LABEL: Record<PaidPlan | Tier, string> = {
  starter: 'Starter',
  professional: 'Professional',
  team: 'Team',
  founders: "Founders Circle",
};

export interface PlanCard {
  id: PaidPlan;
  name: string;
  month: number;      // $/mo billed monthly
  yearMonthly: number; // $/mo billed yearly
  yearTotal: number;
  tagline: string;
  features: string[];
  color: string;
  icon: string;
  badge?: string;
}

export const PLAN_CARDS: PlanCard[] = [
  {
    id: 'founders', name: 'Founders Circle', month: 49, yearMonthly: 39, yearTotal: 468,
    tagline: 'Everything in Professional at a price that never goes up.',
    features: ['Everything in Professional', 'Price locked for life', 'Only 100 seats, ever', 'Direct line to the founders'],
    color: '#D4AF37', icon: 'diamond', badge: 'Limited',
  },
  {
    id: 'professional', name: 'Professional', month: 79, yearMonthly: 63, yearTotal: 756,
    tagline: 'For a working agent who wants everything in one place.',
    features: ['Unlimited clients & deals', '25 GB document storage', 'Secure client messaging', 'Marketing & analytics tools'],
    color: '#2DD4BF', icon: 'briefcase', badge: 'Most popular',
  },
  {
    id: 'team', name: 'Team', month: 149, yearMonthly: 119, yearTotal: 1428,
    tagline: 'You plus up to 9 agents, each with their own private workspace.',
    features: ['Everything in Professional', 'Up to 10 agents total', 'See your team\u2019s numbers', 'Add/remove agents any time'],
    color: '#818CF8', icon: 'people',
  },
];

export const STARTER_FEATURES = ['Up to 50 clients', '3 active deals at a time', '500 MB of documents', 'Client messaging'];

export function useBillingStatus() {
  const { isRealAgent } = useApp();
  return useQuery<BillingStatus | null>({
    queryKey: ['/api/billing/status'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: isRealAgent,
    staleTime: 30_000,
  });
}

export function usePublicPlans() {
  return useQuery<PublicPlans | null>({
    queryKey: ['/api/billing/plans'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 60_000,
  });
}

export function useChecklist() {
  const { isRealAgent } = useApp();
  return useQuery<Checklist | null>({
    queryKey: ['/api/account/checklist'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: isRealAgent,
    staleTime: 15_000,
  });
}

export function useRefreshAccount() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['/api/billing/status'] });
    qc.invalidateQueries({ queryKey: ['/api/account/checklist'] });
    qc.invalidateQueries({ queryKey: ['/api/passkeys'] });
    qc.invalidateQueries({ queryKey: ['/api/team'] });
  };
}

function go(url: string) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.href = url;
  else import('expo-linking').then((L) => L.openURL(url)).catch(() => {});
}

/** Sends the agent to Stripe Checkout. Throws with a readable message on failure. */
export async function startCheckout(plan: PaidPlan, interval: BillingInterval) {
  const res = await apiRequest('POST', '/api/billing/checkout', { plan, interval });
  const { url } = await res.json();
  if (!url) throw new Error('500: {"error":"Checkout is not available right now."}');
  go(url);
}

/** Opens Stripe's billing portal (update card, change plan, cancel, invoices). */
export async function openBillingPortal() {
  const res = await apiRequest('POST', '/api/billing/portal');
  const { url } = await res.json();
  if (url) go(url);
}

export async function confirmCheckout(sessionId: string) {
  await apiRequest('POST', '/api/billing/confirm', { sessionId });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

// ─── Biometric sign-in (passkeys) ──────────────────────────────────────

export interface PasskeyRow { id: string; deviceLabel: string | null; createdAt: string; lastUsedAt: string | null }

export function usePasskeys() {
  const { isAuthenticated } = useApp();
  return useQuery<PasskeyRow[] | null>({
    queryKey: ['/api/passkeys'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: isAuthenticated,
  });
}

/** True when this browser can use Face ID / Touch ID / fingerprint / Windows Hello. */
export function passkeysSupported(): boolean {
  return Platform.OS === 'web'
    && typeof window !== 'undefined'
    && !!(window as any).PublicKeyCredential
    && window.isSecureContext;
}

/** What to call the biometric on this device, for button labels. */
export function biometricName(): string {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'Face ID';
  const ua = navigator.userAgent;
  if (/iPhone|iPad/i.test(ua)) return 'Face ID';
  if (/Macintosh/i.test(ua)) return 'Touch ID';
  if (/Android/i.test(ua)) return 'Fingerprint';
  if (/Windows/i.test(ua)) return 'Windows Hello';
  return 'Face ID / Fingerprint';
}

function friendlyWebAuthnError(e: any): Error {
  const name = e?.name || '';
  if (name === 'NotAllowedError' || name === 'AbortError') return new Error('cancelled');
  if (name === 'InvalidStateError') return new Error('400: {"error":"This device is already set up for sign-in."}');
  return e instanceof Error ? e : new Error(String(e));
}

/** Registers this device's Face ID / Touch ID for the signed-in account. */
export async function registerPasskey() {
  const { startRegistration } = await import('@simplewebauthn/browser');
  const optionsJSON = await (await apiRequest('POST', '/api/passkeys/register/options')).json();
  let response;
  try {
    response = await startRegistration({ optionsJSON });
  } catch (e) {
    throw friendlyWebAuthnError(e);
  }
  await apiRequest('POST', '/api/passkeys/register/verify', { response });
}

/** Signs in with a passkey. Returns the user on success. */
export async function signInWithPasskey(rememberMe = true) {
  const { startAuthentication } = await import('@simplewebauthn/browser');
  const optionsJSON = await (await apiRequest('POST', '/api/passkeys/login/options')).json();
  let response;
  try {
    response = await startAuthentication({ optionsJSON });
  } catch (e) {
    throw friendlyWebAuthnError(e);
  }
  const res = await apiRequest('POST', '/api/passkeys/login/verify', { response, rememberMe });
  return (await res.json()).user as { id: string; email: string; firstName: string; lastName: string; role: string };
}

export async function removePasskey(id: string) {
  await apiRequest('DELETE', `/api/passkeys/${encodeURIComponent(id)}`);
}
