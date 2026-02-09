import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';

type DocStatus = 'Signed' | 'Pending' | 'Needs Review' | 'Verified';
type FilterTab = 'All' | 'Pending' | 'Signed' | 'Verified';

interface Document {
  id: string;
  name: string;
  status: DocStatus;
  date: string;
  transaction: string;
  icon: keyof typeof Ionicons.glyphMap;
  verified: boolean;
  parties: string[];
  version: string;
  hash: string;
}

const DOCUMENTS: Document[] = [
  { id: '1', name: 'Purchase Agreement', status: 'Signed', date: 'Jan 28, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'document-text', verified: true, parties: ['Sarah Chen (Buyer)', 'Marcus Webb (Seller)', 'Lisa Tran (Agent)'], version: 'v3.1 — Final', hash: '0x8a3f...c7d2' },
  { id: '2', name: 'Pre-Approval Letter', status: 'Verified', date: 'Jan 15, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'card', verified: true, parties: ['Sarah Chen (Buyer)', 'First National Bank'], version: 'v1.0', hash: '0x1b9e...4f81' },
  { id: '3', name: 'Disclosure Package', status: 'Pending', date: 'Feb 03, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'alert-circle', verified: false, parties: ['Marcus Webb (Seller)', 'Lisa Tran (Agent)'], version: 'v2.0 — Draft', hash: '' },
  { id: '4', name: 'Inspection Report', status: 'Signed', date: 'Feb 01, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'search', verified: true, parties: ['HomeCheck Inspections', 'Sarah Chen (Buyer)'], version: 'v1.0 — Final', hash: '0x3d7a...e190' },
  { id: '5', name: 'Appraisal Report', status: 'Needs Review', date: 'Feb 05, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'calculator', verified: false, parties: ['Valley Appraisals LLC', 'First National Bank'], version: 'v1.0 — Pending Review', hash: '' },
  { id: '6', name: 'Title Report', status: 'Verified', date: 'Jan 22, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'shield-checkmark', verified: true, parties: ['Pacific Title Co.', 'Lisa Tran (Agent)'], version: 'v1.0', hash: '0x6c2f...b3a5' },
  { id: '7', name: 'HUD-1 Settlement Statement', status: 'Pending', date: 'Feb 07, 2026', transaction: 'TXN-4821 · 742 Elm St', icon: 'receipt', verified: false, parties: ['Pacific Title Co.', 'Sarah Chen', 'Marcus Webb'], version: 'v1.0 — Draft', hash: '' },
  { id: '8', name: 'Home Warranty Agreement', status: 'Signed', date: 'Jan 30, 2026', transaction: 'TXN-4899 · 1510 Oak Ave', icon: 'home', verified: true, parties: ['American Home Shield', 'David Park (Buyer)'], version: 'v1.0 — Final', hash: '0xab12...9ef4' },
  { id: '9', name: 'Insurance Binder', status: 'Verified', date: 'Jan 25, 2026', transaction: 'TXN-4899 · 1510 Oak Ave', icon: 'umbrella', verified: true, parties: ['State Farm Insurance', 'David Park (Buyer)'], version: 'v1.0', hash: '0x5e8d...a2c7' },
  { id: '10', name: 'Amendment to Purchase Agreement', status: 'Needs Review', date: 'Feb 06, 2026', transaction: 'TXN-4899 · 1510 Oak Ave', icon: 'create', verified: false, parties: ['David Park (Buyer)', 'Jennifer Liu (Seller)', 'Lisa Tran (Agent)'], version: 'v1.0 — Awaiting Signatures', hash: '' },
  { id: '11', name: 'Buyer Representation Agreement', status: 'Signed', date: 'Dec 10, 2025', transaction: 'TXN-4750 · 88 Maple Dr', icon: 'people', verified: true, parties: ['Robert Kim (Buyer)', 'Lisa Tran (Agent)'], version: 'v1.0 — Final', hash: '0x72cf...d561' },
];

const FILTER_TABS: FilterTab[] = ['All', 'Pending', 'Signed', 'Verified'];

const statusColors: Record<DocStatus, string> = {
  Signed: '#34C759',
  Pending: '#FF9500',
  'Needs Review': '#FF3B30',
  Verified: '#007AFF',
};

export default function DocumentsScreen() {
  const { colors, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const filtered = activeFilter === 'All'
    ? DOCUMENTS
    : DOCUMENTS.filter(d => d.status === activeFilter);

  const totalDocs = DOCUMENTS.length;
  const pendingCount = DOCUMENTS.filter(d => d.status === 'Pending' || d.status === 'Needs Review').length;
  const verifiedCount = DOCUMENTS.filter(d => d.verified).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Documents" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          {[
            { label: 'Total Docs', value: totalDocs, icon: 'documents' as const, color: colors.primary },
            { label: 'Pending', value: pendingCount, icon: 'time' as const, color: '#FF9500' },
            { label: 'Verified', value: verifiedCount, icon: 'shield-checkmark' as const, color: '#007AFF' },
          ].map((stat) => (
            <GlassCard key={stat.label} compact style={styles.statCard}>
              <View style={styles.statInner}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            </GlassCard>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
          {FILTER_TABS.map(tab => {
            const isActive = activeFilter === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveFilter(tab)}
                style={[styles.filterPill, { backgroundColor: isActive ? colors.primary : colors.cardGlass, borderColor: isActive ? colors.primary : colors.border }]}
              >
                <Text style={[styles.filterText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>Upload</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary, borderWidth: 1, borderColor: colors.border }]}>
            <Ionicons name="pencil" size={18} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Request Signature</Text>
          </Pressable>
        </View>

        {filtered.map(doc => {
          const expanded = expandedId === doc.id;
          return (
            <GlassCard key={doc.id} onPress={() => setExpandedId(expanded ? null : doc.id)} style={styles.docCard}>
              <View style={styles.docRow}>
                <View style={[styles.docIconWrap, { backgroundColor: statusColors[doc.status] + '18' }]}>
                  <Ionicons name={doc.icon} size={22} color={statusColors[doc.status]} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{doc.name}</Text>
                  <Text style={[styles.docMeta, { color: colors.textSecondary }]}>{doc.date} {'\u00B7'} {doc.transaction}</Text>
                </View>
                <View style={styles.docRight}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColors[doc.status] + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColors[doc.status] }]}>{doc.status}</Text>
                  </View>
                  {doc.verified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#007AFF" />
                      <Text style={styles.verifiedText}>On-chain</Text>
                    </View>
                  )}
                </View>
              </View>
              {expanded && (
                <View style={[styles.expandedSection, { borderTopColor: colors.divider }]}>
                  <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Parties Involved</Text>
                  {doc.parties.map((p, i) => (
                    <Text key={i} style={[styles.expandedValue, { color: colors.text }]}>{p}</Text>
                  ))}
                  <View style={styles.expandedRow}>
                    <View style={styles.expandedCol}>
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Version</Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>{doc.version}</Text>
                    </View>
                    {doc.hash ? (
                      <View style={styles.expandedCol}>
                        <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Verification Hash</Text>
                        <Text style={[styles.expandedValue, { color: colors.primary }]}>{doc.hash}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}
            </GlassCard>
          );
        })}

        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.documents.title}
        description={SCREEN_HELP.documents.description}
        details={SCREEN_HELP.documents.details}
        examples={SCREEN_HELP.documents.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  statCard: { minHeight: 80 },
  statInner: { alignItems: 'center' as const, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700' as const },
  statLabel: { fontSize: 11, fontWeight: '500' as const },
  filterRow: { marginTop: 16, maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' as const },
  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' as const, gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontWeight: '600' as const, color: '#FFFFFF' },
  docCard: { marginHorizontal: 16, marginTop: 10, minHeight: 70 },
  docRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 12 },
  docIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const },
  docInfo: { flex: 1, gap: 2 },
  docName: { fontSize: 14, fontWeight: '600' as const },
  docMeta: { fontSize: 11 },
  docRight: { alignItems: 'flex-end' as const, gap: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' as const },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center' as const, gap: 3 },
  verifiedText: { fontSize: 9, color: '#007AFF', fontWeight: '500' as const },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 4 },
  expandedLabel: { fontSize: 10, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginTop: 6 },
  expandedValue: { fontSize: 13 },
  expandedRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  expandedCol: { flex: 1 },
});
