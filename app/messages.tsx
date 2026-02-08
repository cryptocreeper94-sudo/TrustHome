import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
}

interface Conversation {
  id: string;
  name: string;
  initial: string;
  initialColor: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  context?: string;
  messages: Message[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: '1', name: 'Sarah Mitchell', initial: 'S', initialColor: '#FF3B30',
    lastMessage: 'Can we schedule a second showing for Saturday?',
    timestamp: '2m ago', unread: 2,
    context: 'Transaction: 1847 Oak Valley Dr',
    messages: [
      { id: 'm1', text: 'Hi Sarah, the seller accepted the inspection timeline.', sender: 'me', time: '10:15 AM' },
      { id: 'm2', text: 'That is great news! Thank you for pushing on that.', sender: 'them', time: '10:22 AM' },
      { id: 'm3', text: 'Can we schedule a second showing for Saturday?', sender: 'them', time: '10:24 AM' },
    ],
  },
  {
    id: '2', name: 'James Rivera', initial: 'J', initialColor: '#007AFF',
    lastMessage: 'I sent the pre-approval letter to your email.',
    timestamp: '1h ago', unread: 1,
    context: 'Transaction: 302 Maple Heights Blvd',
    messages: [
      { id: 'm1', text: 'James, do you have the updated pre-approval?', sender: 'me', time: '9:00 AM' },
      { id: 'm2', text: 'Yes, my lender just finalized it this morning.', sender: 'them', time: '9:45 AM' },
      { id: 'm3', text: 'I sent the pre-approval letter to your email.', sender: 'them', time: '9:47 AM' },
    ],
  },
  {
    id: '3', name: 'Lisa Thompson', initial: 'L', initialColor: '#34C759',
    lastMessage: 'The movers are confirmed for March 15th.',
    timestamp: '3h ago', unread: 0,
    context: 'Relocation from Denver',
    messages: [
      { id: 'm1', text: 'Lisa, any update on the moving timeline?', sender: 'me', time: '7:30 AM' },
      { id: 'm2', text: 'The movers are confirmed for March 15th.', sender: 'them', time: '8:10 AM' },
    ],
  },
  {
    id: '4', name: 'Mark & Diana Patel', initial: 'M', initialColor: '#AF52DE',
    lastMessage: 'We love the kitchen renovation! Let us think about the offer.',
    timestamp: 'Yesterday', unread: 0,
    context: 'Transaction: 410 Birch Creek Way',
    messages: [
      { id: 'm1', text: 'Here are the photos from today\u2019s showing.', sender: 'me', time: 'Yesterday 4:00 PM' },
      { id: 'm2', text: 'These look amazing, the backyard is perfect for the kids.', sender: 'them', time: 'Yesterday 5:12 PM' },
      { id: 'm3', text: 'We love the kitchen renovation! Let us think about the offer.', sender: 'them', time: 'Yesterday 5:15 PM' },
    ],
  },
  {
    id: '5', name: 'Rachel Nguyen', initial: 'R', initialColor: '#FF9500',
    lastMessage: 'Thank you for everything! We are so happy with the home.',
    timestamp: '2d ago', unread: 0,
    context: 'Closed: 88 Lakeview Estates',
    messages: [
      { id: 'm1', text: 'Congratulations Rachel! The closing is all finalized.', sender: 'me', time: 'Wed 11:00 AM' },
      { id: 'm2', text: 'Thank you for everything! We are so happy with the home.', sender: 'them', time: 'Wed 11:30 AM' },
    ],
  },
  {
    id: '6', name: 'David Okafor', initial: 'D', initialColor: '#1A8A7E',
    lastMessage: 'Are there any new listings in the Westside area?',
    timestamp: '3d ago', unread: 0,
    messages: [
      { id: 'm1', text: 'Hi David, welcome! I saw your inquiry about properties.', sender: 'me', time: 'Mon 2:00 PM' },
      { id: 'm2', text: 'Thanks! Yes, I am looking for a 3BR under $550K.', sender: 'them', time: 'Mon 3:15 PM' },
      { id: 'm3', text: 'Are there any new listings in the Westside area?', sender: 'them', time: 'Mon 3:16 PM' },
    ],
  },
  {
    id: '7', name: 'Emily Chen', initial: 'E', initialColor: '#E1306C',
    lastMessage: 'I have a few questions about the FHA loan process.',
    timestamp: '5d ago', unread: 0,
    context: 'First-time Buyer',
    messages: [
      { id: 'm1', text: 'Emily, I connected you with our preferred lender.', sender: 'me', time: 'Last Wed 10:00 AM' },
      { id: 'm2', text: 'I have a few questions about the FHA loan process.', sender: 'them', time: 'Last Wed 12:30 PM' },
    ],
  },
];

export default function MessagesScreen() {
  const { colors, isDark } = useTheme();
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Messages" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.actionRow}>
          <GlassCard style={styles.actionCard} compact onPress={() => {}}>
            <View style={styles.actionInner}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>New Message</Text>
            </View>
          </GlassCard>
          <GlassCard style={styles.actionCard} compact onPress={() => setSearchVisible(!searchVisible)}>
            <View style={styles.actionInner}>
              <Ionicons name="search-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.text }]}>Search</Text>
            </View>
          </GlassCard>
        </View>

        {totalUnread > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={[styles.unreadBannerText, { color: colors.primary }]}>
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {CONVERSATIONS.map(convo => {
          const isExpanded = expandedConvo === convo.id;
          return (
            <GlassCard key={convo.id} style={styles.convoCard} onPress={() => setExpandedConvo(isExpanded ? null : convo.id)}>
              <View style={styles.convoRow}>
                <View style={[styles.avatar, { backgroundColor: convo.initialColor + '22' }]}>
                  <Text style={[styles.avatarText, { color: convo.initialColor }]}>{convo.initial}</Text>
                </View>
                <View style={styles.convoInfo}>
                  <View style={styles.convoTopRow}>
                    <Text style={[styles.convoName, { color: colors.text }]} numberOfLines={1}>{convo.name}</Text>
                    <Text style={[styles.convoTime, { color: colors.textTertiary }]}>{convo.timestamp}</Text>
                  </View>
                  {convo.context && (
                    <View style={styles.contextRow}>
                      <Ionicons name="link-outline" size={11} color={colors.primary} />
                      <Text style={[styles.contextText, { color: colors.primary }]} numberOfLines={1}>{convo.context}</Text>
                    </View>
                  )}
                  <Text style={[styles.convoPreview, { color: colors.textSecondary }]} numberOfLines={1}>{convo.lastMessage}</Text>
                </View>
                {convo.unread > 0 && (
                  <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.unreadText}>{convo.unread}</Text>
                  </View>
                )}
              </View>

              {isExpanded && (
                <View style={[styles.messagesSection, { borderTopColor: colors.divider }]}>
                  {convo.messages.map(msg => (
                    <View key={msg.id} style={[styles.msgBubbleWrap, msg.sender === 'me' ? styles.msgRight : styles.msgLeft]}>
                      <View style={[
                        styles.msgBubble,
                        msg.sender === 'me'
                          ? { backgroundColor: colors.primary }
                          : { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary }
                      ]}>
                        <Text style={[styles.msgText, { color: msg.sender === 'me' ? '#FFF' : colors.text }]}>{msg.text}</Text>
                        <Text style={[styles.msgTime, { color: msg.sender === 'me' ? 'rgba(255,255,255,0.65)' : colors.textTertiary }]}>{msg.time}</Text>
                      </View>
                    </View>
                  ))}
                  <View style={styles.msgActions}>
                    <Pressable style={[styles.replyBtn, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="arrow-undo-outline" size={14} color={colors.primary} />
                      <Text style={[styles.replyBtnText, { color: colors.primary }]}>Reply</Text>
                    </Pressable>
                    <Pressable style={[styles.replyBtn, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="call-outline" size={14} color={colors.primary} />
                      <Text style={[styles.replyBtnText, { color: colors.primary }]}>Call</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </GlassCard>
          );
        })}

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 12 },
  actionCard: { minHeight: 56 },
  actionInner: { flexDirection: 'row', alignItems: 'center' as const, gap: 8 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
  unreadBanner: { marginBottom: 12, paddingLeft: 4 },
  unreadBannerText: { fontSize: 13, fontWeight: '600' as const },
  convoCard: { minHeight: 64, marginBottom: 8 },
  convoRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center' as const, justifyContent: 'center' as const },
  avatarText: { fontSize: 18, fontWeight: '700' as const },
  convoInfo: { flex: 1 },
  convoTopRow: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const },
  convoName: { fontSize: 15, fontWeight: '600' as const, flex: 1, marginRight: 8 },
  convoTime: { fontSize: 11 },
  contextRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 3, marginTop: 2 },
  contextText: { fontSize: 11, fontWeight: '500' as const },
  convoPreview: { fontSize: 13, marginTop: 2 },
  unreadBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center' as const, justifyContent: 'center' as const },
  unreadText: { fontSize: 11, fontWeight: '700' as const, color: '#FFF' },
  messagesSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  msgBubbleWrap: { marginBottom: 8 },
  msgRight: { alignItems: 'flex-end' as const },
  msgLeft: { alignItems: 'flex-start' as const },
  msgBubble: { maxWidth: '85%', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  msgText: { fontSize: 13, lineHeight: 18 },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' as const },
  msgActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  replyBtn: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  replyBtnText: { fontSize: 12, fontWeight: '600' as const },
});
