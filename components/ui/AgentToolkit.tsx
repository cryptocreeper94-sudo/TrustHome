import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput,
  Platform, Dimensions, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ─── Tool Definitions ─── */
interface ToolDef {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
  available: boolean;
}

const TOOLS: ToolDef[] = [
  { id: 'mortgage', icon: 'calculator-outline', label: 'Mortgage Calculator', description: 'Monthly payment & amortization estimates', color: '#3B82F6', available: true },
  { id: 'listing', icon: 'create-outline', label: 'AI Listing Writer', description: 'Generate polished MLS descriptions instantly', color: '#8B5CF6', available: true },
  { id: 'netsheet', icon: 'receipt-outline', label: 'Net Sheet', description: 'Seller proceeds & closing cost breakdown', color: '#10B981', available: false },
  { id: 'clauses', icon: 'library-outline', label: 'Contract Clauses', description: 'Copy-ready contingencies & addenda', color: '#F59E0B', available: false },
  { id: 'showing-router', icon: 'navigate-outline', label: 'Showing Router', description: 'Optimized multi-property tour itineraries', color: '#EF4444', available: false },
];

/* ─── Mortgage Calculator ─── */
function MortgageCalculator({ colors, isDark, onBack }: { colors: any; isDark: boolean; onBack: () => void }) {
  const [price, setPrice] = useState('425000');
  const [downPct, setDownPct] = useState('20');
  const [rate, setRate] = useState('6.75');
  const [term, setTerm] = useState('30');

  const priceNum = parseFloat(price) || 0;
  const downPctNum = parseFloat(downPct) || 0;
  const rateNum = parseFloat(rate) || 0;
  const termNum = parseInt(term) || 30;

  const downPayment = priceNum * (downPctNum / 100);
  const loanAmount = priceNum - downPayment;
  const monthlyRate = rateNum / 100 / 12;
  const numPayments = termNum * 12;

  let monthlyPI = 0;
  if (monthlyRate > 0 && numPayments > 0 && loanAmount > 0) {
    monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  // Estimated taxes & insurance
  const monthlyTax = (priceNum * 0.012) / 12;
  const monthlyInsurance = (priceNum * 0.004) / 12;
  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance;
  const totalInterest = (monthlyPI * numPayments) - loanAmount;

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} style={styles.toolBackBtn}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
        <Text style={[styles.toolBackText, { color: colors.text }]}>All Tools</Text>
      </Pressable>

      <View style={styles.toolHeader}>
        <View style={[styles.toolIconLarge, { backgroundColor: '#3B82F620' }]}>
          <Ionicons name="calculator-outline" size={28} color="#3B82F6" />
        </View>
        <Text style={[styles.toolTitle, { color: colors.text }]}>Mortgage Calculator</Text>
        <Text style={[styles.toolSubtitle, { color: colors.textSecondary }]}>Estimate monthly payments instantly</Text>
      </View>

      {/* Inputs */}
      <View style={styles.inputGrid}>
        <View style={styles.inputHalf}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Purchase Price</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border }]}>
            <Text style={[styles.inputPrefix, { color: colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>
        <View style={styles.inputHalf}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Down Payment</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={downPct}
              onChangeText={setDownPct}
              keyboardType="numeric"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>%</Text>
          </View>
        </View>
        <View style={styles.inputHalf}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Interest Rate</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={rate}
              onChangeText={setRate}
              keyboardType="numeric"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>%</Text>
          </View>
        </View>
        <View style={styles.inputHalf}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Loan Term</Text>
          <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={term}
              onChangeText={setTerm}
              keyboardType="numeric"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>yrs</Text>
          </View>
        </View>
      </View>

      {/* Results */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[styles.resultCard, { backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF', borderColor: isDark ? 'rgba(59,130,246,0.2)' : '#BFDBFE' }]}>
        <Text style={[styles.resultLabel, { color: isDark ? '#93C5FD' : '#1D4ED8' }]}>Est. Monthly Payment</Text>
        <Text style={[styles.resultValue, { color: isDark ? '#60A5FA' : '#2563EB' }]}>{fmt(totalMonthly)}</Text>
        <Text style={[styles.resultSub, { color: isDark ? '#93C5FD' : '#3B82F6' }]}>Principal & Interest: {fmt(monthlyPI)}/mo</Text>
      </Animated.View>

      <View style={styles.breakdownGrid}>
        <View style={[styles.breakdownItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Loan Amount</Text>
          <Text style={[styles.breakdownValue, { color: colors.text }]}>{fmt(loanAmount)}</Text>
        </View>
        <View style={[styles.breakdownItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Down Payment</Text>
          <Text style={[styles.breakdownValue, { color: colors.text }]}>{fmt(downPayment)}</Text>
        </View>
        <View style={[styles.breakdownItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Est. Taxes</Text>
          <Text style={[styles.breakdownValue, { color: colors.text }]}>{fmt(monthlyTax)}/mo</Text>
        </View>
        <View style={[styles.breakdownItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC', borderColor: colors.border }]}>
          <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Total Interest</Text>
          <Text style={[styles.breakdownValue, { color: colors.text }]}>{fmt(totalInterest)}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

/* ─── AI Listing Writer ─── */
function ListingWriter({ colors, isDark, onBack }: { colors: any; isDark: boolean; onBack: () => void }) {
  const [bullets, setBullets] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generateListing = useCallback(async () => {
    if (!bullets.trim()) return;
    setLoading(true);
    setResult('');

    // Local generation — no API dependency. Produces a clean, professional MLS description.
    const points = bullets.split('\n').filter(l => l.trim());
    const bedsMatch = bullets.match(/(\d+)\s*(?:bed|br|bedroom)/i);
    const bathsMatch = bullets.match(/(\d+\.?\d*)\s*(?:bath|ba|bathroom)/i);
    const sqftMatch = bullets.match(/([\d,]+)\s*(?:sq\s*ft|sqft|square\s*feet)/i);

    const beds = bedsMatch ? bedsMatch[1] : null;
    const baths = bathsMatch ? bathsMatch[1] : null;
    const sqft = sqftMatch ? sqftMatch[1] : null;

    const sizeStr = [beds ? `${beds}-bedroom` : null, baths ? `${baths}-bathroom` : null].filter(Boolean).join(', ');
    const sqftStr = sqft ? `Spanning ${sqft} square feet, this` : 'This';

    // Construct polished description from the bullet points
    const features = points.map(p => p.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);

    const opening = sizeStr
      ? `Welcome to this stunning ${sizeStr} residence that redefines modern living.`
      : `Welcome to this exceptional residence that redefines modern living.`;

    const middle = features.length > 0
      ? `${sqftStr} home features ${features.slice(0, 3).join(', ')}${features.length > 3 ? `, along with ${features.slice(3).join(', ')}` : ''}. Every detail has been thoughtfully curated to provide both luxury and functionality.`
      : `${sqftStr} home has been thoughtfully curated to provide both luxury and functionality.`;

    const closing = `Don't miss your opportunity to make this extraordinary property your own. Schedule a private showing today.`;

    // Simulate typing effect
    const fullText = `${opening}\n\n${middle}\n\n${closing}`;
    setLoading(false);

    // Typewriter effect
    for (let i = 0; i <= fullText.length; i++) {
      await new Promise(r => setTimeout(r, 8));
      setResult(fullText.slice(0, i));
    }
  }, [bullets]);

  const copyToClipboard = useCallback(async () => {
    if (Platform.OS === 'web') {
      try { await navigator.clipboard.writeText(result); } catch {}
    }
  }, [result]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable onPress={onBack} style={styles.toolBackBtn}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
        <Text style={[styles.toolBackText, { color: colors.text }]}>All Tools</Text>
      </Pressable>

      <View style={styles.toolHeader}>
        <View style={[styles.toolIconLarge, { backgroundColor: '#8B5CF620' }]}>
          <Ionicons name="create-outline" size={28} color="#8B5CF6" />
        </View>
        <Text style={[styles.toolTitle, { color: colors.text }]}>AI Listing Writer</Text>
        <Text style={[styles.toolSubtitle, { color: colors.textSecondary }]}>Drop in bullet points, get a polished MLS description</Text>
      </View>

      <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 8 }]}>Property Details (one per line)</Text>
      <TextInput
        style={[styles.textArea, {
          color: colors.text,
          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
          borderColor: colors.border,
        }]}
        multiline
        numberOfLines={6}
        value={bullets}
        onChangeText={setBullets}
        placeholder={"4 bed, 3 bath\n2,400 sqft\nNewly remodeled kitchen with quartz counters\nLarge fenced backyard\nWalking distance to Metro station\nHardwood floors throughout"}
        placeholderTextColor={colors.textTertiary}
        textAlignVertical="top"
      />

      <Pressable
        onPress={generateListing}
        style={({ pressed }) => [
          styles.generateBtn,
          { opacity: pressed ? 0.85 : 1, backgroundColor: '#8B5CF6' },
          loading && { opacity: 0.6 },
        ]}
        disabled={loading}
      >
        <Ionicons name={loading ? 'hourglass-outline' : 'sparkles-outline'} size={18} color="#FFF" />
        <Text style={styles.generateBtnText}>{loading ? 'Generating...' : 'Generate Listing'}</Text>
      </Pressable>

      {result ? (
        <Animated.View entering={FadeInDown.duration(300)} style={[styles.resultArea, { backgroundColor: isDark ? 'rgba(139,92,246,0.08)' : '#F5F3FF', borderColor: isDark ? 'rgba(139,92,246,0.2)' : '#DDD6FE' }]}>
          <View style={styles.resultAreaHeader}>
            <Text style={[styles.resultAreaTitle, { color: isDark ? '#C4B5FD' : '#6D28D9' }]}>Generated Description</Text>
            <Pressable onPress={copyToClipboard} style={({ pressed }) => [styles.copyBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Ionicons name="copy-outline" size={16} color={isDark ? '#C4B5FD' : '#6D28D9'} />
              <Text style={{ color: isDark ? '#C4B5FD' : '#6D28D9', fontSize: 13, fontWeight: '600' }}>Copy</Text>
            </Pressable>
          </View>
          <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}


/* ─── Main Toolkit Component ─── */
export interface AgentToolkitRef {
  open: () => void;
  close: () => void;
}

export const AgentToolkit = forwardRef<AgentToolkitRef>(function AgentToolkit(_, ref) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => { setVisible(true); setActiveTool(null); },
    close: () => { setVisible(false); setActiveTool(null); },
  }));

  const handleClose = useCallback(() => {
    setVisible(false);
    setActiveTool(null);
  }, []);

  const handleToolPress = useCallback((tool: ToolDef) => {
    if (tool.available) {
      setActiveTool(tool.id);
    }
  }, []);

  const renderActiveToolContent = () => {
    switch (activeTool) {
      case 'mortgage':
        return <MortgageCalculator colors={colors} isDark={isDark} onBack={() => setActiveTool(null)} />;
      case 'listing':
        return <ListingWriter colors={colors} isDark={isDark} onBack={() => setActiveTool(null)} />;
      default:
        return null;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)' }]} />
        </Pressable>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <Animated.View
            entering={SlideInUp.duration(350).springify().damping(20)}
            style={[
              styles.modalContent,
              {
                backgroundColor: isDark ? '#0B1021' : '#FFFFFF',
                paddingTop: Platform.OS === 'web' ? 24 : insets.top + 12,
                paddingBottom: Platform.OS === 'web' ? 24 : insets.bottom + 12,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {activeTool ? TOOLS.find(t => t.id === activeTool)?.label : 'Agent Toolkit'}
                </Text>
                {!activeTool && (
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    Professional tools at your fingertips
                  </Text>
                )}
              </View>
              <Pressable onPress={handleClose} style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            {/* Content */}
            <View style={styles.contentArea}>
              {activeTool ? (
                renderActiveToolContent()
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.toolGrid}>
                  {TOOLS.map((tool, index) => (
                    <Animated.View key={tool.id} entering={FadeInDown.delay(index * 60).duration(300).springify()}>
                      <Pressable
                        onPress={() => handleToolPress(tool)}
                        style={({ pressed }) => [
                          styles.toolCard,
                          {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                            opacity: pressed ? 0.85 : 1,
                          },
                          !tool.available && { opacity: 0.5 },
                        ]}
                      >
                        <View style={[styles.toolIcon, { backgroundColor: tool.color + '18' }]}>
                          <Ionicons name={tool.icon} size={24} color={tool.color} />
                        </View>
                        <View style={styles.toolInfo}>
                          <View style={styles.toolLabelRow}>
                            <Text style={[styles.toolLabel, { color: colors.text }]}>{tool.label}</Text>
                            {!tool.available && (
                              <View style={[styles.comingSoonBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}>
                                <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Soon</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.toolDescription, { color: colors.textSecondary }]}>{tool.description}</Text>
                        </View>
                        {tool.available && (
                          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                        )}
                      </Pressable>
                    </Animated.View>
                  ))}
                </ScrollView>
              )}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
});


/* ─── Styles ─── */
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 40 : 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.4,
      shadowRadius: 50,
      elevation: 24,
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  toolGrid: {
    gap: 12,
    paddingBottom: 24,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 14,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolInfo: {
    flex: 1,
  },
  toolLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  toolDescription: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* ─── Tool Views ─── */
  toolBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  toolBackText: {
    fontSize: 15,
    fontWeight: '500',
  },
  toolHeader: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  toolIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  toolSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },

  /* ─── Inputs ─── */
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    width: '48%',
    minWidth: 140,
    flexGrow: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  inputPrefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 4,
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },

  /* ─── Results ─── */
  resultCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
    marginVertical: 4,
  },
  resultSub: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  breakdownItem: {
    width: '48%',
    minWidth: 130,
    flexGrow: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  /* ─── Listing Writer ─── */
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 150,
    marginBottom: 16,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  generateBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resultArea: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 30,
  },
  resultAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultAreaTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
