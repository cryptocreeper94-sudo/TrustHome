import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { AccordionSection } from '@/components/ui/AccordionSection';

const STAGE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  pre_approval: 'document-text',
  home_search: 'search',
  offer: 'pricetag',
  under_contract: 'shield-checkmark',
  inspection: 'construct',
  closing: 'checkmark-circle',
};

const URGENT_STAGES = new Set(['under_contract', 'inspection', 'offer']);

let DEALS: { id: string; address: string; client: string; type: string; price: string; stage: string; daysInStage: number; agent: string; deadline: string; parties: string[] }[] = [];

export interface PipelineStageType {
  key: string; label: string; color: string; count: number;
}

interface DealCardProps {
  deal: typeof DEALS[0];
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
}

function AnimatedDealActionButton({ icon, label, primary, colors, isDark }: { icon: keyof typeof Ionicons.glyphMap; label: string; primary?: boolean; colors: any; isDark: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[styles.dealActionBtn, primary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary, borderColor: colors.border, borderWidth: 1 }
        ]}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      >
        <Ionicons name={icon} size={16} color={primary ? '#FFF' : colors.text} />
        <Text style={[styles.dealActionText, !primary && { color: colors.text }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function DealCard({ deal, isExpanded, onToggle, index }: DealCardProps) {
  const { colors, isDark } = useTheme();
  const stage = PIPELINE_STAGES.find(s => s.key === deal.stage);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <Pressable onPress={onToggle}>
        <GlassCard style={styles.dealCard}>
          <View style={styles.dealHeader}>
            <View style={styles.dealHeaderLeft}>
              <View style={[styles.dealStageDot, { backgroundColor: stage?.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.dealAddress, { color: colors.text }]} numberOfLines={1}>{deal.address}</Text>
                <Text style={[styles.dealClient, { color: colors.textSecondary }]}>{deal.client} - {deal.type}</Text>
              </View>
            </View>
            <Text style={[styles.dealPrice, { color: colors.primary }]}>{deal.price}</Text>
          </View>

          <View style={styles.dealMeta}>
            <View style={[styles.dealMetaPill, { backgroundColor: stage?.color + '18' }]}>
              <Text style={[styles.dealMetaText, { color: stage?.color }]}>{stage?.label}</Text>
            </View>
            <Text style={[styles.dealDays, { color: colors.textTertiary }]}>{deal.daysInStage}d in stage</Text>
            <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
          </View>

          {isExpanded ? (
            <View style={[styles.dealExpanded, { borderTopColor: colors.divider }]}>
              <View style={styles.dealExpandRow}>
                <Ionicons name="alert-circle" size={16} color="#FBBF24" />
                <Text style={[styles.dealExpandText, { color: colors.text }]}>{deal.deadline}</Text>
              </View>
              {deal.parties.length > 0 ? (
                <View style={styles.dealExpandRow}>
                  <Ionicons name="people" size={16} color={colors.textSecondary} />
                  <View style={styles.partyChips}>
                    {deal.parties.map((p, i) => (
                      <View key={i} style={[styles.partyChip, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.backgroundTertiary }]}>
                        <Text style={[styles.partyChipText, { color: colors.textSecondary }]}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
              <View style={styles.dealActions}>
                <AnimatedDealActionButton icon="document-text-outline" label="Docs" primary colors={colors} isDark={isDark} />
                <AnimatedDealActionButton icon="chatbubble-outline" label="Message" colors={colors} isDark={isDark} />
                <AnimatedDealActionButton icon="calendar-outline" label="Schedule" colors={colors} isDark={isDark} />
              </View>
            </View>
          ) : null}
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedStagePill({ stage, isActive, onPress, colors, isDark }: { stage: PipelineStageType; isActive: boolean; onPress: () => void; colors: any; isDark: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        style={[styles.stagePill, { backgroundColor: isActive ? stage.color : (isDark ? colors.surface : colors.backgroundTertiary), borderColor: isActive ? stage.color : colors.border }]}
      >
        <View style={[styles.stageCountDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : stage.color }]}>
          <Text style={[styles.stageCountText, { color: '#FFF' }]}>{stage.count}</Text>
        </View>
        <Text style={[styles.stagePillText, { color: isActive ? '#FFF' : colors.text }]}>{stage.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function TransactionsScreen() {
  const { colors, isDark } = useTheme();
  const [deals, setDeals] = useState(DEALS);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeal, setNewDeal] = useState({ address: '', client: '', price: '', type: 'Buy', stage: 'pre_approval' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PIPELINE_STAGES: PipelineStageType[] = [
    { key: 'pre_approval', label: 'Pre-Approval', color: '#FBBF24', count: deals.filter(d => d.stage === 'pre_approval').length },
    { key: 'home_search', label: 'Home Search', color: '#60A5FA', count: deals.filter(d => d.stage === 'home_search').length },
    { key: 'offer', label: 'Offer', color: '#38bdf8', count: deals.filter(d => d.stage === 'offer').length },
    { key: 'under_contract', label: 'Under Contract', color: '#1A8A7E', count: deals.filter(d => d.stage === 'under_contract').length },
    { key: 'inspection', label: 'Inspection', color: '#F87171', count: deals.filter(d => d.stage === 'inspection').length },
    { key: 'closing', label: 'Closing', color: '#34D399', count: deals.filter(d => d.stage === 'closing').length },
  ];

  const stagesToShow = activeStage
    ? PIPELINE_STAGES.filter(s => s.key === activeStage)
    : PIPELINE_STAGES;

  const handleAddDeal = () => {
    if (!newDeal.address || !newDeal.client) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const deal = {
        id: Math.random().toString(),
        address: newDeal.address,
        client: newDeal.client,
        price: newDeal.price || '$0',
        type: newDeal.type,
        stage: newDeal.stage,
        daysInStage: 0,
        agent: 'Me',
        deadline: 'TBD',
        parties: []
      };
      DEALS.push(deal);
      setDeals([...DEALS]);
      setShowAddModal(false);
      setNewDeal({ address: '', client: '', price: '', type: 'Buy', stage: 'pre_approval' });
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Header imageBanner={require('@/assets/images/guide-transactions.jpg')} 
        title="Transactions" 
        subtitle="Track every deal from contract to close"
        showBack 
        rightAction={
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Pressable onPress={() => setShowAddModal(true)} style={[styles.headerAddBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={[styles.headerAddText, { color: '#FFF' }]}>Add Deal</Text>
            </Pressable>
            <InfoButton onPress={() => setShowHelp(true)} />
          </View>
        } 
      />

        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <View style={styles.bentoWrap}>
            <BentoGrid columns={3} gap={10}>
              <GlassCard compact>
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{DEALS.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
                </View>
              </GlassCard>
              <GlassCard compact>
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: '#34D399' }]}>$4.47M</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pipeline</Text>
                </View>
              </GlassCard>
              <GlassCard compact>
                <View style={styles.statContent}>
                  <Text style={[styles.statValue, { color: '#FBBF24' }]}>3</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Urgent</Text>
                </View>
              </GlassCard>
            </BentoGrid>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>PIPELINE</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Pressable onPress={() => setActiveStage(null)} style={[styles.stagePill, { backgroundColor: !activeStage ? colors.primary : (isDark ? colors.surface : colors.backgroundTertiary), borderColor: !activeStage ? colors.primary : colors.border }]}>
                <Text style={[styles.stagePillText, { color: !activeStage ? '#FFF' : colors.text }]}>All</Text>
                <View style={[styles.stageCountDot, { backgroundColor: !activeStage ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.stageCountText, { color: !activeStage ? '#FFF' : colors.textSecondary }]}>{DEALS.length}</Text>
                </View>
              </Pressable>
              {PIPELINE_STAGES.map(s => (
                <AnimatedStagePill
                  key={s.key}
                  stage={s}
                  isActive={activeStage === s.key}
                  onPress={() => setActiveStage(activeStage === s.key ? null : s.key)}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <View style={styles.accordionWrap}>
            {stagesToShow.map(stage => {
              const stageDeals = DEALS.filter(d => d.stage === stage.key);
              if (stageDeals.length === 0) return null;
              const hasUrgent = URGENT_STAGES.has(stage.key);
              const isForced = activeStage === stage.key;
              return (
                <AccordionSection
                  key={stage.key}
                  title={stage.label}
                  icon={STAGE_ICONS[stage.key]}
                  iconColor={stage.color}
                  badge={stageDeals.length}
                  badgeColor={stage.color}
                  defaultOpen={isForced || hasUrgent}
                >
                  {stageDeals.map((deal, idx) => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      isExpanded={expandedDeal === deal.id}
                      onToggle={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                      index={idx}
                    />
                  ))}
                </AccordionSection>
              );
            })}
          </View>
        </Animated.View>

        <Footer />
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Deal</Text>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Property Address</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newDeal.address} onChangeText={t => setNewDeal({...newDeal, address: t})} placeholder="123 Main St" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Client Name</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newDeal.client} onChangeText={t => setNewDeal({...newDeal, client: t})} placeholder="John Doe" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Price / Value</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newDeal.price} onChangeText={t => setNewDeal({...newDeal, price: t})} placeholder="$450,000" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Stage</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {PIPELINE_STAGES.map(s => (
                    <Pressable key={s.key} onPress={() => setNewDeal({...newDeal, stage: s.key})} style={[styles.stageSelectBtn, { backgroundColor: newDeal.stage === s.key ? s.color : 'transparent', borderColor: s.color }]}>
                      <Text style={{ color: newDeal.stage === s.key ? '#FFF' : s.color, fontSize: 12, fontWeight: '600' }}>{s.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.divider }]}>
              <Pressable style={[styles.modalBtn, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handleAddDeal} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Add Deal</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.transactions.title}
        description={SCREEN_HELP.transactions.description}
        details={SCREEN_HELP.transactions.details}
        examples={SCREEN_HELP.transactions.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  bentoWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  statContent: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800' as const },
  statLabel: { fontSize: 12, fontWeight: '600' as const, marginTop: 2 },
  carouselCard: { width: 140, minHeight: 72 },
  carouselCardInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  carouselDot: { width: 10, height: 10, borderRadius: 5 },
  carouselLabel: { fontSize: 13, fontWeight: '600' as const, flex: 1 },
  carouselCount: { fontSize: 20, fontWeight: '800' as const },
  stageRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 14, paddingTop: 6 },
  stagePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1, minHeight: 44 },
  stagePillText: { fontSize: 13, fontWeight: '600' as const },
  stageCountDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stageCountText: { fontSize: 11, fontWeight: '700' as const },
  accordionWrap: { paddingHorizontal: 16, paddingTop: 4 },
  dealCard: { marginBottom: 10 },
  dealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dealHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dealStageDot: { width: 10, height: 10, borderRadius: 5 },
  dealAddress: { fontSize: 16, fontWeight: '700' as const },
  dealClient: { fontSize: 13, marginTop: 2 },
  dealPrice: { fontSize: 16, fontWeight: '800' as const },
  dealMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  dealMetaPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dealMetaText: { fontSize: 11, fontWeight: '600' as const },
  dealDays: { fontSize: 12, flex: 1 },
  dealExpanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 10 },
  dealExpandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dealExpandText: { fontSize: 14, flex: 1 },
  partyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  partyChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  partyChipText: { fontSize: 12 },
  dealActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  dealActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, minHeight: 44 },
  dealActionText: { fontSize: 13, fontWeight: '600' as const, color: '#FFF' },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  headerAddText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  stageSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnText: {
    fontWeight: '600' as const,
    fontSize: 14,
  },
});
