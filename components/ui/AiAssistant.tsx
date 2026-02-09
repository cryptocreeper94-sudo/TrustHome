import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { getApiUrl } from '@/lib/query-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(340, SCREEN_WIDTH * 0.88);

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isStreaming?: boolean;
}

type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking';

function AiTab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.tab, { backgroundColor: colors.primary }]} testID="ai-assistant-tab">
      <MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" />
      <Text style={styles.tabText}>AI</Text>
    </Pressable>
  );
}

function TypingDots({ color }: { color: string }) {
  return (
    <View style={styles.typingRow}>
      <View style={[styles.dot, { backgroundColor: color, opacity: 0.4 }]} />
      <View style={[styles.dot, { backgroundColor: color, opacity: 0.6 }]} />
      <View style={[styles.dot, { backgroundColor: color, opacity: 0.8 }]} />
    </View>
  );
}

function VoiceWaveform({ color }: { color: string }) {
  return (
    <View style={styles.waveformRow}>
      {[0.3, 0.7, 1, 0.8, 0.5, 0.9, 0.6, 0.4, 0.8, 1, 0.7, 0.3].map((h, i) => (
        <View
          key={i}
          style={[styles.waveBar, { backgroundColor: color, height: 4 + h * 16, opacity: 0.6 + h * 0.4 }]}
        />
      ))}
    </View>
  );
}

function MicButton({ voiceState, onPress, colors }: { voiceState: VoiceState; onPress: () => void; colors: any }) {
  const isRecording = voiceState === 'recording';
  const isProcessing = voiceState === 'processing';
  const isSpeaking = voiceState === 'speaking';
  const isDisabled = isProcessing;

  const bgColor = isRecording ? '#EF4444' : isSpeaking ? '#F59E0B' : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.micBtn, { backgroundColor: bgColor, opacity: isDisabled ? 0.5 : 1 }]}
      testID="voice-mic-btn"
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : isRecording ? (
        <Ionicons name="stop" size={18} color="#FFFFFF" />
      ) : isSpeaking ? (
        <Ionicons name="volume-high" size={18} color="#FFFFFF" />
      ) : (
        <Ionicons name="mic" size={18} color="#FFFFFF" />
      )}
    </Pressable>
  );
}

export function AiAssistant() {
  const { colors, isDark } = useTheme();
  const { currentRole, aiAssistantOpen, openAiAssistant, closeAiAssistant } = useApp();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);
  const audioContextRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mp3AudioRef = useRef<string | null>(null);

  const isAgent = currentRole === 'agent';

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = isAgent
        ? "Hi! I'm your TrustHome AI assistant. I can help with transaction management, lead scoring, marketing ideas, scheduling, market analysis, and contract questions. What can I help you with?"
        : "Hi! I'm here to help you through your home buying journey. Ask me about your timeline, documents, mortgage terms, or anything else. How can I help?";
      setMessages([{ id: '0', role: 'assistant', text: welcomeMsg }]);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendTextMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
    };

    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      text: '',
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setIsTyping(true);
    scrollToBottom();

    const history = messages
      .filter(m => m.id !== '0')
      .map(m => ({ role: m.role, content: m.text }));

    try {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const baseUrl = getApiUrl();
      const url = new URL('/api/ai/chat', baseUrl);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text' && data.content) {
              accumulated += data.content;
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, text: accumulated } : m)
              );
              scrollToBottom();
            } else if (data.type === 'done') {
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, text: data.content || accumulated, isStreaming: false } : m)
              );
            }
          } catch {}
        }
      }

      setMessages(prev =>
        prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
      );
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === aiMsgId ? { ...m, text: 'Sorry, I had trouble processing that. Please try again.', isStreaming: false } : m)
        );
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
      scrollToBottom();
    }
  }, [inputText, messages, scrollToBottom]);

  const playAudioChunks = useCallback(async (base64Chunks: string[]) => {
    if (Platform.OS !== 'web' || base64Chunks.length === 0) {
      setVoiceState('idle');
      return;
    }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      const allSamples: number[] = [];
      for (const b64 of base64Chunks) {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const int16 = new Int16Array(bytes.buffer);
        for (let i = 0; i < int16.length; i++) allSamples.push(int16[i] / 32768);
      }

      if (allSamples.length === 0) { setVoiceState('idle'); return; }

      const audioBuffer = ctx.createBuffer(1, allSamples.length, 16000);
      audioBuffer.getChannelData(0).set(new Float32Array(allSamples));
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setVoiceState('idle');
      source.start();
    } catch (err) {
      console.error('Audio playback error:', err);
      setVoiceState('idle');
    }
  }, []);

  const playMp3Audio = useCallback(async (base64: string) => {
    if (Platform.OS !== 'web') { setVoiceState('idle'); return; }
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setVoiceState('idle');
      source.start();
    } catch (err) {
      console.error('MP3 playback error:', err);
      setVoiceState('idle');
    }
  }, []);

  const handleVoicePress = useCallback(async () => {
    if (voiceState === 'recording') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    if (voiceState === 'speaking') {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setVoiceState('idle');
      return;
    }

    if (Platform.OS !== 'web') {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Voice input is available on the web version. Please use text input on this device.',
      }]);
      scrollToBottom();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e: any) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setVoiceState('processing');

        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const userMsgId = Date.now().toString();
        const aiMsgId = (Date.now() + 1).toString();

        setMessages(prev => [...prev,
          { id: userMsgId, role: 'user', text: 'Processing voice...' },
          { id: aiMsgId, role: 'assistant', text: '', isStreaming: true },
        ]);
        scrollToBottom();

        try {
          const baseUrl = getApiUrl();
          const url = new URL('/api/ai/voice', baseUrl);
          const response = await fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64 }),
          });

          if (!response.ok) throw new Error('Voice request failed');

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No response body');

          const decoder = new TextDecoder();
          const audioB64Chunks: string[] = [];
          let aiText = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'transcript') {
                  setMessages(prev =>
                    prev.map(m => m.id === userMsgId ? { ...m, text: data.content } : m)
                  );
                } else if (data.type === 'ai_text') {
                  aiText = data.content;
                  setMessages(prev =>
                    prev.map(m => m.id === aiMsgId ? { ...m, text: aiText } : m)
                  );
                  scrollToBottom();
                } else if (data.type === 'audio') {
                  audioB64Chunks.push(data.content);
                } else if (data.type === 'audio_full') {
                  mp3AudioRef.current = data.content;
                } else if (data.type === 'done') {
                  setMessages(prev =>
                    prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
                  );
                }
              } catch {}
            }
          }

          setMessages(prev =>
            prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
          );

          if (audioB64Chunks.length > 0) {
            setVoiceState('speaking');
            await playAudioChunks(audioB64Chunks);
          } else if (mp3AudioRef.current) {
            setVoiceState('speaking');
            await playMp3Audio(mp3AudioRef.current);
            mp3AudioRef.current = null;
          } else {
            setVoiceState('idle');
          }
        } catch (err) {
          console.error('Voice error:', err);
          setMessages(prev =>
            prev.map(m => m.id === aiMsgId ? { ...m, text: 'Voice processing failed. Please try again or use text.', isStreaming: false } : m)
          );
          setVoiceState('idle');
        }
      };

      recorder.start(100);
      setVoiceState('recording');
    } catch (err) {
      console.error('Mic access error:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        text: 'Unable to access microphone. Please allow microphone access in your browser settings.',
      }]);
      scrollToBottom();
    }
  }, [voiceState, scrollToBottom, playAudioChunks]);

  const speakMessage = useCallback(async (text: string) => {
    if (Platform.OS !== 'web') return;
    setVoiceState('speaking');

    try {
      const baseUrl = getApiUrl();
      const url = new URL('/api/ai/tts', baseUrl);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No body');

      const decoder = new TextDecoder();
      const audioB64Chunks: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'audio') audioB64Chunks.push(data.content);
            if (data.type === 'audio_full') mp3AudioRef.current = data.content;
          } catch {}
        }
      }

      if (audioB64Chunks.length > 0) {
        await playAudioChunks(audioB64Chunks);
      } else if (mp3AudioRef.current) {
        await playMp3Audio(mp3AudioRef.current);
        mp3AudioRef.current = null;
      } else {
        setVoiceState('idle');
      }
    } catch {
      setVoiceState('idle');
    }
  }, [playAudioChunks, playMp3Audio]);

  const quickPrompts = isAgent
    ? ['Check my deadlines', 'Lead priorities', "Tomorrow's schedule", 'Market analysis']
    : ['My timeline status', 'Explain inspection', 'Mortgage calculator', 'What happens next?'];

  const topPadding = Platform.OS === 'web' ? 4 : insets.top;

  if (!aiAssistantOpen) {
    return <AiTab onPress={openAiAssistant} />;
  }

  return (
    <View style={[styles.overlay]}>
      <Pressable style={styles.backdrop} onPress={closeAiAssistant} />
      <View style={[styles.panel, { width: PANEL_WIDTH, backgroundColor: colors.background, borderLeftColor: colors.border }]}>
        <View style={[styles.panelHeader, { paddingTop: topPadding + 8, backgroundColor: colors.primary }]}>
          <View style={styles.panelHeaderRow}>
            <View style={styles.panelTitleRow}>
              <MaterialCommunityIcons name="robot" size={22} color="#FFFFFF" />
              <View>
                <Text style={styles.panelTitle}>{isAgent ? 'Agent Assistant' : 'Your Assistant'}</Text>
                <Text style={styles.panelSubtitle}>Powered by TrustHome AI</Text>
              </View>
            </View>
            <Pressable onPress={closeAiAssistant} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
          {voiceState === 'recording' && (
            <View style={styles.recordingBanner}>
              <VoiceWaveform color="#FFFFFF" />
              <Text style={styles.recordingText}>Listening...</Text>
            </View>
          )}
          {voiceState === 'processing' && (
            <View style={styles.recordingBanner}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.recordingText}>Thinking...</Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble, {
              backgroundColor: msg.role === 'user' ? colors.primary : (isDark ? colors.surface : colors.backgroundTertiary),
            }]}>
              {msg.role === 'assistant' && (
                <View style={styles.aiHeader}>
                  <MaterialCommunityIcons name="robot" size={14} color={colors.primary} />
                  <Text style={[styles.aiLabel, { color: colors.primary }]}>TrustHome AI</Text>
                  {!msg.isStreaming && msg.text && Platform.OS === 'web' && (
                    <Pressable
                      onPress={() => speakMessage(msg.text)}
                      style={styles.speakBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="volume-medium" size={14} color={colors.textSecondary} />
                    </Pressable>
                  )}
                </View>
              )}
              <Text style={[styles.messageText, { color: msg.role === 'user' ? '#FFFFFF' : colors.text }]}>
                {msg.text || (msg.isStreaming ? '' : '')}
              </Text>
              {msg.isStreaming && !msg.text && <TypingDots color={colors.primary} />}
            </View>
          ))}

          {messages.length <= 1 && (
            <View style={styles.quickPrompts}>
              <Text style={[styles.quickPromptsTitle, { color: colors.textSecondary }]}>Try asking:</Text>
              {quickPrompts.map((prompt, i) => (
                <Pressable key={i} onPress={() => { setInputText(prompt); }} style={[styles.quickPromptBtn, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.backgroundTertiary }]}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.quickPromptText, { color: colors.text }]}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
          <View style={[styles.inputRow, { borderTopColor: colors.divider, backgroundColor: colors.background }]}>
            <MicButton voiceState={voiceState} onPress={handleVoicePress} colors={colors} />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, color: colors.text, borderColor: colors.borderLight }]}
              placeholder={isAgent ? 'Ask about leads, schedule, deals...' : 'Ask about your transaction...'}
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendTextMessage}
              returnKeyType="send"
              editable={voiceState === 'idle'}
            />
            <Pressable
              onPress={sendTextMessage}
              disabled={!inputText.trim() || voiceState !== 'idle'}
              style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: inputText.trim() && voiceState === 'idle' ? 1 : 0.4 }]}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <View style={{ height: Platform.OS === 'web' ? 34 : insets.bottom }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    position: 'absolute',
    right: 0,
    top: '45%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    gap: 4,
    zIndex: 50,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 6 },
      web: { shadowColor: '#000', shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
    }),
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    height: '100%',
    borderLeftWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 12 },
      web: { shadowColor: '#000', shadowOffset: { width: -4, height: 0 }, shadowOpacity: 0.15, shadowRadius: 12 },
    }),
  },
  panelHeader: {
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  panelSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingVertical: 6,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    gap: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: '92%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    flex: 1,
  },
  speakBtn: {
    padding: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  typingRow: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 24,
  },
  waveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  quickPrompts: {
    marginTop: 8,
    gap: 8,
  },
  quickPromptsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  quickPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
