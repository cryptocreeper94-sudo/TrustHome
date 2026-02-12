import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { Footer } from '@/components/ui/Footer';

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  action: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ContactItem {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

interface EcosystemLink {
  label: string;
  url: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I add a new client?',
    answer: 'Navigate to the Leads screen from the main menu or dashboard. Tap the add button in the top-right corner to create a new lead entry. Fill in the client details including name, contact information, and property preferences, then save.',
  },
  {
    question: 'How does Trust Layer verification work?',
    answer: 'Trust Layer uses the DarkWave blockchain (DWTL) to provide immutable document verification. When a document is uploaded, a cryptographic hash is generated and recorded on-chain. This creates a tamper-proof record that can be independently verified by any party, ensuring document integrity throughout the transaction.',
  },
  {
    question: 'Can I customize my branding?',
    answer: 'Yes. Go to the Branding screen from the main menu to customize your agent profile, brand colors, logo, and client-facing materials. All branding changes sync across the TrustHome ecosystem and your white-label domain.',
  },
  {
    question: 'How do I connect my MLS?',
    answer: 'Go to Settings, then open the Integrations section and tap MLS Connection. Select your MLS data provider (Bridge, Spark, Trestle, or other), enter your API credentials, and test the connection. TrustHome supports the RESO Web API 2.0 standard.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Your data is protected by Trust Shield, the DarkWave ecosystem security suite. All data is encrypted at rest and in transit using industry-standard AES-256 encryption. Role-based access control (RBAC) ensures that only authorized users can view sensitive information. Blockchain verification adds an additional layer of integrity protection.',
  },
  {
    question: 'How do I track expenses?',
    answer: 'Open Business Suite from the main menu, then tap the Expenses tab. You can log expenses by category, attach receipts, and track spending against your budget. Expense reports can be generated for any time period.',
  },
];

const ECOSYSTEM_LINKS: EcosystemLink[] = [
  {
    label: 'DarkWave Studios',
    url: 'https://darkwavestudios.io',
    description: 'Parent company',
    icon: 'business-outline',
    color: '#1A8A7E',
  },
  {
    label: 'Trust Layer',
    url: 'https://dwtl.io',
    description: 'Blockchain verification',
    icon: 'cube-outline',
    color: '#007AFF',
  },
  {
    label: 'Trust Shield',
    url: 'https://trustshield.tech',
    description: 'Security suite',
    icon: 'shield-checkmark-outline',
    color: '#AF52DE',
  },
  {
    label: 'PaintPros.io',
    url: 'https://paintpros.io',
    description: 'Ecosystem hub',
    icon: 'color-palette-outline',
    color: '#FF9500',
  },
];

export default function SupportScreen() {
  const { colors, isDark } = useTheme();
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const scrollRef = useRef<ScrollView>(null);
  const faqY = useRef<number>(0);
  const contactY = useRef<number>(0);

  const quickActions: QuickAction[] = [
    {
      label: 'Getting Started',
      icon: 'rocket-outline',
      color: '#1A8A7E',
      action: () => {
        Alert.alert(
          'Getting Started',
          'Welcome to TrustHome!\n\n1. Complete your profile in Settings\n2. Set up your branding on the Branding screen\n3. Connect your MLS feed in Settings > Integrations\n4. Add your first client in Leads\n5. Explore the Dashboard for a full overview\n\nNeed help? Contact support anytime.',
        );
      },
    },
    {
      label: 'Video Tutorials',
      icon: 'videocam-outline',
      color: '#007AFF',
      action: () => Linking.openURL('https://darkwavestudios.io/tutorials'),
    },
    {
      label: 'FAQs',
      icon: 'help-circle-outline',
      color: '#AF52DE',
      action: () => {
        if (faqY.current > 0) {
          scrollRef.current?.scrollTo({ y: faqY.current, animated: true });
        }
      },
    },
    {
      label: 'Contact Support',
      icon: 'chatbubble-ellipses-outline',
      color: '#FF9500',
      action: () => {
        if (contactY.current > 0) {
          scrollRef.current?.scrollTo({ y: contactY.current, animated: true });
        }
      },
    },
  ];

  const contactItems: ContactItem[] = [
    {
      label: 'Email Support',
      value: 'support@trusthome.io',
      icon: 'mail-outline',
      color: '#007AFF',
      onPress: () => Linking.openURL('mailto:support@trusthome.io'),
    },
    {
      label: 'Phone Support',
      value: '(555) 0199',
      icon: 'call-outline',
      color: '#34C759',
      onPress: () => Linking.openURL('tel:5550199'),
    },
    {
      label: 'Live Chat',
      value: 'Signal Chat Integration',
      icon: 'chatbubble-outline',
      color: '#AF52DE',
      onPress: () => Linking.openURL('https://signal.me'),
    },
    {
      label: 'Support Hours',
      value: 'Mon-Fri 8am-8pm EST\nSat 9am-5pm EST',
      icon: 'time-outline',
      color: '#FF9500',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Help & Support" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <AccordionSection
              title="Quick Help"
              icon="flash"
              iconColor="#1A8A7E"
              defaultOpen
            >
              <View style={styles.quickGrid}>
                {quickActions.map((item, i) => (
                  <Pressable
                    key={i}
                    onPress={item.action}
                    style={[styles.quickCard, {
                      backgroundColor: isDark ? item.color + '18' : item.color + '0C',
                      borderColor: item.color + '30',
                    }]}
                  >
                    <View style={[styles.quickIconWrap, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon} size={22} color={item.color} />
                    </View>
                    <Text style={[styles.quickLabel, { color: colors.text }]}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </AccordionSection>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(400).delay(200)}
            onLayout={(e) => { faqY.current = e.nativeEvent.layout.y; }}
          >
            <AccordionSection
              title="Frequently Asked Questions"
              icon="help-circle"
              iconColor="#AF52DE"
              badge={FAQ_ITEMS.length}
              badgeColor="#AF52DE"
            >
              {FAQ_ITEMS.map((faq, i) => (
                <View key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
                  <GlassCard compact>
                    <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                  </GlassCard>
                </View>
              ))}
            </AccordionSection>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(400).delay(300)}
            onLayout={(e) => { contactY.current = e.nativeEvent.layout.y; }}
          >
            <AccordionSection
              title="Contact Support"
              icon="chatbubbles"
              iconColor="#FF9500"
            >
              {contactItems.map((item, i) => (
                <Pressable
                  key={i}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                  style={[
                    styles.contactRow,
                    i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                  ]}
                >
                  <View style={[styles.contactIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                    <Text style={[styles.contactValue, { color: colors.text }]}>{item.value}</Text>
                  </View>
                  {item.onPress && (
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  )}
                </Pressable>
              ))}
            </AccordionSection>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <AccordionSection
              title="Ecosystem Resources"
              icon="globe"
              iconColor="#007AFF"
            >
              {ECOSYSTEM_LINKS.map((link, i) => (
                <View key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
                  <GlassCard compact onPress={() => Linking.openURL(link.url)}>
                    <View style={styles.ecoRow}>
                      <View style={[styles.ecoIcon, { backgroundColor: link.color + '18' }]}>
                        <Ionicons name={link.icon} size={20} color={link.color} />
                      </View>
                      <View style={styles.ecoInfo}>
                        <Text style={[styles.ecoLabel, { color: colors.text }]}>{link.label}</Text>
                        <Text style={[styles.ecoDesc, { color: colors.textSecondary }]}>{link.description}</Text>
                      </View>
                      <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
                    </View>
                  </GlassCard>
                </View>
              ))}
            </AccordionSection>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <AccordionSection
              title="Feature Requests"
              icon="bulb"
              iconColor="#34C759"
            >
              <GlassCard compact>
                <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                  Have an idea for a new feature or improvement? We value your feedback and actively incorporate agent suggestions into our roadmap. Submit your feature request and our product team will review it.
                </Text>
                <Pressable
                  onPress={() => Linking.openURL('mailto:features@trusthome.io?subject=Feature%20Request')}
                  style={[styles.featureBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="send-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.featureBtnText}>Submit Feature Request</Text>
                </Pressable>
              </GlassCard>
            </AccordionSection>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(600)}>
            <AccordionSection
              title="App Info"
              icon="information-circle"
              iconColor="#8E8E93"
            >
              <View style={styles.appInfoGrid}>
                <View style={styles.appInfoRow}>
                  <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Version</Text>
                  <Text style={[styles.appInfoValue, { color: colors.text }]}>1.0.0-beta</Text>
                </View>
                <View style={[styles.appInfoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                  <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Build Date</Text>
                  <Text style={[styles.appInfoValue, { color: colors.text }]}>February 12, 2026</Text>
                </View>
                <View style={[styles.appInfoRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
                  <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Copyright</Text>
                  <Text style={[styles.appInfoValue, { color: colors.text }]}>2026 DarkWave Studios LLC</Text>
                </View>
              </View>
            </AccordionSection>
          </Animated.View>
        </View>
        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.support.title}
        description={SCREEN_HELP.support.description}
        details={SCREEN_HELP.support.details}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 16,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: '48%' as any,
    flexGrow: 1,
    alignItems: 'center' as const,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  ecoRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    gap: 12,
  },
  ecoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  ecoInfo: {
    flex: 1,
  },
  ecoLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  ecoDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  featureBtn: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  featureBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  appInfoGrid: {},
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  appInfoLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
