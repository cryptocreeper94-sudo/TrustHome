import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
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

const PIPELINE_STAGES = [
  { key: 'pre_approval', label: 'Pre-Approval', color: '#FBBF24', count: 2 },
  { key: 'home_search', label: 'Home Search', color: '#60A5FA', count: 3 },
  { key: 'offer', label: 'Offer', color: '#A78BFA', count: 1 },
  { key: 'under_contract', label: 'Under Contract', color: '#1A8A7E', count: 2 },
  { key: 'inspection', label: 'Inspection', color: '#F87171', count: 1 },
  { key: 'closing', label: 'Closing', color: '#34D399', count: 1 },
];

const DEALS = [
  { id: '1', address: '1847 Oak Valley Dr', client: 'Sarah Mitchell', type: 'Buyer', price: '$425,000', stage: 'under_contract', daysInStage: 8, agent: 'Jennifer Lambert', deadline: 'Inspection by Feb 12', parties: ['Inspector', 'Lender', 'Title'] },
  { id: '2', address: '890 Magnolia Way', client: 'Robert Kim', type: 'Seller', price: '$580,000', stage: 'offer', daysInStage: 3, agent: 'Jennifer Lambert', deadline: 'Counter expires Feb 10', parties: ['Buyer Agent', 'Lender'] },
  { id: '3', address: '302 Elm Park Ct', client: 'David Park', type: 'Buyer', price: '$389,000', stage: 'home_search', daysInStage: 14, agent: 'Jennifer Lambert', deadline: 'Pre-approval expires Mar 1', parties: ['Lender'] },
  { id: '4', address: '445 Sunset Blvd', client: 'Lisa Nguyen', type: 'Seller', price: '$375,000', stage: 'home_search', daysInStage: 21, agent: 'Jennifer Lambert', deadline: 'Open house Feb 15', parties: [] },
  { id: '5', address: '55 Lakeview Terrace', client: 'Mike Torres', type: 'Buyer', price: '$510,000', stage: 'pre_approval', daysInStage: 5, agent: 'Jennifer Lambert', deadline: 'Docs needed', parties: ['Lender'] },
  { id: '6', address: '2205 Birch Creek Ln', client: 'Amanda Chen', type: 'Buyer', price: '$445,000', stage: 'under_contract', daysInStage: 12, agent: 'Jennifer Lambert', deadline: 'Appraisal Feb 14', parties: ['Inspector', 'Lender', 'Title', 'Appraiser'] },
  { id: '7', address: '1200 Pine Ridge Dr', client: 'James Wilson', type: 'Buyer', price: '$350,000', stage: 'inspection', daysInStage: 2, agent: 'Jennifer Lambert', deadline: 'Report due Feb 11', parties: ['Inspector', 'Lender'] },
  { id: '8', address: '780 Oakwood Ln', client: 'Rachel Green', type: 'Seller', price: '$620,000', stage: 'closing', daysInStage: 4, agent: 'Jennifer Lambert', deadline: 'Closing Feb 18', parties: ['Title', 'Lender', 'Buyer Agent'] },
  { id: '9', address: '456 Maple Ave', client: 'Tom Harris', type: 'Buyer', price: '$295,000', stage: 'pre_approval', daysInStage: 1, agent: 'Jennifer Lambert', deadline: 'Awaiting docs', parties: [] },
  { id: '10', address: '910 Cedar Ridge', client: 'Emily Davis', type: 'Buyer', price: '$475,000', stage: 'home_search', daysInStage: 7, agent: 'Jennifer Lambert', deadline: 'Showing scheduled', parties: ['Lender'] },
];

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

function AnimatedStagePill({ stage, isActive, onPress, colors, isDark }: { stage: typeof PIPELINE_STAGES[0]; isActive: boolean; onPress: () => void; colors: any; isDark: boolean }) {
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
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const stagesToShow = activeStage
    ? PIPELINE_STAGES.filter(s => s.key === activeStage)
    : PIPELINE_STAGES;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Transactions" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

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
          <HorizontalCarousel title="Pipeline" itemWidth={140}>
            {PIPELINE_STAGES.map(s => (
              <GlassCard key={s.key} compact style={styles.carouselCard} onPress={() => setActiveStage(activeStage === s.key ? null : s.key)}>
                <View style={styles.carouselCardInner}>
                  <View style={[styles.carouselDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.carouselLabel, { color: colors.text }]} numberOfLines={1}>{s.label}</Text>
                  <Text style={[styles.carouselCount, { color: s.color }]}>{s.count}</Text>
                </View>
              </GlassCard>
            ))}
          </HorizontalCarousel>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageRow}>
            <Pressable onPress={() => setActiveStage(null)} style={[styles.stagePill, { backgroundColor: !activeStage ? colors.primary : (isDark ? colors.surface : colors.backgroundTertiary), borderColor: !activeStage ? colors.primary : colors.border }]}>
              <Text style={[styles.stagePillText, { color: !activeStage ? '#FFF' : colors.text }]}>All ({DEALS.length})</Text>
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
          </ScrollView>
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
});
