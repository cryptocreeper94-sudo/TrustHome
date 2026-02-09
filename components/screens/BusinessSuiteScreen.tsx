import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { apiRequest, queryClient } from '@/lib/query-client';

type SegmentType = 'expenses' | 'mileage';

const EXPENSE_CATEGORIES = [
  { id: 'marketing', label: 'Marketing', icon: 'megaphone-outline' as const },
  { id: 'office', label: 'Office', icon: 'business-outline' as const },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' as const },
  { id: 'meals', label: 'Meals', icon: 'restaurant-outline' as const },
  { id: 'technology', label: 'Tech', icon: 'laptop-outline' as const },
  { id: 'staging', label: 'Staging', icon: 'home-outline' as const },
  { id: 'photography', label: 'Photo', icon: 'camera-outline' as const },
  { id: 'supplies', label: 'Supplies', icon: 'cart-outline' as const },
  { id: 'insurance', label: 'Insurance', icon: 'shield-outline' as const },
  { id: 'education', label: 'Education', icon: 'school-outline' as const },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

const MILEAGE_CATEGORIES = [
  { id: 'showing', label: 'Showing' },
  { id: 'open-house', label: 'Open House' },
  { id: 'client-meeting', label: 'Client Mtg' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'closing', label: 'Closing' },
  { id: 'prospecting', label: 'Prospecting' },
  { id: 'other', label: 'Other' },
];

const IRS_RATE_2026 = 0.70;

export function BusinessSuiteScreen() {
  const { colors, isDark } = useTheme();
  const [segment, setSegment] = useState<SegmentType>('expenses');
  const [showForm, setShowForm] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expCategory, setExpCategory] = useState('other');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');
  const [expProperty, setExpProperty] = useState('');

  const [milMiles, setMilMiles] = useState('');
  const [milPurpose, setMilPurpose] = useState('');
  const [milCategory, setMilCategory] = useState('showing');
  const [milDate, setMilDate] = useState(new Date().toISOString().split('T')[0]);
  const [milStart, setMilStart] = useState('');
  const [milEnd, setMilEnd] = useState('');
  const [milNotes, setMilNotes] = useState('');

  const expensesQuery = useQuery<any[]>({ queryKey: ['/api/expenses?agentId=demo'] });
  const mileageQuery = useQuery<any[]>({ queryKey: ['/api/mileage?agentId=demo'] });

  const expensesList: any[] = Array.isArray(expensesQuery.data) ? expensesQuery.data : [];
  const mileageList: any[] = Array.isArray(mileageQuery.data) ? mileageQuery.data : [];

  const totalExpenses = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalMiles = mileageList.reduce((sum, m) => sum + (m.miles || 0), 0);
  const mileageDeduction = totalMiles * IRS_RATE_2026;
  const totalDeductions = totalExpenses + mileageDeduction;

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/expenses', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses?agentId=demo'] });
      closeForm();
    },
  });

  const addMileageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/mileage', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mileage?agentId=demo'] });
      closeForm();
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest('DELETE', `/api/expenses/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/expenses?agentId=demo'] }); },
  });

  const deleteMileageMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest('DELETE', `/api/mileage/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['/api/mileage?agentId=demo'] }); },
  });

  const closeForm = () => {
    setShowForm(false);
    setShowOptional(false);
    setExpDesc(''); setExpAmount(''); setExpVendor(''); setExpCategory('other');
    setExpDate(new Date().toISOString().split('T')[0]); setExpNotes(''); setExpProperty('');
    setMilMiles(''); setMilPurpose(''); setMilCategory('showing');
    setMilDate(new Date().toISOString().split('T')[0]); setMilStart(''); setMilEnd(''); setMilNotes('');
  };

  const handleScanReceipt = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.[0]?.base64) return;

      setOcrLoading(true);
      setShowForm(true);
      setSegment('expenses');
      const res = await apiRequest('POST', '/api/expenses/ocr', {
        imageBase64: result.assets[0].base64,
      });
      const ocr = await res.json();
      if (ocr.vendor) setExpVendor(ocr.vendor);
      if (ocr.amount) setExpAmount(String(ocr.amount));
      if (ocr.date) setExpDate(ocr.date);
      if (ocr.description) setExpDesc(ocr.description);
      if (ocr.category) setExpCategory(ocr.category);
      setOcrLoading(false);
    } catch {
      setOcrLoading(false);
      Alert.alert('Receipt Scan', 'Could not read receipt. Please fill in the details manually.');
    }
  };

  const submitExpense = () => {
    if (!expDesc.trim() || !expAmount.trim()) {
      Alert.alert('Missing Info', 'Please add a description and amount.');
      return;
    }
    addExpenseMutation.mutate({
      description: expDesc.trim(),
      amount: parseFloat(expAmount),
      vendor: expVendor.trim() || null,
      category: expCategory,
      date: expDate,
      notes: expNotes.trim() || null,
      propertyAddress: expProperty.trim() || null,
      agentId: 'demo',
    });
  };

  const submitMileage = () => {
    if (!milMiles.trim() || !milPurpose.trim()) {
      Alert.alert('Missing Info', 'Please add miles and a purpose.');
      return;
    }
    addMileageMutation.mutate({
      miles: parseFloat(milMiles),
      purpose: milPurpose.trim(),
      category: milCategory,
      date: milDate,
      startAddress: milStart.trim() || null,
      endAddress: milEnd.trim() || null,
      notes: milNotes.trim() || null,
      agentId: 'demo',
    });
  };

  const confirmDelete = (type: 'expense' | 'mileage', id: string) => {
    const label = type === 'expense' ? 'expense' : 'mileage entry';
    if (Platform.OS === 'web') {
      if (confirm(`Delete this ${label}?`)) {
        type === 'expense' ? deleteExpenseMutation.mutate(id) : deleteMileageMutation.mutate(id);
      }
    } else {
      Alert.alert('Delete', `Remove this ${label}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () =>
          type === 'expense' ? deleteExpenseMutation.mutate(id) : deleteMileageMutation.mutate(id)
        },
      ]);
    }
  };

  const inputStyle = [styles.input, {
    backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7',
    color: colors.text,
    borderColor: isDark ? '#333' : '#e0e0e0',
  }];

  const isPending = segment === 'expenses' ? addExpenseMutation.isPending : addMileageMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Business Suite" showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Summary Strip ── */}
          <View style={styles.summaryStrip}>
            <View style={styles.summaryItem}>
              <Ionicons name="receipt-outline" size={16} color={colors.primary} />
              <View>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Expenses</Text>
              </View>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="car-outline" size={16} color="#4A90D9" />
              <View>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {totalMiles.toLocaleString('en-US', { maximumFractionDigits: 0 })} mi
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Mileage</Text>
              </View>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]} />
            <View style={styles.summaryItem}>
              <Ionicons name="calculator-outline" size={16} color="#34C759" />
              <View>
                <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                  ${totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Deductions</Text>
              </View>
            </View>
          </View>

          {/* ── Segment Toggle ── */}
          <View style={[styles.segmentWrap, { backgroundColor: isDark ? '#1a1a2e' : '#f0f0f3' }]}>
            <Pressable
              style={[
                styles.segmentBtn,
                segment === 'expenses' && [styles.segmentActive, { backgroundColor: isDark ? colors.surface : '#fff' }],
              ]}
              onPress={() => { setSegment('expenses'); if (showForm) closeForm(); }}
            >
              <Ionicons name="receipt-outline" size={16} color={segment === 'expenses' ? colors.primary : colors.textSecondary} />
              <Text style={[
                styles.segmentText,
                { color: segment === 'expenses' ? colors.primary : colors.textSecondary },
                segment === 'expenses' && styles.segmentTextActive,
              ]}>Expenses</Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentBtn,
                segment === 'mileage' && [styles.segmentActive, { backgroundColor: isDark ? colors.surface : '#fff' }],
              ]}
              onPress={() => { setSegment('mileage'); if (showForm) closeForm(); }}
            >
              <Ionicons name="car-outline" size={16} color={segment === 'mileage' ? '#4A90D9' : colors.textSecondary} />
              <Text style={[
                styles.segmentText,
                { color: segment === 'mileage' ? '#4A90D9' : colors.textSecondary },
                segment === 'mileage' && styles.segmentTextActive,
              ]}>Mileage</Text>
            </Pressable>
          </View>

          {/* ── Inline Form ── */}
          {showForm && (
            <Animated.View entering={SlideInDown.duration(250)} style={styles.formWrap}>
              <GlassCard style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={[styles.formTitle, { color: colors.text }]}>
                    {segment === 'expenses' ? 'New Expense' : 'Log Trip'}
                  </Text>
                  <Pressable onPress={closeForm} hitSlop={12}>
                    <Ionicons name="close" size={22} color={colors.textSecondary} />
                  </Pressable>
                </View>

                {segment === 'expenses' ? (
                  <>
                    {/* Scan banner */}
                    <Pressable
                      style={[styles.scanBanner, {
                        backgroundColor: isDark ? 'rgba(232,145,53,0.1)' : 'rgba(232,145,53,0.05)',
                        borderColor: '#E8913530',
                      }]}
                      onPress={handleScanReceipt}
                    >
                      {ocrLoading ? (
                        <ActivityIndicator size="small" color="#E89135" />
                      ) : (
                        <Ionicons name="scan" size={18} color="#E89135" />
                      )}
                      <Text style={[styles.scanLabel, { color: '#E89135' }]}>
                        {ocrLoading ? 'Reading receipt...' : 'Scan receipt to auto-fill'}
                      </Text>
                    </Pressable>

                    {/* Essential fields */}
                    <TextInput
                      style={inputStyle}
                      value={expDesc}
                      onChangeText={setExpDesc}
                      placeholder="What was this for?"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <View style={styles.fieldRow}>
                      <TextInput
                        style={[inputStyle, { flex: 1 }]}
                        value={expAmount}
                        onChangeText={setExpAmount}
                        placeholder="Amount"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                      />
                      <TextInput
                        style={[inputStyle, { flex: 1 }]}
                        value={expVendor}
                        onChangeText={setExpVendor}
                        placeholder="Vendor"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    {/* Category pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContent}>
                      {EXPENSE_CATEGORIES.map(cat => {
                        const active = expCategory === cat.id;
                        return (
                          <Pressable
                            key={cat.id}
                            style={[styles.pill, {
                              backgroundColor: active ? colors.primary + '18' : (isDark ? '#222' : '#f0f0f3'),
                              borderColor: active ? colors.primary : 'transparent',
                            }]}
                            onPress={() => setExpCategory(cat.id)}
                          >
                            <Ionicons name={cat.icon} size={13} color={active ? colors.primary : colors.textSecondary} />
                            <Text style={[styles.pillText, { color: active ? colors.primary : colors.textSecondary }]}>{cat.label}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    {/* Optional toggle */}
                    <Pressable style={styles.optionalToggle} onPress={() => setShowOptional(!showOptional)}>
                      <Ionicons name={showOptional ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
                      <Text style={[styles.optionalText, { color: colors.textTertiary }]}>
                        {showOptional ? 'Less details' : 'More details'}
                      </Text>
                    </Pressable>

                    {showOptional && (
                      <Animated.View entering={FadeIn.duration(200)}>
                        <TextInput style={inputStyle} value={expDate} onChangeText={setExpDate}
                          placeholder="Date (YYYY-MM-DD)" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={inputStyle} value={expProperty} onChangeText={setExpProperty}
                          placeholder="Property address" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={[inputStyle, styles.textArea]} value={expNotes} onChangeText={setExpNotes}
                          placeholder="Notes" placeholderTextColor={colors.textSecondary} multiline />
                      </Animated.View>
                    )}
                  </>
                ) : (
                  <>
                    {/* Essential fields */}
                    <TextInput
                      style={inputStyle}
                      value={milPurpose}
                      onChangeText={setMilPurpose}
                      placeholder="Trip purpose (e.g. Showing at 123 Main St)"
                      placeholderTextColor={colors.textSecondary}
                    />
                    <View style={styles.fieldRow}>
                      <TextInput
                        style={[inputStyle, { flex: 1 }]}
                        value={milMiles}
                        onChangeText={setMilMiles}
                        placeholder="Miles"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                      />
                      <View style={[styles.deductionBadge, { backgroundColor: isDark ? 'rgba(52,199,89,0.12)' : 'rgba(52,199,89,0.06)' }]}>
                        <Ionicons name="calculator-outline" size={14} color="#34C759" />
                        <Text style={styles.deductionValue}>
                          = ${(parseFloat(milMiles || '0') * IRS_RATE_2026).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    {/* Category pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillContent}>
                      {MILEAGE_CATEGORIES.map(cat => {
                        const active = milCategory === cat.id;
                        return (
                          <Pressable
                            key={cat.id}
                            style={[styles.pill, {
                              backgroundColor: active ? '#4A90D918' : (isDark ? '#222' : '#f0f0f3'),
                              borderColor: active ? '#4A90D9' : 'transparent',
                            }]}
                            onPress={() => setMilCategory(cat.id)}
                          >
                            <Text style={[styles.pillText, { color: active ? '#4A90D9' : colors.textSecondary }]}>{cat.label}</Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>

                    {/* Optional toggle */}
                    <Pressable style={styles.optionalToggle} onPress={() => setShowOptional(!showOptional)}>
                      <Ionicons name={showOptional ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
                      <Text style={[styles.optionalText, { color: colors.textTertiary }]}>
                        {showOptional ? 'Less details' : 'More details (addresses, notes)'}
                      </Text>
                    </Pressable>

                    {showOptional && (
                      <Animated.View entering={FadeIn.duration(200)}>
                        <TextInput style={inputStyle} value={milDate} onChangeText={setMilDate}
                          placeholder="Date (YYYY-MM-DD)" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={inputStyle} value={milStart} onChangeText={setMilStart}
                          placeholder="Start address" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={inputStyle} value={milEnd} onChangeText={setMilEnd}
                          placeholder="End address" placeholderTextColor={colors.textSecondary} />
                        <TextInput style={[inputStyle, styles.textArea]} value={milNotes} onChangeText={setMilNotes}
                          placeholder="Notes" placeholderTextColor={colors.textSecondary} multiline />
                      </Animated.View>
                    )}
                  </>
                )}

                {/* Submit */}
                <Pressable
                  style={[styles.submitBtn, {
                    backgroundColor: segment === 'expenses' ? colors.primary : '#4A90D9',
                    opacity: isPending ? 0.7 : 1,
                  }]}
                  onPress={segment === 'expenses' ? submitExpense : submitMileage}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.submitText}>
                        {segment === 'expenses' ? 'Save Expense' : 'Save Trip'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </GlassCard>
            </Animated.View>
          )}

          {/* ── List ── */}
          <View style={styles.listSection}>
            {segment === 'expenses' ? (
              expensesList.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(26,138,126,0.1)' : 'rgba(26,138,126,0.05)' }]}>
                    <Ionicons name="receipt-outline" size={28} color={colors.primary} />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No expenses yet</Text>
                  <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                    Tap + to add one, or scan a receipt
                  </Text>
                </View>
              ) : (
                expensesList.map((exp) => (
                  <ExpenseRow key={exp.id} expense={exp} colors={colors} isDark={isDark} onDelete={() => confirmDelete('expense', exp.id)} />
                ))
              )
            ) : (
              mileageList.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(74,144,217,0.1)' : 'rgba(74,144,217,0.05)' }]}>
                    <Ionicons name="car-outline" size={28} color="#4A90D9" />
                  </View>
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No trips logged</Text>
                  <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                    Tap + to log your business drives
                  </Text>
                </View>
              ) : (
                <>
                  <View style={[styles.irsNote, { backgroundColor: isDark ? 'rgba(52,199,89,0.08)' : 'rgba(52,199,89,0.04)' }]}>
                    <MaterialCommunityIcons name="highway" size={14} color="#34C759" />
                    <Text style={[styles.irsText, { color: colors.textSecondary }]}>
                      IRS rate: ${IRS_RATE_2026.toFixed(2)}/mi
                    </Text>
                  </View>
                  {mileageList.map((entry) => (
                    <MileageRow key={entry.id} entry={entry} colors={colors} isDark={isDark} onDelete={() => confirmDelete('mileage', entry.id)} />
                  ))}
                </>
              )
            )}
          </View>

          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── FAB ── */}
      {!showForm && (
        <Pressable
          style={[styles.fab, { backgroundColor: segment === 'expenses' ? colors.primary : '#4A90D9' }]}
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

function ExpenseRow({ expense, colors, isDark, onDelete }: { expense: any; colors: any; isDark: boolean; onDelete: () => void }) {
  const catInfo = EXPENSE_CATEGORIES.find(c => c.id === expense.category);

  return (
    <Pressable onLongPress={onDelete} style={styles.rowPressable}>
      <View style={[styles.listRow, { borderBottomColor: isDark ? '#1a1a2e' : '#f0f0f3' }]}>
        <View style={[styles.rowIcon, { backgroundColor: isDark ? 'rgba(26,138,126,0.1)' : 'rgba(26,138,126,0.04)' }]}>
          <Ionicons name={catInfo?.icon || 'ellipsis-horizontal-outline'} size={16} color={colors.primary} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{expense.description}</Text>
          <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
            {expense.vendor ? `${expense.vendor} \u00B7 ` : ''}{expense.date || expense.expense_date}
          </Text>
        </View>
        <Text style={[styles.rowAmount, { color: colors.text }]}>
          -${parseFloat(expense.amount).toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

function MileageRow({ entry, colors, isDark, onDelete }: { entry: any; colors: any; isDark: boolean; onDelete: () => void }) {
  const deduction = (entry.miles || 0) * IRS_RATE_2026;

  return (
    <Pressable onLongPress={onDelete} style={styles.rowPressable}>
      <View style={[styles.listRow, { borderBottomColor: isDark ? '#1a1a2e' : '#f0f0f3' }]}>
        <View style={[styles.rowIcon, { backgroundColor: isDark ? 'rgba(74,144,217,0.1)' : 'rgba(74,144,217,0.04)' }]}>
          <Ionicons name="car-outline" size={16} color="#4A90D9" />
        </View>
        <View style={styles.rowInfo}>
          <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>{entry.purpose}</Text>
          <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
            {entry.date || entry.entry_date} \u00B7 {parseFloat(entry.miles).toFixed(1)} mi
          </Text>
        </View>
        <Text style={[styles.rowAmount, { color: '#34C759' }]}>
          ${deduction.toFixed(2)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    marginTop: 1,
  },
  summaryDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 8,
  },

  segmentWrap: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  segmentActive: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
    }),
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  segmentTextActive: {
    fontWeight: '700' as const,
  },

  formWrap: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  formCard: {
    minHeight: 'auto' as any,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    gap: 6,
  },
  scanLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 8,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top' as const,
  },
  pillScroll: {
    marginTop: 10,
    maxHeight: 34,
  },
  pillContent: {
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  optionalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    marginTop: 4,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  deductionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  deductionValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#34C759',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 6,
    marginTop: 12,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700' as const,
  },

  listSection: {
    paddingHorizontal: 16,
  },
  rowPressable: {},
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
  },

  irsNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
  },
  irsText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
  },

  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 50 : 30,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 6 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    }),
  },
});
