import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(340, SCREEN_WIDTH * 0.88);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const AGENT_WELCOME = "Hi Jennifer! I'm your TrustHome AI assistant. I can help you with:\n\n- Transaction management and deadlines\n- Lead scoring and follow-up suggestions\n- Marketing content ideas\n- Scheduling optimization\n- Market analysis and pricing\n- Contract and document questions\n\nWhat can I help you with?";

const CLIENT_WELCOME = "Hi Sarah! I'm here to help you through your home buying journey. I can help with:\n\n- Understanding your transaction timeline\n- Explaining documents you need to sign\n- Mortgage terms and calculations\n- What to expect at each stage\n- Scheduling questions\n- General real estate questions\n\nHow can I help you today?";

const AGENT_RESPONSES: Record<string, string> = {
  'lead': "Based on your current pipeline, I'd recommend prioritizing Amanda Chen - she has a 92 lead score, visited the open house yesterday, and is pre-approved for $400K-$500K. I'd suggest scheduling a showing for this week while her interest is high.\n\nYour other hot leads (David Park and Jennifer Cole) also need follow-ups within the next 48 hours.",
  'schedule': "Your schedule for tomorrow:\n\n10:00 AM - Showing at 1847 Oak Valley Dr with Sarah M.\n11:30 AM - Showing at 302 Elm Park Ct with Sarah M.\n1:00 PM - Listing Appointment at 890 Magnolia Way with Robert K.\n3:30 PM - Open House at 445 Sunset Blvd\n\nI notice you have back-to-back showings in the morning. The properties are 12 minutes apart, so you should have enough time. Want me to send a reminder to Sarah?",
  'market': "Here's a quick market snapshot for your area:\n\nMedian Sale Price: $425,000 (up 3.2% YoY)\nAvg Days on Market: 28 days (down from 35)\nInventory: 342 active listings (down 12%)\nList-to-Sale Ratio: 98.4%\n\nThe market is favoring sellers right now. For your listing at 890 Magnolia Way ($580K), I'd suggest pricing at $575K to generate multiple offers given the low inventory.",
  'deadline': "You have 3 urgent deadlines:\n\n1. Inspection deadline TOMORROW - 2205 Birch Creek Ln (Amanda Chen). The inspector report needs to be reviewed and the inspection contingency response is due.\n\n2. Contract signature needed - Sarah Mitchell's purchase agreement at 1847 Oak Valley Dr. This has been pending for 2 days.\n\n3. Pre-approval expiring in 3 days - Mike Torres. He needs to submit his updated income documentation to the lender.",
  'default': "I can help with that! Let me look into it for you.\n\nIn the full version, I'll be connected to your CRM, calendar, MLS data, and transaction management system to give you real-time insights and recommendations.\n\nIs there anything specific about your deals, leads, or schedule I can help with right now?",
};

const CLIENT_RESPONSES: Record<string, string> = {
  'inspection': "Great question! The home inspection is a key step in your purchase. Here's what to expect:\n\nYour inspection at 1847 Oak Valley Dr is scheduled for this week. The inspector will spend 2-4 hours examining the property's structure, systems, and condition.\n\nAfter the inspection, you'll receive a detailed report. Jennifer will help you review it and decide if you want to:\n- Proceed as-is\n- Request repairs from the seller\n- Renegotiate the price\n- Walk away (using your inspection contingency)\n\nYou have until Feb 12 to respond after receiving the report.",
  'mortgage': "Here's a quick breakdown of your mortgage terms:\n\nLoan Amount: ~$340,000 (after 20% down on $425,000)\nEstimated Rate: 6.5% (30-year fixed)\nMonthly Payment: ~$2,149 (principal + interest)\nProperty Tax: ~$354/month\nInsurance: ~$125/month\nTotal Monthly: ~$2,628\n\nYour pre-approval is good through March 1st. Want me to calculate payments for a different price or down payment amount?",
  'timeline': "Here's where you are in your home buying journey:\n\nCompleted:\n- Pre-Approval\n- Home Search\n- Offer (accepted!)\n\nCurrent Stage:\n- Under Contract at 1847 Oak Valley Dr\n\nComing Up:\n- Inspection (this week)\n- Appraisal (expected next week)\n- Final Walk-through\n- Closing (estimated Feb 28)\n\nThe biggest upcoming milestone is the inspection. Jennifer will guide you through the results.",
  'default': "That's a great question! In the full version, I'll be able to pull up your specific transaction details, documents, and timeline to give you a detailed answer.\n\nFor now, I can help explain general real estate concepts, walk you through what to expect at each stage, or help with mortgage calculations.\n\nWhat would you like to know more about?",
};

function getResponse(text: string, isAgent: boolean): string {
  const lower = text.toLowerCase();
  const responses = isAgent ? AGENT_RESPONSES : CLIENT_RESPONSES;

  if (isAgent) {
    if (lower.includes('lead') || lower.includes('follow') || lower.includes('prospect')) return responses['lead'];
    if (lower.includes('schedule') || lower.includes('calendar') || lower.includes('tomorrow') || lower.includes('today')) return responses['schedule'];
    if (lower.includes('market') || lower.includes('price') || lower.includes('comp')) return responses['market'];
    if (lower.includes('deadline') || lower.includes('urgent') || lower.includes('due')) return responses['deadline'];
  } else {
    if (lower.includes('inspect')) return responses['inspection'];
    if (lower.includes('mortgage') || lower.includes('payment') || lower.includes('loan') || lower.includes('rate')) return responses['mortgage'];
    if (lower.includes('timeline') || lower.includes('stage') || lower.includes('status') || lower.includes('where')) return responses['timeline'];
  }
  return responses['default'];
}

function AiTab({ onPress }: { onPress: () => void }) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.tab, { backgroundColor: colors.primary }]} testID="ai-assistant-tab">
      <MaterialCommunityIcons name="robot" size={20} color="#FFFFFF" />
      <Text style={styles.tabText}>AI</Text>
    </Pressable>
  );
}

export function AiAssistant() {
  const { colors, isDark } = useTheme();
  const { currentRole, aiAssistantOpen, openAiAssistant, closeAiAssistant } = useApp();
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const isAgent = currentRole === 'agent';
  const welcomeMsg = isAgent ? AGENT_WELCOME : CLIENT_WELCOME;

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: welcomeMsg, timestamp: 'Now' },
  ]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
      timestamp: 'Now',
    };
    const response = getResponse(inputText, isAgent);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: response,
      timestamp: 'Now',
    };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

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
              {msg.role === 'assistant' ? (
                <View style={styles.aiHeader}>
                  <MaterialCommunityIcons name="robot" size={14} color={colors.primary} />
                  <Text style={[styles.aiLabel, { color: colors.primary }]}>TrustHome AI</Text>
                </View>
              ) : null}
              <Text style={[styles.messageText, { color: msg.role === 'user' ? '#FFFFFF' : colors.text }]}>{msg.text}</Text>
            </View>
          ))}

          {messages.length <= 1 ? (
            <View style={styles.quickPrompts}>
              <Text style={[styles.quickPromptsTitle, { color: colors.textSecondary }]}>Try asking:</Text>
              {quickPrompts.map((prompt, i) => (
                <Pressable key={i} onPress={() => { setInputText(prompt); }} style={[styles.quickPromptBtn, { borderColor: colors.border, backgroundColor: isDark ? colors.surface : colors.backgroundTertiary }]}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={[styles.quickPromptText, { color: colors.text }]}>{prompt}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
          <View style={[styles.inputRow, { borderTopColor: colors.divider, backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? colors.surface : colors.backgroundTertiary, color: colors.text, borderColor: colors.borderLight }]}
              placeholder={isAgent ? 'Ask about leads, schedule, deals...' : 'Ask about your transaction...'}
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: inputText.trim() ? 1 : 0.5 }]}>
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
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
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
});
