import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { apiRequest, queryClient } from '@/lib/query-client';

type TabType = 'overview' | 'expenses' | 'mileage';

const EXPENSE_CATEGORIES = [
  { id: 'marketing', label: 'Marketing', icon: 'megaphone-outline' as const },
  { id: 'office', label: 'Office', icon: 'business-outline' as const },
  { id: 'travel', label: 'Travel', icon: 'airplane-outline' as const },
  { id: 'meals', label: 'Meals', icon: 'restaurant-outline' as const },
  { id: 'supplies', label: 'Supplies', icon: 'cart-outline' as const },
  { id: 'technology', label: 'Technology', icon: 'laptop-outline' as const },
  { id: 'insurance', label: 'Insurance', icon: 'shield-outline' as const },
  { id: 'licensing', label: 'Licensing', icon: 'document-outline' as const },
  { id: 'staging', label: 'Staging', icon: 'home-outline' as const },
  { id: 'photography', label: 'Photography', icon: 'camera-outline' as const },
  { id: 'signage', label: 'Signage', icon: 'flag-outline' as const },
  { id: 'gifts', label: 'Gifts', icon: 'gift-outline' as const },
  { id: 'education', label: 'Education', icon: 'school-outline' as const },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' as const },
];

const MILEAGE_CATEGORIES = [
  { id: 'showing', label: 'Showing' },
  { id: 'open-house', label: 'Open House' },
  { id: 'client-meeting', label: 'Client Meeting' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'closing', label: 'Closing' },
  { id: 'prospecting', label: 'Prospecting' },
  { id: 'office', label: 'Office Visit' },
  { id: 'other', label: 'Other' },
];

const IRS_RATE_2026 = 0.70;

interface ExpenseForm {
  description: string;
  amount: string;
  vendor: string;
  category: string;
  date: string;
  notes: string;
  propertyAddress: string;
}

interface MileageForm {
  miles: string;
  purpose: string;
  category: string;
  date: string;
  startAddress: string;
  endAddress: string;
  notes: string;
}

export function BusinessSuiteScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showMileageForm, setShowMileageForm] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    description: '', amount: '', vendor: '', category: 'other',
    date: new Date().toISOString().split('T')[0], notes: '', propertyAddress: '',
  });
  const [mileageForm, setMileageForm] = useState<MileageForm>({
    miles: '', purpose: '', category: 'showing',
    date: new Date().toISOString().split('T')[0],
    startAddress: '', endAddress: '', notes: '',
  });

  const expensesQuery = useQuery<any[]>({ queryKey: ['/api/expenses?agentId=demo'] });
  const mileageQuery = useQuery<any[]>({ queryKey: ['/api/mileage?agentId=demo'] });

  const addExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/expenses', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses?agentId=demo'] });
      setShowExpenseForm(false);
      resetExpenseForm();
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expenses?agentId=demo'] });
    },
  });

  const addMileageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/mileage', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mileage?agentId=demo'] });
      setShowMileageForm(false);
      resetMileageForm();
    },
  });

  const deleteMileageMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/mileage/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mileage?agentId=demo'] });
    },
  });

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '', amount: '', vendor: '', category: 'other',
      date: new Date().toISOString().split('T')[0], notes: '', propertyAddress: '',
    });
  };

  const resetMileageForm = () => {
    setMileageForm({
      miles: '', purpose: '', category: 'showing',
      date: new Date().toISOString().split('T')[0],
      startAddress: '', endAddress: '', notes: '',
    });
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
      const res = await apiRequest('POST', '/api/expenses/ocr', {
        imageBase64: result.assets[0].base64,
      });
      const ocrData = await res.json();

      setExpenseForm(prev => ({
        ...prev,
        vendor: ocrData.vendor || prev.vendor,
        amount: ocrData.amount ? String(ocrData.amount) : prev.amount,
        date: ocrData.date || prev.date,
        description: ocrData.description || prev.description,
        category: ocrData.category || prev.category,
      }));
      setOcrLoading(false);
      setShowExpenseForm(true);
    } catch (error) {
      setOcrLoading(false);
      Alert.alert('OCR Error', 'Could not process receipt. Please enter details manually.');
    }
  };

  const handleSubmitExpense = () => {
    if (!expenseForm.description || !expenseForm.amount) {
      Alert.alert('Required', 'Please enter a description and amount.');
      return;
    }
    addExpenseMutation.mutate({
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      agentId: 'demo',
    });
  };

  const handleSubmitMileage = () => {
    if (!mileageForm.miles || !mileageForm.purpose) {
      Alert.alert('Required', 'Please enter miles and purpose.');
      return;
    }
    addMileageMutation.mutate({
      ...mileageForm,
      miles: parseFloat(mileageForm.miles),
      agentId: 'demo',
    });
  };

  const handleDeleteExpense = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Delete this expense?')) deleteExpenseMutation.mutate(id);
    } else {
      Alert.alert('Delete Expense', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpenseMutation.mutate(id) },
      ]);
    }
  };

  const handleDeleteMileage = (id: string) => {
    if (Platform.OS === 'web') {
      if (confirm('Delete this mileage entry?')) deleteMileageMutation.mutate(id);
    } else {
      Alert.alert('Delete Entry', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMileageMutation.mutate(id) },
      ]);
    }
  };

  const expensesList: any[] = Array.isArray(expensesQuery.data) ? expensesQuery.data : [];
  const mileageList: any[] = Array.isArray(mileageQuery.data) ? mileageQuery.data : [];

  const totalExpenses = expensesList.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  const totalMiles = mileageList.reduce((sum: number, m: any) => sum + (m.miles || 0), 0);
  const mileageDeduction = totalMiles * IRS_RATE_2026;
  const totalDeductions = totalExpenses + mileageDeduction;

  const categoryIcon = (cat: string) => {
    const found = EXPENSE_CATEGORIES.find(c => c.id === cat);
    return found?.icon || 'ellipsis-horizontal-outline';
  };

  const tabs: { id: TabType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt-outline' },
    { id: 'mileage', label: 'Mileage', icon: 'car-outline' },
  ];

  const renderOverview = () => (
    <View style={styles.section}>
      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <LinearGradient
            colors={isDark ? ['#1A8A7E22', '#1A8A7E08'] : ['#1A8A7E11', '#1A8A7E04']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.statContent}>
            <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Expenses</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <LinearGradient
            colors={isDark ? ['#4A90D922', '#4A90D908'] : ['#4A90D911', '#4A90D904']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.statContent}>
            <Ionicons name="car-outline" size={22} color="#4A90D9" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalMiles.toLocaleString('en-US', { maximumFractionDigits: 1 })}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Miles</Text>
          </View>
        </GlassCard>
      </View>

      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <LinearGradient
            colors={isDark ? ['#E8913522', '#E8913508'] : ['#E8913511', '#E8913504']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.statContent}>
            <MaterialCommunityIcons name="gas-station" size={22} color="#E89135" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${mileageDeduction.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Mileage Deduction</Text>
          </View>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <LinearGradient
            colors={isDark ? ['#34C75922', '#34C75908'] : ['#34C75911', '#34C75904']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.statContent}>
            <Ionicons name="calculator-outline" size={22} color="#34C759" />
            <Text style={[styles.statValue, { color: colors.text }]}>
              ${totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Deductions</Text>
          </View>
        </GlassCard>
      </View>

      <GlassCard style={styles.rateCard}>
        <View style={styles.rateRow}>
          <View style={[styles.rateIcon, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.08)' }]}>
            <MaterialCommunityIcons name="highway" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rateTitle, { color: colors.text }]}>2026 IRS Mileage Rate</Text>
            <Text style={[styles.rateValue, { color: colors.textSecondary }]}>
              ${IRS_RATE_2026.toFixed(2)} per mile (standard business rate)
            </Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(26,138,126,0.12)' : 'rgba(26,138,126,0.06)', borderColor: colors.primary + '30' }]}
            onPress={() => { setActiveTab('expenses'); setShowExpenseForm(true); }}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Add Expense</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(74,144,217,0.12)' : 'rgba(74,144,217,0.06)', borderColor: '#4A90D930' }]}
            onPress={() => { setActiveTab('mileage'); setShowMileageForm(true); }}
          >
            <Ionicons name="car" size={28} color="#4A90D9" />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Log Mileage</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(232,145,53,0.12)' : 'rgba(232,145,53,0.06)', borderColor: '#E8913530' }]}
            onPress={handleScanReceipt}
          >
            {ocrLoading ? (
              <ActivityIndicator size="small" color="#E89135" />
            ) : (
              <Ionicons name="scan" size={28} color="#E89135" />
            )}
            <Text style={[styles.actionLabel, { color: colors.text }]}>Scan Receipt</Text>
          </Pressable>
        </View>
      </View>

      {expensesList.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Expenses</Text>
          {expensesList.slice(0, 3).map((expense: any) => (
            <ExpenseRow key={expense.id} expense={expense} colors={colors} onDelete={handleDeleteExpense} />
          ))}
          {expensesList.length > 3 && (
            <Pressable onPress={() => setActiveTab('expenses')} style={styles.viewAllBtn}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View all {expensesList.length} expenses</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>
      )}

      {mileageList.length > 0 && (
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Mileage</Text>
          {mileageList.slice(0, 3).map((entry: any) => (
            <MileageRow key={entry.id} entry={entry} colors={colors} onDelete={handleDeleteMileage} />
          ))}
          {mileageList.length > 3 && (
            <Pressable onPress={() => setActiveTab('mileage')} style={styles.viewAllBtn}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View all {mileageList.length} entries</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  const renderExpenseForm = () => (
    <GlassCard style={styles.formCard}>
      <View style={styles.formHeader}>
        <Text style={[styles.formTitle, { color: colors.text }]}>New Expense</Text>
        <Pressable onPress={() => { setShowExpenseForm(false); resetExpenseForm(); }}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Pressable
        style={[styles.scanBanner, { backgroundColor: isDark ? 'rgba(232,145,53,0.12)' : 'rgba(232,145,53,0.06)', borderColor: '#E8913530' }]}
        onPress={handleScanReceipt}
      >
        {ocrLoading ? (
          <ActivityIndicator size="small" color="#E89135" />
        ) : (
          <Ionicons name="scan" size={20} color="#E89135" />
        )}
        <Text style={[styles.scanText, { color: '#E89135' }]}>
          {ocrLoading ? 'Scanning receipt...' : 'Scan receipt to auto-fill'}
        </Text>
      </Pressable>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={expenseForm.description}
          onChangeText={v => setExpenseForm(p => ({ ...p, description: v }))}
          placeholder="What was this expense for?"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Amount *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
            value={expenseForm.amount}
            onChangeText={v => setExpenseForm(p => ({ ...p, amount: v }))}
            placeholder="0.00"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
            value={expenseForm.date}
            onChangeText={v => setExpenseForm(p => ({ ...p, date: v }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Vendor</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={expenseForm.vendor}
          onChangeText={v => setExpenseForm(p => ({ ...p, vendor: v }))}
          placeholder="Store or vendor name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {EXPENSE_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: expenseForm.category === cat.id
                    ? colors.primary + '20'
                    : (isDark ? '#1a1a2e' : '#f5f5f7'),
                  borderColor: expenseForm.category === cat.id ? colors.primary : (isDark ? '#333' : '#e0e0e0'),
                },
              ]}
              onPress={() => setExpenseForm(p => ({ ...p, category: cat.id }))}
            >
              <Ionicons name={cat.icon} size={14} color={expenseForm.category === cat.id ? colors.primary : colors.textSecondary} />
              <Text style={[
                styles.categoryChipText,
                { color: expenseForm.category === cat.id ? colors.primary : colors.textSecondary },
              ]}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Property Address (optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={expenseForm.propertyAddress}
          onChangeText={v => setExpenseForm(p => ({ ...p, propertyAddress: v }))}
          placeholder="Link to a property"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={expenseForm.notes}
          onChangeText={v => setExpenseForm(p => ({ ...p, notes: v }))}
          placeholder="Additional notes..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <Pressable
        style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: addExpenseMutation.isPending ? 0.7 : 1 }]}
        onPress={handleSubmitExpense}
        disabled={addExpenseMutation.isPending}
      >
        {addExpenseMutation.isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.submitText}>Save Expense</Text>
          </>
        )}
      </Pressable>
    </GlassCard>
  );

  const renderMileageForm = () => (
    <GlassCard style={styles.formCard}>
      <View style={styles.formHeader}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Log Mileage</Text>
        <Pressable onPress={() => { setShowMileageForm(false); resetMileageForm(); }}>
          <Ionicons name="close" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Miles *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
            value={mileageForm.miles}
            onChangeText={v => setMileageForm(p => ({ ...p, miles: v }))}
            placeholder="0.0"
            placeholderTextColor={colors.textSecondary}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date</Text>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
            value={mileageForm.date}
            onChangeText={v => setMileageForm(p => ({ ...p, date: v }))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Purpose *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={mileageForm.purpose}
          onChangeText={v => setMileageForm(p => ({ ...p, purpose: v }))}
          placeholder="Reason for trip"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {MILEAGE_CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: mileageForm.category === cat.id
                    ? '#4A90D920'
                    : (isDark ? '#1a1a2e' : '#f5f5f7'),
                  borderColor: mileageForm.category === cat.id ? '#4A90D9' : (isDark ? '#333' : '#e0e0e0'),
                },
              ]}
              onPress={() => setMileageForm(p => ({ ...p, category: cat.id }))}
            >
              <Text style={[
                styles.categoryChipText,
                { color: mileageForm.category === cat.id ? '#4A90D9' : colors.textSecondary },
              ]}>{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Start Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={mileageForm.startAddress}
          onChangeText={v => setMileageForm(p => ({ ...p, startAddress: v }))}
          placeholder="Starting location"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>End Address</Text>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={mileageForm.endAddress}
          onChangeText={v => setMileageForm(p => ({ ...p, endAddress: v }))}
          placeholder="Destination"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#1a1a2e' : '#f5f5f7', color: colors.text, borderColor: isDark ? '#333' : '#e0e0e0' }]}
          value={mileageForm.notes}
          onChangeText={v => setMileageForm(p => ({ ...p, notes: v }))}
          placeholder="Additional notes..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.deductionPreview}>
        <Ionicons name="calculator-outline" size={16} color={colors.primary} />
        <Text style={[styles.deductionText, { color: colors.textSecondary }]}>
          Estimated deduction: ${(parseFloat(mileageForm.miles || '0') * IRS_RATE_2026).toFixed(2)}
        </Text>
      </View>

      <Pressable
        style={[styles.submitBtn, { backgroundColor: '#4A90D9', opacity: addMileageMutation.isPending ? 0.7 : 1 }]}
        onPress={handleSubmitMileage}
        disabled={addMileageMutation.isPending}
      >
        {addMileageMutation.isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.submitText}>Save Mileage</Text>
          </>
        )}
      </Pressable>
    </GlassCard>
  );

  const renderExpenses = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}
          onPress={() => setShowExpenseForm(true)}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {showExpenseForm && renderExpenseForm()}

      {expensesList.length === 0 && !showExpenseForm ? (
        <GlassCard style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(26,138,126,0.12)' : 'rgba(26,138,126,0.06)' }]}>
              <Ionicons name="receipt-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No expenses yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Add your first business expense or scan a receipt to get started
            </Text>
          </View>
        </GlassCard>
      ) : (
        expensesList.map((expense: any) => (
          <ExpenseRow key={expense.id} expense={expense} colors={colors} onDelete={handleDeleteExpense} />
        ))
      )}
    </View>
  );

  const renderMileage = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mileage Log</Text>
        <Pressable
          style={[styles.addBtn, { backgroundColor: '#4A90D915', borderColor: '#4A90D930' }]}
          onPress={() => setShowMileageForm(true)}
        >
          <Ionicons name="add" size={20} color="#4A90D9" />
        </Pressable>
      </View>

      {showMileageForm && renderMileageForm()}

      {mileageList.length === 0 && !showMileageForm ? (
        <GlassCard style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? 'rgba(74,144,217,0.12)' : 'rgba(74,144,217,0.06)' }]}>
              <Ionicons name="car-outline" size={32} color="#4A90D9" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No mileage entries</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Start logging your business drives to maximize tax deductions
            </Text>
          </View>
        </GlassCard>
      ) : (
        mileageList.map((entry: any) => (
          <MileageRow key={entry.id} entry={entry} colors={colors} onDelete={handleDeleteMileage} />
        ))
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Business Suite" showBack />

      <View style={[styles.tabBar, { borderBottomColor: isDark ? '#1a1a2e' : '#e8e8e8' }]}>
        {tabs.map(tab => (
          <Pressable
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && [styles.activeTab, { borderBottomColor: colors.primary }],
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.id ? colors.primary : colors.textSecondary },
              activeTab === tab.id && styles.activeTabText,
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'expenses' && renderExpenses()}
        {activeTab === 'mileage' && renderMileage()}
        <Footer />
      </ScrollView>

      <InfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title="Business Suite"
        description="Track your business expenses, log mileage for tax deductions, and scan receipts with AI-powered OCR. All data syncs with the PaintPros ecosystem for seamless bookkeeping integration."
      />
    </View>
  );
}

function ExpenseRow({ expense, colors, onDelete }: { expense: any; colors: any; onDelete: (id: string) => void }) {
  const { isDark } = useTheme();
  const catInfo = EXPENSE_CATEGORIES.find(c => c.id === expense.category);

  return (
    <GlassCard style={styles.listCard} compact>
      <View style={styles.listRow}>
        <View style={[styles.listIcon, { backgroundColor: isDark ? 'rgba(26,138,126,0.12)' : 'rgba(26,138,126,0.06)' }]}>
          <Ionicons name={catInfo?.icon || 'ellipsis-horizontal-outline'} size={18} color={colors.primary} />
        </View>
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={[styles.listSub, { color: colors.textSecondary }]}>
            {expense.vendor ? `${expense.vendor} · ` : ''}{expense.date || expense.expense_date}
          </Text>
        </View>
        <View style={styles.listRight}>
          <Text style={[styles.listAmount, { color: colors.text }]}>
            ${parseFloat(expense.amount).toFixed(2)}
          </Text>
          <Pressable onPress={() => onDelete(expense.id)} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

function MileageRow({ entry, colors, onDelete }: { entry: any; colors: any; onDelete: (id: string) => void }) {
  const { isDark } = useTheme();
  const deduction = (entry.miles || 0) * IRS_RATE_2026;

  return (
    <GlassCard style={styles.listCard} compact>
      <View style={styles.listRow}>
        <View style={[styles.listIcon, { backgroundColor: isDark ? 'rgba(74,144,217,0.12)' : 'rgba(74,144,217,0.06)' }]}>
          <Ionicons name="car-outline" size={18} color="#4A90D9" />
        </View>
        <View style={styles.listInfo}>
          <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
            {entry.purpose}
          </Text>
          <Text style={[styles.listSub, { color: colors.textSecondary }]}>
            {entry.date || entry.entry_date} · {parseFloat(entry.miles).toFixed(1)} mi
          </Text>
        </View>
        <View style={styles.listRight}>
          <Text style={[styles.listAmount, { color: '#34C759' }]}>
            ${deduction.toFixed(2)}
          </Text>
          <Pressable onPress={() => onDelete(entry.id)} hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </Pressable>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  activeTabText: {
    fontWeight: '700' as const,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 90,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800' as const,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  rateCard: {
    marginBottom: 16,
    minHeight: 60,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rateIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  rateValue: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  recentSection: {
    marginBottom: 16,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  formCard: {
    marginBottom: 16,
    minHeight: 'auto' as any,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  scanText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top' as const,
  },
  categoryScroll: {
    maxHeight: 36,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  deductionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    paddingVertical: 8,
  },
  deductionText: {
    fontSize: 13,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  emptyCard: {
    minHeight: 160,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  listCard: {
    marginBottom: 8,
    minHeight: 60,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  listSub: {
    fontSize: 12,
    marginTop: 2,
  },
  listRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  listAmount: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
