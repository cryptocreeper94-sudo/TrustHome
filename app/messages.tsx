import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';

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

const CONVERSATIONS: Conversation[] = [];

function ConversationCard({ convo, isExpanded, onToggle, colors, isDark }: {
  convo: Conversation;
  isExpanded: boolean;
  onToggle: () => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <GlassCard style={styles.convoCard} onPress={onToggle}>
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
}

export default function MessagesScreen() {
  const { colors, isDark } = useTheme();
  const [expandedConvo, setExpandedConvo] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  
  // New Message Modal State
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [msgType, setMsgType] = useState<'email' | 'sms'>('email');
  const [msgTo, setMsgTo] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mock compliance check (in reality, this would check the selected contact's DB record)
  const isSmsOptedIn = false;

  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);
  const unreadConversations = CONVERSATIONS.filter(c => c.unread > 0);
  const activeThreads = CONVERSATIONS.filter(c => c.unread > 0 || ['2m ago', '1h ago', '3h ago'].includes(c.timestamp));

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : colors.background }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header title="Messages" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)}  imageBanner={require('@/assets/images/guide-messages.jpg')} />} />

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <BentoGrid columns={3} gap={10}>
          <GlassCard compact style={styles.statCard}>
            <View style={styles.statInner}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{CONVERSATIONS.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
          </GlassCard>
          <GlassCard compact style={styles.statCard}>
            <View style={styles.statInner}>
              <Ionicons name="mail-unread-outline" size={20} color={totalUnread > 0 ? '#FF9500' : colors.primary} />
              <Text style={[styles.statValue, { color: totalUnread > 0 ? '#FF9500' : colors.text }]}>{totalUnread}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Unread</Text>
            </View>
          </GlassCard>
          <GlassCard compact style={styles.statCard}>
            <View style={styles.statInner}>
              <Ionicons name="pulse-outline" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{activeThreads.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active</Text>
            </View>
          </GlassCard>
        </BentoGrid>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
        <View style={styles.actionRow}>
          <GlassCard style={styles.actionCard} compact onPress={() => setShowNewMessage(true)}>
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
        </Animated.View>

        {totalUnread > 0 && (
          <View style={styles.unreadBanner}>
            <Text style={[styles.unreadBannerText, { color: colors.primary }]}>
              {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {unreadConversations.length > 0 && (
          <HorizontalCarousel title="Unread" itemWidth={180}>
            {unreadConversations.map(convo => (
              <GlassCard
                key={convo.id}
                compact
                style={styles.carouselCard}
                onPress={() => setExpandedConvo(expandedConvo === convo.id ? null : convo.id)}
              >
                <View style={styles.carouselInner}>
                  <View style={styles.carouselTop}>
                    <View style={[styles.carouselAvatar, { backgroundColor: convo.initialColor + '22' }]}>
                      <Text style={[styles.carouselAvatarText, { color: convo.initialColor }]}>{convo.initial}</Text>
                    </View>
                    <View style={[styles.carouselBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.carouselBadgeText}>{convo.unread}</Text>
                    </View>
                  </View>
                  <Text style={[styles.carouselName, { color: colors.text }]} numberOfLines={1}>{convo.name}</Text>
                  <Text style={[styles.carouselPreview, { color: colors.textSecondary }]} numberOfLines={2}>{convo.lastMessage}</Text>
                </View>
              </GlassCard>
            ))}
          </HorizontalCarousel>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(260)}>
        <AccordionSection
          title="Active Conversations"
          icon="chatbubbles"
          iconColor="#1A8A7E"
          badge={unreadConversations.length}
          defaultOpen={true}
        >
          {unreadConversations.map(convo => (
            <ConversationCard
              key={convo.id}
              convo={convo}
              isExpanded={expandedConvo === convo.id}
              onToggle={() => setExpandedConvo(expandedConvo === convo.id ? null : convo.id)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </AccordionSection>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(340)}>
        <AccordionSection
          title="All Messages"
          icon="mail"
          iconColor="#007AFF"
          badge={CONVERSATIONS.length}
          defaultOpen={true}
        >
          {CONVERSATIONS.map(convo => (
            <ConversationCard
              key={convo.id}
              convo={convo}
              isExpanded={expandedConvo === convo.id}
              onToggle={() => setExpandedConvo(expandedConvo === convo.id ? null : convo.id)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </AccordionSection>
        </Animated.View>

        <Footer />
      </ScrollView>

      {/* New Message Modal */}
      <Modal visible={showNewMessage} transparent animationType="fade" onRequestClose={() => setShowNewMessage(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Message</Text>
              <Pressable onPress={() => setShowNewMessage(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
              
              {/* Type Toggle */}
              <View style={[styles.typeToggleRow, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }]}>
                <Pressable 
                  style={[styles.typeToggleBtn, msgType === 'email' && { backgroundColor: colors.cardGlass, borderColor: colors.primary, borderWidth: 1 }]} 
                  onPress={() => setMsgType('email')}
                >
                  <Ionicons name="mail" size={16} color={msgType === 'email' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.typeToggleText, { color: msgType === 'email' ? colors.primary : colors.textSecondary }]}>Email</Text>
                </Pressable>
                <Pressable 
                  style={[styles.typeToggleBtn, msgType === 'sms' && { backgroundColor: colors.cardGlass, borderColor: colors.primary, borderWidth: 1 }]} 
                  onPress={() => setMsgType('sms')}
                >
                  <Ionicons name="chatbubble" size={16} color={msgType === 'sms' ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.typeToggleText, { color: msgType === 'sms' ? colors.primary : colors.textSecondary }]}>SMS</Text>
                </Pressable>
              </View>

              {/* SMS Compliance Warning */}
              {msgType === 'sms' && !isSmsOptedIn && (
                <View style={[styles.warningBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#FEF3C7', borderColor: '#FDE68A' }]}>
                  <View style={styles.warningHeader}>
                    <Ionicons name="warning" size={18} color="#D97706" />
                    <Text style={styles.warningTitle}>A2P 10DLC Compliance Required</Text>
                  </View>
                  <Text style={styles.warningText}>This contact has not opted-in to receive SMS messages. You must receive explicit consent before sending automated texts.</Text>
                  <Pressable style={styles.requestOptInBtn}>
                    <Ionicons name="paper-plane" size={14} color="#D97706" />
                    <Text style={styles.requestOptInText}>Send Opt-In Request via Email</Text>
                  </Pressable>
                </View>
              )}

              {/* Form Fields */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>To</Text>
                <TextInput 
                  style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} 
                  value={msgTo} 
                  onChangeText={setMsgTo} 
                  placeholder={msgType === 'email' ? "client@example.com" : "(555) 123-4567"} 
                  placeholderTextColor={colors.textTertiary} 
                />
              </View>

              {msgType === 'email' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject</Text>
                  <TextInput 
                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} 
                    value={msgSubject} 
                    onChangeText={setMsgSubject} 
                    placeholder="Property update..." 
                    placeholderTextColor={colors.textTertiary} 
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Message</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} 
                  value={msgBody} 
                  onChangeText={setMsgBody} 
                  placeholder="Type your message here..." 
                  placeholderTextColor={colors.textTertiary} 
                  multiline 
                  numberOfLines={4} 
                  textAlignVertical="top"
                />
              </View>

            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.divider }]}>
              <Pressable style={[styles.modalBtn, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]} onPress={() => setShowNewMessage(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, { backgroundColor: colors.primary, opacity: (msgType === 'sms' && !isSmsOptedIn) ? 0.5 : 1 }]} 
                disabled={isSending || (msgType === 'sms' && !isSmsOptedIn)}
                onPress={() => {
                  setIsSending(true);
                  setTimeout(() => {
                    setIsSending(false);
                    setShowNewMessage(false);
                    setMsgTo(''); setMsgSubject(''); setMsgBody('');
                  }, 1000);
                }}
              >
                {isSending ? <ActivityIndicator color="#FFF" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="send" size={14} color="#FFF" />
                    <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Send</Text>
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
  statInner: { alignItems: 'center' as const, justifyContent: 'center' as const, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' as const },
  statLabel: { fontSize: 11, fontWeight: '500' as const },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 12 },
  actionCard: { minHeight: 56 },
  actionInner: { flexDirection: 'row', alignItems: 'center' as const, gap: 8 },
  actionText: { fontSize: 14, fontWeight: '600' as const },
  unreadBanner: { marginBottom: 12, paddingLeft: 4 },
  unreadBannerText: { fontSize: 13, fontWeight: '600' as const },
  carouselCard: { width: 180, minHeight: 120 },
  carouselInner: { gap: 6 },
  carouselTop: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const },
  carouselAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center' as const, justifyContent: 'center' as const },
  carouselAvatarText: { fontSize: 15, fontWeight: '700' as const },
  carouselBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const },
  carouselBadgeText: { fontSize: 10, fontWeight: '700' as const, color: '#FFF' },
  carouselName: { fontSize: 13, fontWeight: '600' as const },
  carouselPreview: { fontSize: 11, lineHeight: 15 },
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
  replyBtn: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, minHeight: 44, justifyContent: 'center' as const },
  replyBtnText: { fontSize: 12, fontWeight: '600' as const },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, borderWidth: 1, maxHeight: '85%', overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: '700' as const },
  modalClose: { padding: 4 },
  modalBody: { padding: 16 },
  typeToggleRow: { flexDirection: 'row', padding: 4, borderRadius: 12, marginBottom: 20 },
  typeToggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6, borderWidth: 1, borderColor: 'transparent' },
  typeToggleText: { fontSize: 14, fontWeight: '600' as const },
  warningBox: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  warningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  warningTitle: { fontSize: 14, fontWeight: '700' as const, color: '#D97706' },
  warningText: { fontSize: 13, color: '#92400E', lineHeight: 18, marginBottom: 12 },
  requestOptInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(217,119,6,0.15)', paddingVertical: 10, borderRadius: 8 },
  requestOptInText: { fontSize: 13, fontWeight: '600' as const, color: '#D97706' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '500' as const, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 15 },
  textArea: { minHeight: 120 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, padding: 16, borderTopWidth: 1 },
  modalBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, minWidth: 100, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontWeight: '600' as const, fontSize: 14 },
});
