import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { apiRequest, queryClient } from '@/lib/query-client';

type TeamStep = 'gate' | 'login' | 'register' | 'verify' | 'forgot' | 'reset_code' | 'set_password' | 'request_access' | 'request_success';
type VerifySource = 'login' | 'register';

export default function TeamScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<TeamStep>('gate');
  const [verifySource, setVerifySource] = useState<VerifySource>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [pinChecking, setPinChecking] = useState(false);
  const pinRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
  const codeRefs = useRef<(TextInput | null)[]>([]);

  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [showSetupPassword, setShowSetupPassword] = useState(false);

  const [reqFirstName, setReqFirstName] = useState('');
  const [reqLastName, setReqLastName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqBrokerage, setReqBrokerage] = useState('');
  const [reqMessage, setReqMessage] = useState('');

  const clearError = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  const goToStep = useCallback((s: TeamStep) => {
    clearError();
    setStep(s);
  }, [clearError]);

  const parseError = async (err: unknown): Promise<string> => {
    if (err instanceof Error) {
      try {
        const msg = err.message;
        const jsonPart = msg.substring(msg.indexOf('{'));
        const parsed = JSON.parse(jsonPart);
        return parsed.error || msg;
      } catch {
        return err.message.replace(/^\d+:\s*/, '');
      }
    }
    return 'Something went wrong. Please try again.';
  };

  const handlePinDigit = useCallback(async (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);
    if (text && !/^\d$/.test(text)) return;

    setPinError(false);
    const newDigits = [...pinDigits];
    newDigits[index] = text;
    setPinDigits(newDigits);

    if (text && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    if (newDigits.every(d => d.length === 1)) {
      const entered = newDigits.join('');
      setPinChecking(true);
      try {
        const res = await apiRequest('POST', '/api/auth/dev-pin', { pin: entered });
        const data = await res.json();
        await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        if (data.mustResetPassword) {
          goToStep('set_password');
        } else {
          router.replace('/');
        }
      } catch (err) {
        setPinError(true);
        setTimeout(() => {
          setPinDigits(['', '', '', '']);
          pinRefs.current[0]?.focus();
        }, 600);
      } finally {
        setPinChecking(false);
      }
    }
  }, [pinDigits, router, goToStep]);

  const handlePinKeyPress = useCallback((e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !pinDigits[index] && index > 0) {
      const newDigits = [...pinDigits];
      newDigits[index - 1] = '';
      setPinDigits(newDigits);
      pinRefs.current[index - 1]?.focus();
    }
  }, [pinDigits]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/auth/login', { email: email.trim().toLowerCase(), password });
      setVerifySource('login');
      setVerifyCode(['', '', '', '', '', '']);
      goToStep('verify');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!pwRegex.test(password)) {
      setError('Password does not meet requirements');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/auth/register', {
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'agent',
        phone: phone.trim() || undefined,
      });
      setVerifySource('register');
      setVerifyCode(['', '', '', '', '', '']);
      goToStep('verify');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = verifyCode.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    clearError();
    try {
      const endpoint = verifySource === 'login' ? '/api/auth/login/verify' : '/api/auth/verify-email';
      await apiRequest('POST', endpoint, {
        email: email.trim().toLowerCase(),
        code,
        rememberMe,
      });
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      router.replace('/');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/auth/resend-code', { email: email.trim().toLowerCase() });
      setSuccessMsg('A new code has been sent to your email');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/auth/forgot-password', { email: resetEmail.trim().toLowerCase() });
      setEmail(resetEmail.trim().toLowerCase());
      goToStep('reset_code');
      setSuccessMsg('If an account exists with that email, a reset code has been sent');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const code = verifyCode.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!pwRegex.test(newPassword)) {
      setError('Password does not meet requirements');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/auth/reset-password', {
        email: resetEmail.trim().toLowerCase(),
        code,
        newPassword,
      });
      setSuccessMsg('Password reset successfully! You can now sign in.');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setVerifyCode(['', '', '', '', '', '']);
      setTimeout(() => goToStep('login'), 2000);
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!setupPassword || !setupConfirm) {
      setError('Please fill in both fields');
      return;
    }
    if (setupPassword !== setupConfirm) {
      setError('Passwords do not match');
      return;
    }
    const pwRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!pwRegex.test(setupPassword)) {
      setError('Password does not meet requirements');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/auth/set-password', { password: setupPassword });
      await queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      router.replace('/');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    if (!reqFirstName.trim() || !reqLastName.trim() || !reqEmail.trim()) {
      setError('Please fill in your name and email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(reqEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await apiRequest('POST', '/api/access-requests', {
        firstName: reqFirstName.trim(),
        lastName: reqLastName.trim(),
        email: reqEmail.trim().toLowerCase(),
        phone: reqPhone.trim() || undefined,
        brokerage: reqBrokerage.trim() || undefined,
        message: reqMessage.trim() || undefined,
        role: 'agent',
      });
      goToStep('request_success');
    } catch (err) {
      setError(await parseError(err));
    } finally {
      setLoading(false);
    }
  };

  const setupPwHasLength = setupPassword.length >= 8;
  const setupPwHasUpper = /[A-Z]/.test(setupPassword);
  const setupPwHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(setupPassword);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...verifyCode];
    if (text.length > 1) {
      const chars = text.replace(/[^0-9]/g, '').split('');
      chars.forEach((c, i) => {
        if (index + i < 6) newCode[index + i] = c;
      });
      setVerifyCode(newCode);
      const nextIndex = Math.min(index + chars.length, 5);
      codeRefs.current[nextIndex]?.focus();
      return;
    }
    newCode[index] = text.replace(/[^0-9]/g, '');
    setVerifyCode(newCode);
    if (text && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !verifyCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const pwHasLength = password.length >= 8;
  const pwHasUpper = /[A-Z]/.test(password);
  const pwHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const newPwHasLength = newPassword.length >= 8;
  const newPwHasUpper = /[A-Z]/.test(newPassword);
  const newPwHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const renderPasswordReqs = (hasLen: boolean, hasUp: boolean, hasSpec: boolean) => (
    <View style={styles.reqContainer}>
      <View style={styles.reqRow}>
        <Ionicons name={hasLen ? 'checkmark-circle' : 'close-circle'} size={16} color={hasLen ? colors.success : colors.error} />
        <Text style={[styles.reqText, { color: colors.textSecondary }]}>At least 8 characters</Text>
      </View>
      <View style={styles.reqRow}>
        <Ionicons name={hasUp ? 'checkmark-circle' : 'close-circle'} size={16} color={hasUp ? colors.success : colors.error} />
        <Text style={[styles.reqText, { color: colors.textSecondary }]}>One uppercase letter</Text>
      </View>
      <View style={styles.reqRow}>
        <Ionicons name={hasSpec ? 'checkmark-circle' : 'close-circle'} size={16} color={hasSpec ? colors.success : colors.error} />
        <Text style={[styles.reqText, { color: colors.textSecondary }]}>One special character</Text>
      </View>
    </View>
  );

  const renderCodeInputs = () => (
    <View style={styles.codeRow}>
      {verifyCode.map((digit, i) => (
        <TextInput
          key={i}
          ref={ref => { codeRefs.current[i] = ref; }}
          style={[
            styles.codeBox,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: digit ? colors.primary : colors.border,
              color: colors.text,
            },
          ]}
          value={digit}
          onChangeText={t => handleCodeChange(t, i)}
          onKeyPress={e => handleCodeKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset, paddingBottom: bottomInset }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backNav} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            <Text style={[styles.backNavText, { color: colors.textSecondary }]}>Back</Text>
          </Pressable>

          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="people" size={36} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoTitle, { color: colors.text }]}>Team Access</Text>
            <Text style={[styles.logoSubtitle, { color: colors.textSecondary }]}>Agent & team member portal</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>

            {step === 'gate' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Enter Access Code</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Enter your team PIN to get started, or tap below to sign in with your account
                </Text>

                <View style={styles.pinRow}>
                  {pinDigits.map((digit, i) => (
                    <View
                      key={i}
                      style={[
                        styles.pinCell,
                        {
                          backgroundColor: colors.backgroundTertiary,
                          borderColor: pinError ? colors.error : digit ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <TextInput
                        ref={(ref) => { pinRefs.current[i] = ref; }}
                        style={[styles.pinInput, { color: colors.text }]}
                        value={digit}
                        onChangeText={(text) => handlePinDigit(text, i)}
                        onKeyPress={(e) => handlePinKeyPress(e, i)}
                        keyboardType="number-pad"
                        maxLength={1}
                        secureTextEntry
                        autoFocus={i === 0}
                        selectTextOnFocus
                        testID={`pin-input-${i}`}
                      />
                    </View>
                  ))}
                </View>

                {pinChecking && (
                  <View style={styles.pinCheckingRow}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.pinCheckingText, { color: colors.textSecondary }]}>Authenticating...</Text>
                  </View>
                )}

                {pinError && (
                  <View style={[styles.errorBox, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
                    <Ionicons name="alert-circle" size={16} color={colors.error} />
                    <Text style={[styles.errorText, { color: colors.error }]}>Authentication failed. Try again.</Text>
                  </View>
                )}

                <View style={[styles.dividerRow, { marginTop: 8 }]}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => goToStep('login')}
                  testID="team-signin-btn"
                >
                  <Text style={styles.primaryBtnText}>Sign In with Email</Text>
                </Pressable>

                <Pressable style={styles.linkBtn} onPress={() => goToStep('register')}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Create Team Account</Text>
                </Pressable>

                <View style={[styles.dividerRow, { marginTop: 4 }]}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>new here?</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <Pressable
                  style={[styles.requestAccessBtn, { borderColor: colors.primary }]}
                  onPress={() => goToStep('request_access')}
                  testID="request-access-btn"
                >
                  <Ionicons name="hand-right-outline" size={18} color={colors.primary} />
                  <Text style={[styles.requestAccessText, { color: colors.primary }]}>Request Access</Text>
                </Pressable>
              </Animated.View>
            )}

            {step === 'login' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Pressable style={styles.backRow} onPress={() => goToStep('gate')}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Team Sign In</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Sign in to your team account</Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="team-email-input"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showPassword}
                      testID="team-password-input"
                    />
                    <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.rememberRow}>
                  <Pressable
                    onPress={() => setRememberMe(!rememberMe)}
                    style={[styles.toggle, { backgroundColor: rememberMe ? colors.primary : colors.backgroundTertiary, borderColor: rememberMe ? colors.primary : colors.border }]}
                  >
                    <View style={rememberMe ? styles.toggleDot : [styles.toggleDotOff, { backgroundColor: colors.textTertiary, alignSelf: 'flex-start' as const }]} />
                  </Pressable>
                  <Text style={[styles.rememberLabel, { color: colors.text }]}>Remember me (30 days)</Text>
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleLogin}
                  disabled={loading}
                  testID="team-login-btn"
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Sign In</Text>}
                </Pressable>

                <Pressable style={styles.linkBtn} onPress={() => { setResetEmail(email); goToStep('forgot'); }}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Forgot Password?</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <Pressable style={styles.linkBtn} onPress={() => goToStep('register')}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Create Team Account</Text>
                </Pressable>
              </Animated.View>
            )}

            {step === 'register' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Pressable style={styles.backRow} onPress={() => goToStep('gate')}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Join the Team</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Create your agent account</Text>

                <View style={[styles.nameRow, { marginBottom: 16 }]}>
                  <View style={[styles.inputGroup, styles.halfInput, { marginBottom: 0 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, styles.halfInput, { marginBottom: 0 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone (optional)</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="call-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="(555) 123-4567"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                  {password.length > 0 && renderPasswordReqs(pwHasLength, pwHasUpper, pwHasSpecial)}
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Create Account</Text>}
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <Pressable style={styles.linkBtn} onPress={() => goToStep('login')}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Already have an account? Sign In</Text>
                </Pressable>
              </Animated.View>
            )}

            {step === 'verify' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Pressable style={styles.backRow} onPress={() => goToStep(verifySource === 'login' ? 'login' : 'register')}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>

                <View style={styles.verifyIconWrap}>
                  <View style={[styles.verifyIcon, { backgroundColor: colors.primary + '14' }]}>
                    <Ionicons name="mail-open-outline" size={32} color={colors.primary} />
                  </View>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Verify Your Email</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  We sent a 6-digit code to {email}
                </Text>

                {renderCodeInputs()}

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleVerify}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Verify</Text>}
                </Pressable>

                <Pressable style={styles.linkBtn} onPress={handleResendCode} disabled={loading}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Resend Code</Text>
                </Pressable>
              </Animated.View>
            )}

            {step === 'forgot' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Pressable style={styles.backRow} onPress={() => goToStep('login')}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Enter your email and we'll send a reset code
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Send Reset Code</Text>}
                </Pressable>
              </Animated.View>
            )}

            {step === 'reset_code' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Pressable style={styles.backRow} onPress={() => goToStep('forgot')}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Enter Reset Code</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Enter the code sent to {resetEmail} and your new password
                </Text>

                {renderCodeInputs()}

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="New password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showNewPassword}
                    />
                    <Pressable style={styles.eyeBtn} onPress={() => setShowNewPassword(!showNewPassword)}>
                      <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                  {newPassword.length > 0 && renderPasswordReqs(newPwHasLength, newPwHasUpper, newPwHasSpecial)}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showNewPassword}
                    />
                  </View>
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Reset Password</Text>}
                </Pressable>
              </Animated.View>
            )}

            {step === 'set_password' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <View style={[styles.setupBanner, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                  <Text style={[styles.setupBannerText, { color: colors.primary }]}>Welcome! Set up your secure password to continue.</Text>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text }]}>Create Your Password</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Choose a strong password for your account. You will use this to sign in going forward.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>New Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={setupPassword}
                      onChangeText={setSetupPassword}
                      placeholder="Create a strong password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showSetupPassword}
                      testID="setup-password-input"
                    />
                    <Pressable style={styles.eyeBtn} onPress={() => setShowSetupPassword(!showSetupPassword)}>
                      <Ionicons name={showSetupPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                  {setupPassword.length > 0 && renderPasswordReqs(setupPwHasLength, setupPwHasUpper, setupPwHasSpecial)}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Confirm Password</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={setupConfirm}
                      onChangeText={setSetupConfirm}
                      placeholder="Confirm your password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showSetupPassword}
                      testID="setup-confirm-input"
                    />
                  </View>
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleSetPassword}
                  disabled={loading}
                  testID="setup-password-btn"
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Set Password & Continue</Text>}
                </Pressable>
              </Animated.View>
            )}

            {step === 'request_access' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <Pressable style={styles.backRow} onPress={() => goToStep('gate')}>
                  <Ionicons name="chevron-back" size={18} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Request Access</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Interested in TrustHome? Tell us about yourself and we'll get you set up.
                </Text>

                <View style={[styles.nameRow, { marginBottom: 16 }]}>
                  <View style={[styles.inputGroup, styles.halfInput, { marginBottom: 0 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name *</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={reqFirstName}
                        onChangeText={setReqFirstName}
                        placeholder="First"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="words"
                        testID="req-first-name"
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, styles.halfInput, { marginBottom: 0 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name *</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={reqLastName}
                        onChangeText={setReqLastName}
                        placeholder="Last"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize="words"
                        testID="req-last-name"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email *</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={reqEmail}
                      onChangeText={setReqEmail}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      testID="req-email"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="call-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={reqPhone}
                      onChangeText={setReqPhone}
                      placeholder="(555) 123-4567"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                      testID="req-phone"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Brokerage / Company</Text>
                  <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <Ionicons name="business-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={reqBrokerage}
                      onChangeText={setReqBrokerage}
                      placeholder="Your brokerage or company"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="words"
                      testID="req-brokerage"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tell us about your needs</Text>
                  <View style={[styles.inputWrap, styles.textAreaWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.input, styles.textArea, { color: colors.text }]}
                      value={reqMessage}
                      onChangeText={setReqMessage}
                      placeholder="What are you looking for in a real estate platform?"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      testID="req-message"
                    />
                  </View>
                </View>

                <Pressable
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  onPress={handleRequestAccess}
                  disabled={loading}
                  testID="req-submit-btn"
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Submit Request</Text>}
                </Pressable>
              </Animated.View>
            )}

            {step === 'request_success' && (
              <Animated.View entering={FadeInDown.duration(400)}>
                <View style={styles.successCenter}>
                  <View style={[styles.successIcon, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text, textAlign: 'center' as const }]}>Request Received!</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary, textAlign: 'center' as const }]}>
                    Thank you for your interest in TrustHome. Our team will review your request and reach out to you shortly to get you set up.
                  </Text>
                  <Pressable
                    style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 8 }]}
                    onPress={() => router.back()}
                    testID="req-done-btn"
                  >
                    <Text style={styles.primaryBtnText}>Done</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}
            {successMsg ? (
              <View style={[styles.successBox, { backgroundColor: colors.success + '10', borderColor: colors.success + '30' }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.successText, { color: colors.success }]}>{successMsg}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.footerArea}>
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textTertiary} />
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>Powered by TrustShield</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  backNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  backNavText: { fontSize: 14, fontWeight: '500' as const },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoTitle: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  logoSubtitle: { fontSize: 14, marginTop: 4, fontWeight: '400' as const },
  card: { borderRadius: 20, padding: 24, borderWidth: 1 },
  cardTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginVertical: 16,
  },
  pinCell: {
    width: 56,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    textAlign: 'center',
    width: '100%' as any,
    height: '100%' as any,
  },
  pinCheckingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  pinCheckingText: { fontSize: 13 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500' as const, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, height: 48 },
  eyeBtn: { padding: 6 },
  nameRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  toggleDotOff: {
    width: 18,
    height: 18,
    borderRadius: 9,
    opacity: 0.5,
  },
  rememberLabel: { fontSize: 14, fontWeight: '500' as const },
  primaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  linkBtn: { alignItems: 'center', paddingVertical: 12 },
  linkText: { fontSize: 14, fontWeight: '600' as const },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontWeight: '500' as const },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: { fontSize: 14, fontWeight: '600' as const },
  verifyIconWrap: { alignItems: 'center', marginBottom: 16 },
  verifyIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  codeBox: {
    width: 46,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700' as const,
  },
  reqContainer: { marginTop: 8, gap: 4 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reqText: { fontSize: 12 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18 },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  successText: { flex: 1, fontSize: 13, lineHeight: 18 },
  requestAccessBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
  },
  requestAccessText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  textAreaWrap: {
    alignItems: 'flex-start' as const,
    minHeight: 100,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  successCenter: {
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  setupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  setupBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  },
  footerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingBottom: 8,
  },
  footerText: { fontSize: 12 },
});
