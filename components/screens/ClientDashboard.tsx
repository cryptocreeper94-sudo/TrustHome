import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { Footer } from '@/components/ui/Footer';

const CARD_IMAGES = {
  home1: require('@/assets/images/cards/home1_1.jpg'),
  home2: require('@/assets/images/cards/home1_2.jpg'),
  home3: require('@/assets/images/cards/home1_3.jpg'),
  home4: require('@/assets/images/cards/home1_4.jpg'),
  inspector: require('@/assets/images/cards/inspector.jpg'),
  lender: require('@/assets/images/cards/lender.jpg'),
  team: require('@/assets/images/cards/team.jpg'),
};

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
  { address: '1847 Oak Valley Dr', price: '$425,000', beds: 4, baths: 3, sqft: '2,400', status: 'Under Contract', favorited: true, image: CARD_IMAGES.home1 },
  { address: '302 Elm Park Ct', price: '$389,000', beds: 3, baths: 2, sqft: '1,850', status: 'Favorited', favorited: true, image: CARD_IMAGES.home2 },
  { address: '910 Cedar Ridge Blvd', price: '$445,000', beds: 4, baths: 2.5, sqft: '2,600', status: 'New', favorited: false, image: CARD_IMAGES.home3 },
  { address: '55 Lakeview Terrace', price: '$510,000', beds: 5, baths: 3, sqft: '3,100', status: 'New', favorited: false, image: CARD_IMAGES.home4 },
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

const CONNECTED_PARTIES = [
  { role: 'Agent', name: 'Jennifer C.', icon: 'person' as const, color: '#1A8A7E', image: CARD_IMAGES.team },
  { role: 'Inspector', name: 'Mark T.', icon: 'search' as const, color: '#34C759', image: CARD_IMAGES.inspector },
  { role: 'Lender', name: "First Nat'l", icon: 'cash' as const, color: '#007AFF', image: CARD_IMAGES.lender },
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
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
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

      <HorizontalCarousel title="Your Shortlist" onSeeAll={() => {}} style={styles.shortlistSection} itemWidth={240}>
        {MOCK_SHORTLIST.map((prop, i) => (
          <Pressable key={i}>
            <View style={styles.propCard}>
              <Image source={prop.image} style={styles.propImage} resizeMode="cover" />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.75)']}
                style={styles.propOverlay}
              />
              <View style={styles.propTopRow}>
                <View style={[styles.propStatusPill, {
                  backgroundColor: prop.status === 'Under Contract'
                    ? 'rgba(52,199,89,0.85)'
                    : prop.status === 'New'
                      ? 'rgba(0,122,255,0.85)'
                      : 'rgba(255,149,0,0.85)'
                }]}>
                  <Text style={styles.propStatusText}>{prop.status}</Text>
                </View>
                <Pressable>
                  <Ionicons name={prop.favorited ? 'heart' : 'heart-outline'} size={22} color={prop.favorited ? '#FF3B30' : '#FFFFFF'} />
                </Pressable>
              </View>
              <View style={styles.propBottom}>
                <Text style={styles.propPrice}>{prop.price}</Text>
                <Text style={styles.propAddr} numberOfLines={1}>{prop.address}</Text>
                <View style={styles.propDetails}>
                  <Text style={styles.propDetail}>{prop.beds} bed</Text>
                  <View style={styles.detailDot} />
                  <Text style={styles.propDetail}>{prop.baths} bath</Text>
                  <View style={styles.detailDot} />
                  <Text style={styles.propDetail}>{prop.sqft} sqft</Text>
                </View>
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

      <HorizontalCarousel itemWidth={160}>
        {CONNECTED_PARTIES.map((party, i) => (
          <Pressable key={i}>
            <View style={styles.partyCard}>
              <Image source={party.image} style={styles.partyImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.partyContent}>
                <View style={[styles.partyIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={party.icon} size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.partyRole}>{party.role}</Text>
                <Text style={styles.partyName}>{party.name}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </HorizontalCarousel>

      <View style={styles.quickActions}>
        {[
          { label: 'Message Agent', icon: 'chatbubble-outline' as const, key: 'message' },
          { label: 'Calculator', icon: 'calculator-outline' as const, key: 'calc' },
          { label: 'Schedule', icon: 'calendar-outline' as const, key: 'schedule' },
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
    width: 230,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  propImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  propOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  propTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
  },
  propStatusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  propStatusText: { fontSize: 10, fontWeight: '700' as const, color: '#FFFFFF' },
  propBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  propPrice: { fontSize: 20, fontWeight: '800' as const, color: '#FFFFFF', marginBottom: 2 },
  propAddr: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  propDetails: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  propDetail: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  detailDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.5)' },

  docsList: { paddingHorizontal: 16, gap: 6, marginBottom: 16 },
  docCard: { minHeight: 52 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '600' as const },
  docStatus: { fontSize: 12, marginTop: 1 },

  partyCard: {
    width: 150,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  partyImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  partyContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
  },
  partyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  partyRole: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  partyName: { fontSize: 14, fontWeight: '700' as const, color: '#FFFFFF' },

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
