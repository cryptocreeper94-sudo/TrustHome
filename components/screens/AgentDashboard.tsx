import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { Footer } from '@/components/ui/Footer';

const CARD_IMAGES = {
  team: require('@/assets/images/cards/team.jpg'),
  transaction: require('@/assets/images/cards/transaction.jpg'),
  trust: require('@/assets/images/cards/trust.jpg'),
  leads: require('@/assets/images/cards/leads.jpg'),
  messages: require('@/assets/images/cards/messages.jpg'),
  revenue: require('@/assets/images/cards/revenue.jpg'),
  home1: require('@/assets/images/cards/home1_1.jpg'),
  home2: require('@/assets/images/cards/home1_2.jpg'),
  home3: require('@/assets/images/cards/home1_3.jpg'),
  home4: require('@/assets/images/cards/home1_4.jpg'),
  inspector: require('@/assets/images/cards/inspector.jpg'),
  lender: require('@/assets/images/cards/lender.jpg'),
  title: require('@/assets/images/cards/title.jpg'),
};

const MOCK_AGENT = {
  name: 'Jennifer Lambert',
  activeClients: 12,
  activeTransactions: 8,
  pendingLeads: 5,
  closingsThisMonth: 3,
  showingsToday: 4,
  unreadMessages: 7,
  trustScore: 94,
  revenue: '$48,200',
};

const STAT_CARDS = [
  { label: 'Active Clients', value: '12', icon: 'people' as const, image: CARD_IMAGES.team },
  { label: 'Transactions', value: '8', icon: 'swap-horizontal' as const, image: CARD_IMAGES.transaction },
  { label: 'Trust Score', value: '94', icon: 'shield-checkmark' as const, image: CARD_IMAGES.trust, hasInfo: true },
  { label: 'Pending Leads', value: '5', icon: 'flame' as const, image: CARD_IMAGES.leads },
  { label: 'Messages', value: '7', icon: 'chatbubbles' as const, image: CARD_IMAGES.messages },
  { label: 'Revenue (MTD)', value: '$48.2K', icon: 'trending-up' as const, image: CARD_IMAGES.revenue },
];

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
  { address: '1847 Oak Valley Dr', client: 'Sarah Mitchell', stage: 'Under Contract', price: '$425,000', daysActive: 34, image: CARD_IMAGES.home1 },
  { address: '2205 Birch Creek Ln', client: 'Sarah Mitchell', stage: 'Home Search', price: '', daysActive: 12, image: CARD_IMAGES.home2 },
  { address: '890 Magnolia Way', client: 'Robert Kim', stage: 'Listing Prep', price: '$580,000', daysActive: 5, image: CARD_IMAGES.home3 },
  { address: '445 Sunset Blvd', client: 'Jennifer Cole', stage: 'Active Listing', price: '$375,000', daysActive: 21, image: CARD_IMAGES.home4 },
];

const MOCK_HOT_LEADS = [
  { name: 'Amanda Chen', source: 'Open House', temp: 'hot', lastContact: '2 hours ago', budget: '$400K-$500K' },
  { name: 'David Park', source: 'Referral', temp: 'hot', lastContact: '1 day ago', budget: '$350K-$450K' },
  { name: 'Lisa Nguyen', source: 'Website', temp: 'warm', lastContact: '3 days ago', budget: '$500K-$650K' },
];

const VERTICALS = [
  { label: 'Inspectors', count: '3 active', icon: 'search' as const, color: '#34C759', image: CARD_IMAGES.inspector },
  { label: 'Lenders', count: '2 active', icon: 'cash' as const, color: '#007AFF', image: CARD_IMAGES.lender },
  { label: 'Title', count: '1 active', icon: 'document-text' as const, color: '#8E44AD', image: CARD_IMAGES.title },
];

export function AgentDashboard() {
  const { colors, isDark } = useTheme();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{ visible: boolean; title: string; description: string; details?: string[]; examples?: string[] }>({
    visible: false, title: '', description: '',
  });

  const leadsQuery = useQuery<any[]>({
    queryKey: ['/api/leads'],
  });

  const analyticsQuery = useQuery<any>({
    queryKey: ['/api/analytics/dashboard'],
  });

  const liveLeadCount = leadsQuery.data && Array.isArray(leadsQuery.data) ? leadsQuery.data.length : null;
  const liveAnalytics = analyticsQuery.data && !analyticsQuery.data?.error ? analyticsQuery.data : null;

  const statCards = STAT_CARDS.map(card => {
    if (card.label === 'Pending Leads' && liveLeadCount !== null) {
      return { ...card, value: liveLeadCount.toString() };
    }
    return card;
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

      {(liveLeadCount !== null || liveAnalytics) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, marginBottom: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' }} />
          <Text style={{ fontSize: 10, color: colors.textTertiary }}>Connected to PaintPros.io</Text>
        </View>
      )}

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

      <HorizontalCarousel
        title="At a Glance"
        itemWidth={160}
        onSeeAll={() => showInfo(
          'Trust Score',
          'Your Trust Score is a blockchain-verified reputation metric based on your real transaction history, client reviews, response times, and credential verification.',
          ['Scores range from 0-100', 'Updated automatically after each transaction', 'Verified on the blockchain - cannot be faked', 'Visible to clients when they search for agents'],
          ['A score of 90+ means you are in the top tier of verified agents', 'Completing transactions on time improves your score', 'Fast response times to client messages boost your score']
        )}
      >
        {statCards.map((stat, i) => (
          <Pressable key={i}>
            <View style={styles.statCard}>
              <Image source={stat.image} style={styles.statCardImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0.7)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.statCardContent}>
                <Ionicons name={stat.icon} size={18} color="rgba(255,255,255,0.85)" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

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

      <HorizontalCarousel title="Active Deals" onSeeAll={() => {}} itemWidth={260}>
        {MOCK_ACTIVE_DEALS.map((deal, i) => (
          <Pressable key={i}>
            <View style={styles.dealCard}>
              <Image source={deal.image} style={styles.dealImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.dealOverlay}
              />
              <View style={styles.dealContent}>
                <View style={styles.dealStageRow}>
                  <View style={styles.stagePill}>
                    <Text style={styles.stageText}>{deal.stage}</Text>
                  </View>
                  <Text style={styles.dealDays}>{deal.daysActive}d</Text>
                </View>
                <Text style={styles.dealAddress} numberOfLines={1}>{deal.address}</Text>
                <Text style={styles.dealClient}>{deal.client}</Text>
                {deal.price ? <Text style={styles.dealPrice}>{deal.price}</Text> : null}
              </View>
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

      <HorizontalCarousel title="Hot Leads" onSeeAll={() => {}} itemWidth={180}>
        {MOCK_HOT_LEADS.map((lead, i) => (
          <Pressable key={i}>
            <View style={[styles.leadCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.leadHeader}>
                <View style={[styles.tempDot, { backgroundColor: lead.temp === 'hot' ? colors.error : colors.warning }]} />
                <Text style={[styles.leadName, { color: colors.text }]} numberOfLines={1}>{lead.name}</Text>
              </View>
              <Text style={[styles.leadSource, { color: colors.textSecondary }]}>{lead.source}</Text>
              <Text style={[styles.leadBudget, { color: colors.primary }]}>{lead.budget}</Text>
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

      <HorizontalCarousel itemWidth={160}>
        {VERTICALS.map((v, i) => (
          <Pressable key={i}>
            <View style={styles.verticalCard}>
              <Image source={v.image} style={styles.verticalImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.65)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.verticalContent}>
                <View style={[styles.verticalIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={v.icon} size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.verticalLabel}>{v.label}</Text>
                <Text style={styles.verticalCount}>{v.count}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

      <View style={styles.quickActions}>
        {[
          { label: 'Add Client', icon: 'person-add-outline' as const, key: 'add' },
          { label: 'New Showing', icon: 'calendar-outline' as const, key: 'showing' },
          { label: 'Create Post', icon: 'megaphone-outline' as const, key: 'post' },
        ].map((btn) => {
          const isActive = selectedAction === btn.key;
          return (
            <Pressable
              key={btn.key}
              onPress={() => setSelectedAction(isActive ? null : btn.key)}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: isActive ? colors.primary : (isDark ? colors.surface : colors.backgroundTertiary),
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Ionicons name={btn.icon} size={18} color={isActive ? '#FFFFFF' : colors.text} />
              <Text style={[styles.actionBtnText, { color: isActive ? '#FFFFFF' : colors.text }]}>{btn.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Footer />

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
    paddingTop: 12,
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

  statCard: {
    width: 150,
    height: 130,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  statCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600' as const,
    marginTop: 1,
  },

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
    width: 250,
    height: 170,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dealImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  dealOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dealContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 14,
  },
  dealStageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stagePill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stageText: { fontSize: 11, fontWeight: '600' as const, color: '#FFFFFF' },
  dealDays: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  dealAddress: { fontSize: 15, fontWeight: '700' as const, color: '#FFFFFF', marginBottom: 2 },
  dealClient: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  dealPrice: { fontSize: 17, fontWeight: '800' as const, color: '#FFFFFF', marginTop: 4 },

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
  leadName: { fontSize: 14, fontWeight: '600' as const, flex: 1 },
  leadSource: { fontSize: 12, marginBottom: 4 },
  leadBudget: { fontSize: 13, fontWeight: '700' as const, marginBottom: 2 },
  leadContact: { fontSize: 11 },

  verticalCard: {
    width: 150,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  verticalImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  verticalContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  verticalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  verticalLabel: { fontSize: 14, fontWeight: '700' as const, color: '#FFFFFF' },
  verticalCount: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
