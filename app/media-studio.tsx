import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { getApiUrl, apiRequest, queryClient } from '@/lib/query-client';

type TabKey = 'projects' | 'requests' | 'tools';

interface MediaProject {
  id: string;
  title: string;
  type: string;
  status: 'completed' | 'processing' | 'draft' | 'queued';
  createdAt: string;
  thumbnail?: string;
  duration?: string;
  format?: string;
}

const SAMPLE_PROJECTS: MediaProject[] = [
  { id: 'msp-001', title: 'Oak Street Listing Walkthrough', type: 'video_walkthrough', status: 'completed', createdAt: '2026-02-10', duration: '3:45', format: 'mp4' },
  { id: 'msp-002', title: 'Spring Campaign Promo', type: 'branded_intro', status: 'completed', createdAt: '2026-02-08', duration: '0:30', format: 'mp4' },
  { id: 'msp-003', title: 'Market Update Voiceover', type: 'voiceover', status: 'completed', createdAt: '2026-02-06', duration: '2:15', format: 'mp3' },
  { id: 'msp-004', title: 'Oakwood Open House Highlights', type: 'video_editing', status: 'processing', createdAt: '2026-02-11', duration: '5:00' },
  { id: 'msp-005', title: 'New Listing - Elm Ave', type: 'video_walkthrough', status: 'queued', createdAt: '2026-02-12' },
];

const TOOLS = [
  { id: 'walkthrough', icon: 'videocam-outline' as const, label: 'Video Walkthrough', desc: 'Professional property walkthrough video' },
  { id: 'editing', icon: 'cut-outline' as const, label: 'Video Editing', desc: 'Edit and polish your property videos' },
  { id: 'audio', icon: 'mic-outline' as const, label: 'Audio / Voiceover', desc: 'Add professional narration to tours' },
  { id: 'branding', icon: 'sparkles-outline' as const, label: 'Branded Intros', desc: 'Custom animated intro/outros for listings' },
  { id: 'stitch', icon: 'layers-outline' as const, label: 'Multi-Angle Stitch', desc: 'Combine multiple camera angles into one video' },
  { id: 'thumbnail', icon: 'image-outline' as const, label: 'Thumbnail Gen', desc: 'Auto-generate eye-catching listing thumbnails' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return '#1A8A7E';
    case 'processing': return '#F59E0B';
    case 'queued': return '#6366F1';
    case 'draft': return '#94A3B8';
    default: return '#94A3B8';
  }
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'video_walkthrough': return 'videocam';
    case 'video_editing': return 'cut';
    case 'branded_intro': return 'sparkles';
    case 'voiceover': return 'mic';
    case 'audio_editing': return 'musical-notes';
    case 'multi_angle_stitch': return 'layers';
    case 'thumbnail_generation': return 'image';
    default: return 'film';
  }
}

export default function MediaStudioScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('projects');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [walkthroughAddress, setWalkthroughAddress] = useState('');

  const statusQuery = useQuery<any>({
    queryKey: ['/api/media-studio/status'],
  });

  const projectsQuery = useQuery<any>({
    queryKey: ['/api/media-studio/projects'],
  });

  const isConnected = statusQuery.data?.configured === true;
  const capabilities = statusQuery.data?.capabilities || [];

  const allProjects = SAMPLE_PROJECTS;

  const handleDownload = useCallback(async (project: MediaProject) => {
    setDownloadingId(project.id);
    try {
      const url = new URL(`/api/media-studio/projects/${project.id}/download`, getApiUrl());
      url.searchParams.set('format', project.format || 'mp4');
      const resp = await fetch(url.toString());
      const data = await resp.json();
      if (data.downloadUrl) {
        if (Platform.OS === 'web') {
          window.open(data.downloadUrl, '_blank');
        } else {
          await Linking.openURL(data.downloadUrl);
        }
      }
    } catch (err) {
      Alert.alert('Download Error', 'Could not generate download link. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const handleRequestWalkthrough = useCallback(async () => {
    try {
      const resp = await apiRequest('POST', '/api/media-studio/walkthrough-request', {
        propertyAddress: 'New Property',
        requestType: 'video_walkthrough',
      });
      Alert.alert('Request Submitted', 'Your video walkthrough request has been sent to DarkWave Media Studio. Estimated turnaround: 24 hours.');
    } catch (err) {
      Alert.alert('Error', 'Could not submit request. Please try again.');
    }
  }, []);

  const handleOpenStudio = useCallback(() => {
    Linking.openURL('https://media.darkwavestudios.io');
  }, []);

  const renderProjectCard = (project: MediaProject) => {
    const isDownloading = downloadingId === project.id;
    const canDownload = project.status === 'completed';
    return (
      <GlassCard key={project.id} style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={[styles.typeIconWrap, { backgroundColor: getStatusColor(project.status) + '20' }]}>
            <Ionicons name={getTypeIcon(project.type) as any} size={22} color={getStatusColor(project.status)} />
          </View>
          <View style={styles.projectInfo}>
            <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={1}>{project.title}</Text>
            <Text style={[styles.projectMeta, { color: colors.textSecondary }]}>
              {project.type.replace(/_/g, ' ')} {project.duration ? `  ${project.duration}` : ''}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
              {project.status}
            </Text>
          </View>
        </View>

        <View style={styles.projectActions}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{project.createdAt}</Text>
          <View style={styles.actionButtons}>
            {canDownload && (
              <Pressable
                style={[styles.downloadBtn, { backgroundColor: '#1A8A7E' }]}
                onPress={() => handleDownload(project)}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={16} color="#fff" />
                    <Text style={styles.downloadBtnText}>Download</Text>
                  </>
                )}
              </Pressable>
            )}
            {project.status === 'processing' && (
              <View style={[styles.processingBtn, { backgroundColor: '#F59E0B20' }]}>
                <ActivityIndicator size="small" color="#F59E0B" />
                <Text style={[styles.processingText, { color: '#F59E0B' }]}>Processing</Text>
              </View>
            )}
            {project.status === 'queued' && (
              <View style={[styles.processingBtn, { backgroundColor: '#6366F120' }]}>
                <Ionicons name="time-outline" size={14} color="#6366F1" />
                <Text style={[styles.processingText, { color: '#6366F1' }]}>In Queue</Text>
              </View>
            )}
          </View>
        </View>
      </GlassCard>
    );
  };

  const renderToolCard = (tool: typeof TOOLS[0]) => (
    <GlassCard key={tool.id} style={styles.toolCard} onPress={handleOpenStudio}>
      <View style={[styles.toolIconWrap, { backgroundColor: '#1A8A7E15' }]}>
        <Ionicons name={tool.icon as any} size={28} color="#1A8A7E" />
      </View>
      <Text style={[styles.toolLabel, { color: colors.text }]}>{tool.label}</Text>
      <Text style={[styles.toolDesc, { color: colors.textSecondary }]} numberOfLines={2}>{tool.desc}</Text>
    </GlassCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Media Studio" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={isDark ? ['#0D3B36', '#1A1A2E'] : ['#E0F7F5', '#F0FFFE']}
          style={styles.heroBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <MaterialCommunityIcons name="movie-open-star-outline" size={40} color="#1A8A7E" />
            </View>
            <View style={styles.heroRight}>
              <Text style={[styles.heroTitle, { color: colors.text }]}>DarkWave Media Studio</Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                Professional video production for your listings
              </Text>
              <View style={styles.heroStatusRow}>
                <View style={[styles.connectionDot, { backgroundColor: isConnected ? '#1A8A7E' : '#EF4444' }]} />
                <Text style={[styles.connectionText, { color: isConnected ? '#1A8A7E' : '#EF4444' }]}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabRow}>
          {([
            { key: 'projects' as TabKey, label: 'My Projects', icon: 'folder-outline' },
            { key: 'requests' as TabKey, label: 'Requests', icon: 'paper-plane-outline' },
            { key: 'tools' as TabKey, label: 'Tools', icon: 'construct-outline' },
          ]).map((tab) => (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
                activeTab === tab.key && { borderBottomColor: '#1A8A7E' },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.key ? '#1A8A7E' : colors.textSecondary}
              />
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.key ? '#1A8A7E' : colors.textSecondary },
                activeTab === tab.key && styles.tabTextActive,
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'projects' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Projects</Text>
              <Pressable onPress={handleOpenStudio} style={styles.openStudioBtn}>
                <Ionicons name="open-outline" size={14} color="#1A8A7E" />
                <Text style={styles.openStudioText}>Open Studio</Text>
              </Pressable>
            </View>
            {allProjects.map(renderProjectCard)}
            {allProjects.length === 0 && (
              <GlassCard>
                <View style={styles.emptyState}>
                  <Ionicons name="film-outline" size={48} color={colors.textSecondary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Projects Yet</Text>
                  <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                    Request a video walkthrough or use the tools to get started
                  </Text>
                </View>
              </GlassCard>
            )}
          </View>
        )}

        {activeTab === 'requests' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Request New Media</Text>
            <GlassCard>
              <View style={styles.requestForm}>
                <View style={[styles.requestIconWrap, { backgroundColor: '#1A8A7E15' }]}>
                  <Ionicons name="videocam-outline" size={32} color="#1A8A7E" />
                </View>
                <Text style={[styles.requestTitle, { color: colors.text }]}>Video Walkthrough</Text>
                <Text style={[styles.requestDesc, { color: colors.textSecondary }]}>
                  Request a professional video walkthrough for any of your listings. Our team will produce a polished, branded video within 24 hours.
                </Text>
                <Pressable style={[styles.requestBtn, { backgroundColor: '#1A8A7E' }]} onPress={handleRequestWalkthrough}>
                  <Ionicons name="add-outline" size={18} color="#fff" />
                  <Text style={styles.requestBtnText}>Request Walkthrough</Text>
                </Pressable>
              </View>
            </GlassCard>
            <GlassCard style={{ marginTop: 12 }}>
              <View style={styles.requestForm}>
                <View style={[styles.requestIconWrap, { backgroundColor: '#6366F115' }]}>
                  <Ionicons name="mic-outline" size={32} color="#6366F1" />
                </View>
                <Text style={[styles.requestTitle, { color: colors.text }]}>Voiceover Narration</Text>
                <Text style={[styles.requestDesc, { color: colors.textSecondary }]}>
                  Add professional voiceover to your property tours. Upload your script or let our AI generate one from your listing details.
                </Text>
                <Pressable style={[styles.requestBtn, { backgroundColor: '#6366F1' }]} onPress={() => {
                  Alert.alert('Coming Soon', 'Voiceover requests will be available in the next update.');
                }}>
                  <Ionicons name="add-outline" size={18} color="#fff" />
                  <Text style={styles.requestBtnText}>Request Voiceover</Text>
                </Pressable>
              </View>
            </GlassCard>
          </View>
        )}

        {activeTab === 'tools' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Studio Tools</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Tap any tool to open in DarkWave Media Studio
            </Text>
            <View style={styles.toolGrid}>
              {TOOLS.map(renderToolCard)}
            </View>
          </View>
        )}

        <View style={styles.capabilitiesSection}>
          <Text style={[styles.capLabel, { color: colors.textSecondary }]}>Available Capabilities</Text>
          <View style={styles.capRow}>
            {capabilities.map((cap: string) => (
              <View key={cap} style={[styles.capPill, { backgroundColor: isDark ? '#1A8A7E20' : '#1A8A7E10' }]}>
                <Text style={[styles.capText, { color: '#1A8A7E' }]}>{cap.replace(/_/g, ' ')}</Text>
              </View>
            ))}
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  heroBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20, overflow: 'hidden' },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroLeft: { width: 56, height: 56, borderRadius: 14, backgroundColor: 'rgba(26,138,126,0.12)', alignItems: 'center', justifyContent: 'center' },
  heroRight: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: '700' as const },
  heroSubtitle: { fontSize: 13, marginTop: 2 },
  heroStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  connectionDot: { width: 8, height: 8, borderRadius: 4 },
  connectionText: { fontSize: 12, fontWeight: '600' as const },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.15)' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: '500' as const },
  tabTextActive: { fontWeight: '700' as const },
  section: { marginHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const },
  sectionSubtitle: { fontSize: 13, marginBottom: 12 },
  openStudioBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  openStudioText: { fontSize: 13, color: '#1A8A7E', fontWeight: '600' as const },
  projectCard: { marginBottom: 10 },
  projectHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  typeIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  projectInfo: { flex: 1 },
  projectTitle: { fontSize: 15, fontWeight: '600' as const },
  projectMeta: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' as const, textTransform: 'capitalize' as const },
  projectActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  dateText: { fontSize: 12 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  downloadBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' as const },
  processingBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  processingText: { fontSize: 12, fontWeight: '600' as const },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '600' as const },
  emptyDesc: { fontSize: 13, textAlign: 'center' as const, paddingHorizontal: 20 },
  requestForm: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  requestIconWrap: { width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  requestTitle: { fontSize: 16, fontWeight: '700' as const },
  requestDesc: { fontSize: 13, textAlign: 'center' as const, paddingHorizontal: 12, lineHeight: 19 },
  requestBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24, marginTop: 4 },
  requestBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' as const },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 10 },
  toolCard: { width: '48%' as any, alignItems: 'center' as const, paddingVertical: 18, gap: 8 },
  toolIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  toolLabel: { fontSize: 13, fontWeight: '700' as const, textAlign: 'center' as const },
  toolDesc: { fontSize: 11, textAlign: 'center' as const, paddingHorizontal: 6 },
  capabilitiesSection: { marginHorizontal: 16, marginTop: 24 },
  capLabel: { fontSize: 12, fontWeight: '600' as const, marginBottom: 8 },
  capRow: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 6 },
  capPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  capText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
});
