import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, Platform, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { SampleDataBanner } from '@/components/ui/SampleDataBanner';
import { apiRequest, getQueryFn } from '@/lib/query-client';
import { apiErrorMessage, timeAgo } from '@/lib/tenant-api';

interface Thread {
  id: string;
  myRole: 'agent' | 'client';
  name: string;
  clientName: string;
  clientEmail: string | null;
  context: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  mine: boolean;
  readAt: string | null;
}

interface ThreadDetail {
  thread: { id: string; clientName: string; context: string | null };
  myRole: 'agent' | 'client';
  messages: ChatMessage[];
}

const AVATAR_COLORS = ['#1A8A7E', '#007AFF', '#AF52DE', '#FF9500', '#FF2D55', '#34C759', '#5856D6'];
const colorFor = (s: string) => AVATAR_COLORS[Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];
const initialsFor = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const SAMPLE_THREADS: Thread[] = [
  { id: 's1', myRole: 'agent', name: 'Sarah Mitchell', clientName: 'Sarah Mitchell', clientEmail: 'sarah@example.com', context: '123 Oak Street', lastMessage: 'Can we see it again Saturday morning?', lastMessageAt: minsAgo(4), unread: 2 },
  { id: 's2', myRole: 'agent', name: 'David Chen', clientName: 'David Chen', clientEmail: 'david@example.com', context: 'Pre-approval', lastMessage: 'Lender just sent the updated letter.', lastMessageAt: minsAgo(75), unread: 1 },
  { id: 's3', myRole: 'agent', name: 'The Johnsons', clientName: 'The Johnsons', clientEmail: 'johnsons@example.com', context: '48 Maple Drive', lastMessage: 'Thanks! We signed the disclosure.', lastMessageAt: minsAgo(60 * 26), unread: 0 },
];

const SAMPLE_MESSAGES: Record<string, ChatMessage[]> = {
  s1: [
    { id: 'a', body: 'Hi Sarah, the sellers accepted the showing request.', createdAt: minsAgo(40), mine: true, readAt: minsAgo(30) },
    { id: 'b', body: 'Great news! We loved the backyard.', createdAt: minsAgo(10), mine: false, readAt: null },
    { id: 'c', body: 'Can we see it again Saturday morning?', createdAt: minsAgo(4), mine: false, readAt: null },
  ],
  s2: [
    { id: 'a', body: 'Lender just sent the updated letter.', createdAt: minsAgo(75), mine: false, readAt: null },
  ],
  s3: [
    { id: 'a', body: 'The seller disclosure is ready for your signature.', createdAt: minsAgo(60 * 28), mine: true, readAt: minsAgo(60 * 27) },
    { id: 'b', body: 'Thanks! We signed the disclosure.', createdAt: minsAgo(60 * 26), mine: false, readAt: minsAgo(60 * 25) },
  ],
};

function confirmAction(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]),
  );
}

function ThreadCard({ thread, onPress, colors }: { thread: Thread; onPress: () => void; colors: any }) {
  const tint = colorFor(thread.name);
  return (
    <GlassCard style={styles.convoCard} onPress={onPress}>
      <View style={styles.convoRow}>
        <View style={[styles.avatar, { backgroundColor: tint + '22' }]}>
          <Text style={[styles.avatarText, { color: tint }]}>{initialsFor(thread.name)}</Text>
        </View>
        <View style={styles.convoInfo}>
          <View style={styles.convoTopRow}>
            <Text style={[styles.convoName, { color: colors.text }]} numberOfLines={1}>{thread.name}</Text>
            <Text style={[styles.convoTime, { color: colors.textTertiary }]}>{timeAgo(thread.lastMessageAt)}</Text>
          </View>
          {thread.context ? (
            <View style={styles.contextRow}>
              <Ionicons name="link-outline" size={11} color={colors.primary} />
              <Text style={[styles.contextText, { color: colors.primary }]} numberOfLines={1}>{thread.context}</Text>
            </View>
          ) : null}
          <Text style={[styles.convoPreview, { color: colors.textSecondary }]} numberOfLines={1}>
            {thread.lastMessage || 'No messages yet'}
          </Text>
        </View>
        {thread.unread > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primaryAction }]}>
            <Text style={styles.unreadText}>{thread.unread}</Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

export default function MessagesScreen() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, demoMode, browseMode, isRealAgent } = useApp();
  const qc = useQueryClient();
  const live = isAuthenticated && !demoMode && !browseMode;

  const [showHelp, setShowHelp] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const [sampleNotice, setSampleNotice] = useState(false);

  // New conversation modal
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newContext, setNewContext] = useState('');
  const [newBody, setNewBody] = useState('');
  const [creating, setCreating] = useState(false);
  const [newError, setNewError] = useState('');

  const threadsQuery = useQuery<Thread[] | null>({
    queryKey: ['/api/threads'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: live,
    refetchInterval: live ? 10_000 : false,
    staleTime: 5_000,
  });

  const detailQuery = useQuery<ThreadDetail | null>({
    queryKey: ['/api/threads', openThreadId ?? '', 'messages'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: live && !!openThreadId,
    refetchInterval: live && openThreadId ? 4_000 : false,
    staleTime: 0,
  });

  const threads: Thread[] = live ? (Array.isArray(threadsQuery.data) ? threadsQuery.data : []) : SAMPLE_THREADS;
  const visibleThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) =>
      [t.name, t.context, t.lastMessage, t.clientEmail].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [threads, search]);

  const totalUnread = threads.reduce((sum, t) => sum + (t.unread || 0), 0);
  const unreadThreads = visibleThreads.filter((t) => t.unread > 0);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const activeCount = threads.filter((t) => new Date(t.lastMessageAt).getTime() > weekAgo).length;

  const openThread = threads.find((t) => t.id === openThreadId) || null;
  const chatMessages: ChatMessage[] = live
    ? detailQuery.data?.messages ?? []
    : (openThreadId ? SAMPLE_MESSAGES[openThreadId] ?? [] : []);

  // Opening a thread marks it read on the server; refresh the list badge.
  const openUnread = openThread?.unread ?? 0;
  useEffect(() => {
    if (live && openThreadId && detailQuery.dataUpdatedAt && openUnread > 0) {
      qc.invalidateQueries({ queryKey: ['/api/threads'], exact: true });
    }
  }, [live, openThreadId, detailQuery.dataUpdatedAt, openUnread, qc]);

  const chatScrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    const t = setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [chatMessages.length, openThreadId]);

  const openChat = (id: string) => {
    setChatError('');
    setDraft('');
    setOpenThreadId(id);
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || !openThreadId) return;
    if (!live) {
      setChatError('This is sample data. Sign in to message your real clients.');
      return;
    }
    setSending(true);
    setChatError('');
    try {
      await apiRequest('POST', `/api/threads/${openThreadId}/messages`, { body });
      setDraft('');
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['/api/threads', openThreadId, 'messages'] }),
        qc.invalidateQueries({ queryKey: ['/api/threads'] }),
      ]);
    } catch (e) {
      setChatError(apiErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const deleteThread = async () => {
    if (!live || !openThread || openThread.myRole !== 'agent') return;
    const ok = await confirmAction('Delete conversation?', `All messages with ${openThread.name} will be removed for both of you.`);
    if (!ok) return;
    try {
      await apiRequest('DELETE', `/api/threads/${openThread.id}`);
      setOpenThreadId(null);
      qc.invalidateQueries({ queryKey: ['/api/threads'] });
    } catch (e) {
      setChatError(apiErrorMessage(e));
    }
  };

  const startNew = () => {
    if (!live) { setSampleNotice(true); return; }
    setNewName(''); setNewEmail(''); setNewContext(''); setNewBody(''); setNewError('');
    setShowNew(true);
  };

  const createThread = async () => {
    setNewError('');
    if (!newName.trim()) { setNewError('Client name is required.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(newEmail.trim())) { setNewError('Enter a valid client email.'); return; }
    setCreating(true);
    try {
      const res = await apiRequest('POST', '/api/threads', {
        clientName: newName.trim(),
        clientEmail: newEmail.trim(),
        context: newContext.trim() || undefined,
        message: newBody.trim() || undefined,
      });
      const thread = await res.json();
      await qc.invalidateQueries({ queryKey: ['/api/threads'] });
      setShowNew(false);
      if (thread?.id) openChat(thread.id);
    } catch (e) {
      setNewError(apiErrorMessage(e));
    } finally {
      setCreating(false);
    }
  };

  const inputStyle = [styles.input, {
    color: colors.text, borderColor: colors.border,
    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
  }];

  const subtitle = live && !isRealAgent ? 'Conversations with your agent' : 'Client conversations in one place';

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          imageBanner={require('@/assets/images/guide-messages.jpg')}
          title="Messages"
          subtitle={subtitle}
          showBack
          rightAction={<InfoButton onPress={() => setShowHelp(true)} />}
        />

        <SampleDataBanner live={live} count={live ? threads.length : undefined} noun="conversations" />

        {sampleNotice && !live && (
          <View style={[styles.errorBox, { marginBottom: 8 }]}>
            <Ionicons name="information-circle" size={16} color="#FF9500" />
            <Text style={[styles.errorText, { color: '#FF9500' }]}>Sign in to your agent account to start real conversations.</Text>
          </View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <BentoGrid columns={3} gap={10}>
            {[
              { label: 'Total', value: threads.length, icon: 'chatbubbles-outline' as const, color: colors.primary },
              { label: 'Unread', value: totalUnread, icon: 'mail-unread-outline' as const, color: totalUnread > 0 ? '#FF9500' : colors.primary },
              { label: 'Active 7d', value: activeCount, icon: 'pulse-outline' as const, color: colors.primary },
            ].map((s) => (
              <GlassCard key={s.label} compact style={styles.statCard}>
                <View style={styles.statInner}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                  <Text style={[styles.statValue, { color: s.label === 'Unread' && totalUnread > 0 ? '#FF9500' : colors.text }]}>{s.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
                </View>
              </GlassCard>
            ))}
          </BentoGrid>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)}>
          <View style={styles.actionRow}>
            {(!live || isRealAgent) && (
              <GlassCard style={styles.actionCard} compact onPress={startNew} testID="messages-new-btn">
                <View style={styles.actionInner}>
                  <Ionicons name="create-outline" size={20} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.text }]}>New Conversation</Text>
                </View>
              </GlassCard>
            )}
            <GlassCard style={styles.actionCard} compact onPress={() => setSearchVisible(!searchVisible)} testID="messages-search-btn">
              <View style={styles.actionInner}>
                <Ionicons name="search-outline" size={20} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>Search</Text>
              </View>
            </GlassCard>
          </View>
          {searchVisible && (
            <TextInput
              testID="messages-search-input"
              style={[inputStyle, { marginBottom: 12 }]}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by name, property or message"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
          )}
        </Animated.View>

        {live && threadsQuery.isLoading && <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />}

        {unreadThreads.length > 0 && (
          <HorizontalCarousel title="Unread" itemWidth={180}>
            {unreadThreads.map((t) => {
              const tint = colorFor(t.name);
              return (
                <GlassCard key={t.id} compact style={styles.carouselCard} onPress={() => openChat(t.id)}>
                  <View style={styles.carouselInner}>
                    <View style={styles.carouselTop}>
                      <View style={[styles.carouselAvatar, { backgroundColor: tint + '22' }]}>
                        <Text style={[styles.carouselAvatarText, { color: tint }]}>{initialsFor(t.name)}</Text>
                      </View>
                      <View style={[styles.carouselBadge, { backgroundColor: colors.primaryAction }]}>
                        <Text style={styles.carouselBadgeText}>{t.unread}</Text>
                      </View>
                    </View>
                    <Text style={[styles.carouselName, { color: colors.text }]} numberOfLines={1}>{t.name}</Text>
                    <Text style={[styles.carouselPreview, { color: colors.textSecondary }]} numberOfLines={2}>{t.lastMessage}</Text>
                  </View>
                </GlassCard>
              );
            })}
          </HorizontalCarousel>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
          <AccordionSection title="All Conversations" icon="chatbubbles" iconColor="#1A8A7E" badge={visibleThreads.length} defaultOpen>
            {visibleThreads.map((t) => (
              <ThreadCard key={t.id} thread={t} onPress={() => openChat(t.id)} colors={colors} />
            ))}
            {visibleThreads.length === 0 && !(live && threadsQuery.isLoading) && (
              <View style={styles.emptyInner}>
                <Ionicons name="chatbubble-ellipses-outline" size={34} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {search ? 'No matches' : 'No conversations yet'}
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {isRealAgent
                    ? 'Start a conversation with a client by email. When they sign in to TrustHome with that email, they\u2019ll see it here.'
                    : 'When your agent messages you, the conversation will appear here.'}
                </Text>
              </View>
            )}
          </AccordionSection>
        </Animated.View>

        <Footer />
      </ScrollView>

      {/* Conversation view */}
      <Modal visible={!!openThreadId} animationType="slide" onRequestClose={() => setOpenThreadId(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.chatRoot, { backgroundColor: isDark ? '#0B1021' : colors.background }]}
        >
          <View style={[styles.chatHeader, { borderBottomColor: colors.divider }]}>
            <Pressable onPress={() => setOpenThreadId(null)} style={styles.chatBack} testID="messages-chat-back">
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
              <Text style={[styles.chatBackText, { color: colors.primary }]}>Back</Text>
            </Pressable>
            <View style={styles.chatTitleWrap}>
              <Text style={[styles.chatTitle, { color: colors.text }]} numberOfLines={1}>{openThread?.name ?? 'Conversation'}</Text>
              {openThread?.context ? (
                <Text style={[styles.chatSub, { color: colors.textSecondary }]} numberOfLines={1}>{openThread.context}</Text>
              ) : null}
            </View>
            {live && openThread?.myRole === 'agent' ? (
              <Pressable onPress={deleteThread} style={styles.chatDelete} testID="messages-chat-delete">
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </Pressable>
            ) : <View style={styles.chatDelete} />}
          </View>

          <ScrollView ref={chatScrollRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {live && detailQuery.isLoading && <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />}
            {chatMessages.length === 0 && !(live && detailQuery.isLoading) && (
              <Text style={[styles.chatEmpty, { color: colors.textTertiary }]}>No messages yet. Say hello.</Text>
            )}
            {chatMessages.map((m) => (
              <View key={m.id} style={[styles.msgBubbleWrap, m.mine ? styles.msgRight : styles.msgLeft]}>
                <View style={[
                  styles.msgBubble,
                  m.mine ? { backgroundColor: colors.primaryAction } : { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary },
                ]}>
                  <Text selectable style={[styles.msgText, { color: m.mine ? '#FFF' : colors.text }]}>{m.body}</Text>
                  <Text style={[styles.msgTime, { color: m.mine ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
                    {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {m.mine ? (m.readAt ? ' \u00B7 Read' : ' \u00B7 Sent') : ''}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {chatError ? (
            <View style={[styles.errorBox, { marginHorizontal: 12 }]}>
              <Ionicons name="alert-circle" size={16} color="#FF3B30" />
              <Text style={styles.errorText}>{chatError}</Text>
            </View>
          ) : null}

          <View style={[styles.composer, { borderTopColor: colors.divider }]}>
            <TextInput
              testID="messages-composer-input"
              style={[inputStyle, styles.composerInput]}
              value={draft}
              onChangeText={setDraft}
              placeholder={live ? 'Write a message\u2026' : 'Sign in to send messages'}
              placeholderTextColor={colors.textTertiary}
              multiline
              onKeyPress={(e: any) => {
                if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                  e.preventDefault?.();
                  send();
                }
              }}
            />
            <Pressable
              testID="messages-send-btn"
              onPress={send}
              disabled={sending || !draft.trim()}
              style={[styles.sendBtn, { backgroundColor: colors.primaryAction, opacity: sending || !draft.trim() ? 0.5 : 1 }]}
            >
              {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="send" size={18} color="#FFF" />}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* New conversation */}
      <Modal visible={showNew} transparent animationType="fade" onRequestClose={() => setShowNew(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Conversation</Text>
              <Pressable onPress={() => setShowNew(false)} style={styles.modalClose} testID="messages-new-close">
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Client name</Text>
              <TextInput testID="messages-new-name" style={inputStyle} value={newName} onChangeText={setNewName}
                placeholder="Jane Smith" placeholderTextColor={colors.textTertiary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>Client email</Text>
              <TextInput testID="messages-new-email" style={inputStyle} value={newEmail} onChangeText={setNewEmail}
                placeholder="jane@example.com" placeholderTextColor={colors.textTertiary}
                keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              <Text style={[styles.helper, { color: colors.textTertiary }]}>
                Your client sees this conversation when they sign in to TrustHome with this email.
              </Text>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>About (optional)</Text>
              <TextInput testID="messages-new-context" style={inputStyle} value={newContext} onChangeText={setNewContext}
                placeholder="123 Oak Street" placeholderTextColor={colors.textTertiary} />
              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 14 }]}>First message (optional)</Text>
              <TextInput testID="messages-new-body" style={[inputStyle, styles.textArea]} value={newBody} onChangeText={setNewBody}
                placeholder="Type your message here\u2026" placeholderTextColor={colors.textTertiary} multiline textAlignVertical="top" />
              {newError ? (
                <View style={[styles.errorBox, { marginTop: 12 }]}>
                  <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                  <Text style={styles.errorText}>{newError}</Text>
                </View>
              ) : null}
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.divider }]}>
              <Pressable style={[styles.modalBtn, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]} onPress={() => setShowNew(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable testID="messages-new-submit" style={[styles.modalBtn, { backgroundColor: colors.primaryAction, opacity: creating ? 0.6 : 1 }]}
                disabled={creating} onPress={createThread}>
                {creating ? <ActivityIndicator color="#FFF" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="send" size={14} color="#FFF" />
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Start</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.messages.title}
        description={SCREEN_HELP.messages.description}
        details={SCREEN_HELP.messages.details}
        examples={SCREEN_HELP.messages.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  statCard: { minHeight: 80 },
  statInner: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 12 },
  actionCard: { minHeight: 56 },
  actionInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionText: { fontSize: 14, fontWeight: '600' },
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,59,48,0.1)' },
  errorText: { flex: 1, color: '#FF3B30', fontSize: 13 },
  carouselCard: { width: 180, minHeight: 120 },
  carouselInner: { gap: 6 },
  carouselTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  carouselAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  carouselAvatarText: { fontSize: 14, fontWeight: '700' },
  carouselBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  carouselBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  carouselName: { fontSize: 13, fontWeight: '600' },
  carouselPreview: { fontSize: 11, lineHeight: 15 },
  convoCard: { minHeight: 64, marginBottom: 8 },
  convoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700' },
  convoInfo: { flex: 1 },
  convoTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  convoName: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  convoTime: { fontSize: 11 },
  contextRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  contextText: { fontSize: 11, fontWeight: '500' },
  convoPreview: { fontSize: 13, marginTop: 2 },
  unreadBadge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  unreadText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  emptyInner: { alignItems: 'center', gap: 8, paddingVertical: 20, paddingHorizontal: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  chatRoot: { flex: 1, width: '100%', maxWidth: 1200, alignSelf: 'center' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: Platform.OS === 'ios' ? 54 : 14, paddingBottom: 12, borderBottomWidth: 1 },
  chatBack: { flexDirection: 'row', alignItems: 'center', minWidth: 72, minHeight: 44 },
  chatBackText: { fontSize: 15, fontWeight: '600' },
  chatTitleWrap: { flex: 1, alignItems: 'center' },
  chatTitle: { fontSize: 16, fontWeight: '700' },
  chatSub: { fontSize: 12, marginTop: 2 },
  chatDelete: { minWidth: 72, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 },
  chatScroll: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24 },
  chatEmpty: { textAlign: 'center', marginTop: 40, fontSize: 13 },
  msgBubbleWrap: { marginBottom: 8 },
  msgRight: { alignItems: 'flex-end' },
  msgLeft: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '80%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  msgText: { fontSize: 14, lineHeight: 19 },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1 },
  composerInput: { flex: 1, maxHeight: 120, minHeight: 44 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, borderWidth: 1, maxHeight: '85%', overflow: 'hidden', width: '100%', maxWidth: 520, alignSelf: 'center' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalClose: { padding: 4 },
  modalBody: { padding: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  textArea: { minHeight: 110 },
  helper: { fontSize: 11, marginTop: 6, lineHeight: 15 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 16, borderTopWidth: 1 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 100, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontWeight: '600', fontSize: 14 },
});
