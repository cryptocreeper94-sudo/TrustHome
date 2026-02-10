import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { apiRequest, queryClient } from '@/lib/query-client';

type AuthStep = 'login' | 'register' | 'verify' | 'forgot' | 'reset_code';
type VerifySource = 'login' | 'register';

export default function AuthScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<AuthStep>('login');
  const [verifySource, setVerifySource] = useState<VerifySource>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'agent' | 'client'>('client');
  const [rememberMe, setRememberMe] = useState(false);

  const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
  const codeRefs = useRef<(TextInput | null)[]>([]);

  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const clearError = useCallback(() => {
    setError('');
    setSuccessMsg('');
  }, []);

  const goToStep = useCallback((s: AuthStep) => {
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
        role,
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
          testID={`code-input-${i}`}
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
          <View style={styles.logoArea}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </View>
            <Text style={[styles.logoTitle, { color: colors.text }]}>TrustHome</Text>
            <Text style={[styles.logoSubtitle, { color: colors.textSecondary }]}>Your Trusted Real Estate Partner</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
            {step === 'login' && (
              <>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Welcome Back</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Sign in to your account</Text>

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
                      testID="login-email"
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
                      testID="login-password"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.rememberRow}>
                  <Pressable
                    onPress={() => setRememberMe(!rememberMe)}
                    style={[styles.toggle, { backgroundColor: rememberMe ? colors.primary : colors.backgroundTertiary, borderColor: rememberMe ? colors.primary : colors.border }]}
                    testID="remember-me-toggle"
                  >
                    {rememberMe && <View style={styles.toggleDot} />}
                    {!rememberMe && <View style={[styles.toggleDotOff, { backgroundColor: colors.textTertiary }]} />}
                  </Pressable>
                  <Text style={[styles.rememberLabel, { color: colors.textSecondary }]}>Keep me signed in</Text>
                </View>

                {rememberMe && (
                  <View style={[styles.disclaimerBox, { backgroundColor: 'rgba(255,149,0,0.08)', borderColor: colors.warning }]}>
                    <Ionicons name="warning-outline" size={16} color={colors.warning} />
                    <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                      Enabling this keeps you signed in for 30 days. Anyone with access to this device will be able to access your account.
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleLogin}
                  disabled={loading}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  testID="login-submit"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  )}
                </Pressable>

                <Pressable onPress={() => { setResetEmail(email); goToStep('forgot'); }} style={styles.linkBtn}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Forgot your password?</Text>
                </Pressable>

                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <Pressable onPress={() => goToStep('register')} style={[styles.secondaryBtn, { borderColor: colors.primary }]} testID="go-register">
                  <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Create Account</Text>
                </Pressable>

                <View style={[styles.dividerRow, { marginTop: 12 }]}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                  <Text style={[styles.dividerText, { color: colors.textTertiary }]}>team member?</Text>
                  <View style={[styles.dividerLine, { backgroundColor: colors.divider }]} />
                </View>

                <Pressable
                  style={[styles.teamLoginBtn, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
                  onPress={() => router.push('/team')}
                  testID="team-login-link"
                >
                  <Ionicons name="people" size={18} color={colors.primary} />
                  <Text style={[styles.teamLoginBtnText, { color: colors.primary }]}>Team Login</Text>
                </Pressable>
              </>
            )}

            {step === 'register' && (
              <>
                <Pressable onPress={() => goToStep('login')} style={styles.backRow}>
                  <Ionicons name="arrow-back" size={20} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back to Sign In</Text>
                </Pressable>

                <Text style={[styles.cardTitle, { color: colors.text }]}>Create Account</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Join TrustHome today</Text>

                <View style={styles.nameRow}>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First"
                        placeholderTextColor={colors.textTertiary}
                        testID="reg-first"
                      />
                    </View>
                  </View>
                  <View style={[styles.inputGroup, styles.halfInput]}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name</Text>
                    <View style={[styles.inputWrap, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last"
                        placeholderTextColor={colors.textTertiary}
                        testID="reg-last"
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
                      testID="reg-email"
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
                      testID="reg-password"
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
                    </Pressable>
                  </View>
                  {password.length > 0 && renderPasswordReqs(pwHasLength, pwHasUpper, pwHasSpecial)}
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
                      testID="reg-phone"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>I am a...</Text>
                  <View style={styles.rolePicker}>
                    <Pressable
                      onPress={() => setRole('client')}
                      style={[styles.roleOption, { backgroundColor: role === 'client' ? colors.primary : colors.backgroundTertiary, borderColor: role === 'client' ? colors.primary : colors.border }]}
                      testID="role-client"
                    >
                      <Ionicons name="person-outline" size={18} color={role === 'client' ? '#FFFFFF' : colors.textSecondary} />
                      <Text style={[styles.roleText, { color: role === 'client' ? '#FFFFFF' : colors.textSecondary }]}>Buyer / Seller</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setRole('agent')}
                      style={[styles.roleOption, { backgroundColor: role === 'agent' ? colors.primary : colors.backgroundTertiary, borderColor: role === 'agent' ? colors.primary : colors.border }]}
                      testID="role-agent"
                    >
                      <Ionicons name="briefcase-outline" size={18} color={role === 'agent' ? '#FFFFFF' : colors.textSecondary} />
                      <Text style={[styles.roleText, { color: role === 'agent' ? '#FFFFFF' : colors.textSecondary }]}>Real Estate Agent</Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={handleRegister}
                  disabled={loading}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  testID="register-submit"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                  )}
                </Pressable>
              </>
            )}

            {step === 'verify' && (
              <>
                <Pressable onPress={() => goToStep(verifySource === 'login' ? 'login' : 'register')} style={styles.backRow}>
                  <Ionicons name="arrow-back" size={20} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>

                <View style={styles.verifyIconWrap}>
                  <View style={[styles.verifyIcon, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="mail-open-outline" size={32} color={colors.primary} />
                  </View>
                </View>

                <Text style={[styles.cardTitle, { color: colors.text, textAlign: 'center' as const }]}>Check Your Email</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary, textAlign: 'center' as const }]}>
                  We sent a 6-digit code to{'\n'}
                  <Text style={{ fontWeight: '600' as const, color: colors.text }}>{email}</Text>
                </Text>

                {renderCodeInputs()}

                <Pressable
                  onPress={handleVerify}
                  disabled={loading}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  testID="verify-submit"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify</Text>
                  )}
                </Pressable>

                <Pressable onPress={handleResendCode} disabled={loading} style={styles.linkBtn}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Resend Code</Text>
                </Pressable>
              </>
            )}

            {step === 'forgot' && (
              <>
                <Pressable onPress={() => goToStep('login')} style={styles.backRow}>
                  <Ionicons name="arrow-back" size={20} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back to Sign In</Text>
                </Pressable>

                <Text style={[styles.cardTitle, { color: colors.text }]}>Reset Password</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Enter your email and we'll send you a code to reset your password.
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
                      testID="forgot-email"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={handleForgotPassword}
                  disabled={loading}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  testID="forgot-submit"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                  )}
                </Pressable>
              </>
            )}

            {step === 'reset_code' && (
              <>
                <Pressable onPress={() => goToStep('forgot')} style={styles.backRow}>
                  <Ionicons name="arrow-back" size={20} color={colors.primary} />
                  <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
                </Pressable>

                <Text style={[styles.cardTitle, { color: colors.text }]}>Set New Password</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Enter the code from your email and choose a new password.
                </Text>

                <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 6 }]}>Verification Code</Text>
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
                      testID="reset-new-pw"
                    />
                    <Pressable onPress={() => setShowNewPassword(!showNewPassword)} style={styles.eyeBtn}>
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
                      placeholder="Confirm password"
                      placeholderTextColor={colors.textTertiary}
                      secureTextEntry={!showNewPassword}
                      testID="reset-confirm-pw"
                    />
                  </View>
                  {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                    <View style={styles.reqContainer}>
                      <View style={styles.reqRow}>
                        <Ionicons name="close-circle" size={16} color={colors.error} />
                        <Text style={[styles.reqText, { color: colors.error }]}>Passwords do not match</Text>
                      </View>
                    </View>
                  )}
                </View>

                <Pressable
                  onPress={handleResetPassword}
                  disabled={loading}
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
                  testID="reset-submit"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Reset Password</Text>
                  )}
                </Pressable>
              </>
            )}

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: 'rgba(255,59,48,0.08)', borderColor: colors.error }]}>
                <Ionicons name="alert-circle" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {successMsg ? (
              <View style={[styles.successBox, { backgroundColor: 'rgba(52,199,89,0.08)', borderColor: colors.success }]}>
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
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '400' as const,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: 48,
  },
  eyeBtn: {
    padding: 6,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
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
  rememberLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
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
  secondaryBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  verifyIconWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
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
  reqContainer: {
    marginTop: 8,
    gap: 4,
  },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reqText: {
    fontSize: 12,
  },
  rolePicker: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  teamLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  teamLoginBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  footerArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
  },
});
