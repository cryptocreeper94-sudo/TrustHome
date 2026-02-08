import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { BentoGrid, BentoRow } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { PillButton } from '@/components/ui/PillButton';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';

const MOCK_CLIENT = {
  name: 'Sarah',
  agentName: 'Jennifer Cole',
  agentPhoto: null,
  trustScore: 88,
};

const TRANSACTION_STAGES = [
  { label: 'Pre-Approval', status: 'completed' as const, icon: 'checkmark-circle' as const },
  { label: 'Home Search', status: 'completed' as const, icon: 'checkmark-circle' as const },
  { label: 'Offer', status: 'completed' as const, icon: 'checkmark-circle' as const },
  { label: 'Under Contract', status: 'active' as const, icon: 'radio-button-on' as const },
  { label: 'Inspection', status: 'upcoming' as const, icon: 'ellipse-outline' as const },
  { label: 'Appraisal', status: 'upcoming' as const, icon: 'ellipse-outline' as const },
  { label: 'Final Walk', status: 'upcoming' as const, icon: 'ellipse-outline' as const },
  { label: 'Closing', status: 'upcoming' as const, icon: 'ellipse-outline' as const },
];

const MOCK_SHORTLIST = [
  { address: '1847 Oak Valley Dr', price: '$425,000', beds: 4, baths: 3, sqft: '2,400', status: 'Under Contract', favorited: true },
  { address: '302 Elm Park Ct', price: '$389,000', beds: 3, baths: 2, sqft: '1,850', status: 'Favorited', favorited: true },
  { address: '910 Cedar Ridge Blvd', price: '$445,000', beds: 4, baths: 2.5, sqft: '2,600', status: 'New', favorited: false },
  { address: '55 Lakeview Terrace', price: '$510,000', beds: 5, baths: 3, sqft: '3,100', status: 'New', favorited: false },
];

const MOCK_SHOWINGS = [
  { date: 'Tomorrow', time: '10:00 AM', address: '1847 Oak Valley Dr', type: 'Second Showing' },
  { date: 'Tomorrow', time: '11:30 AM', address: '302 Elm Park Ct', type: 'First Showing' },
  { date: 'Friday', time: '2:00 PM', address: '55 Lakeview Terrace', type: 'First Showing' },
];

const MOCK_DOCUMENTS = [
  { name: 'Purchase Agreement', status: 'Signed', icon: 'document-text' as const, date: 'Jan 15' },
  { name: 'Pre-Approval Letter', status: 'Completed', icon: 'shield-checkmark' as const, date: 'Jan 8' },
  { name: 'Disclosure Package', status: 'Needs Review', icon: 'alert-circle' as const, date: 'Feb 5' },
  { name: 'Home Inspection Report', status: 'Pending', icon: 'time' as const, date: '' },
];

function TimelineStage({ label, status, icon, isLast }: { label: string; status: 'completed' | 'active' | 'upcoming'; icon: keyof typeof Ionicons.glyphMap; isLast: boolean }) {
  const { colors } = useTheme();
  const stageColors = {
    completed: colors.success,
    active: colors.primary,
    upcoming: colors.textTertiary,
  };
  return (
    <View style={tlStyles.stage}>
      <View style={tlStyles.iconCol}>
        <Ionicons name={icon} size={20} color={stageColors[status]} />
        {!isLast ? <View style={[tlStyles.line, { backgroundColor: status === 'completed' ? colors.success : colors.border }]} /> : null}
      </View>
      <View style={tlStyles.labelCol}>
        <Text style={[
          tlStyles.label,
          { color: status === 'upcoming' ? colors.textTertiary : colors.text },
          status === 'active' && { fontWeight: '700' as const },
        ]}>{label}</Text>
        {status === 'active' ? <Text style={[tlStyles.activeTag, { color: colors.primary }]}>Current Stage</Text> : null}
      </View>
    </View>
  );
}

const tlStyles = StyleSheet.create({
  stage: { flexDirection: 'row', gap: 12 },
  iconCol: { alignItems: 'center', width: 20 },
  line: { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  labelCol: { flex: 1, paddingBottom: 12 },
  label: { fontSize: 14 },
  activeTag: { fontSize: 11, fontWeight: '600' as const, marginTop: 2 },
});

export function ClientDashboard() {
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
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>Welcome back</Text>
          <Text style={[styles.name, { color: colors.text }]}>{MOCK_CLIENT.name}</Text>
        </View>
        <View style={[styles.agentChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.agentAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.agentInitial}>{MOCK_CLIENT.agentName[0]}</Text>
          </View>
          <View>
            <Text style={[styles.agentLabel, { color: colors.textTertiary }]}>Your Agent</Text>
            <Text style={[styles.agentName, { color: colors.text }]}>{MOCK_CLIENT.agentName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction Progress</Text>
        <InfoButton onPress={() => showInfo(
          'Transaction Timeline',
          'This tracks the progress of your home purchase from pre-approval through closing. Each step represents a major milestone in the process.',
          ['Completed steps have a green checkmark', 'Your current step is highlighted', 'Upcoming steps show as circles', 'Your agent updates this as things progress'],
          ['Pre-Approval: Getting approved by your lender for a loan amount', 'Under Contract: Your offer was accepted and the legal process begins', 'Closing: The final step where you sign documents and get the keys']
        )} />
      </View>

      <GlassCard style={styles.timelineCard}>
        <View style={styles.timelineHeader}>
          <View>
            <Text style={[styles.propertyAddr, { color: colors.text }]}>1847 Oak Valley Dr</Text>
            <Text style={[styles.propertyPrice, { color: colors.primary }]}>$425,000</Text>
          </View>
          <View style={[styles.trustBadge, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.08)' }]}>
            <MaterialCommunityIcons name="shield-check" size={14} color={colors.primary} />
            <Text style={[styles.trustText, { color: colors.primary }]}>Verified</Text>
          </View>
        </View>
        <View style={styles.timeline}>
          {TRANSACTION_STAGES.map((stage, i) => (
            <TimelineStage key={i} {...stage} isLast={i === TRANSACTION_STAGES.length - 1} />
          ))}
        </View>
      </GlassCard>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Showings</Text>
        <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>{MOCK_SHOWINGS.length} scheduled</Text>
      </View>

      {MOCK_SHOWINGS.map((showing, i) => (
        <Pressable key={i}>
          <GlassCard compact style={styles.showingCard}>
            <View style={styles.showingRow}>
              <View style={[styles.showingDate, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.08)' }]}>
                <Text style={[styles.showingDateText, { color: colors.primary }]}>{showing.date}</Text>
                <Text style={[styles.showingTimeText, { color: colors.primary }]}>{showing.time}</Text>
              </View>
              <View style={styles.showingInfo}>
                <Text style={[styles.showingAddr, { color: colors.text }]}>{showing.address}</Text>
                <Text style={[styles.showingType, { color: colors.textSecondary }]}>{showing.type}</Text>
              </View>
              <Ionicons name="navigate-outline" size={20} color={colors.primary} />
            </View>
          </GlassCard>
        </Pressable>
      ))}

      <HorizontalCarousel title="Your Shortlist" onSeeAll={() => {}} style={styles.shortlistSection}>
        {MOCK_SHORTLIST.map((prop, i) => (
          <Pressable key={i}>
            <View style={[styles.propCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <LinearGradient
                colors={isDark
                  ? ['rgba(26,138,126,0.08)', 'rgba(26,138,126,0.02)']
                  : ['rgba(26,138,126,0.04)', 'transparent']}
                style={styles.propCardGradient}
              />
              <View style={styles.propHeader}>
                <View style={[styles.propStatusPill, {
                  backgroundColor: prop.status === 'Under Contract'
                    ? (isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.1)')
                    : prop.status === 'New'
                      ? (isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.1)')
                      : (isDark ? 'rgba(255,149,0,0.15)' : 'rgba(255,149,0,0.1)')
                }]}>
                  <Text style={[styles.propStatusText, {
                    color: prop.status === 'Under Contract' ? colors.success : prop.status === 'New' ? colors.info : colors.warning
                  }]}>{prop.status}</Text>
                </View>
                <Pressable>
                  <Ionicons name={prop.favorited ? 'heart' : 'heart-outline'} size={20} color={prop.favorited ? colors.error : colors.textTertiary} />
                </Pressable>
              </View>
              <Text style={[styles.propPrice, { color: colors.text }]}>{prop.price}</Text>
              <Text style={[styles.propAddr, { color: colors.textSecondary }]} numberOfLines={1}>{prop.address}</Text>
              <View style={styles.propDetails}>
                <Text style={[styles.propDetail, { color: colors.textTertiary }]}>{prop.beds} bed</Text>
                <View style={[styles.detailDot, { backgroundColor: colors.border }]} />
                <Text style={[styles.propDetail, { color: colors.textTertiary }]}>{prop.baths} bath</Text>
                <View style={[styles.detailDot, { backgroundColor: colors.border }]} />
                <Text style={[styles.propDetail, { color: colors.textTertiary }]}>{prop.sqft} sqft</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>
        <InfoButton onPress={() => showInfo(
          'Document Vault',
          'All your transaction documents in one secure place. Documents are verified on the blockchain through Trust Shield to ensure they have not been altered.',
          ['Green = completed/signed', 'Orange = needs your review', 'Gray = pending (waiting on another party)', 'Documents with the shield icon are blockchain-verified'],
        )} />
      </View>

      <View style={styles.docsList}>
        {MOCK_DOCUMENTS.map((doc, i) => (
          <Pressable key={i}>
            <GlassCard compact style={styles.docCard}>
              <View style={styles.docRow}>
                <Ionicons name={doc.icon} size={22} color={
                  doc.status === 'Signed' || doc.status === 'Completed' ? colors.success
                    : doc.status === 'Needs Review' ? colors.warning
                      : colors.textTertiary
                } />
                <View style={styles.docInfo}>
                  <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                  <Text style={[styles.docStatus, { color: colors.textSecondary }]}>{doc.status}{doc.date ? ` - ${doc.date}` : ''}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </View>
            </GlassCard>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Connected Parties</Text>
        <InfoButton onPress={() => showInfo(
          'Connected Parties',
          'These are the professionals involved in your transaction. You can message them directly about your deal.',
          ['Your agent coordinates all parties', 'The inspector examines the property for issues', 'Your lender handles your mortgage financing', 'The title company handles the legal transfer of ownership'],
        )} />
      </View>

      <BentoGrid style={styles.partiesGrid}>
        <BentoRow>
          <GlassCard compact onPress={() => {}}>
            <View style={styles.partyCard}>
              <View style={[styles.partyIcon, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.08)' }]}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.partyRole, { color: colors.textSecondary }]}>Agent</Text>
              <Text style={[styles.partyName, { color: colors.text }]}>Jennifer C.</Text>
            </View>
          </GlassCard>
          <GlassCard compact onPress={() => {}}>
            <View style={styles.partyCard}>
              <View style={[styles.partyIcon, { backgroundColor: isDark ? 'rgba(52,199,89,0.15)' : 'rgba(52,199,89,0.08)' }]}>
                <Ionicons name="search" size={20} color={colors.success} />
              </View>
              <Text style={[styles.partyRole, { color: colors.textSecondary }]}>Inspector</Text>
              <Text style={[styles.partyName, { color: colors.text }]}>Mark T.</Text>
            </View>
          </GlassCard>
          <GlassCard compact onPress={() => {}}>
            <View style={styles.partyCard}>
              <View style={[styles.partyIcon, { backgroundColor: isDark ? 'rgba(0,122,255,0.15)' : 'rgba(0,122,255,0.08)' }]}>
                <Ionicons name="cash" size={20} color={colors.info} />
              </View>
              <Text style={[styles.partyRole, { color: colors.textSecondary }]}>Lender</Text>
              <Text style={[styles.partyName, { color: colors.text }]}>First Nat'l</Text>
            </View>
          </GlassCard>
        </BentoRow>
      </BentoGrid>

      <View style={styles.quickActions}>
        <PillButton title="Message Agent" icon="chatbubble-outline" onPress={() => {}} variant="primary" size="medium" />
        <PillButton title="Calculator" icon="calculator-outline" onPress={() => {}} variant="secondary" size="medium" />
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
  agentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentInitial: { color: '#fff', fontSize: 14, fontWeight: '700' as const },
  agentLabel: { fontSize: 10 },
  agentName: { fontSize: 13, fontWeight: '600' as const },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const, letterSpacing: 0.2 },
  sectionCount: { fontSize: 13 },
  timelineCard: { marginHorizontal: 16, marginBottom: 20 },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  propertyAddr: { fontSize: 16, fontWeight: '700' as const },
  propertyPrice: { fontSize: 20, fontWeight: '800' as const, marginTop: 2 },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trustText: { fontSize: 11, fontWeight: '600' as const },
  timeline: { paddingLeft: 4 },
  showingCard: { marginHorizontal: 16, marginBottom: 6, minHeight: 64 },
  showingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  showingDate: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  showingDateText: { fontSize: 11, fontWeight: '700' as const },
  showingTimeText: { fontSize: 10 },
  showingInfo: { flex: 1 },
  showingAddr: { fontSize: 14, fontWeight: '600' as const },
  showingType: { fontSize: 12, marginTop: 1 },
  shortlistSection: { marginTop: 16 },
  propCard: {
    width: 200,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  propCardGradient: { ...StyleSheet.absoluteFillObject },
  propHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propStatusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  propStatusText: { fontSize: 10, fontWeight: '600' as const },
  propPrice: { fontSize: 18, fontWeight: '800' as const, marginBottom: 4 },
  propAddr: { fontSize: 12, marginBottom: 6 },
  propDetails: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  propDetail: { fontSize: 11 },
  detailDot: { width: 3, height: 3, borderRadius: 1.5 },
  docsList: { paddingHorizontal: 16, gap: 6, marginBottom: 16 },
  docCard: { minHeight: 52 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '600' as const },
  docStatus: { fontSize: 12, marginTop: 1 },
  partiesGrid: { paddingHorizontal: 16, marginBottom: 20, gap: 10 },
  partyCard: { alignItems: 'center', gap: 4, paddingVertical: 4 },
  partyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyRole: { fontSize: 11 },
  partyName: { fontSize: 13, fontWeight: '600' as const },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
});
