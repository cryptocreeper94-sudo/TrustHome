import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { getApiUrl, apiRequest } from '@/lib/query-client';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PROJECT_IMAGES: Record<string, any> = {
  'msp-001': require('@/assets/images/media-walkthrough.jpg'),
  'msp-002': require('@/assets/images/media-branding.jpg'),
  'msp-003': require('@/assets/images/media-voiceover.jpg'),
  'msp-004': require('@/assets/images/media-editing.jpg'),
  'msp-005': require('@/assets/images/media-interior.jpg'),
};

const TOOL_IMAGES: Record<string, any> = {
  walkthrough: require('@/assets/images/media-filming.jpg'),
  editing: require('@/assets/images/media-editing.jpg'),
  audio: require('@/assets/images/media-voiceover.jpg'),
  branding: require('@/assets/images/media-branding.jpg'),
  stitch: require('@/assets/images/media-multicam.jpg'),
  thumbnail: require('@/assets/images/media-thumbnails.jpg'),
};

const REQUEST_IMAGES: Record<string, any> = {
  walkthrough: require('@/assets/images/media-walkthrough.jpg'),
  voiceover: require('@/assets/images/media-voiceover.jpg'),
  aerial: require('@/assets/images/media-aerial.jpg'),
  interior: require('@/assets/images/media-interior.jpg'),
};

interface MediaProject {
  id: string;
  title: string;
  type: string;
  status: 'completed' | 'processing' | 'draft' | 'queued';
  createdAt: string;
  duration?: string;
  format?: string;
}

const SAMPLE_PROJECTS: MediaProject[] = [
  { id: 'msp-001', title: 'Oak Street Listing Walkthrough', type: 'video_walkthrough', status: 'completed', createdAt: 'Feb 10, 2026', duration: '3:45', format: 'mp4' },
  { id: 'msp-002', title: 'Spring Campaign Promo', type: 'branded_intro', status: 'completed', createdAt: 'Feb 8, 2026', duration: '0:30', format: 'mp4' },
  { id: 'msp-003', title: 'Market Update Voiceover', type: 'voiceover', status: 'completed', createdAt: 'Feb 6, 2026', duration: '2:15', format: 'mp3' },
  { id: 'msp-004', title: 'Oakwood Open House Highlights', type: 'video_editing', status: 'processing', createdAt: 'Feb 11, 2026', duration: '5:00' },
  { id: 'msp-005', title: 'New Listing - Elm Ave', type: 'video_walkthrough', status: 'queued', createdAt: 'Feb 12, 2026' },
];

const TOOLS = [
  { id: 'walkthrough', icon: 'videocam' as const, label: 'Video Walkthrough', desc: 'Professional property walkthrough video', gradient: ['#1A8A7E', '#0F6B62'] as [string, string] },
  { id: 'editing', icon: 'cut' as const, label: 'Video Editing', desc: 'Edit and polish your property videos', gradient: ['#F2994A', '#F2C94C'] as [string, string] },
  { id: 'audio', icon: 'mic' as const, label: 'Audio / Voiceover', desc: 'Professional narration for tours', gradient: ['#6366F1', '#818CF8'] as [string, string] },
  { id: 'branding', icon: 'sparkles' as const, label: 'Branded Intros', desc: 'Custom animated intro/outros', gradient: ['#E44D26', '#F16529'] as [string, string] },
  { id: 'stitch', icon: 'layers' as const, label: 'Multi-Angle Stitch', desc: 'Combine multiple camera angles', gradient: ['#4B6CB7', '#182848'] as [string, string] },
  { id: 'thumbnail', icon: 'image' as const, label: 'Thumbnail Gen', desc: 'Auto-generate listing thumbnails', gradient: ['#834D9B', '#D04ED6'] as [string, string] },
];

const STATS = [
  { icon: 'film' as const, label: 'Total Projects', value: '5', color: '#1A8A7E' },
  { icon: 'checkmark-circle' as const, label: 'Completed', value: '3', color: '#34C759' },
  { icon: 'hourglass' as const, label: 'In Progress', value: '2', color: '#F59E0B' },
  { icon: 'cloud-download' as const, label: 'Downloads', value: '12', color: '#6366F1' },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'completed': return '#34C759';
    case 'processing': return '#F59E0B';
    case 'queued': return '#6366F1';
    case 'draft': return '#94A3B8';
    default: return '#94A3B8';
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'video_walkthrough': return 'Walkthrough';
    case 'video_editing': return 'Editing';
    case 'branded_intro': return 'Branding';
    case 'voiceover': return 'Voiceover';
    case 'multi_angle_stitch': return 'Multi-Cam';
    case 'thumbnail_generation': return 'Thumbnail';
    default: return 'Media';
  }
}

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }, style]} />;
}

function StatCard({ icon, label, value, color, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  colors: any;
}) {
  return (
    <GlassCard compact>
      <View style={s.statCard}>
        <View style={[s.statIconWrap, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[s.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={[s.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
    </GlassCard>
  );
}

function ProjectCarouselCard({ project, onDownload, isDownloading, colors, isDark, index }: {
  project: MediaProject;
  onDownload: () => void;
  isDownloading: boolean;
  colors: any;
  isDark: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const canDownload = project.status === 'completed';
  const img = PROJECT_IMAGES[project.id];

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).springify()}>
      <AnimatedPressable
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[animStyle, { width: 260 }]}
      >
        <View style={[s.projectCard, {
          backgroundColor: colors.cardGlass,
          borderColor: colors.cardGlassBorder,
        }]}>
          <View style={s.projectImageWrap}>
            {img && <Image source={img} style={s.projectImage} resizeMode="cover" />}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.75)']}
              style={s.projectImageOverlay}
            />
            <View style={s.projectImageBadge}>
              <View style={[s.statusPill, { backgroundColor: getStatusColor(project.status) }]}>
                {project.status === 'processing' && <ActivityIndicator size={10} color="#fff" />}
                <Text style={s.statusPillText}>{project.status}</Text>
              </View>
            </View>
            {project.duration && (
              <View style={s.durationBadge}>
                <Ionicons name="time-outline" size={11} color="#fff" />
                <Text style={s.durationText}>{project.duration}</Text>
              </View>
            )}
          </View>
          <View style={s.projectBody}>
            <Text style={[s.projectTitle, { color: colors.text }]} numberOfLines={1}>{project.title}</Text>
            <View style={s.projectMetaRow}>
              <View style={[s.typePill, { backgroundColor: isDark ? 'rgba(26,138,126,0.15)' : 'rgba(26,138,126,0.08)' }]}>
                <Text style={[s.typeLabel, { color: '#1A8A7E' }]}>{getTypeLabel(project.type)}</Text>
              </View>
              <Text style={[s.dateLabel, { color: colors.textSecondary }]}>{project.createdAt}</Text>
            </View>
            <View style={s.projectFooter}>
              {canDownload ? (
                <Pressable
                  style={s.downloadBtn}
                  onPress={onDownload}
                  disabled={isDownloading}
                >
                  <LinearGradient
                    colors={['#1A8A7E', '#0F6B62'] as [string, string, ...string[]]}
                    style={s.downloadBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={15} color="#fff" />
                        <Text style={s.downloadBtnText}>Download</Text>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              ) : project.status === 'processing' ? (
                <View style={[s.progressBarWrap, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]}>
                  <Animated.View style={[s.progressBar, { width: '65%', backgroundColor: '#F59E0B' }]} />
                </View>
              ) : (
                <View style={[s.queuedRow]}>
                  <PulsingDot color="#6366F1" />
                  <Text style={[s.queuedText, { color: '#6366F1' }]}>In Queue</Text>
                </View>
              )}
              <Pressable style={s.moreBtn}>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function ToolCard({ tool, onPress, colors, isDark, index }: {
  tool: typeof TOOLS[0];
  onPress: () => void;
  colors: any;
  isDark: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const img = TOOL_IMAGES[tool.id];

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[animStyle]}
      >
        <View style={[s.toolCard, {
          backgroundColor: colors.cardGlass,
          borderColor: colors.cardGlassBorder,
        }]}>
          <View style={s.toolImageWrap}>
            {img && <Image source={img} style={s.toolImage} resizeMode="cover" />}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={s.toolImageOverlay}
            />
            <View style={s.toolImageContent}>
              <LinearGradient
                colors={tool.gradient as [string, string, ...string[]]}
                style={s.toolIconGradient}
              >
                <Ionicons name={tool.icon as any} size={20} color="#FFF" />
              </LinearGradient>
            </View>
          </View>
          <View style={s.toolBody}>
            <Text style={[s.toolLabel, { color: colors.text }]}>{tool.label}</Text>
            <Text style={[s.toolDesc, { color: colors.textSecondary }]} numberOfLines={2}>{tool.desc}</Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function RequestCard({ title, desc, image, gradient, icon, onPress, colors, isDark, index }: {
  title: string;
  desc: string;
  image: any;
  gradient: [string, string];
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  colors: any;
  isDark: boolean;
  index: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={{ width: 280 }}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.96); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[animStyle]}
      >
        <View style={[s.requestCard, {
          backgroundColor: colors.cardGlass,
          borderColor: colors.cardGlassBorder,
        }]}>
          <View style={s.requestImageWrap}>
            {image && <Image source={image} style={s.requestImage} resizeMode="cover" />}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.65)']}
              style={s.requestImageOverlay}
            />
            <View style={s.requestImageContent}>
              <LinearGradient
                colors={gradient as [string, string, ...string[]]}
                style={s.requestIconGradient}
              >
                <Ionicons name={icon} size={24} color="#FFF" />
              </LinearGradient>
            </View>
          </View>
          <View style={s.requestBody}>
            <Text style={[s.requestTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[s.requestDesc, { color: colors.textSecondary }]} numberOfLines={3}>{desc}</Text>
            <View style={s.requestAction}>
              <LinearGradient
                colors={gradient as [string, string, ...string[]]}
                style={s.requestActionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={s.requestActionText}>Request</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function MediaStudioScreen() {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const statusQuery = useQuery<any>({
    queryKey: ['/api/media-studio/status'],
  });

  const isConnected = statusQuery.data?.configured === true;
  const capabilities = statusQuery.data?.capabilities || [];

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
      await apiRequest('POST', '/api/media-studio/walkthrough-request', {
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

  const completedProjects = SAMPLE_PROJECTS.filter(p => p.status === 'completed');
  const activeProjects = SAMPLE_PROJECTS.filter(p => p.status !== 'completed');

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Header title="Media Studio" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        <Animated.View entering={FadeInDown.delay(50).springify()}>
          <Pressable onPress={handleOpenStudio} style={s.heroWrap}>
            <View style={s.heroImageWrap}>
              <Image source={require('@/assets/images/media-listing-hero.jpg')} style={s.heroImage} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
                style={s.heroOverlay}
              />
              <View style={s.heroContent}>
                <View style={s.heroTop}>
                  <View style={s.heroBadge}>
                    <PulsingDot color={isConnected ? '#34C759' : '#EF4444'} />
                    <Text style={s.heroBadgeText}>{isConnected ? 'Connected' : 'Offline'}</Text>
                  </View>
                  <View style={s.heroOpenBtn}>
                    <Ionicons name="open-outline" size={14} color="#fff" />
                    <Text style={s.heroOpenText}>Open Studio</Text>
                  </View>
                </View>
                <View style={s.heroBottom}>
                  <View style={s.heroIconWrap}>
                    <LinearGradient
                      colors={['#1A8A7E', '#0F6B62'] as [string, string, ...string[]]}
                      style={s.heroIconGradient}
                    >
                      <MaterialCommunityIcons name="movie-open-star-outline" size={28} color="#FFF" />
                    </LinearGradient>
                  </View>
                  <View style={s.heroTextWrap}>
                    <Text style={s.heroTitle}>DarkWave Media Studio</Text>
                    <Text style={s.heroSubtitle}>Professional video production for your listings</Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).springify()} style={s.statsSection}>
          <BentoGrid columns={2} gap={8}>
            {STATS.map((stat) => (
              <StatCard key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} color={stat.color} colors={colors} />
            ))}
          </BentoGrid>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <HorizontalCarousel title="Recent Projects" onSeeAll={handleOpenStudio}>
            {SAMPLE_PROJECTS.map((project, idx) => (
              <ProjectCarouselCard
                key={project.id}
                project={project}
                onDownload={() => handleDownload(project)}
                isDownloading={downloadingId === project.id}
                colors={colors}
                isDark={isDark}
                index={idx}
              />
            ))}
          </HorizontalCarousel>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).springify()}>
          <AccordionSection
            title="Completed"
            icon="checkmark-circle"
            iconColor="#34C759"
            defaultOpen
            badge={completedProjects.length}
            badgeColor="#34C759"
            style={{ marginHorizontal: 16, marginTop: 8 }}
          >
            {completedProjects.map((project, idx) => {
              const img = PROJECT_IMAGES[project.id];
              return (
                <Pressable
                  key={project.id}
                  style={[s.accordionRow, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#222' : '#eee' }]}
                  onPress={() => handleDownload(project)}
                >
                  <View style={s.accordionThumb}>
                    {img && <Image source={img} style={s.accordionThumbImg} resizeMode="cover" />}
                  </View>
                  <View style={s.accordionInfo}>
                    <Text style={[s.accordionTitle, { color: colors.text }]} numberOfLines={1}>{project.title}</Text>
                    <Text style={[s.accordionMeta, { color: colors.textSecondary }]}>{getTypeLabel(project.type)}  {project.duration}  {project.createdAt}</Text>
                  </View>
                  <View style={s.accordionAction}>
                    <LinearGradient
                      colors={['#1A8A7E', '#0F6B62'] as [string, string, ...string[]]}
                      style={s.accordionDownloadBtn}
                    >
                      <Ionicons name="download-outline" size={16} color="#FFF" />
                    </LinearGradient>
                  </View>
                </Pressable>
              );
            })}
          </AccordionSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <AccordionSection
            title="In Progress"
            icon="hourglass"
            iconColor="#F59E0B"
            defaultOpen={false}
            badge={activeProjects.length}
            badgeColor="#F59E0B"
            style={{ marginHorizontal: 16 }}
          >
            {activeProjects.map((project, idx) => {
              const img = PROJECT_IMAGES[project.id];
              return (
                <View
                  key={project.id}
                  style={[s.accordionRow, idx > 0 && { borderTopWidth: 1, borderTopColor: isDark ? '#222' : '#eee' }]}
                >
                  <View style={s.accordionThumb}>
                    {img && <Image source={img} style={s.accordionThumbImg} resizeMode="cover" />}
                  </View>
                  <View style={s.accordionInfo}>
                    <Text style={[s.accordionTitle, { color: colors.text }]} numberOfLines={1}>{project.title}</Text>
                    <Text style={[s.accordionMeta, { color: colors.textSecondary }]}>{getTypeLabel(project.type)}  {project.createdAt}</Text>
                  </View>
                  <View style={[s.statusChip, { backgroundColor: getStatusColor(project.status) + '18' }]}>
                    {project.status === 'processing' ? (
                      <ActivityIndicator size={10} color={getStatusColor(project.status)} />
                    ) : (
                      <PulsingDot color={getStatusColor(project.status)} />
                    )}
                    <Text style={[s.statusChipText, { color: getStatusColor(project.status) }]}>{project.status}</Text>
                  </View>
                </View>
              );
            })}
          </AccordionSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).springify()}>
          <HorizontalCarousel title="Request New Media">
            <RequestCard
              title="Video Walkthrough"
              desc="Professional video walkthrough for any listing. Polished, branded video within 24 hours."
              image={REQUEST_IMAGES.walkthrough}
              gradient={['#1A8A7E', '#0F6B62']}
              icon="videocam-outline"
              onPress={handleRequestWalkthrough}
              colors={colors}
              isDark={isDark}
              index={0}
            />
            <RequestCard
              title="Voiceover Narration"
              desc="Add professional voiceover to property tours. AI-generated or custom script."
              image={REQUEST_IMAGES.voiceover}
              gradient={['#6366F1', '#818CF8']}
              icon="mic-outline"
              onPress={() => Alert.alert('Coming Soon', 'Voiceover requests will be available in the next update.')}
              colors={colors}
              isDark={isDark}
              index={1}
            />
            <RequestCard
              title="Aerial / Drone"
              desc="Stunning aerial footage of properties and neighborhoods from professional drone operators."
              image={REQUEST_IMAGES.aerial}
              gradient={['#00B4DB', '#0083B0']}
              icon="airplane-outline"
              onPress={() => Alert.alert('Coming Soon', 'Aerial/drone requests will be available in the next update.')}
              colors={colors}
              isDark={isDark}
              index={2}
            />
            <RequestCard
              title="Interior Photography"
              desc="HDR interior photography with professional lighting and staging guidance."
              image={REQUEST_IMAGES.interior}
              gradient={['#F2994A', '#F2C94C']}
              icon="camera-outline"
              onPress={() => Alert.alert('Coming Soon', 'Interior photography requests will be available in the next update.')}
              colors={colors}
              isDark={isDark}
              index={3}
            />
          </HorizontalCarousel>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).springify()} style={s.toolsSection}>
          <View style={s.toolsSectionHeader}>
            <Text style={[s.toolsSectionTitle, { color: colors.text }]}>Studio Tools</Text>
            <Pressable onPress={handleOpenStudio} style={s.seeAllBtn}>
              <Text style={s.seeAllText}>Open Studio</Text>
              <Ionicons name="open-outline" size={13} color="#1A8A7E" />
            </Pressable>
          </View>
          <BentoGrid columns={3} gap={10}>
            {TOOLS.map((tool, idx) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onPress={handleOpenStudio}
                colors={colors}
                isDark={isDark}
                index={idx}
              />
            ))}
          </BentoGrid>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(420).springify()}>
          <AccordionSection
            title="Capabilities"
            icon="flash"
            iconColor="#1A8A7E"
            defaultOpen={false}
            badge={capabilities.length}
            badgeColor="#1A8A7E"
            style={{ marginHorizontal: 16, marginTop: 4 }}
          >
            <View style={s.capGrid}>
              {capabilities.map((cap: string, idx: number) => (
                <View key={cap} style={[s.capPill, { backgroundColor: isDark ? '#1A8A7E20' : '#1A8A7E0A' }]}>
                  <Ionicons name="checkmark-circle" size={13} color="#1A8A7E" />
                  <Text style={[s.capText, { color: isDark ? '#5DD3C8' : '#0F6B62' }]}>{cap.replace(/_/g, ' ')}</Text>
                </View>
              ))}
            </View>
          </AccordionSection>
        </Animated.View>

        <View style={s.poweredByWrap}>
          <LinearGradient
            colors={isDark ? ['rgba(26,138,126,0.08)', 'rgba(15,107,98,0.04)'] : ['rgba(26,138,126,0.04)', 'rgba(15,107,98,0.02)']}
            style={s.poweredBy}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="movie-open-star-outline" size={18} color="#1A8A7E" />
            <Text style={[s.poweredByText, { color: colors.textSecondary }]}>
              Powered by DarkWave Media Studio  media.darkwavestudios.io
            </Text>
          </LinearGradient>
        </View>

        <Footer />
      </ScrollView>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Media Studio"
        description="DarkWave Media Studio provides professional video production, editing, and media tools for your real estate listings."
        details={[
          'Request video walkthroughs, voiceovers, aerial footage, and interior photography',
          'Download completed projects directly from TrustHome',
          'Access all studio tools through a single connected platform',
          'Projects are stored securely on DarkWave Media Studio servers',
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  heroWrap: { marginHorizontal: 16, marginTop: 12 },
  heroImageWrap: { borderRadius: 20, overflow: 'hidden', height: 200 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroContent: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' as const },
  heroOpenBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroOpenText: { color: '#fff', fontSize: 11, fontWeight: '600' as const },
  heroBottom: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroIconWrap: {},
  heroIconGradient: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTextWrap: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 19, fontWeight: '800' as const, letterSpacing: 0.3 },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },

  statsSection: { marginHorizontal: 16, marginTop: 16 },
  statCard: { alignItems: 'center' as const, paddingVertical: 4, gap: 3 },
  statIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' as const },
  statLabel: { fontSize: 11, fontWeight: '500' as const },

  projectCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
    }),
  },
  projectImageWrap: { height: 130, position: 'relative' as const },
  projectImage: { width: '100%', height: '100%' },
  projectImageOverlay: { ...StyleSheet.absoluteFillObject },
  projectImageBadge: { position: 'absolute' as const, top: 10, left: 10 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusPillText: { color: '#fff', fontSize: 10, fontWeight: '700' as const, textTransform: 'uppercase' as const },
  durationBadge: { position: 'absolute' as const, bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '600' as const },
  projectBody: { padding: 12, gap: 6 },
  projectTitle: { fontSize: 14, fontWeight: '700' as const },
  projectMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  typeLabel: { fontSize: 11, fontWeight: '600' as const },
  dateLabel: { fontSize: 11 },
  projectFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  downloadBtn: { flex: 1 },
  downloadBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 12 },
  downloadBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' as const },
  progressBarWrap: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 },
  queuedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  queuedText: { fontSize: 12, fontWeight: '600' as const },
  moreBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  accordionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  accordionThumb: { width: 48, height: 48, borderRadius: 10, overflow: 'hidden', backgroundColor: '#ddd' },
  accordionThumbImg: { width: '100%', height: '100%' },
  accordionInfo: { flex: 1 },
  accordionTitle: { fontSize: 14, fontWeight: '600' as const },
  accordionMeta: { fontSize: 11, marginTop: 2 },
  accordionAction: {},
  accordionDownloadBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusChipText: { fontSize: 11, fontWeight: '700' as const, textTransform: 'capitalize' as const },

  requestCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 4 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
    }),
  },
  requestImageWrap: { height: 120, position: 'relative' as const },
  requestImage: { width: '100%', height: '100%' },
  requestImageOverlay: { ...StyleSheet.absoluteFillObject },
  requestImageContent: { position: 'absolute' as const, bottom: 12, left: 12 },
  requestIconGradient: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  requestBody: { padding: 12, gap: 6 },
  requestTitle: { fontSize: 15, fontWeight: '700' as const },
  requestDesc: { fontSize: 12, lineHeight: 17 },
  requestAction: { marginTop: 4 },
  requestActionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 12 },
  requestActionText: { color: '#fff', fontSize: 13, fontWeight: '700' as const },

  toolsSection: { marginHorizontal: 16, marginTop: 8 },
  toolsSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  toolsSectionTitle: { fontSize: 17, fontWeight: '700' as const, letterSpacing: 0.2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: { fontSize: 13, color: '#1A8A7E', fontWeight: '600' as const },

  toolCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 3 },
      web: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
    }),
  },
  toolImageWrap: { height: 80, position: 'relative' as const },
  toolImage: { width: '100%', height: '100%' },
  toolImageOverlay: { ...StyleSheet.absoluteFillObject },
  toolImageContent: { position: 'absolute' as const, bottom: 8, left: 8 },
  toolIconGradient: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toolBody: { padding: 8, gap: 2 },
  toolLabel: { fontSize: 12, fontWeight: '700' as const },
  toolDesc: { fontSize: 10, lineHeight: 14 },

  capGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 6, paddingTop: 4 },
  capPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  capText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },

  poweredByWrap: { marginHorizontal: 16, marginTop: 16 },
  poweredBy: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14 },
  poweredByText: { fontSize: 11, flex: 1 },
});
