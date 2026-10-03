/**
 * How TrustHome Works — plain-language picture guide for non-technical agents.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { Footer } from '@/components/ui/Footer';
import { biometricName } from '@/lib/billing';

const CARD_W = 300;

export default function GuideScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const bio = biometricName();

  const TOPICS = [
    {
      img: require('@/assets/images/guide-welcome.jpg'), title: 'Getting started', icon: 'rocket-outline', route: '/team',
      steps: ['Tap "Create Agent Account" and enter your name, email and a password.', 'Check your email for a 6-digit code and type it in.', 'Follow the short setup — your 14-day free trial starts right away.'],
    },
    {
      img: require('@/assets/images/guide-faceid.jpg'), title: `Sign in with ${bio}`, icon: 'scan-outline', route: '/settings',
      steps: ['Open Settings (or tap "Turn on" on your dashboard).', `Tap "Turn on ${bio}" and look at your phone.`, `Next time, tap "Sign in with ${bio}" — no password or code.`],
    },
    {
      img: require('@/assets/images/guide-leads.jpg'), title: 'Add a client', icon: 'person-add-outline', route: '/leads',
      steps: ['Open "Leads & CRM" from the menu.', 'Tap the + button and enter their name, phone and email.', 'Mark them hot, warm or cold so you know who to call first.'],
    },
    {
      img: require('@/assets/images/guide-transactions.jpg'), title: 'Track a deal', icon: 'git-branch-outline', route: '/transactions',
      steps: ['Open "Transactions".', 'Add the property address, client and price.', 'Move it along as it goes: showing → offer → under contract → closed.'],
    },
    {
      img: require('@/assets/images/guide-documents.jpg'), title: 'Upload a document', icon: 'document-attach-outline', route: '/documents',
      steps: ['Open "Documents" and tap "Upload".', 'Pick a PDF or photo from your phone or computer.', 'Find it any time with search — it\u2019s private to you.'],
    },
    {
      img: require('@/assets/images/guide-messages.jpg'), title: 'Message a client', icon: 'chatbubbles-outline', route: '/messages',
      steps: ['Open "Messages" and tap "New conversation".', 'Enter your client\u2019s name and email, then type your message.', 'They get an email, sign in free with that email, and reply right here.'],
    },
    {
      img: require('@/assets/images/guide-business.jpg'), title: 'Plans & billing', icon: 'card-outline', route: '/billing',
      steps: ['Your first 14 days are free — no card needed.', 'Pick a plan any time from "Plan & Billing". You\u2019re charged only after the trial.', 'Change or cancel any time. Your data is never deleted.'],
    },
    {
      img: require('@/assets/images/guide-trust.jpg'), title: 'For your clients', icon: 'people-outline', route: '/messages',
      steps: ['Clients never pay anything.', 'They sign in with the same email you used to message them.', 'They only see their own conversations and documents you share.'],
    },
  ];

  const GLOSSARY: [string, string][] = [
    ['Lead', 'Someone who might buy or sell with you, but hasn\u2019t signed anything yet.'],
    ['Pipeline', 'All your deals lined up by how far along they are.'],
    ['MLS', 'Multiple Listing Service — the shared database of homes for sale that agents use.'],
    ['DOM', 'Days on Market — how long a home has been listed.'],
    ['Earnest money', 'A deposit the buyer puts down to show they\u2019re serious.'],
    ['Contingency', 'A condition in the contract (like a passing inspection) that has to happen or the buyer can walk away.'],
    ['Escrow', 'A neutral third party holds the money and paperwork until closing.'],
    ['Closing', 'The final day: papers are signed, money changes hands, keys are handed over.'],
    ['Passkey', `The secure key behind ${bio} sign-in. It lives on your phone; TrustHome never sees your face or fingerprint.`],
  ];

  const FAQ: [string, string][] = [
    ['Can other agents see my clients?', 'No. Every agent has their own private workspace. Even on a Team plan, each agent\u2019s clients and deals stay private to them.'],
    ['What happens when my free trial ends?', 'If you picked a plan, it simply continues. If not, you move to the free Starter plan. Nothing is deleted.'],
    ['Do my clients have to pay?', 'Never. Clients use TrustHome free.'],
    ['I don\u2019t have a Gmail account. Is that OK?', 'Yes. Any email works — iCloud, Yahoo, Outlook, your brokerage email.'],
    [`What if ${bio} doesn\u2019t work?`, 'You can always sign in with your email and password instead. Your email will get a 6-digit code to confirm it\u2019s you.'],
    ['Is my card information safe?', 'Payments are handled by Stripe, the same company used by Amazon and Target. TrustHome never sees your card number.'],
  ];

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Header title="How TrustHome Works" showBack />
        <View style={styles.intro}>
          <Text style={[styles.h1, { color: colors.text }]}>A simple picture guide</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>
            Swipe through the cards (or use the arrows). Each one shows three easy steps. Tap "Show me" to jump right there.
          </Text>
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <HorizontalCarousel itemWidth={CARD_W}>
            {TOPICS.map((t, idx) => (
              <View key={t.title} style={[styles.card, { width: CARD_W, backgroundColor: isDark ? '#111827' : '#FFFFFF', borderColor: colors.border }]}>
                <Image source={t.img} style={styles.cardImg} resizeMode="cover" />
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.numBubble}><Text style={styles.numText}>{idx + 1}</Text></View>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t.title}</Text>
                  </View>
                  {t.steps.map((s, si) => (
                    <View key={si} style={styles.stepRow}>
                      <Ionicons name="checkmark-circle" size={18} color="#2DD4BF" style={{ marginTop: 1 }} />
                      <Text style={[styles.stepText, { color: colors.textSecondary }]}>{s}</Text>
                    </View>
                  ))}
                  <Pressable onPress={() => router.push(t.route as any)} style={styles.showBtn} testID={`guide-show-${idx}`}>
                    <Ionicons name={t.icon as any} size={16} color="#0B1021" />
                    <Text style={styles.showBtnText}>Show me</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </HorizontalCarousel>
        </Animated.View>

        <View style={styles.section}>
          <AccordionSection title="Real estate words, explained" icon="book" iconColor="#D4AF37">
            {GLOSSARY.map(([term, def], i) => (
              <View key={term} style={[styles.qa, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={[styles.term, { color: colors.text }]}>{term}</Text>
                <Text style={[styles.def, { color: colors.textSecondary }]}>{def}</Text>
              </View>
            ))}
          </AccordionSection>
          <AccordionSection title="Common questions" icon="help-circle" iconColor="#2DD4BF" defaultOpen>
            {FAQ.map(([q, a], i) => (
              <View key={q} style={[styles.qa, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                <Text style={[styles.term, { color: colors.text }]}>{q}</Text>
                <Text style={[styles.def, { color: colors.textSecondary }]}>{a}</Text>
              </View>
            ))}
          </AccordionSection>
          <Pressable onPress={() => router.push('/support' as any)} style={[styles.helpCard, { borderColor: colors.border }]} testID="guide-support">
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#2DD4BF" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.term, { color: colors.text }]}>Still stuck?</Text>
              <Text style={[styles.def, { color: colors.textSecondary }]}>Reach out and a real person will help.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  intro: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  h1: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  body: { fontSize: 15, lineHeight: 22 },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', height: 490 },
  cardImg: { width: '100%', height: 150 },
  cardBody: { padding: 16, flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, minHeight: 50 },
  numBubble: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#2DD4BF', alignItems: 'center', justifyContent: 'center' },
  numText: { color: '#0B1021', fontWeight: '900', fontSize: 14 },
  cardTitle: { fontSize: 18, fontWeight: '800', flexShrink: 1 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  showBtn: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#2DD4BF', paddingVertical: 11, borderRadius: 12 },
  showBtnText: { color: '#0B1021', fontWeight: '800', fontSize: 15 },
  section: { paddingHorizontal: 16, paddingTop: 18, gap: 12 },
  qa: { paddingVertical: 12 },
  term: { fontSize: 15, fontWeight: '700' },
  def: { fontSize: 14, lineHeight: 20, marginTop: 3 },
  helpCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
});
