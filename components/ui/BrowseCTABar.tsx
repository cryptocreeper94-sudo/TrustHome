import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Platform, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/query-client';

export function BrowseCTABar() {
  const { colors, isDark } = useTheme();
  const { isBrowsing, demoMode } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  if (!isBrowsing && !demoMode) return null;

  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <>
      <Animated.View
        entering={FadeInUp.duration(500).delay(800)}
        style={[styles.bar, { bottom: bottomInset + 8 }]}
      >
        <LinearGradient
          colors={['rgba(26,138,126,0.95)', 'rgba(15,118,110,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.barGradient}
        >
          <View style={styles.barLeft}>
            <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.barText}>Exploring TrustHome</Text>
          </View>
          <View style={styles.barActions}>
            <Pressable
              style={styles.barBtnSecondary}
              onPress={() => setShowInvite(true)}
            >
              <Ionicons name="share-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.barBtnSecondaryText}>Share</Text>
            </Pressable>
            <Pressable
              style={styles.barBtnPrimary}
              onPress={() => router.push('/team')}
            >
              <Text style={styles.barBtnPrimaryText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={14} color="#1A8A7E" />
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>

      <ClientSignupModal visible={showSignup} onClose={() => setShowSignup(false)} />
      <InviteAgentModal visible={showInvite} onClose={() => setShowInvite(false)} />
    </>
  );
}

function ClientSignupModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!firstName.trim() || !email.trim()) {
      setError('Please enter your name and email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiRequest('POST', '/api/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: 'temp_' + Date.now(),
        role: 'client',
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setFirstName(''); setLastName(''); setEmail('');
    setError(''); setSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={resetAndClose}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
            {success ? (
              <View style={styles.successContent}>
                <View style={[styles.successIcon, { backgroundColor: 'rgba(26,138,126,0.15)' }]}>
                  <Ionicons name="checkmark-circle" size={48} color="#1A8A7E" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Welcome to TrustHome!</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  Your account has been created. You can now save properties, message agents, and more.
                </Text>
                <Pressable style={styles.successBtn} onPress={resetAndClose}>
                  <LinearGradient colors={['#1A8A7E', '#0F766E']} style={styles.successBtnGradient}>
                    <Text style={styles.successBtnText}>Start Exploring</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <LinearGradient colors={['#1A8A7E', '#0F766E']} style={styles.modalIconWrap}>
                    <Ionicons name="person-add" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Create Your Account</Text>
                    <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                      Free for buyers and sellers. Just name and email.
                    </Text>
                  </View>
                  <Pressable onPress={resetAndClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Smith"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="john@email.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {error ? (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                  <LinearGradient colors={['#1A8A7E', '#0F766E']} style={styles.submitBtnGradient}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>Create Free Account</Text>
                        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function InviteAgentModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const [agentEmail, setAgentEmail] = useState('');
  const [yourName, setYourName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!agentEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentEmail.trim())) {
      setError("Please enter your agent's email address");
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiRequest('POST', '/api/invite-agent', {
        agentEmail: agentEmail.trim().toLowerCase(),
        senderName: yourName.trim() || 'A potential client',
      });
      setSuccess(true);
    } catch (err: any) {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setAgentEmail(''); setYourName('');
    setError(''); setSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <Pressable style={styles.modalOverlay} onPress={resetAndClose}>
          <Pressable onPress={(e) => e.stopPropagation()} style={[styles.modalCard, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
            {success ? (
              <View style={styles.successContent}>
                <View style={[styles.successIcon, { backgroundColor: 'rgba(37,99,235,0.15)' }]}>
                  <Ionicons name="mail" size={48} color="#2563EB" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Invite Sent!</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                  We'll let your agent know about TrustHome. They'll get everything they need to get started.
                </Text>
                <Pressable style={styles.successBtn} onPress={resetAndClose}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.successBtnGradient}>
                    <Text style={styles.successBtnText}>Done</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.modalIconWrap}>
                    <Ionicons name="paper-plane" size={24} color="#FFFFFF" />
                  </LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Share with Your Agent</Text>
                    <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                      Send an invite so your agent can explore TrustHome.
                    </Text>
                  </View>
                  <Pressable onPress={resetAndClose} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Your Name (optional)</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    value={yourName}
                    onChangeText={setYourName}
                    placeholder="Your name"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Agent's Email</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    value={agentEmail}
                    onChangeText={setAgentEmail}
                    placeholder="agent@email.com"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {error ? (
                  <View style={styles.errorRow}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <Pressable style={styles.submitBtn} onPress={handleSend} disabled={loading}>
                  <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.submitBtnGradient}>
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={styles.submitBtnText}>Send Invite</Text>
                        <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <View style={styles.privacyNote}>
                  <Ionicons name="lock-closed" size={12} color={colors.textTertiary} />
                  <Text style={[styles.privacyText, { color: colors.textTertiary }]}>
                    We only use this to send a one-time invite. No spam, ever.
                  </Text>
                </View>
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 999,
  },
  barGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(12px)',
    } as any : {}),
  },
  barLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  barActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  barBtnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  barBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  barBtnPrimaryText: {
    color: '#1A8A7E',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 24,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    } as any : {}),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
  },
  submitBtn: {
    marginTop: 4,
    borderRadius: 14,
    overflow: 'hidden',
  },
  submitBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successBtn: {
    marginTop: 20,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  successBtnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    justifyContent: 'center',
  },
  privacyText: {
    fontSize: 11,
  },
});
