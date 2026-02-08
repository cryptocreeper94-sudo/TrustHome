import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { getApiUrl } from '@/lib/query-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(340, SCREEN_WIDTH * 0.88);

interface EcosystemApp {
  id: string;
  name: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  abbrev: string;
}

const ECOSYSTEM_APPS: EcosystemApp[] = [
  { id: 'trusthome', name: 'TrustHome', color: '#1A8A7E', icon: 'home', abbrev: 'TH' },
  { id: 'paintpros', name: 'PaintPros', color: '#E85D3A', icon: 'color-palette', abbrev: 'PP' },
  { id: 'trustshield', name: 'TrustShield', color: '#6C5CE7', icon: 'shield-checkmark', abbrev: 'TS' },
  { id: 'darkwave', name: 'DarkWave TL', color: '#2D3436', icon: 'cube', abbrev: 'DW' },
];

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  channel: string;
  sourceApp?: string;
}

interface ChatChannel {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  unread: number;
  scope: 'ecosystem' | 'vertical';
  lastMessage?: string;
  lastMessageTime?: string;
}

const DEFAULT_CHANNELS: ChatChannel[] = [
  { id: 'ecosystem-general', name: 'Ecosystem Hub', icon: 'globe', description: 'Cross-app announcements & updates', unread: 2, scope: 'ecosystem' },
  { id: 'ecosystem-ops', name: 'Operations', icon: 'git-network', description: 'Cross-vertical coordination', unread: 0, scope: 'ecosystem' },
  { id: 'ecosystem-trust', name: 'Trust Layer', icon: 'shield-checkmark', description: 'Blockchain verification & trust scores', unread: 1, scope: 'ecosystem' },
  { id: 'th-transactions', name: 'Transactions', icon: 'document-text', description: 'TrustHome deal discussions', unread: 0, scope: 'vertical' },
  { id: 'th-leads', name: 'Leads', icon: 'people', description: 'TrustHome lead coordination', unread: 0, scope: 'vertical' },
  { id: 'support', name: 'Support', icon: 'help-circle', description: 'Ecosystem-wide support desk', unread: 0, scope: 'ecosystem' },
];

type ViewState = 'channels' | 'chat';

function getAppMeta(appId?: string): EcosystemApp | undefined {
  return ECOSYSTEM_APPS.find(a => a.id === appId);
}

function AppBadge({ appId }: { appId: string }) {
  const app = getAppMeta(appId);
  if (!app) return null;
  return (
    <View style={[badgeStyles.badge, { backgroundColor: app.color + '18' }]}>
      <Ionicons name={app.icon} size={10} color={app.color} />
      <Text style={[badgeStyles.badgeText, { color: app.color }]}>{app.abbrev}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, fontWeight: '800' as const, letterSpacing: 0.4 },
});

function SignalTab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, { backgroundColor: '#3A76F0' }]} testID="signal-chat-tab">
      <Ionicons name="chatbubble-ellipses" size={20} color="#FFFFFF" />
      <Text style={styles.tabText}>Signal</Text>
    </Pressable>
  );
}

export function SignalChat() {
  const { colors, isDark } = useTheme();
  const { user, signalChatOpen, openSignalChat, closeSignalChat } = useApp();
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
      const pollingUrl = `${baseUrl}/ws/?EIO=4&transport=polling`;
      fetch(pollingUrl)
        .then(() => { setConnected(true); setConnecting(false); })
        .catch(() => { setConnected(false); setConnecting(false); });
    } catch {
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

    if (channel.id === 'ecosystem-general') {
      seedMessages.push(
        { id: '1', senderId: 'system', senderName: 'Signal', text: `Welcome to the Ecosystem Hub. Messages here reach all connected apps across the DarkWave ecosystem.`, timestamp: formatTime(new Date(Date.now() - 7200000)), isOwn: false, channel: channel.id, sourceApp: 'darkwave' },
        { id: '2', senderId: 'pp-admin', senderName: 'Marcus Chen', text: 'PaintPros Q1 numbers are in. Three new franchise partners onboarded this month. Syncing lead data across verticals now.', timestamp: formatTime(new Date(Date.now() - 3600000)), isOwn: false, channel: channel.id, sourceApp: 'paintpros' },
        { id: '3', senderId: 'jennifer', senderName: 'Jennifer Lambert', text: 'Great news. TrustHome is seeing strong referral traffic from the PaintPros network. 12 pre-qualified leads this week.', timestamp: formatTime(new Date(Date.now() - 1800000)), isOwn: false, channel: channel.id, sourceApp: 'trusthome' },
        { id: '4', senderId: 'ts-ops', senderName: 'Alex Rivera', text: 'TrustShield security audit complete across all verticals. All endpoints passed. Full report in the dashboard.', timestamp: formatTime(new Date(Date.now() - 900000)), isOwn: false, channel: channel.id, sourceApp: 'trustshield' },
      );
    } else if (channel.id === 'ecosystem-ops') {
      seedMessages.push(
        { id: '5', senderId: 'system', senderName: 'Signal', text: `Cross-vertical operations coordination. Discuss workflows that span multiple ecosystem apps.`, timestamp: formatTime(new Date(Date.now() - 10800000)), isOwn: false, channel: channel.id, sourceApp: 'darkwave' },
        { id: '6', senderId: 'pp-admin', senderName: 'Marcus Chen', text: 'When a PaintPros job completes on a listed property, can we auto-update the TrustHome listing photos? Would streamline the pipeline.', timestamp: formatTime(new Date(Date.now() - 5400000)), isOwn: false, channel: channel.id, sourceApp: 'paintpros' },
        { id: '7', senderId: 'jennifer', senderName: 'Jennifer Lambert', text: 'Love that idea. We already have the property ID link. I will open a feature request on the integration board.', timestamp: formatTime(new Date(Date.now() - 4800000)), isOwn: false, channel: channel.id, sourceApp: 'trusthome' },
      );
    } else if (channel.id === 'ecosystem-trust') {
      seedMessages.push(
        { id: '8', senderId: 'system', senderName: 'Signal', text: `Trust Layer channel. Blockchain verification events, trust score updates, and DWTL notifications across the ecosystem.`, timestamp: formatTime(new Date(Date.now() - 14400000)), isOwn: false, channel: channel.id, sourceApp: 'darkwave' },
        { id: '9', senderId: 'dwtl-bot', senderName: 'DWTL Verifier', text: 'Trust score updated: Jennifer Lambert - Real Estate License verified on-chain. Score: 94/100.', timestamp: formatTime(new Date(Date.now() - 7200000)), isOwn: false, channel: channel.id, sourceApp: 'darkwave' },
        { id: '10', senderId: 'ts-ops', senderName: 'Alex Rivera', text: 'New TrustShield policy: All cross-ecosystem data transfers now require Trust Layer signature verification. Rolling out next week.', timestamp: formatTime(new Date(Date.now() - 3600000)), isOwn: false, channel: channel.id, sourceApp: 'trustshield' },
      );
    } else if (channel.id === 'th-transactions') {
      seedMessages.push(
        { id: '11', senderId: 'system', senderName: 'Signal', text: `TrustHome transaction updates and deal coordination.`, timestamp: formatTime(new Date(Date.now() - 10800000)), isOwn: false, channel: channel.id, sourceApp: 'trusthome' },
        { id: '12', senderId: 'jennifer', senderName: 'Jennifer Lambert', text: '1847 Oak Valley Dr - inspection report came back clean. Moving to appraisal phase. Title company confirmed for Friday.', timestamp: formatTime(new Date(Date.now() - 900000)), isOwn: false, channel: channel.id, sourceApp: 'trusthome' },
      );
    } else if (channel.id === 'th-leads') {
      seedMessages.push(
        { id: '13', senderId: 'system', senderName: 'Signal', text: `TrustHome lead coordination and pipeline updates.`, timestamp: formatTime(new Date(Date.now() - 7200000)), isOwn: false, channel: channel.id, sourceApp: 'trusthome' },
        { id: '14', senderId: 'pp-admin', senderName: 'Marcus Chen', text: 'Sending over a referral from a PaintPros client who is looking to sell after renovation. Pre-qualified, high intent.', timestamp: formatTime(new Date(Date.now() - 2700000)), isOwn: false, channel: channel.id, sourceApp: 'paintpros' },
      );
    } else if (channel.id === 'support') {
      seedMessages.push(
        { id: '15', senderId: 'system', senderName: 'Signal', text: `Ecosystem-wide support desk. Questions about any DarkWave app are handled here. TrustShield security team monitors 24/7.`, timestamp: formatTime(new Date(Date.now() - 18000000)), isOwn: false, channel: channel.id, sourceApp: 'trustshield' },
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
      sourceApp: 'trusthome',
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
  const ecosystemChannels = channels.filter(c => c.scope === 'ecosystem');
  const verticalChannels = channels.filter(c => c.scope === 'vertical');
  const totalUnread = channels.reduce((sum, c) => sum + c.unread, 0);

  if (!signalChatOpen) {
    return (
      <View style={{ position: 'absolute', right: 0, top: '35%', zIndex: 50 }}>
        <SignalTab onPress={openSignalChat} />
        {totalUnread > 0 && (
          <View style={styles.tabUnread}>
            <Text style={styles.tabUnreadText}>{totalUnread}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={closeSignalChat} />
      <View style={[styles.panel, { width: PANEL_WIDTH, backgroundColor: colors.background, borderLeftColor: colors.border }]}>
        <View style={[styles.panelHeader, { paddingTop: topPadding + 8, backgroundColor: '#3A76F0' }]}>
          <View style={styles.panelHeaderRow}>
            <View style={styles.panelTitleRow}>
              {viewState === 'chat' ? (
                <Pressable onPress={() => setViewState('channels')} style={styles.headerBackBtn} testID="signal-back-btn">
                  <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </Pressable>
              ) : (
                <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.panelTitle}>
                  {viewState === 'chat' && activeChannel ? `#${activeChannel.name}` : 'Signal'}
                </Text>
                <Text style={styles.panelSubtitle} numberOfLines={1}>
                  {viewState === 'chat' && activeChannel
                    ? activeChannel.description
                    : connected ? 'Connected - DarkWave Ecosystem' : 'Cross-Ecosystem Messaging'}
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
            <Text style={[styles.statusText, { color: '#FFA500' }]}>Connecting to ecosystem...</Text>
          </View>
        )}

        {connected && viewState === 'channels' && (
          <View style={[styles.connectedApps, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.connectedLabel, { color: colors.textTertiary }]}>CONNECTED APPS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appRow}>
              {ECOSYSTEM_APPS.map(app => (
                <View key={app.id} style={[styles.appChip, { backgroundColor: app.color + '12', borderColor: app.color + '30' }]}>
                  <Ionicons name={app.icon} size={14} color={app.color} />
                  <Text style={[styles.appChipText, { color: app.color }]}>{app.name}</Text>
                  <View style={[styles.appDot, { backgroundColor: '#2ECC71' }]} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {viewState === 'channels' ? (
          <ScrollView style={styles.channelList} contentContainerStyle={styles.channelListContent} showsVerticalScrollIndicator={false}>
            <View style={styles.channelSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="globe-outline" size={13} color={colors.textTertiary} />
                <Text style={[styles.channelSectionTitle, { color: colors.textSecondary }]}>ECOSYSTEM CHANNELS</Text>
              </View>
              {ecosystemChannels.map(channel => (
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
              <View style={styles.sectionHeader}>
                <Ionicons name="home-outline" size={13} color="#1A8A7E" />
                <Text style={[styles.channelSectionTitle, { color: colors.textSecondary }]}>TRUSTHOME</Text>
              </View>
              {verticalChannels.map(channel => (
                <Pressable
                  key={channel.id}
                  style={[styles.channelItem, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary }]}
                  onPress={() => openChannel(channel)}
                  testID={`channel-${channel.id}`}
                >
                  <View style={[styles.channelIconWrap, { backgroundColor: '#1A8A7E' + '18' }]}>
                    <Ionicons name={channel.icon} size={20} color="#1A8A7E" />
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
              <View style={styles.sectionHeader}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.textTertiary} />
                <Text style={[styles.channelSectionTitle, { color: colors.textSecondary }]}>DIRECT MESSAGES</Text>
              </View>
              <View style={[styles.dmPlaceholder, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, borderColor: colors.border }]}>
                <Ionicons name="lock-closed" size={18} color={colors.textTertiary} />
                <Text style={[styles.dmPlaceholderText, { color: colors.textSecondary }]}>
                  E2E encrypted DMs across all ecosystem apps - coming soon
                </Text>
              </View>
            </View>

            <View style={styles.ecosystemInfo}>
              <View style={[styles.ecosystemBadge, { backgroundColor: isDark ? colors.surface : '#F8F9FA', borderColor: colors.border }]}>
                <Ionicons name="flash" size={14} color="#3A76F0" />
                <Text style={[styles.ecosystemText, { color: colors.textSecondary }]}>
                  Powered by PaintPros.io Signal Protocol
                </Text>
              </View>
              <View style={[styles.ecosystemBadge, { backgroundColor: isDark ? colors.surface : '#F8F9FA', borderColor: colors.border, marginTop: 6 }]}>
                <Ionicons name="shield-checkmark" size={14} color="#6C5CE7" />
                <Text style={[styles.ecosystemText, { color: colors.textSecondary }]}>
                  Secured by TrustShield - darkwavestudios.io
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
                        ? (isDark ? colors.primaryLight : '#3A76F0' + '08')
                        : (isDark ? colors.surface : colors.backgroundTertiary),
                  },
                ]}>
                  {!msg.isOwn && msg.senderId !== 'system' && (
                    <View style={styles.senderRow}>
                      <Text style={[styles.senderName, { color: getAppMeta(msg.sourceApp)?.color || '#3A76F0' }]}>{msg.senderName}</Text>
                      {msg.sourceApp && <AppBadge appId={msg.sourceApp} />}
                    </View>
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
                  <View style={styles.msgFooter}>
                    {msg.isOwn && msg.sourceApp && <AppBadge appId={msg.sourceApp} />}
                    <Text style={[styles.msgTime, {
                      color: msg.isOwn ? 'rgba(255,255,255,0.6)' : colors.textTertiary
                    }]}>{msg.timestamp}</Text>
                  </View>
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
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    alignItems: 'center',
    gap: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
      android: { elevation: 6 },
      web: { shadowColor: '#000', shadowOffset: { width: -2, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6 },
    }),
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
  },
  tabUnread: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#FF3B30',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabUnreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800' as const,
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
  connectedApps: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  connectedLabel: {
    fontSize: 9,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  appRow: {
    flexDirection: 'row',
    gap: 6,
  },
  appChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  appChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  appDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  channelSectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.8,
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
    fontWeight: '500' as const,
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
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700' as const,
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
  msgFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
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
