import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';

// Dummy data for now - this would come from the database based on the ID
const AGENT_DATA: Record<string, any> = {
  'default': {
    name: 'Sarah Jenkins',
    title: 'Luxury Real Estate Advisor',
    brokerage: 'TrustHome Premiere',
    phone: '(555) 123-4567',
    email: 'sarah@trusthome.tlid.io',
    bio: 'Specializing in high-end residential properties and exclusive estates across the region. With over a decade of experience, I provide unmatched discretion and elite service to discerning clients.',
    image: require('@/assets/images/cards/team.jpg'),
    stats: [
      { label: 'Career Volume', value: '$120M+' },
      { label: 'Avg List-to-Sale', value: '102%' },
      { label: 'Active Listings', value: '12' },
    ]
  }
};

export async function generateStaticParams() {
  return [
    { id: 'default' }
  ];
}

export default function AgentProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Load the agent data or fallback to default
  const agent = AGENT_DATA[id as string] || AGENT_DATA['default'];

  // Form State
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    setSubmitted(true);
    // Here we would trigger an email/sms to the agent using Resend/Twilio
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: '#020617' }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── HEADER BACKGROUND ─── */}
      <View style={styles.headerWrap}>
        <Image source={agent.image} style={styles.headerImage} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', '#020617']}
          style={styles.headerGradient}
        />
        <Pressable onPress={() => router.push('/')} style={[styles.backBtn, { top: insets.top + 16 }]}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </Pressable>
      </View>

      <View style={styles.contentWrap}>
        {/* ─── PROFILE INFO ─── */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.profileHeader}>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color="#D4D4D8" />
            <Text style={styles.badgeText}>Verified Agent</Text>
          </View>
          <Text style={styles.agentName}>{agent.name}</Text>
          <Text style={styles.agentTitle}>{agent.title}</Text>
          <Text style={styles.agentBrokerage}>{agent.brokerage}</Text>
        </Animated.View>

        {/* ─── STATS ─── */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsRow}>
          {agent.stats.map((stat: any, index: number) => (
            <View key={index} style={styles.statBox}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* ─── BIO ─── */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.bioSection}>
          <Text style={styles.bioText}>{agent.bio}</Text>
        </Animated.View>

        {/* ─── CONTACT FORM ─── */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)}>
          <GlassCard style={styles.contactCard}>
            {submitted ? (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={32} color="#000" />
                </View>
                <Text style={styles.successTitle}>Inquiry Sent</Text>
                <Text style={styles.successDesc}>
                  {agent.name.split(' ')[0]} will be in touch with you shortly.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactTitle}>Work with {agent.name.split(' ')[0]}</Text>
                  <Text style={styles.contactDesc}>
                    Send a direct inquiry. All messages are encrypted and secured by TrustLayer.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Jane Doe"
                    placeholderTextColor="#52525B"
                    value={form.name}
                    onChangeText={t => setForm({ ...form, name: t })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="jane@example.com"
                    placeholderTextColor="#52525B"
                    keyboardType="email-address"
                    value={form.email}
                    onChangeText={t => setForm({ ...form, email: t })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="(555) 123-4567"
                    placeholderTextColor="#52525B"
                    keyboardType="phone-pad"
                    value={form.phone}
                    onChangeText={t => setForm({ ...form, phone: t })}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Message</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="I'm looking to buy a home..."
                    placeholderTextColor="#52525B"
                    multiline
                    textAlignVertical="top"
                    value={form.message}
                    onChangeText={t => setForm({ ...form, message: t })}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.8 }]}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitText}>Send Inquiry</Text>
                  <Ionicons name="arrow-forward" size={18} color="#000" />
                </Pressable>
              </>
            )}
          </GlassCard>
        </Animated.View>

        {/* ─── FOOTER ─── */}
        <Animated.View entering={FadeIn.delay(600)} style={styles.footer}>
          <Ionicons name="shield-checkmark" size={16} color="#52525B" />
          <Text style={styles.footerText}>Powered by TrustHome</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    height: 400,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
    top: '30%',
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contentWrap: {
    paddingHorizontal: 24,
    marginTop: -80,
  },
  profileHeader: {
    marginBottom: 32,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
    gap: 6,
  },
  badgeText: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  agentName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  agentTitle: {
    fontSize: 18,
    color: '#A1A1AA',
    fontWeight: '500',
    marginBottom: 4,
  },
  agentBrokerage: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#09090B',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 32,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bioSection: {
    marginBottom: 40,
  },
  bioText: {
    fontSize: 16,
    color: '#D4D4D8',
    lineHeight: 26,
  },
  contactCard: {
    padding: 32,
    backgroundColor: '#09090B',
    borderColor: '#27272A',
  },
  contactHeader: {
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  contactDesc: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  submitBtn: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  submitText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 48,
  },
  footerText: {
    fontSize: 12,
    color: '#52525B',
    fontWeight: '500',
    letterSpacing: 0.5,
  }
});
