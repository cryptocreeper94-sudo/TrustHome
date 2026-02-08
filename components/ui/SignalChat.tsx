import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { getApiUrl } from '@/lib/query-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(340, SCREEN_WIDTH * 0.88);

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  channel: string;
}

interface ChatChannel {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  unread: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

const DEFAULT_CHANNELS: ChatChannel[] = [
  { id: 'general', name: 'General', icon: 'chatbubbles', description: 'Team-wide announcements & discussions', unread: 0 },
  { id: 'transactions', name: 'Transactions', icon: 'document-text', description: 'Active deal discussions', unread: 0 },
  { id: 'leads', name: 'Leads', icon: 'people', description: 'Lead coordination & updates', unread: 0 },
  { id: 'support', name: 'Support', icon: 'help-circle', description: 'Platform help & troubleshooting', unread: 0 },
];

type ViewState = 'channels' | 'chat';

function SignalTab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.tab, { backgroundColor: '#3A76F0' }]} testID="signal-chat-tab">
      <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
      <Text style={styles.tabText}>Chat</Text>
    </Pressable>
  );
}

export function SignalChat() {
  const { colors, isDark } = useTheme();
  const { user, currentRole, signalChatOpen, openSignalChat, closeSignalChat } = useApp();
  const insets = useSafeAreaInsets();
  const [viewState, setViewState] = useState<ViewState>('channels');
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>(DEFAULT_CHANNELS);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const wsRef = useRef<any>(null);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
  const userId = user?.id || 'guest';

  const connectSocket = useCallback(() => {
    if (wsRef.current || connecting) return;
    setConnecting(true);

    try {
      const baseUrl = getApiUrl();
      const wsUrl = baseUrl.replace(/^http/, 'ws') + '/ws';

      const pollingUrl = `${baseUrl}/ws/?EIO=4&transport=polling`;
      fetch(pollingUrl)
        .then(() => {
          setConnected(true);
          setConnecting(false);
        })
        .catch(() => {
          setConnected(false);
          setConnecting(false);
        });
    } catch (err) {
      setConnected(false);
      setConnecting(false);
    }
  }, [connecting]);

  useEffect(() => {
    if (signalChatOpen && !connected && !connecting) {
      connectSocket();
    }
  }, [signalChatOpen, connected, connecting, connectSocket]);

  const openChannel = useCallback((channel: ChatChannel) => {
    setActiveChannel(channel);
    setViewState('chat');

    const seedMessages: ChatMessage[] = [];
    if (channel.id === 'general') {
      seedMessages.push(
        { id: '1', senderId: 'system', senderName: 'Signal', text: `Welcome to #${channel.name}. This is the cross-ecosystem Signal chat powered by PaintPros.io.`, timestamp: formatTime(new Date(Date.now() - 3600000)), isOwn: false, channel: channel.id },
        { id: '2', senderId: 'jennifer', senderName: 'Jennifer Lambert', text: 'Good morning team! We have 3 closings this week. Please make sure all documents are uploaded to the vault.', timestamp: formatTime(new Date(Date.now() - 1800000)), isOwn: false, channel: channel.id },
      );
    } else if (channel.id === 'transactions') {
      seedMessages.push(
        { id: '3', senderId: 'system', senderName: 'Signal', text: `Transaction updates and deal coordination for the team.`, timestamp: formatTime(new Date(Date.now() - 7200000)), isOwn: false, channel: channel.id },
        { id: '4', senderId: 'jennifer', senderName: 'Jennifer Lambert', text: '1847 Oak Valley Dr - inspection report came back clean. Moving to appraisal phase.', timestamp: formatTime(new Date(Date.now() - 900000)), isOwn: false, channel: channel.id },
      );
    } else if (channel.id === 'leads') {
      seedMessages.push(
        { id: '5', senderId: 'system', senderName: 'Signal', text: `Lead updates and coordination channel.`, timestamp: formatTime(new Date(Date.now() - 5400000)), isOwn: false, channel: channel.id },
      );
    } else if (channel.id === 'support') {
      seedMessages.push(
        { id: '6', senderId: 'system', senderName: 'Signal', text: `Need help? Post your questions here. TrustShield support monitors this channel.`, timestamp: formatTime(new Date(Date.now() - 10800000)), isOwn: false, channel: channel.id },
      );
    }
    setMessages(seedMessages);

    setChannels(prev => prev.map(c => c.id === channel.id ? { ...c, unread: 0 } : c));
  }, []);

  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !activeChannel) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      senderId: userId,
      senderName: userName,
      text: inputText.trim(),
      timestamp: formatTime(new Date()),
      isOwn: true,
      channel: activeChannel.id,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    setChannels(prev => prev.map(c =>
      c.id === activeChannel.id
        ? { ...c, lastMessage: inputText.trim(), lastMessageTime: 'Now' }
        : c
    ));
  }, [inputText, activeChannel, userId, userName]);

  const topPadding = Platform.OS === 'web' ? 4 : insets.top;

  if (!signalChatOpen) {
    return <SignalTab onPress={openSignalChat} />;
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={closeSignalChat} />
      <View style={[styles.panel, { width: PANEL_WIDTH, backgroundColor: colors.background, borderLeftColor: colors.border }]}>
        <View style={[styles.panelHeader, { paddingTop: topPadding + 8, backgroundColor: '#3A76F0' }]}>
          <View style={styles.panelHeaderRow}>
            <View style={styles.panelTitleRow}>
              {viewState === 'chat' ? (
                <Pressable onPress={() => setViewState('channels')} style={styles.headerBackBtn}>
                  <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </Pressable>
              ) : (
                <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
              )}
              <View>
                <Text style={styles.panelTitle}>
                  {viewState === 'chat' && activeChannel ? `#${activeChannel.name}` : 'Signal Chat'}
                </Text>
                <Text style={styles.panelSubtitle}>
                  {viewState === 'chat' && activeChannel
                    ? activeChannel.description
                    : connected ? 'Connected to PaintPros.io' : 'Ecosystem Messaging'}
                </Text>
              </View>
            </View>
            <Pressable onPress={closeSignalChat} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {connecting && (
          <View style={[styles.statusBar, { backgroundColor: '#FFA500' + '20' }]}>
            <ActivityIndicator size="small" color="#FFA500" />
            <Text style={[styles.statusText, { color: '#FFA500' }]}>Connecting to Signal...</Text>
          </View>
        )}

        {viewState === 'channels' ? (
          <ScrollView style={styles.channelList} contentContainerStyle={styles.channelListContent} showsVerticalScrollIndicator={false}>
            <View style={styles.channelSection}>
              <Text style={[styles.channelSectionTitle, { color: colors.textSecondary }]}>CHANNELS</Text>
              {channels.map(channel => (
                <Pressable
                  key={channel.id}
                  style={[styles.channelItem, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary }]}
                  onPress={() => openChannel(channel)}
                  testID={`channel-${channel.id}`}
                >
                  <View style={[styles.channelIconWrap, { backgroundColor: '#3A76F0' + '18' }]}>
                    <Ionicons name={channel.icon} size={20} color="#3A76F0" />
                  </View>
                  <View style={styles.channelInfo}>
                    <View style={styles.channelNameRow}>
                      <Text style={[styles.channelName, { color: colors.text }]}>#{channel.name}</Text>
                      {channel.unread > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{channel.unread}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.channelDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                      {channel.lastMessage || channel.description}
                    </Text>
                  </View>
                  {channel.lastMessageTime && (
                    <Text style={[styles.channelTime, { color: colors.textTertiary }]}>{channel.lastMessageTime}</Text>
                  )}
                </Pressable>
              ))}
            </View>

            <View style={styles.channelSection}>
              <Text style={[styles.channelSectionTitle, { color: colors.textSecondary }]}>DIRECT MESSAGES</Text>
              <View style={[styles.dmPlaceholder, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, borderColor: colors.border }]}>
                <Ionicons name="lock-closed" size={18} color={colors.textTertiary} />
                <Text style={[styles.dmPlaceholderText, { color: colors.textSecondary }]}>
                  End-to-end encrypted DMs coming soon
                </Text>
              </View>
            </View>

            <View style={styles.ecosystemInfo}>
              <View style={[styles.ecosystemBadge, { backgroundColor: '#3A76F0' + '10', borderColor: '#3A76F0' + '25' }]}>
                <Ionicons name="globe-outline" size={16} color="#3A76F0" />
                <Text style={[styles.ecosystemText, { color: '#3A76F0' }]}>
                  Cross-ecosystem chat via PaintPros.io
                </Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(msg => (
                <View key={msg.id} style={[
                  styles.messageBubble,
                  msg.isOwn ? styles.ownBubble : (msg.senderId === 'system' ? styles.systemBubble : styles.otherBubble),
                  {
                    backgroundColor: msg.isOwn
                      ? '#3A76F0'
                      : msg.senderId === 'system'
                        ? (isDark ? colors.primaryLight : '#3A76F0' + '0A')
                        : (isDark ? colors.surface : colors.backgroundTertiary),
                  },
                ]}>
                  {!msg.isOwn && msg.senderId !== 'system' && (
                    <Text style={[styles.senderName, { color: '#3A76F0' }]}>{msg.senderName}</Text>
                  )}
                  {msg.senderId === 'system' && (
                    <View style={styles.systemHeader}>
                      <Ionicons name="information-circle" size={14} color="#3A76F0" />
                      <Text style={[styles.systemLabel, { color: '#3A76F0' }]}>Signal</Text>
                    </View>
                  )}
                  <Text style={[styles.messageText, {
                    color: msg.isOwn ? '#FFFFFF' : (msg.senderId === 'system' ? colors.textSecondary : colors.text)
                  }]}>{msg.text}</Text>
                  <Text style={[styles.msgTime, {
                    color: msg.isOwn ? 'rgba(255,255,255,0.6)' : colors.textTertiary
                  }]}>{msg.timestamp}</Text>
                </View>
              ))}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
              <View style={[styles.inputRow, { borderTopColor: colors.divider, backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.input, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, color: colors.text, borderColor: colors.borderLight }]}
                  placeholder={`Message #${activeChannel?.name || 'channel'}...`}
                  placeholderTextColor={colors.textTertiary}
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                  testID="signal-chat-input"
                />
                <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: '#3A76F0', opacity: inputText.trim() ? 1 : 0.5 }]} testID="signal-send-btn">
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </>
        )}

        <View style={{ height: Platform.OS === 'web' ? 34 : insets.bottom }} />
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  const m = minutes.toString().padStart(2, '0');
  return `${h}:${m} ${ampm}`;
}

const styles = StyleSheet.create({
  tab: {
    position: 'absolute',
    right: 0,
    top: '35%',
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
    flex: 1,
  },
  headerBackBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginLeft: -4,
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  channelList: {
    flex: 1,
  },
  channelListContent: {
    padding: 16,
    gap: 16,
  },
  channelSection: {
    gap: 8,
  },
  channelSectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  channelIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInfo: {
    flex: 1,
  },
  channelNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  unreadBadge: {
    backgroundColor: '#3A76F0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  channelDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  channelTime: {
    fontSize: 11,
  },
  dmPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed' as any,
  },
  dmPlaceholderText: {
    fontSize: 13,
    flex: 1,
  },
  ecosystemInfo: {
    marginTop: 8,
  },
  ecosystemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  ecosystemText: {
    fontSize: 12,
    fontWeight: '600' as const,
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    gap: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 14,
    maxWidth: '92%',
  },
  ownBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  systemBubble: {
    alignSelf: 'center',
    maxWidth: '100%',
    borderRadius: 10,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  systemLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right' as const,
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
});
