import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Platform, Modal, TextInput, ActivityIndicator, Alert, Linking,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import { SampleDataBanner } from '@/components/ui/SampleDataBanner';
import {
  useTenantList, pickFile, uploadDocument, documentDownloadUrl, formatBytes, apiErrorMessage, timeAgo,
  MAX_UPLOAD_BYTES, type PickedFile,
} from '@/lib/tenant-api';

type DocStatus = 'Pending' | 'Needs Review' | 'Signed' | 'Verified';
type FilterTab = 'All' | DocStatus;

interface DocumentRow {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  status: DocStatus;
  transactionLabel: string | null;
  version: number;
  createdAt: string;
}

const STATUSES: DocStatus[] = ['Pending', 'Needs Review', 'Signed', 'Verified'];
const FILTER_TABS: FilterTab[] = ['All', ...STATUSES];

const statusColors: Record<DocStatus, string> = {
  Pending: '#FF9500',
  'Needs Review': '#FF3B30',
  Signed: '#34C759',
  Verified: '#007AFF',
};

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const SAMPLE_DOCS: DocumentRow[] = [
  { id: 's1', name: 'Purchase Agreement.pdf', mimeType: 'application/pdf', sizeBytes: 482_113, sha256: '9f2c4e7a1b03d8e6c5a4f1e2d3b7c9a0e8f6d5c4b3a2918273645f1e0d9c8b7a', status: 'Signed', transactionLabel: '123 Oak Street', version: 2, createdAt: daysAgo(2) },
  { id: 's2', name: 'Seller Disclosure.pdf', mimeType: 'application/pdf', sizeBytes: 211_904, sha256: '4b8d1f0e7c6a5b3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d', status: 'Pending', transactionLabel: '123 Oak Street', version: 1, createdAt: daysAgo(3) },
  { id: 's3', name: 'Inspection Report.pdf', mimeType: 'application/pdf', sizeBytes: 3_904_221, sha256: 'c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2', status: 'Needs Review', transactionLabel: '48 Maple Drive', version: 1, createdAt: daysAgo(5) },
  { id: 's4', name: 'Pre-Approval Letter.pdf', mimeType: 'application/pdf', sizeBytes: 98_310, sha256: 'e7f6d5c4b3a29180f1e2d3c4b5a69788a1b2c3d4e5f60718293a4b5c6d7e8f90', status: 'Verified', transactionLabel: '48 Maple Drive', version: 1, createdAt: daysAgo(9) },
];

function iconFor(mime: string): keyof typeof Ionicons.glyphMap {
  if (mime === 'application/pdf') return 'document-text';
  if (mime.startsWith('image/')) return 'image';
  if (mime.includes('sheet') || mime.includes('excel')) return 'grid';
  if (mime.includes('word')) return 'document';
  return 'document-attach';
}

const shortHash = (h: string) => (h ? `${h.slice(0, 10)}\u2026${h.slice(-6)}` : '');

function confirmAction(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

function openUrl(url: string) {
  if (Platform.OS === 'web') window.open(url, '_blank', 'noopener');
  else Linking.openURL(url);
}

export default function DocumentsScreen() {
  const { colors, isDark } = useTheme();
  const docsApi = useTenantList<DocumentRow>('/api/documents');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [folder, setFolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [actionError, setActionError] = useState('');

  const docs: DocumentRow[] = docsApi.isLive ? docsApi.items : SAMPLE_DOCS;
  const filtered = activeFilter === 'All' ? docs : docs.filter((d) => d.status === activeFilter);

  const totalDocs = docs.length;
  const pendingCount = docs.filter((d) => d.status === 'Pending' || d.status === 'Needs Review').length;
  const completeCount = docs.filter((d) => d.status === 'Signed' || d.status === 'Verified').length;
  const recentDocs = docs.slice(0, 8);

  const grouped = useMemo(() => {
    const groups: Record<string, DocumentRow[]> = {};
    for (const doc of filtered) {
      const key = doc.transactionLabel?.trim() || 'Unfiled';
      (groups[key] ||= []).push(doc);
    }
    return groups;
  }, [filtered]);
  const groupKeys = Object.keys(grouped);
  const existingFolders = useMemo(
    () => Array.from(new Set(docs.map((d) => d.transactionLabel?.trim()).filter(Boolean) as string[])).slice(0, 8),
    [docs],
  );

  const openUpload = () => {
    if (!docsApi.isLive) {
      setActionError('Sign in to your agent account to upload real documents.');
      return;
    }
    setPicked(null);
    setUploadError('');
    setShowUpload(true);
  };

  const choose = async () => {
    setUploadError('');
    try {
      const f = await pickFile();
      if (!f) return;
      if (f.size > MAX_UPLOAD_BYTES) {
        setUploadError('That file is larger than 25 MB.');
        return;
      }
      setPicked(f);
    } catch (e) {
      setUploadError(apiErrorMessage(e));
    }
  };

  const doUpload = async () => {
    if (!picked) return;
    setUploading(true);
    setUploadError('');
    try {
      await uploadDocument(picked, folder.trim() || undefined);
      await docsApi.refetch();
      setShowUpload(false);
      setPicked(null);
    } catch (e) {
      setUploadError(apiErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const setStatus = async (doc: DocumentRow, status: DocStatus) => {
    if (!docsApi.isLive || doc.status === status) return;
    setActionError('');
    try {
      await docsApi.update.mutateAsync({ id: doc.id, status });
    } catch (e) {
      setActionError(apiErrorMessage(e));
    }
  };

  const deleteDoc = async (doc: DocumentRow) => {
    if (!docsApi.isLive) return;
    const ok = await confirmAction('Delete document?', `"${doc.name}" will be permanently removed.`);
    if (!ok) return;
    setActionError('');
    try {
      await docsApi.remove.mutateAsync(doc.id);
      setExpandedId(null);
    } catch (e) {
      setActionError(apiErrorMessage(e));
    }
  };

  const inputStyle = [styles.input, {
    color: colors.text, borderColor: colors.border,
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
  }];

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          imageBanner={require('@/assets/images/guide-documents.jpg')}
          title="Documents"
          subtitle="Contracts · Disclosures · Secure vault"
          showBack
          rightAction={<InfoButton onPress={() => setShowHelp(true)} />}
        />

        <View style={styles.pad}>
          <SampleDataBanner live={docsApi.isLive} count={docsApi.isLive ? totalDocs : undefined} noun="documents" />
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.pad}>
          <BentoGrid columns={3} gap={10}>
            {[
              { label: 'Total', value: totalDocs, icon: 'documents' as const, color: colors.primary },
              { label: 'Pending', value: pendingCount, icon: 'time' as const, color: '#FF9500' },
              { label: 'Complete', value: completeCount, icon: 'shield-checkmark' as const, color: '#007AFF' },
            ].map((stat) => (
              <GlassCard key={stat.label} compact style={styles.statCard}>
                <View style={styles.statInner}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
                </View>
              </GlassCard>
            ))}
          </BentoGrid>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.actionsRow}>
          <Pressable
            testID="documents-upload-btn"
            onPress={openUpload}
            style={[styles.actionBtn, { backgroundColor: colors.primaryAction }]}
          >
            <Ionicons name="cloud-upload" size={18} color={colors.textInverse} />
            <Text style={[styles.actionBtnText, { color: colors.textInverse }]}>Upload Document</Text>
          </Pressable>
          {docsApi.isLive && (
            <Pressable
              testID="documents-refresh-btn"
              onPress={() => docsApi.refetch()}
              style={[styles.actionBtn, { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary, borderWidth: 1, borderColor: colors.border }]}
            >
              <Ionicons name="refresh" size={18} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Refresh</Text>
            </Pressable>
          )}
        </Animated.View>

        {actionError ? (
          <View style={[styles.errorBox, styles.padTop]}>
            <Ionicons name="alert-circle" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{actionError}</Text>
          </View>
        ) : null}

        {docsApi.isLoading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
        ) : null}

        {recentDocs.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(220)} style={styles.padTop}>
            <HorizontalCarousel title="Recent Uploads" itemWidth={220}>
              {recentDocs.map((doc) => (
                <GlassCard
                  key={doc.id}
                  compact
                  style={styles.recentCard}
                  onPress={() => (docsApi.isLive ? openUrl(documentDownloadUrl(doc.id, true)) : setExpandedId(doc.id))}
                >
                  <View style={styles.recentInner}>
                    <View style={styles.recentTop}>
                      <Ionicons name={iconFor(doc.mimeType)} size={18} color={statusColors[doc.status]} />
                      <Text style={[styles.recentName, { color: colors.text }]} numberOfLines={1}>{doc.name}</Text>
                    </View>
                    <Text style={[styles.recentMeta, { color: colors.textSecondary }]}>
                      {formatBytes(doc.sizeBytes)} {'\u00B7'} {timeAgo(doc.createdAt)}
                    </Text>
                    <View style={styles.hashRow}>
                      <Ionicons name="finger-print" size={12} color={colors.primary} />
                      <Text style={[styles.recentHash, { color: colors.primary }]}>{shortHash(doc.sha256)}</Text>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </HorizontalCarousel>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(260)} style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <Pressable
                  key={tab}
                  testID={`documents-filter-${tab.replace(/\s/g, '-').toLowerCase()}`}
                  onPress={() => setActiveFilter(tab)}
                  style={[styles.filterPill, { backgroundColor: isActive ? colors.primary : colors.cardGlass, borderColor: isActive ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.filterText, { color: isActive ? colors.textInverse : colors.textSecondary }]}>{tab}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {!docsApi.isLoading && filtered.length === 0 && (
          <GlassCard style={[styles.emptyCard, styles.padTop]}>
            <View style={styles.emptyInner}>
              <Ionicons name="folder-open-outline" size={36} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {docs.length === 0 ? 'No documents yet' : `No ${activeFilter.toLowerCase()} documents`}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Upload contracts, disclosures and reports. Files are stored privately in your TrustHome workspace.
              </Text>
            </View>
          </GlassCard>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(320)} style={styles.accordionWrap}>
          {groupKeys.map((key, idx) => (
            <AccordionSection
              key={key}
              title={key}
              icon="folder"
              iconColor="#1A8A7E"
              badge={grouped[key].length}
              defaultOpen={idx === 0}
            >
              {grouped[key].map((doc) => {
                const expanded = expandedId === doc.id;
                return (
                  <GlassCard key={doc.id} onPress={() => setExpandedId(expanded ? null : doc.id)} style={styles.docCard}>
                    <View style={styles.docRow}>
                      <View style={[styles.docIconWrap, { backgroundColor: statusColors[doc.status] + '18' }]}>
                        <Ionicons name={iconFor(doc.mimeType)} size={22} color={statusColors[doc.status]} />
                      </View>
                      <View style={styles.docInfo}>
                        <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>{doc.name}</Text>
                        <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                          {formatBytes(doc.sizeBytes)} {'\u00B7'} {timeAgo(doc.createdAt)}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColors[doc.status] + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColors[doc.status] }]}>{doc.status}</Text>
                      </View>
                    </View>

                    {expanded && (
                      <View style={[styles.expandedSection, { borderTopColor: colors.divider }]}>
                        <View style={styles.expandedRow}>
                          <View style={styles.expandedCol}>
                            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Version</Text>
                            <Text style={[styles.expandedValue, { color: colors.text }]}>v{doc.version}</Text>
                          </View>
                          <View style={styles.expandedCol}>
                            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Uploaded</Text>
                            <Text style={[styles.expandedValue, { color: colors.text }]}>
                              {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>SHA-256 fingerprint</Text>
                        <Text selectable style={[styles.hashFull, { color: colors.primary }]}>{doc.sha256}</Text>

                        <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Status</Text>
                        <View style={styles.statusPicker}>
                          {STATUSES.map((s) => {
                            const active = doc.status === s;
                            return (
                              <Pressable
                                key={s}
                                disabled={!docsApi.isLive}
                                onPress={() => setStatus(doc, s)}
                                style={[styles.statusChip, {
                                  borderColor: statusColors[s],
                                  backgroundColor: active ? statusColors[s] : 'transparent',
                                  opacity: docsApi.isLive || active ? 1 : 0.5,
                                }]}
                              >
                                <Text style={[styles.statusChipText, { color: active ? '#FFF' : statusColors[s] }]}>{s}</Text>
                              </Pressable>
                            );
                          })}
                        </View>

                        {docsApi.isLive && (
                          <View style={styles.docActions}>
                            <Pressable
                              testID={`documents-open-${doc.id}`}
                              onPress={() => openUrl(documentDownloadUrl(doc.id, true))}
                              style={[styles.smallBtn, { backgroundColor: colors.primary + '18' }]}
                            >
                              <Ionicons name="eye-outline" size={15} color={colors.primary} />
                              <Text style={[styles.smallBtnText, { color: colors.primary }]}>Open</Text>
                            </Pressable>
                            <Pressable
                              testID={`documents-download-${doc.id}`}
                              onPress={() => openUrl(documentDownloadUrl(doc.id))}
                              style={[styles.smallBtn, { backgroundColor: colors.primary + '18' }]}
                            >
                              <Ionicons name="download-outline" size={15} color={colors.primary} />
                              <Text style={[styles.smallBtnText, { color: colors.primary }]}>Download</Text>
                            </Pressable>
                            <Pressable
                              testID={`documents-delete-${doc.id}`}
                              onPress={() => deleteDoc(doc)}
                              style={[styles.smallBtn, { backgroundColor: 'rgba(255,59,48,0.12)' }]}
                            >
                              <Ionicons name="trash-outline" size={15} color="#FF3B30" />
                              <Text style={[styles.smallBtnText, { color: '#FF3B30' }]}>Delete</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    )}
                  </GlassCard>
                );
              })}
            </AccordionSection>
          ))}
        </Animated.View>

        <Footer />
      </ScrollView>

      {/* Upload modal */}
      <Modal visible={showUpload} transparent animationType="fade" onRequestClose={() => setShowUpload(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Document</Text>
              <Pressable onPress={() => setShowUpload(false)} style={styles.modalClose} testID="documents-upload-close">
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Pressable
                testID="documents-choose-file"
                onPress={choose}
                style={[styles.dropZone, { borderColor: picked ? colors.primary : colors.border }]}
              >
                <Ionicons name={picked ? 'document-attach' : 'cloud-upload-outline'} size={32} color={colors.primary} />
                <Text style={[styles.dropTitle, { color: colors.text }]} numberOfLines={1}>
                  {picked ? picked.name : 'Choose a file'}
                </Text>
                <Text style={[styles.dropSub, { color: colors.textSecondary }]}>
                  {picked ? `${formatBytes(picked.size)} \u00B7 tap to change` : 'PDF, Word, Excel, images or text \u00B7 up to 25 MB'}
                </Text>
              </Pressable>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Folder / transaction (optional)</Text>
              <TextInput
                testID="documents-folder-input"
                style={inputStyle}
                value={folder}
                onChangeText={setFolder}
                placeholder="e.g. 123 Oak Street"
                placeholderTextColor={colors.textTertiary}
              />
              {existingFolders.length > 0 && (
                <View style={styles.folderChips}>
                  {existingFolders.map((f) => (
                    <Pressable key={f} onPress={() => setFolder(f)} style={[styles.folderChip, { borderColor: colors.border }]}>
                      <Text style={[styles.folderChipText, { color: colors.textSecondary }]}>{f}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {uploadError ? (
                <View style={[styles.errorBox, { marginTop: 12 }]}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>{uploadError}</Text>
                </View>
              ) : null}
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.divider }]}>
              <Pressable style={[styles.modalBtn, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]} onPress={() => setShowUpload(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="documents-upload-submit"
                style={[styles.modalBtn, { backgroundColor: colors.primaryAction, opacity: picked && !uploading ? 1 : 0.5 }]}
                disabled={!picked || uploading}
                onPress={doUpload}
              >
                {uploading ? <ActivityIndicator color="#FFF" /> : (
                  <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Upload</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
  pad: { paddingHorizontal: 16, marginTop: 8 },
  padTop: { marginTop: 16, marginHorizontal: 16 },
  statCard: { minHeight: 80 },
  statInner: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, minHeight: 44 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,59,48,0.1)' },
  errorText: { flex: 1, color: '#FF3B30', fontSize: 13 },
  recentCard: { width: 220, minHeight: 96 },
  recentInner: { gap: 6 },
  recentTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recentName: { fontSize: 13, fontWeight: '600', flex: 1 },
  recentMeta: { fontSize: 11 },
  hashRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recentHash: { fontSize: 11, fontWeight: '500', fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  filterRow: { marginTop: 16, maxHeight: 44 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  emptyCard: { minHeight: 120 },
  emptyInner: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  accordionWrap: { paddingHorizontal: 16, marginTop: 16 },
  docCard: { marginTop: 8, minHeight: 70 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docInfo: { flex: 1, gap: 2 },
  docName: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 4 },
  expandedLabel: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 },
  expandedValue: { fontSize: 13 },
  expandedRow: { flexDirection: 'row', gap: 20 },
  expandedCol: { flex: 1 },
  hashFull: { fontSize: 11, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined },
  statusPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  docActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, minHeight: 36 },
  smallBtnText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, borderWidth: 1, maxHeight: '85%', overflow: 'hidden', width: '100%', maxWidth: 520, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalClose: { padding: 4 },
  modalBody: { padding: 16 },
  dropZone: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, padding: 24, alignItems: 'center', gap: 6, marginBottom: 16 },
  dropTitle: { fontSize: 15, fontWeight: '700', maxWidth: '100%' },
  dropSub: { fontSize: 12, textAlign: 'center' },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  folderChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  folderChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  folderChipText: { fontSize: 12 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 16, borderTopWidth: 1 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 100, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontWeight: '600', fontSize: 14 },
});
