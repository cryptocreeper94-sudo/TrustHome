import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  { key: 'pre_approval', label: 'Pre-Approval', color: '#FF9500', count: 2 },
  { key: 'home_search', label: 'Home Search', color: '#007AFF', count: 3 },
  { key: 'offer', label: 'Offer', color: '#AF52DE', count: 1 },
  { key: 'under_contract', label: 'Under Contract', color: '#1A8A7E', count: 2 },
  { key: 'inspection', label: 'Inspection', color: '#FF3B30', count: 1 },
  { key: 'closing', label: 'Closing', color: '#34C759', count: 1 },
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
}

function DealCard({ deal, isExpanded, onToggle }: DealCardProps) {
  const { colors, isDark } = useTheme();
  const stage = PIPELINE_STAGES.find(s => s.key === deal.stage);

  return (
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
              <Ionicons name="alert-circle" size={16} color={colors.warning} />
              <Text style={[styles.dealExpandText, { color: colors.text }]}>{deal.deadline}</Text>
            </View>
            {deal.parties.length > 0 ? (
              <View style={styles.dealExpandRow}>
                <Ionicons name="people" size={16} color={colors.textSecondary} />
                <View style={styles.partyChips}>
                  {deal.parties.map((p, i) => (
                    <View key={i} style={[styles.partyChip, { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary }]}>
                      <Text style={[styles.partyChipText, { color: colors.textSecondary }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            <View style={styles.dealActions}>
              <Pressable style={[styles.dealActionBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="document-text-outline" size={16} color="#FFF" />
                <Text style={styles.dealActionText}>Docs</Text>
              </Pressable>
              <Pressable style={[styles.dealActionBtn, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, borderColor: colors.border, borderWidth: 1 }]}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.text} />
                <Text style={[styles.dealActionText, { color: colors.text }]}>Message</Text>
              </Pressable>
              <Pressable style={[styles.dealActionBtn, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, borderColor: colors.border, borderWidth: 1 }]}>
                <Ionicons name="calendar-outline" size={16} color={colors.text} />
                <Text style={[styles.dealActionText, { color: colors.text }]}>Schedule</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </GlassCard>
    </Pressable>
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
                <Text style={[styles.statValue, { color: colors.success }]}>$4.47M</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pipeline</Text>
              </View>
            </GlassCard>
            <GlassCard compact>
              <View style={styles.statContent}>
                <Text style={[styles.statValue, { color: colors.warning }]}>3</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Urgent</Text>
              </View>
            </GlassCard>
          </BentoGrid>
        </View>

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stageRow}>
          <Pressable onPress={() => setActiveStage(null)} style={[styles.stagePill, { backgroundColor: !activeStage ? colors.primary : (isDark ? colors.surface : colors.backgroundTertiary), borderColor: !activeStage ? colors.primary : colors.border }]}>
            <Text style={[styles.stagePillText, { color: !activeStage ? '#FFF' : colors.text }]}>All ({DEALS.length})</Text>
          </Pressable>
          {PIPELINE_STAGES.map(s => {
            const isActive = activeStage === s.key;
            return (
              <Pressable key={s.key} onPress={() => setActiveStage(isActive ? null : s.key)} style={[styles.stagePill, { backgroundColor: isActive ? s.color : (isDark ? colors.surface : colors.backgroundTertiary), borderColor: isActive ? s.color : colors.border }]}>
                <View style={[styles.stageCountDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : s.color }]}>
                  <Text style={[styles.stageCountText, { color: '#FFF' }]}>{s.count}</Text>
                </View>
                <Text style={[styles.stagePillText, { color: isActive ? '#FFF' : colors.text }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

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
                {stageDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    isExpanded={expandedDeal === deal.id}
                    onToggle={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
                  />
                ))}
              </AccordionSection>
            );
          })}
        </View>

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
  scrollContent: { paddingBottom: 20 },
  bentoWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  statContent: { alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' as const },
  statLabel: { fontSize: 11, marginTop: 2 },
  carouselCard: { width: 140, minHeight: 70 },
  carouselCardInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  carouselDot: { width: 10, height: 10, borderRadius: 5 },
  carouselLabel: { fontSize: 13, fontWeight: '600' as const, flex: 1 },
  carouselCount: { fontSize: 18, fontWeight: '800' as const },
  stageRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 12, paddingTop: 4 },
  stagePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  stagePillText: { fontSize: 13, fontWeight: '600' as const },
  stageCountDot: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stageCountText: { fontSize: 11, fontWeight: '700' as const },
  accordionWrap: { paddingHorizontal: 16, paddingTop: 4 },
  dealCard: { marginBottom: 8 },
  dealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dealHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  dealStageDot: { width: 10, height: 10, borderRadius: 5 },
  dealAddress: { fontSize: 15, fontWeight: '700' as const },
  dealClient: { fontSize: 12, marginTop: 1 },
  dealPrice: { fontSize: 15, fontWeight: '800' as const },
  dealMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dealMetaPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dealMetaText: { fontSize: 11, fontWeight: '600' as const },
  dealDays: { fontSize: 11, flex: 1 },
  dealExpanded: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, gap: 8 },
  dealExpandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dealExpandText: { fontSize: 13, flex: 1 },
  partyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  partyChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  partyChipText: { fontSize: 11 },
  dealActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  dealActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  dealActionText: { fontSize: 12, fontWeight: '600' as const, color: '#FFF' },
});
