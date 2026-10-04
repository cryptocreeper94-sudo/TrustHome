import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, TextInput, Switch, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { uploadDocument, MAX_UPLOAD_BYTES, formatBytes, apiErrorMessage } from '@/lib/tenant-api';
import {
  videoBuilderSupported, pickLocalFiles, readClipDuration, stitchClips, startVoiceRecording, formatSeconds, mediaKind,
  type StitchResult,
} from '@/lib/video-stitch';

const TEAL = '#1A8A7E';
const MAX_TOTAL_SECONDS = 5 * 60;

interface Clip { id: string; file: File; kind: 'video' | 'image'; seconds: number; thumb?: string }
const PHOTO_SECONDS = [3, 4, 5, 7];

export default function WalkthroughMakerScreen() {
  const { colors, isDark } = useTheme();
  const { isRealAgent, user } = useApp();
  const [showHelp, setShowHelp] = useState(false);
  const supported = Platform.OS === 'web' && videoBuilderSupported();

  const [clips, setClips] = useState<Clip[]>([]);
  const [addTitle, setAddTitle] = useState(true);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState(user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '');
  const [addMusic, setAddMusic] = useState(false);
  const [music, setMusic] = useState<File | null>(null);
  const [addVoice, setAddVoice] = useState(false);
  const [voice, setVoice] = useState<Blob | null>(null);
  const [voiceName, setVoiceName] = useState('');
  const recorderRef = useRef<{ stop: () => Promise<Blob> } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<StitchResult | null>(null);
  const [saveMsg, setSaveMsg] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const totalSeconds = clips.reduce((a, c) => a + c.seconds, 0);

  const addClips = async () => {
    setError('');
    const files = await pickLocalFiles('video/*,image/*', true);
    if (!files.length) return;
    const items = await Promise.all(files.map(async (f): Promise<Clip> => {
      const kind = mediaKind(f);
      return kind === 'image'
        ? { id: Math.random().toString(36).slice(2), file: f, kind, seconds: 4, thumb: URL.createObjectURL(f) }
        : { id: Math.random().toString(36).slice(2), file: f, kind, seconds: await readClipDuration(f) };
    }));
    setClips(prev => [...prev, ...items]);
    setResult(null);
  };

  const cyclePhotoTime = (id: string) => {
    setClips(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next = PHOTO_SECONDS[(PHOTO_SECONDS.indexOf(c.seconds) + 1) % PHOTO_SECONDS.length];
      return { ...c, seconds: next };
    }));
    setResult(null);
  };

  const moveClip = (idx: number, dir: -1 | 1) => {
    setClips(prev => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const chooseMusic = async () => {
    const [f] = await pickLocalFiles('audio/*', false);
    if (f) setMusic(f);
  };

  const chooseVoiceFile = async () => {
    const [f] = await pickLocalFiles('audio/*', false);
    if (f) { setVoice(f); setVoiceName(f.name); }
  };

  const toggleRecord = async () => {
    setError('');
    try {
      if (!isRecording) {
        recorderRef.current = await startVoiceRecording();
        setIsRecording(true);
      } else {
        const blob = await recorderRef.current!.stop();
        recorderRef.current = null;
        setIsRecording(false);
        setVoice(blob);
        setVoiceName('My recording');
      }
    } catch (e) {
      setIsRecording(false);
      setError(e instanceof Error ? e.message : 'Could not use the microphone. Check your browser permissions.');
    }
  };

  const createVideo = () => {
    if (!clips.length || busy) return;
    if (totalSeconds > MAX_TOTAL_SECONDS) { setError(`Please keep the total under ${MAX_TOTAL_SECONDS / 60} minutes (you have ${formatSeconds(totalSeconds)}).`); return; }
    setError(''); setSaveMsg(''); setBusy(true); setProgress(0); setProgressLabel('Getting ready…');
    if (result) { URL.revokeObjectURL(result.url); setResult(null); }
    // Called directly from the tap (no await before stitchClips starts) so iPhone allows sound.
    stitchClips({
      clips: clips.map(c => ({ file: c.file, kind: c.kind, seconds: c.seconds })),
      music: addMusic ? music : null,
      voice: addVoice ? voice : null,
      title: addTitle ? title : '',
      subtitle: addTitle ? subtitle : '',
      onProgress: (f, label) => { setProgress(f); setProgressLabel(label); },
    })
      .then(res => setResult(res))
      .catch(e => setError(e instanceof Error ? e.message : 'Something went wrong building the video.'))
      .finally(() => setBusy(false));
  };

  const fileName = () => {
    const base = (title || 'walkthrough').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'walkthrough';
    return `${base}.${result?.ext ?? 'mp4'}`;
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = fileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const canShareFile = () => {
    if (!result || typeof navigator === 'undefined' || !(navigator as any).canShare) return false;
    try { return (navigator as any).canShare({ files: [new File([result.blob], fileName(), { type: result.mimeType })] }); } catch { return false; }
  };

  const share = async () => {
    if (!result) return;
    try {
      await (navigator as any).share({ files: [new File([result.blob], fileName(), { type: result.mimeType })], title: title || 'Property walkthrough' });
    } catch { /* user cancelled */ }
  };

  const saveToDocuments = async () => {
    if (!result) return;
    setSaving(true); setSaveMsg('');
    try {
      await uploadDocument({ name: fileName(), type: result.mimeType, size: result.blob.size, blob: result.blob }, title || undefined);
      setSaveMsg('Saved to your Documents.');
    } catch (e) {
      setSaveMsg(apiErrorMessage(e));
    } finally { setSaving(false); }
  };

  const cardBg = { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: colors.border };
  const inputStyle = [s.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }];
  const switchProps = { trackColor: { false: colors.divider, true: TEAL }, thumbColor: '#FFFFFF' };

  return (
    <View style={[s.container, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          imageBanner={require('@/assets/images/guide-media.jpg')}
          title="Walkthrough Maker"
          subtitle="Turn phone clips into one polished tour"
          showBack
          transparent={false}
          rightAction={<InfoButton onPress={() => setShowHelp(true)} />}
        />

        {!supported ? (
          <View style={[s.notice, cardBg]}>
            <Ionicons name="information-circle-outline" size={22} color={TEAL} />
            <Text style={{ color: colors.text, flex: 1, lineHeight: 20 }}>
              The Walkthrough Maker builds videos right in your browser. Please open TrustHome in Safari or Chrome to use it.
            </Text>
          </View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>1. Add your photos & clips</Text>
          <Text style={[s.sectionDesc, { color: colors.textSecondary }]}>
            Pick photos and short videos from your phone. They play in the order shown — use the arrows to rearrange. Tap a photo's time to change how long it shows.
          </Text>

          <Pressable onPress={addClips} disabled={!supported || busy} style={[s.uploadZone, { borderColor: 'rgba(26,138,126,0.45)' }]} testID="walkthrough-add-clips">
            <LinearGradient colors={isDark ? ['rgba(26,138,126,0.12)', 'rgba(26,138,126,0.03)'] : ['rgba(26,138,126,0.08)', 'rgba(26,138,126,0.02)']} style={s.uploadGradient}>
              <View style={[s.uploadIconWrap, { backgroundColor: 'rgba(26,138,126,0.18)' }]}>
                <Ionicons name="images-outline" size={28} color={TEAL} />
              </View>
              <Text style={[s.uploadText, { color: colors.text }]}>{clips.length ? 'Add more photos or clips' : 'Tap to choose photos & video clips'}</Text>
              <Text style={[s.uploadSubtext, { color: colors.textSecondary }]}>Up to 5 minutes total · stays on your device</Text>
            </LinearGradient>
          </Pressable>

          {clips.length > 0 && (
            <View style={s.clipsList}>
              {clips.map((clip, idx) => (
                <View key={clip.id} style={[s.clipItem, cardBg]}>
                  <View style={s.clipNumberWrap}><Text style={s.clipNumber}>{idx + 1}</Text></View>
                  {clip.kind === 'image' && clip.thumb ? (
                    React.createElement('img', { src: clip.thumb, alt: '', style: { width: 44, height: 44, objectFit: 'cover', borderRadius: 8, marginRight: 10 } })
                  ) : (
                    <View style={s.thumbIcon}><Ionicons name="videocam" size={20} color={TEAL} /></View>
                  )}
                  <View style={s.clipInfo}>
                    <Text style={[s.clipName, { color: colors.text }]} numberOfLines={1}>{clip.file.name}</Text>
                    {clip.kind === 'image' ? (
                      <Pressable onPress={() => cyclePhotoTime(clip.id)} disabled={busy} style={s.timeChip} testID={`walkthrough-photo-time-${idx}`}>
                        <Ionicons name="time-outline" size={12} color={TEAL} />
                        <Text style={{ color: TEAL, fontSize: 12, fontWeight: '700' }}>Photo · shows {clip.seconds} sec</Text>
                      </Pressable>
                    ) : (
                      <Text style={[s.clipMeta, { color: colors.textSecondary }]}>Video · {formatSeconds(clip.seconds)} · {formatBytes(clip.file.size)}</Text>
                    )}
                  </View>
                  <Pressable onPress={() => moveClip(idx, -1)} disabled={idx === 0 || busy} style={[s.iconBtn, { opacity: idx === 0 ? 0.3 : 1 }]}>
                    <Ionicons name="arrow-up" size={18} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => moveClip(idx, 1)} disabled={idx === clips.length - 1 || busy} style={[s.iconBtn, { opacity: idx === clips.length - 1 ? 0.3 : 1 }]}>
                    <Ionicons name="arrow-down" size={18} color={colors.textSecondary} />
                  </Pressable>
                  <Pressable onPress={() => { setClips(prev => prev.filter(c => c.id !== clip.id)); setResult(null); }} disabled={busy} style={s.iconBtn}>
                    <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
              <Text style={{ color: totalSeconds > MAX_TOTAL_SECONDS ? '#F87171' : colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                Total length: {formatSeconds(totalSeconds)}
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>2. Finishing touches (optional)</Text>
          <GlassCard style={s.settingsCard}>
            {/* Title */}
            <View style={s.settingRow}>
              <View style={s.settingInfo}>
                <Ionicons name="text-outline" size={20} color={colors.text} />
                <View>
                  <Text style={[s.settingLabel, { color: colors.text }]}>Title on video</Text>
                  <Text style={[s.settingHint, { color: colors.textSecondary }]}>Shows over the first few seconds</Text>
                </View>
              </View>
              <Switch value={addTitle} onValueChange={setAddTitle} {...switchProps} />
            </View>
            {addTitle && (
              <View style={s.optionsWrap}>
                <TextInput style={inputStyle} value={title} onChangeText={setTitle} placeholder="e.g. 4821 Cedar Ridge Dr" placeholderTextColor={colors.textTertiary} testID="walkthrough-title" />
                <TextInput style={[...inputStyle, { marginTop: 8 }]} value={subtitle} onChangeText={setSubtitle} placeholder="e.g. Presented by Jennifer Lambert" placeholderTextColor={colors.textTertiary} />
              </View>
            )}

            {/* Music */}
            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={s.settingInfo}>
                <Ionicons name="musical-notes-outline" size={20} color={colors.text} />
                <View>
                  <Text style={[s.settingLabel, { color: colors.text }]}>Background music</Text>
                  <Text style={[s.settingHint, { color: colors.textSecondary }]}>Use a song file you have rights to</Text>
                </View>
              </View>
              <Switch value={addMusic} onValueChange={setAddMusic} {...switchProps} />
            </View>
            {addMusic && (
              <View style={s.optionsWrap}>
                {music ? (
                  <View style={[s.fileRow, { borderColor: colors.border }]}>
                    <Ionicons name="musical-note" size={18} color={TEAL} />
                    <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>{music.name}</Text>
                    <Pressable onPress={() => setMusic(null)}><Ionicons name="trash-outline" size={18} color={colors.textTertiary} /></Pressable>
                  </View>
                ) : (
                  <Pressable style={[s.outlineBtn, { borderColor: colors.border }]} onPress={chooseMusic}>
                    <Ionicons name="folder-open-outline" size={18} color={colors.text} />
                    <Text style={{ color: colors.text, fontWeight: '600' }}>Choose a song (MP3 / M4A)</Text>
                  </Pressable>
                )}
              </View>
            )}

            {/* Voiceover */}
            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={s.settingInfo}>
                <Ionicons name="mic-outline" size={20} color={colors.text} />
                <View>
                  <Text style={[s.settingLabel, { color: colors.text }]}>Voiceover</Text>
                  <Text style={[s.settingHint, { color: colors.textSecondary }]}>Talk buyers through the home</Text>
                </View>
              </View>
              <Switch value={addVoice} onValueChange={setAddVoice} {...switchProps} />
            </View>
            {addVoice && (
              <View style={s.optionsWrap}>
                {voice && !isRecording ? (
                  <View style={[s.fileRow, { borderColor: colors.border }]}>
                    <Ionicons name="volume-medium" size={18} color={TEAL} />
                    <Text style={{ color: colors.text, flex: 1 }} numberOfLines={1}>{voiceName}</Text>
                    <Pressable onPress={() => { setVoice(null); setVoiceName(''); }}><Ionicons name="trash-outline" size={18} color={colors.textTertiary} /></Pressable>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    <Pressable onPress={toggleRecord} style={[s.recordBtn, { borderColor: isRecording ? '#F87171' : colors.border, backgroundColor: isRecording ? 'rgba(248,113,113,0.12)' : 'transparent' }]} testID="walkthrough-record">
                      <View style={[s.recordDot, { backgroundColor: isRecording ? '#F87171' : 'rgba(26,138,126,0.18)' }]}>
                        <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color={isRecording ? '#FFF' : TEAL} />
                      </View>
                      <Text style={{ color: isRecording ? '#F87171' : colors.text, fontWeight: '700' }}>{isRecording ? 'Recording… tap to stop' : 'Tap to record your voice'}</Text>
                    </Pressable>
                    <Pressable onPress={chooseVoiceFile} disabled={isRecording}>
                      <Text style={{ color: TEAL, fontWeight: '600', textAlign: 'center' }}>or choose an audio file</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={s.section}>
          {error ? (
            <View style={[s.notice, { borderColor: 'rgba(248,113,113,0.4)', backgroundColor: 'rgba(248,113,113,0.08)', marginHorizontal: 0 }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#F87171" />
              <Text style={{ color: '#F87171', flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          {busy ? (
            <View style={[s.progressCard, cardBg]}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{progressLabel}</Text>
              <View style={[s.progressTrack, { backgroundColor: colors.divider }]}>
                <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                {Math.round(progress * 100)}% · Keep this screen open — it takes about as long as the video itself ({formatSeconds(totalSeconds)}).
              </Text>
            </View>
          ) : (
            <Pressable style={[s.createBtn, { backgroundColor: clips.length && supported ? TEAL : colors.divider }]} onPress={createVideo} disabled={!clips.length || !supported} testID="walkthrough-create">
              <Ionicons name="film-outline" size={20} color={clips.length && supported ? '#FFF' : colors.textTertiary} />
              <Text style={[s.createText, { color: clips.length && supported ? '#FFF' : colors.textTertiary }]}>{result ? 'Build Again' : 'Create Video'}</Text>
            </Pressable>
          )}
          {!clips.length && supported ? <Text style={[s.hint, { color: colors.textSecondary }]}>Add at least one photo or clip to get started.</Text> : null}
        </Animated.View>

        {result && !busy ? (
          <Animated.View entering={FadeInDown.springify()} style={s.section}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>3. Your video is ready</Text>
            <View style={[s.previewWrap, cardBg]}>
              {React.createElement('video', {
                src: result.url,
                controls: true,
                playsInline: true,
                style: { width: '100%', maxHeight: 480, borderRadius: 12, backgroundColor: '#000', display: 'block' },
              })}
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 8 }}>
                {formatSeconds(result.seconds)} · {formatBytes(result.blob.size)} · {result.ext.toUpperCase()}
              </Text>
            </View>
            <View style={s.resultActions}>
              {canShareFile() ? (
                <Pressable style={[s.resultBtn, { backgroundColor: TEAL }]} onPress={share} testID="walkthrough-share">
                  <Ionicons name="share-outline" size={18} color="#FFF" />
                  <Text style={s.resultBtnText}>Share / Save to Photos</Text>
                </Pressable>
              ) : null}
              <Pressable style={[s.resultBtn, { backgroundColor: canShareFile() ? 'rgba(26,138,126,0.18)' : TEAL }]} onPress={download} testID="walkthrough-download">
                <Ionicons name="download-outline" size={18} color={canShareFile() ? TEAL : '#FFF'} />
                <Text style={[s.resultBtnText, canShareFile() ? { color: TEAL } : null]}>Download</Text>
              </Pressable>
              {isRealAgent ? (
                <Pressable
                  style={[s.resultBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, opacity: result.blob.size > MAX_UPLOAD_BYTES ? 0.5 : 1 }]}
                  onPress={saveToDocuments}
                  disabled={saving || result.blob.size > MAX_UPLOAD_BYTES}
                  testID="walkthrough-save-docs"
                >
                  {saving ? <ActivityIndicator color={TEAL} /> : <Ionicons name="folder-outline" size={18} color={colors.text} />}
                  <Text style={[s.resultBtnText, { color: colors.text }]}>Save to Documents</Text>
                </Pressable>
              ) : null}
            </View>
            {isRealAgent && result.blob.size > MAX_UPLOAD_BYTES ? (
              <Text style={[s.hint, { color: colors.textSecondary }]}>This video is over 25 MB, so download or share it instead of saving to Documents.</Text>
            ) : null}
            {saveMsg ? <Text style={[s.hint, { color: saveMsg.startsWith('Saved') ? TEAL : '#F87171' }]}>{saveMsg}</Text> : null}
          </Animated.View>
        ) : null}

        <Footer />
      </ScrollView>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Walkthrough Maker"
        description="Snap photos or film a few short clips as you walk through a home, then let TrustHome join them into one smooth video you can text, post, or email."
        details={[
          'Your clips never leave your phone — the video is built right on your device.',
          'Add a title (like the address), a song, or your own voice.',
          'Keep the screen open while it builds. It takes about as long as the video.',
          'When it finishes, tap Share to save it to Photos or send it.',
        ]}
        examples={['Film 6–10 clips of 5–15 seconds each: front of house, entry, kitchen, living room, bedrooms, backyard.']}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { paddingHorizontal: 20, marginBottom: 28, maxWidth: 760, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, letterSpacing: -0.3 },
  sectionDesc: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 20 },
  uploadZone: { borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderStyle: 'dashed' },
  uploadGradient: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  uploadIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  uploadText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  uploadSubtext: { fontSize: 13, fontWeight: '500' },
  clipsList: { marginTop: 16, gap: 8 },
  clipItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1 },
  clipNumberWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  clipNumber: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  clipInfo: { flex: 1 },
  clipName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  clipMeta: { fontSize: 12 },
  thumbIcon: { width: 44, height: 44, borderRadius: 8, marginRight: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(26,138,126,0.15)' },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: 'rgba(26,138,126,0.14)' },
  iconBtn: { padding: 6 },
  settingsCard: { padding: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, gap: 12 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  settingHint: { fontSize: 12, marginTop: 2 },
  optionsWrap: { paddingHorizontal: 18, paddingBottom: 18 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16 },
  recordBtn: { alignItems: 'center', gap: 10, borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, padding: 20 },
  recordDot: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  progressCard: { borderWidth: 1, borderRadius: 16, padding: 18, gap: 10 },
  progressTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: TEAL, borderRadius: 5 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 16 },
  createText: { fontSize: 17, fontWeight: '800' },
  hint: { fontSize: 13, textAlign: 'center', marginTop: 10 },
  previewWrap: { borderWidth: 1, borderRadius: 16, padding: 12 },
  resultActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  resultBtn: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  resultBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
