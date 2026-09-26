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
  const [addMusic, setAddMusic] = useState(false);
  const [addVoiceover, setAddVoiceover] = useState(false);
  const [voiceoverSource, setVoiceoverSource] = useState<'ai' | 'custom'>('ai');
  const [voiceoverScript, setVoiceoverScript] = useState('');
  const [aiVoice, setAiVoice] = useState('alloy');
  const [customAudio, setCustomAudio] = useState<string | null>(null);
  const [addCaptions, setAddCaptions] = useState(false);
  
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

  // Simulated upload (in a real app, this would use expo-document-picker or similar)
  const handleUploadClips = () => {
    const newClip = {
      id: Math.random().toString(36).substring(7),
      name: `Clip_00${clips.length + 1}.mp4`
    };
    setClips([...clips, newClip]);
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
        addVoiceover,
        voiceoverSource,
        voiceoverScript: voiceoverSource === 'ai' ? voiceoverScript : undefined,
        aiVoice: voiceoverSource === 'ai' ? aiVoice : undefined,
        customAudio: voiceoverSource === 'custom' ? customAudio : undefined,
        customAudioTrimStart: voiceoverSource === 'custom' ? Number(trimStart) || 0 : undefined,
        customAudioTrimEnd: voiceoverSource === 'custom' && trimEnd ? Number(trimEnd) : undefined,
        addCaptions
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
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <Header title="Walkthrough Maker" showBack />
      
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={s.section}>
          <Text style={[s.sectionTitle, { color: colors.text }]}>1. Upload Clips</Text>
          <Text style={[s.sectionDesc, { color: colors.textSecondary }]}>
            Upload short video clips from your phone. We'll stitch them together in order.
          </Text>
          
          <Pressable onPress={handleUploadClips} style={s.uploadZone}>
            <LinearGradient
              colors={isDark ? ['rgba(26,138,126,0.1)', 'rgba(15,107,98,0.05)'] : ['rgba(26,138,126,0.05)', 'rgba(15,107,98,0.02)']}
              style={s.uploadGradient}
            >
              <View style={[s.uploadIconWrap, { backgroundColor: isDark ? 'rgba(26,138,126,0.2)' : 'rgba(26,138,126,0.1)' }]}>
                <Ionicons name="cloud-upload-outline" size={28} color="#1A8A7E" />
              </View>
              <Text style={[s.uploadText, { color: colors.text }]}>Tap to Upload Video Clips</Text>
              <Text style={s.uploadSubtext}>MP4, MOV up to 500MB</Text>
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
                <Ionicons name="musical-notes-outline" size={20} color="#1A8A7E" />
                <Text style={[s.settingLabel, { color: colors.text }]}>Background Music</Text>
              </View>
              <Switch
                value={addMusic}
                onValueChange={setAddMusic}
                trackColor={{ false: colors.divider, true: '#1A8A7E' }}
                thumbColor="#fff"
              />
            </View>

            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={s.settingInfo}>
                <Ionicons name="text-outline" size={20} color="#F59E0B" />
                <Text style={[s.settingLabel, { color: colors.text }]}>Auto Captions</Text>
              </View>
              <Switch
                value={addCaptions}
                onValueChange={setAddCaptions}
                trackColor={{ false: colors.divider, true: '#F59E0B' }}
                thumbColor="#fff"
              />
            </View>

            <View style={[s.settingRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}>
              <View style={s.settingInfo}>
                <Ionicons name="mic-outline" size={20} color="#6366F1" />
                <Text style={[s.settingLabel, { color: colors.text }]}>AI Voiceover</Text>
              </View>
              <Switch
                value={addVoiceover}
                onValueChange={setAddVoiceover}
                trackColor={{ false: colors.divider, true: '#6366F1' }}
                thumbColor="#fff"
              />
            </View>

            {addVoiceover && (
              <Animated.View entering={FadeInDown.duration(300)} style={s.voiceOptionsWrap}>
                <View style={s.voiceTabs}>
                  <Pressable 
                    style={[s.voiceTab, voiceoverSource === 'ai' && { backgroundColor: isDark ? 'rgba(26,138,126,0.2)' : 'rgba(26,138,126,0.1)' }]}
                    onPress={() => setVoiceoverSource('ai')}
                  >
                    <Text style={[s.voiceTabText, voiceoverSource === 'ai' ? { color: '#1A8A7E', fontWeight: '600' } : { color: colors.textSecondary }]}>AI Voice</Text>
                  </Pressable>
                  <Pressable 
                    style={[s.voiceTab, voiceoverSource === 'custom' && { backgroundColor: isDark ? 'rgba(26,138,126,0.2)' : 'rgba(26,138,126,0.1)' }]}
                    onPress={() => setVoiceoverSource('custom')}
                  >
                    <Text style={[s.voiceTabText, voiceoverSource === 'custom' ? { color: '#1A8A7E', fontWeight: '600' } : { color: colors.textSecondary }]}>My Voice</Text>
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
                            style={[s.voicePill, aiVoice === v && { backgroundColor: '#6366F1', borderColor: '#6366F1' }]}
                            onPress={() => setAiVoice(v)}
                          >
                            <Text style={[s.voicePillText, aiVoice === v ? { color: '#fff' } : { color: colors.text }]}>{v.charAt(0).toUpperCase() + v.slice(1)}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                    <Text style={[s.scriptLabel, { color: colors.textSecondary }]}>Voiceover Script</Text>
                    <TextInput
                      style={[s.scriptInput, { color: colors.text, borderColor: colors.divider, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}
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
                        style={[s.customUploadBtn, { borderColor: isRecording ? '#EF4444' : colors.divider, backgroundColor: isRecording ? 'rgba(239,68,68,0.1)' : (isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)') }]}
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                      >
                        <View style={[s.recordIconWrap, isRecording && { backgroundColor: '#EF4444' }]}>
                          <Ionicons name="mic" size={32} color={isRecording ? "#fff" : "#6366F1"} />
                        </View>
                        <Text style={[s.customUploadText, { color: isRecording ? '#EF4444' : colors.text }]}>
                          {isRecording ? "Recording... Release to Stop" : "Hold to Record Voice"}
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={[s.customAudioPreview, { borderColor: colors.divider, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                        <View style={s.customAudioTop}>
                          <View style={s.customAudioInfo}>
                            <Ionicons name="volume-medium" size={20} color="#6366F1" />
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
                                style={[s.trimInput, { color: colors.text, borderColor: colors.divider }]}
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
                                style={[s.trimInput, { color: colors.text, borderColor: colors.divider }]}
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
              </Animated.View>
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
              colors={clips.length === 0 ? [colors.divider, colors.divider] : ['#1A8A7E', '#0F6B62']}
              style={s.createGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="film-outline" size={20} color={clips.length === 0 ? colors.textTertiary : "#fff"} />
                  <Text style={[s.createText, clips.length === 0 && { color: colors.textTertiary }]}>Create Video</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
          <Text style={s.poweredBy}>Powered by Axiom42 Suite</Text>
        </Animated.View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40, paddingTop: 16 },
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
    color: '#1A8A7E',
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
    backgroundColor: 'rgba(26,138,126,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clipNumber: {
    color: '#1A8A7E',
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
    padding: 16,
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  voiceTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
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
    borderColor: 'rgba(99,102,241,0.3)',
    marginRight: 8,
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
    backgroundColor: 'rgba(99,102,241,0.1)',
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
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  poweredBy: {
    fontSize: 12,
    color: '#1A8A7E',
    fontWeight: '600',
  }
});
