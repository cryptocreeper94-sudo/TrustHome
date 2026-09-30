import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { apiRequest } from '@/lib/query-client';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WalkthroughMakerScreen() {
  const { colors, isDark } = useTheme();
  
  // State for the simplified editor
  const [clips, setClips] = useState<{ id: string, name: string }[]>([]);
  
  // Music State
  const [addMusic, setAddMusic] = useState(false);
  const [musicSource, setMusicSource] = useState<'ai' | 'custom'>('ai');
  const [aiMusicVibe, setAiMusicVibe] = useState('cinematic');
  const [customMusic, setCustomMusic] = useState<string | null>(null);

  // Captions State
  const [addCaptions, setAddCaptions] = useState(false);
  const [captionStyle, setCaptionStyle] = useState('standard');

  // Voiceover State
  const [addVoiceover, setAddVoiceover] = useState(false);
  const [voiceoverSource, setVoiceoverSource] = useState<'ai' | 'custom'>('ai');
  const [voiceoverScript, setVoiceoverScript] = useState('');
  const [aiVoice, setAiVoice] = useState('alloy');
  const [customAudio, setCustomAudio] = useState<string | null>(null);
  
  // Recording state
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [trimStart, setTrimStart] = useState('0');
  const [trimEnd, setTrimEnd] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Audio Recording handlers
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        Alert.alert('Permission Denied', 'Please grant microphone permissions to record audio.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setCustomAudio(uri);
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
    setRecording(null);
  };

  // Use expo-image-picker to let the user select video files
  const handleUploadClips = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newClips = result.assets.map((asset, index) => ({
          id: Math.random().toString(36).substring(7),
          name: asset.fileName || asset.uri.split('/').pop() || `Clip_${Math.floor(Math.random() * 1000)}.mp4`
        }));
        setClips(prev => [...prev, ...newClips]);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert('Upload Error', 'Could not open the file picker. Ensure you have granted permissions.');
    }
  };

  const handleRemoveClip = (id: string) => {
    setClips(clips.filter(c => c.id !== id));
  };

  const handleCreateVideo = async () => {
    if (clips.length === 0) {
      Alert.alert('No Clips', 'Please upload at least one video clip.');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Send the request to Axiom42 Suite via our updated client endpoint
      await apiRequest('POST', '/api/media-studio/walkthrough-request', {
        title: `Walkthrough ${new Date().toLocaleDateString()}`,
        clips: clips.map(c => c.name),
        addMusic,
        musicSource: addMusic ? musicSource : undefined,
        musicVibe: addMusic && musicSource === 'ai' ? aiMusicVibe : undefined,
        customMusicFile: addMusic && musicSource === 'custom' ? customMusic : undefined,
        addCaptions,
        captionStyle: addCaptions ? captionStyle : undefined,
        addVoiceover,
        voiceoverSource,
        voiceoverScript: voiceoverSource === 'ai' ? voiceoverScript : undefined,
        aiVoice: voiceoverSource === 'ai' ? aiVoice : undefined,
        customAudio: voiceoverSource === 'custom' ? customAudio : undefined,
        customAudioTrimStart: voiceoverSource === 'custom' ? Number(trimStart) || 0 : undefined,
        customAudioTrimEnd: voiceoverSource === 'custom' && trimEnd ? Number(trimEnd) : undefined,
      });
      
      Alert.alert(
        'Processing Started', 
        'Your walkthrough is being stitched together by Axiom42. We will notify you when it is ready to download.'
      );
      
      // Reset form after success
      setClips([]);
      setAddMusic(false);
      setAddVoiceover(false);
      setVoiceoverSource('ai');
      setVoiceoverScript('');
      setAiVoice('alloy');
      setCustomAudio(null);
      setTrimStart('0');
      setTrimEnd('');
      setAddCaptions(false);
      
    } catch (err) {
      Alert.alert('Error', 'Failed to send video to Axiom42 Suite. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[s.container, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Header imageBanner={require('@/assets/images/guide-media.jpg')} 
        title="Walkthrough Maker" 
        showBack 
        transparent={false}
      />

        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>1. Upload Clips</Text>
          <Text style={[s.sectionDesc, { color: colors.textSecondary }]}>
            Upload short video clips from your phone. We'll stitch them together in order.
          </Text>
          
          <Pressable onPress={handleUploadClips} style={[s.uploadZone, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
            <LinearGradient
              colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] : ['rgba(0,0,0,0.03)', 'rgba(0,0,0,0.01)']}
              style={s.uploadGradient}
            >
              <View style={[s.uploadIconWrap, { backgroundColor: 'rgba(150,150,150,0.1)' }]}>
                <Ionicons name="cloud-upload-outline" size={28} color={colors.text} />
              </View>
              <Text style={[s.uploadText, { color: colors.text }]}>Tap to Upload Video Clips</Text>
              <Text style={[s.uploadSubtext, { color: colors.textSecondary }]}>MP4, MOV up to 500MB</Text>
            </LinearGradient>
          </Pressable>

          {clips.length > 0 && (
            <View style={s.clipsList}>
              {clips.map((clip, idx) => (
                <View key={clip.id} style={[s.clipItem, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
                  <View style={s.clipNumberWrap}>
                    <Text style={s.clipNumber}>{idx + 1}</Text>
                  </View>
                  <View style={s.clipInfo}>
                    <Text style={[s.clipName, { color: colors.text }]}>{clip.name}</Text>
                    <Text style={s.clipMeta}>Ready to stitch</Text>
                  </View>
                  <Pressable onPress={() => handleRemoveClip(clip.id)} style={s.removeBtn}>
                    <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>2. Enhancements</Text>
          <Text style={[s.sectionDesc, { color: colors.textSecondary }]}>
            Select what Axiom42 should automatically add to your video.
          </Text>

          <GlassCard style={s.settingsCard}>
            <View style={s.settingRow}>
              <View style={s.settingInfo}>
                <Ionicons name="musical-notes-outline" size={20} color={colors.text} />
                <Text style={[s.settingLabel, { color: colors.text }]}>Background Music</Text>
              </View>
              <Switch
                value={addMusic}
                onValueChange={setAddMusic}
                trackColor={{ false: colors.divider, true: colors.textInverse }}
                thumbColor={colors.text}
              />
            </View>

            {addMusic && (
              <View style={s.optionsWrap}>
                <View style={s.tabsRow}>
                  <Pressable 
                    style={[s.tab, musicSource === 'ai' && { backgroundColor: 'rgba(150,150,150,0.1)' }]}
                    onPress={() => setMusicSource('ai')}
                  >
                    <Text style={[s.tabText, musicSource === 'ai' ? { color: '#FFFFFF', fontWeight: '600' } : { color: colors.textSecondary }]}>AI Vibe</Text>
                  </Pressable>
                  <Pressable 
                    style={[s.tab, musicSource === 'custom' && { backgroundColor: 'rgba(150,150,150,0.1)' }]}
                    onPress={() => setMusicSource('custom')}
                  >
                    <Text style={[s.tabText, musicSource === 'custom' ? { color: '#FFFFFF', fontWeight: '600' } : { color: colors.textSecondary }]}>My Audio</Text>
                  </Pressable>
                </View>

                {musicSource === 'ai' ? (
                  <View style={s.selectorGroup}>
                    <Text style={[s.scriptLabel, { color: colors.textSecondary }]}>Select Mood</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsList}>
                      {['cinematic', 'upbeat', 'ambient', 'lo-fi', 'corporate'].map(v => (
                        <Pressable 
                          key={v} 
                          style={[s.pill, aiMusicVibe === v && { backgroundColor: colors.text, borderColor: colors.text }]}
                          onPress={() => setAiMusicVibe(v)}
                        >
                          <Text style={[s.pillText, aiMusicVibe === v ? { color: '#000000' } : { color: colors.text }]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={s.selectorGroup}>
                    {!customMusic ? (
                      <Pressable 
                        style={[s.uploadBtn, { borderColor: colors.divider, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}
                        onPress={() => setCustomMusic('user_uploaded_audio.mp3')}
                      >
                        <Ionicons name="musical-notes" size={24} color={colors.text} />
                        <Text style={[s.uploadBtnText, { color: colors.text }]}>Browse for MP3/WAV</Text>
                      </Pressable>
                    ) : (
                      <View style={[s.audioPreviewCard, { borderColor: colors.divider, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                        <View style={s.customAudioTop}>
                          <View style={s.customAudioInfo}>
                            <Ionicons name="musical-note" size={20} color={colors.text} />
                            <Text style={[s.customAudioName, { color: colors.text }]}>{customMusic}</Text>
                          </View>
                          <Pressable onPress={() => setCustomMusic(null)}>
                            <Ionicons name="trash-outline" size={20} color={colors.textTertiary} />
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={s.settingInfo}>
                <Ionicons name="text-outline" size={20} color={colors.text} />
                <Text style={[s.settingLabel, { color: colors.text }]}>Auto Captions</Text>
              </View>
              <Switch
                value={addCaptions}
                onValueChange={setAddCaptions}
                trackColor={{ false: colors.divider, true: colors.textInverse }}
                thumbColor={colors.text}
              />
            </View>

            {addCaptions && (
              <View style={s.optionsWrap}>
                <View style={s.selectorGroup}>
                  <Text style={[s.scriptLabel, { color: colors.textSecondary }]}>Caption Style</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillsList}>
                    {['standard', 'bold', 'minimal', 'karaoke'].map(v => (
                      <Pressable 
                        key={v} 
                        style={[s.pill, captionStyle === v && { backgroundColor: colors.text, borderColor: colors.text }]}
                        onPress={() => setCaptionStyle(v)}
                      >
                        <Text style={[s.pillText, captionStyle === v ? { color: '#000000' } : { color: colors.text }]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={s.settingInfo}>
                <Ionicons name="mic-outline" size={20} color={colors.text} />
                <Text style={[s.settingLabel, { color: colors.text }]}>Voiceover</Text>
              </View>
              <Switch
                value={addVoiceover}
                onValueChange={setAddVoiceover}
                trackColor={{ false: colors.divider, true: colors.textInverse }}
                thumbColor={colors.text}
              />
            </View>

            {addVoiceover && (
              <View style={s.voiceOptionsWrap}>
                <View style={s.voiceTabs}>
                  <Pressable 
                    style={[s.voiceTab, voiceoverSource === 'ai' && { backgroundColor: 'rgba(150,150,150,0.1)' }]}
                    onPress={() => setVoiceoverSource('ai')}
                  >
                    <Text style={[s.voiceTabText, voiceoverSource === 'ai' ? { color: '#FFFFFF', fontWeight: '600' } : { color: colors.textSecondary }]}>AI Voice</Text>
                  </Pressable>
                  <Pressable 
                    style={[s.voiceTab, voiceoverSource === 'custom' && { backgroundColor: 'rgba(150,150,150,0.1)' }]}
                    onPress={() => setVoiceoverSource('custom')}
                  >
                    <Text style={[s.voiceTabText, voiceoverSource === 'custom' ? { color: '#FFFFFF', fontWeight: '600' } : { color: colors.textSecondary }]}>My Voice</Text>
                  </Pressable>
                </View>

                {voiceoverSource === 'ai' ? (
                  <View style={s.aiVoiceWrap}>
                    <View style={s.aiVoiceSelector}>
                      <Text style={[s.scriptLabel, { color: colors.textSecondary }]}>Select Voice</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.voicePillsList}>
                        {['alloy', 'onyx', 'nova', 'echo', 'fable', 'shimmer'].map(v => (
                          <Pressable 
                            key={v} 
                            style={[s.voicePill, aiVoice === v && { backgroundColor: colors.text, borderColor: colors.text }]}
                            onPress={() => setAiVoice(v)}
                          >
                            <Text style={[s.voicePillText, aiVoice === v ? { color: '#000000' } : { color: colors.text }]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                    <Text style={[s.scriptLabel, { color: colors.textSecondary }]}>Voiceover Script</Text>
                    <TextInput
                      style={[s.scriptInput, { color: '#FFFFFF', borderColor: colors.divider, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}
                      placeholder="Type the script for the AI to read..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={4}
                      value={voiceoverScript}
                      onChangeText={setVoiceoverScript}
                      textAlignVertical="top"
                    />
                  </View>
                ) : (
                  <View style={s.customVoiceWrap}>
                    {!customAudio ? (
                      <Pressable 
                        style={[s.customUploadBtn, { borderColor: isRecording ? colors.error : colors.divider, backgroundColor: isRecording ? 'rgba(255,59,48,0.1)' : (isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)') }]}
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                      >
                        <View style={[s.recordIconWrap, isRecording && { backgroundColor: colors.error }]}>
                          <Ionicons name="mic" size={32} color={isRecording ? "#fff" : colors.text} />
                        </View>
                        <Text style={[s.customUploadText, { color: isRecording ? colors.error : colors.text }]}>
                          {isRecording ? "Recording... Release to Stop" : "Hold to Record Voice"}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={[s.customAudioPreview, { borderColor: colors.divider, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                        <View style={s.customAudioTop}>
                          <View style={s.customAudioInfo}>
                            <Ionicons name="volume-medium" size={20} color={colors.text} />
                            <Text style={[s.customAudioName, { color: colors.text }]}>My Recording</Text>
                          </View>
                          <Pressable onPress={() => { setCustomAudio(null); setTrimStart('0'); setTrimEnd(''); }}>
                            <Ionicons name="trash-outline" size={20} color={colors.textTertiary} />
                          </Pressable>
                        </View>
                        
                        <View style={s.trimWrap}>
                          <Text style={[s.trimTitle, { color: colors.textSecondary }]}>Trim Audio (seconds)</Text>
                          <View style={s.trimInputs}>
                            <View style={s.trimInputGroup}>
                              <Text style={[s.trimLabel, { color: colors.textTertiary }]}>Start</Text>
                              <TextInput 
                                style={[s.trimInput, { color: '#FFFFFF', borderColor: colors.divider }]}
                                value={trimStart}
                                onChangeText={setTrimStart}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textTertiary}
                              />
                            </View>
                            <View style={s.trimInputGroup}>
                              <Text style={[s.trimLabel, { color: colors.textTertiary }]}>End</Text>
                              <TextInput 
                                style={[s.trimInput, { color: '#FFFFFF', borderColor: colors.divider }]}
                                value={trimEnd}
                                onChangeText={setTrimEnd}
                                keyboardType="numeric"
                                placeholder="e.g. 15"
                                placeholderTextColor={colors.textTertiary}
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={s.actionSection}>
          <Pressable 
            style={[s.createBtn, clips.length === 0 && s.createBtnDisabled]} 
            onPress={handleCreateVideo}
            disabled={isProcessing || clips.length === 0}
          >
            <LinearGradient
              colors={clips.length === 0 ? [colors.divider, colors.divider] : [colors.text, colors.textSecondary]}
              style={s.createGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <>
                  <Ionicons name="film-outline" size={20} color={clips.length === 0 ? colors.textTertiary : colors.background} />
                  <Text style={[s.createText, { color: clips.length === 0 ? colors.textTertiary : colors.background }]}>Create Video</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
          <Text style={[s.poweredBy, { color: colors.textSecondary }]}>Powered by Axiom42 Suite</Text>
        </Animated.View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sectionDesc: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadZone: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(26,138,126,0.3)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  uploadGradient: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  clipsList: {
    marginTop: 16,
    gap: 8,
  },
  clipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  clipNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(150,150,150,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clipNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  clipInfo: {
    flex: 1,
  },
  clipName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  clipMeta: {
    fontSize: 12,
    color: '#34C759',
  },
  removeBtn: {
    padding: 8,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsWrap: {
    padding: 16,
    paddingTop: 0,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectorGroup: {
    marginBottom: 16,
  },
  pillsList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.3)',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
  },
  uploadBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  audioPreviewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  scriptWrap: {
    padding: 16,
    paddingTop: 0,
  },
  voiceOptionsWrap: {
    padding: 16,
    paddingTop: 0,
  },
  voiceTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  voiceTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  voiceTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  aiVoiceWrap: {
  },
  aiVoiceSelector: {
    marginBottom: 16,
  },
  voicePillsList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  voicePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(150,150,150,0.2)',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  voicePillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  customVoiceWrap: {
  },
  customUploadBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
  },
  recordIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(150,150,150,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customUploadText: {
    fontSize: 16,
    fontWeight: '600',
  },
  customAudioPreview: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  customAudioTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  customAudioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customAudioName: {
    fontSize: 16,
    fontWeight: '600',
  },
  trimWrap: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
  },
  trimTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  trimInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  trimInputGroup: {
    flex: 1,
  },
  trimLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  trimInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  scriptLabel: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  scriptInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    fontSize: 15,
    lineHeight: 22,
  },
  actionSection: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  createBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  createBtnDisabled: {
    opacity: 0.7,
  },
  createGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  poweredBy: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  }
});
