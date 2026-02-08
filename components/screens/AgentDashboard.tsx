import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { BentoGrid, BentoRow } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { PillButton } from '@/components/ui/PillButton';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';

const MOCK_AGENT = {
  name: 'Jennifer',
  activeClients: 12,
  activeTransactions: 8,
  pendingLeads: 5,
  closingsThisMonth: 3,
  showingsToday: 4,
  unreadMessages: 7,
  trustScore: 94,
  revenue: '$48,200',
};

const MOCK_TODAY_SCHEDULE = [
  { time: '10:00 AM', type: 'Showing', address: '1847 Oak Valley Dr', client: 'Sarah M.' },
  { time: '11:30 AM', type: 'Showing', address: '2205 Birch Creek Ln', client: 'Sarah M.' },
  { time: '1:00 PM', type: 'Listing Appt', address: '890 Magnolia Way', client: 'Robert K.' },
  { time: '3:30 PM', type: 'Open House', address: '445 Sunset Blvd', client: '' },
];

const MOCK_URGENT = [
  { icon: 'alert-circle' as const, text: 'Inspection deadline tomorrow - 2205 Birch Creek', color: '#FF9500' },
  { icon: 'document-text' as const, text: 'Contract awaiting signature - Sarah M.', color: '#FF3B30' },
  { icon: 'time' as const, text: 'Pre-approval expires in 3 days - Mike T.', color: '#FF9500' },
];

const MOCK_ACTIVE_DEALS = [
  { address: '1847 Oak Valley Dr', client: 'Sarah Mitchell', stage: 'Under Contract', price: '$425,000', daysActive: 34 },
  { address: '2205 Birch Creek Ln', client: 'Sarah Mitchell', stage: 'Home Search', price: '', daysActive: 12 },
  { address: '890 Magnolia Way', client: 'Robert Kim', stage: 'Listing Prep', price: '$580,000', daysActive: 5 },
  { address: '445 Sunset Blvd', client: 'Jennifer Cole', stage: 'Active Listing', price: '$375,000', daysActive: 21 },
];

const MOCK_HOT_LEADS = [
  { name: 'Amanda Chen', source: 'Open House', temp: 'hot', lastContact: '2 hours ago' },
  { name: 'David Park', source: 'Referral', temp: 'hot', lastContact: '1 day ago' },
  { name: 'Lisa Nguyen', source: 'Website', temp: 'warm', lastContact: '3 days ago' },
];

function StatCard({ label, value, icon, gradient, onInfoPress }: {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
  onInfoPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <GlassCard gradient={gradient} compact>
      <View style={statStyles.header}>
        <Ionicons name={icon} size={20} color="rgba(255,255,255,0.9)" />
        {onInfoPress ? <InfoButton onPress={onInfoPress} /> : null}
      </View>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </GlassCard>
  );
}

const statStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  value: { fontSize: 28, fontWeight: '800' as const, color: '#fff', marginTop: 8 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2, fontWeight: '500' as const },
});

export function AgentDashboard() {
  const { colors, isDark } = useTheme();
  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; description: string; details?: string[]; examples?: string[] }>({
    visible: false, title: '', description: '',
  });

  const showInfo = (title: string, description: string, details?: string[], examples?: string[]) => {
    setInfoModal({ visible: true, title, description, details, examples });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.greetingRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Good morning</Text>
          <Text style={[styles.name, { color: colors.text }]}>{MOCK_AGENT.name}</Text>
        </View>
        <View style={[styles.trustBadge, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.08)' }]}>
          <MaterialCommunityIcons name="shield-check" size={18} color={colors.primary} />
          <Text style={[styles.trustText, { color: colors.primary }]}>{MOCK_AGENT.trustScore}</Text>
        </View>
      </View>

      {MOCK_URGENT.length > 0 ? (
        <View style={[styles.urgentBar, { backgroundColor: isDark ? 'rgba(255,59,48,0.1)' : 'rgba(255,59,48,0.06)' }]}>
          <View style={styles.urgentHeader}>
            <Ionicons name="warning" size={16} color={colors.warning} />
            <Text style={[styles.urgentTitle, { color: colors.text }]}>Action Required</Text>
            <InfoButton onPress={() => showInfo('Action Required', 'These are time-sensitive items that need your attention soon. Missing deadlines can delay or jeopardize transactions.', ['Items turn red when they are past due', 'Orange items are approaching their deadline'])} />
          </View>
          {MOCK_URGENT.map((item, i) => (
            <View key={i} style={styles.urgentItem}>
              <Ionicons name={item.icon} size={14} color={item.color} />
              <Text style={[styles.urgentText, { color: colors.textSecondary }]} numberOfLines={1}>{item.text}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <BentoGrid style={styles.statsGrid}>
        <BentoRow>
          <StatCard label="Active Clients" value={MOCK_AGENT.activeClients} icon="people" gradient={['#1A8A7E', '#26A69A']} />
          <StatCard label="Transactions" value={MOCK_AGENT.activeTransactions} icon="swap-horizontal" gradient={['#0F6B62', '#1A8A7E']} />
          <StatCard
            label="Trust Score"
            value={MOCK_AGENT.trustScore}
            icon="shield-checkmark"
            gradient={['#064A44', '#0F6B62']}
            onInfoPress={() => showInfo(
              'Trust Score',
              'Your Trust Score is a blockchain-verified reputation metric based on your real transaction history, client reviews, response times, and credential verification.',
              ['Scores range from 0-100', 'Updated automatically after each transaction', 'Verified on the blockchain - cannot be faked', 'Visible to clients when they search for agents'],
              ['A score of 90+ means you are in the top tier of verified agents', 'Completing transactions on time improves your score', 'Fast response times to client messages boost your score']
            )}
          />
        </BentoRow>
        <BentoRow>
          <StatCard label="Pending Leads" value={MOCK_AGENT.pendingLeads} icon="flame" gradient={['#E67E22', '#F39C12']} />
          <StatCard label="Unread" value={MOCK_AGENT.unreadMessages} icon="chatbubbles" gradient={['#2980B9', '#3498DB']} />
          <StatCard label="Revenue (MTD)" value={MOCK_AGENT.revenue} icon="trending-up" gradient={['#8E44AD', '#9B59B6']} />
        </BentoRow>
      </BentoGrid>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Schedule</Text>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>{MOCK_TODAY_SCHEDULE.length} events</Text>
      </View>

      <View style={styles.scheduleList}>
        {MOCK_TODAY_SCHEDULE.map((item, i) => (
          <Pressable key={i}>
            <GlassCard compact style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <View style={[styles.timePill, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.1)' }]}>
                  <Text style={[styles.timeText, { color: colors.primary }]}>{item.time}</Text>
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleType, { color: colors.text }]}>{item.type}</Text>
                  <Text style={[styles.scheduleAddr, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                </View>
                {item.client ? (
                  <View style={[styles.clientChip, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.clientChipText, { color: colors.textSecondary }]}>{item.client}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      <HorizontalCarousel title="Active Deals" onSeeAll={() => {}}>
        {MOCK_ACTIVE_DEALS.map((deal, i) => (
          <Pressable key={i}>
            <View style={[styles.dealCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <LinearGradient
                colors={isDark
                  ? ['rgba(26,138,126,0.12)', 'rgba(26,138,126,0.03)']
                  : ['rgba(26,138,126,0.06)', 'rgba(26,138,126,0.01)']}
                style={styles.dealCardGradient}
              />
              <View style={styles.dealStageRow}>
                <View style={[styles.stagePill, { backgroundColor: isDark ? 'rgba(26,138,126,0.2)' : 'rgba(26,138,126,0.1)' }]}>
                  <Text style={[styles.stageText, { color: colors.primary }]}>{deal.stage}</Text>
                </View>
                <Text style={[styles.dealDays, { color: colors.textTertiary }]}>{deal.daysActive}d</Text>
              </View>
              <Text style={[styles.dealAddress, { color: colors.text }]} numberOfLines={1}>{deal.address}</Text>
              <Text style={[styles.dealClient, { color: colors.textSecondary }]}>{deal.client}</Text>
              {deal.price ? <Text style={[styles.dealPrice, { color: colors.primary }]}>{deal.price}</Text> : null}
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

      <HorizontalCarousel title="Hot Leads" onSeeAll={() => {}}>
        {MOCK_HOT_LEADS.map((lead, i) => (
          <Pressable key={i}>
            <View style={[styles.leadCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.leadHeader}>
                <View style={[styles.tempDot, { backgroundColor: lead.temp === 'hot' ? colors.error : colors.warning }]} />
                <Text style={[styles.leadName, { color: colors.text }]}>{lead.name}</Text>
              </View>
              <Text style={[styles.leadSource, { color: colors.textSecondary }]}>{lead.source}</Text>
              <Text style={[styles.leadContact, { color: colors.textTertiary }]}>{lead.lastContact}</Text>
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Verticals</Text>
        <InfoButton onPress={() => showInfo(
          'Connected Verticals',
          'These are the professional services connected to your transactions. Each vertical can be a full subscription product or a guest connection for one-time access.',
          ['Inspectors, mortgage brokers, title companies, appraisers, and contractors', 'When both you and the vendor are on TrustHome, data flows seamlessly', 'Guest access lets non-subscribers participate in specific transactions'],
        )} />
      </View>

      <BentoGrid style={styles.verticalsGrid}>
        <BentoRow>
          <GlassCard compact onPress={() => {}}>
            <View style={styles.verticalCard}>
              <View style={[styles.verticalIcon, { backgroundColor: isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.08)' }]}>
                <Ionicons name="search" size={20} color={colors.success} />
              </View>
              <Text style={[styles.verticalLabel, { color: colors.text }]}>Inspectors</Text>
              <Text style={[styles.verticalCount, { color: colors.textSecondary }]}>3 active</Text>
            </View>
          </GlassCard>
          <GlassCard compact onPress={() => {}}>
            <View style={styles.verticalCard}>
              <View style={[styles.verticalIcon, { backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.08)' }]}>
                <Ionicons name="cash" size={20} color={colors.info} />
              </View>
              <Text style={[styles.verticalLabel, { color: colors.text }]}>Lenders</Text>
              <Text style={[styles.verticalCount, { color: colors.textSecondary }]}>2 active</Text>
            </View>
          </GlassCard>
          <GlassCard compact onPress={() => {}}>
            <View style={styles.verticalCard}>
              <View style={[styles.verticalIcon, { backgroundColor: isDark ? 'rgba(142,68,173,0.15)' : 'rgba(142,68,173,0.08)' }]}>
                <Feather name="file-text" size={20} color="#8E44AD" />
              </View>
              <Text style={[styles.verticalLabel, { color: colors.text }]}>Title</Text>
              <Text style={[styles.verticalCount, { color: colors.textSecondary }]}>1 active</Text>
            </View>
          </GlassCard>
        </BentoRow>
      </BentoGrid>

      <View style={styles.quickActions}>
        <PillButton title="Add Client" icon="person-add-outline" onPress={() => {}} variant="primary" size="medium" />
        <PillButton title="New Showing" icon="calendar-outline" onPress={() => {}} variant="secondary" size="medium" />
        <PillButton title="Create Post" icon="megaphone-outline" onPress={() => {}} variant="secondary" size="medium" />
      </View>

      <View style={{ height: 40 }} />

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal(prev => ({ ...prev, visible: false }))}
        title={infoModal.title}
        description={infoModal.description}
        details={infoModal.details}
        examples={infoModal.examples}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: { fontSize: 14, fontWeight: '500' as const },
  name: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 0.3 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trustText: { fontSize: 16, fontWeight: '700' as const },
  urgentBar: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  urgentTitle: { fontSize: 14, fontWeight: '700' as const, flex: 1 },
  urgentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  urgentText: { fontSize: 13, flex: 1 },
  statsGrid: { paddingHorizontal: 16, marginBottom: 20, gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, letterSpacing: 0.2 },
  sectionCount: { fontSize: 13 },
  scheduleList: { paddingHorizontal: 16, gap: 6, marginBottom: 20 },
  scheduleCard: { minHeight: 56 },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: { fontSize: 12, fontWeight: '700' as const },
  scheduleInfo: { flex: 1 },
  scheduleType: { fontSize: 14, fontWeight: '600' as const },
  scheduleAddr: { fontSize: 12, marginTop: 1 },
  clientChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  clientChipText: { fontSize: 11, fontWeight: '500' as const },
  dealCard: {
    width: 200,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dealCardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  dealStageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stagePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stageText: { fontSize: 11, fontWeight: '600' as const },
  dealDays: { fontSize: 11 },
  dealAddress: { fontSize: 14, fontWeight: '600' as const, marginBottom: 4 },
  dealClient: { fontSize: 12, marginBottom: 4 },
  dealPrice: { fontSize: 16, fontWeight: '700' as const },
  leadCard: {
    width: 170,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  leadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tempDot: { width: 8, height: 8, borderRadius: 4 },
  leadName: { fontSize: 14, fontWeight: '600' as const },
  leadSource: { fontSize: 12, marginBottom: 2 },
  leadContact: { fontSize: 11 },
  verticalsGrid: { paddingHorizontal: 16, marginBottom: 20, gap: 10 },
  verticalCard: { alignItems: 'center', gap: 6, paddingVertical: 4 },
  verticalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalLabel: { fontSize: 13, fontWeight: '600' as const },
  verticalCount: { fontSize: 11 },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
});
