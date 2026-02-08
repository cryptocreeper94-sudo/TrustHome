import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';

const TABS = ['Overview', 'Content', 'Schedule', 'Analytics'] as const;
type Tab = typeof TABS[number];

interface ContentItem {
  id: string;
  type: 'Social Post' | 'Ad Copy' | 'Email';
  title: string;
  preview: string;
  platforms: string[];
  status: 'Published' | 'Scheduled' | 'Draft';
  date: string;
}

const CONTENT_ITEMS: ContentItem[] = [
  { id: '1', type: 'Social Post', title: 'New Listing Announcement', preview: 'Just listed! Stunning 4BR/3BA in Oakwood Estates. Open house this Saturday 1-4pm...', platforms: ['FB', 'IG'], status: 'Published', date: 'Feb 7' },
  { id: '2', type: 'Ad Copy', title: 'Spring Buyer Campaign', preview: 'Ready to find your dream home? Spring inventory is here. Contact us for exclusive previews...', platforms: ['FB', 'IG', 'X'], status: 'Scheduled', date: 'Feb 10' },
  { id: '3', type: 'Email', title: 'Monthly Market Update', preview: 'January market stats are in: median price up 4.2%, inventory down 12%. Here\'s what it means...', platforms: ['Email'], status: 'Draft', date: '' },
  { id: '4', type: 'Social Post', title: 'Client Testimonial', preview: '"Jennifer made our first home purchase seamless!" - The Martinez Family. Another happy client!', platforms: ['FB', 'IG'], status: 'Published', date: 'Feb 5' },
  { id: '5', type: 'Social Post', title: 'Home Staging Tips', preview: '5 budget-friendly staging tips that can increase your home\'s value by up to 10%...', platforms: ['IG', 'X'], status: 'Scheduled', date: 'Feb 12' },
  { id: '6', type: 'Ad Copy', title: 'Seller Lead Gen', preview: 'Thinking of selling? Get a free home valuation in 24 hours. Our AI-powered tool analyzes...', platforms: ['FB'], status: 'Draft', date: '' },
  { id: '7', type: 'Email', title: 'Open House Invite', preview: 'You\'re invited! Join us this weekend for exclusive open houses in the greater metro area...', platforms: ['Email'], status: 'Scheduled', date: 'Feb 14' },
];

const SCHEDULE_DATA = [
  { day: 'Mon', posts: [{ title: 'Market Update', time: '9:00 AM', platform: 'FB' }] },
  { day: 'Tue', posts: [] },
  { day: 'Wed', posts: [{ title: 'Listing Photos', time: '11:00 AM', platform: 'IG' }, { title: 'Blog Share', time: '3:00 PM', platform: 'X' }] },
  { day: 'Thu', posts: [{ title: 'Testimonial', time: '10:00 AM', platform: 'FB' }] },
  { day: 'Fri', posts: [] },
  { day: 'Sat', posts: [{ title: 'Open House', time: '8:00 AM', platform: 'FB' }, { title: 'Open House', time: '8:00 AM', platform: 'IG' }] },
  { day: 'Sun', posts: [{ title: 'Weekly Recap', time: '6:00 PM', platform: 'Email' }] },
];

const ANALYTICS_DATA = [
  { label: 'Impressions', value: 24850, max: 30000, color: '#1A8A7E' },
  { label: 'Reach', value: 12430, max: 30000, color: '#26A69A' },
  { label: 'Clicks', value: 1840, max: 30000, color: '#4DB6A8' },
  { label: 'Engagement', value: 3620, max: 30000, color: '#80CBC1' },
  { label: 'Shares', value: 890, max: 30000, color: '#B3E0DA' },
];

export default function MarketingScreen() {
  const { colors, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  const statusColor = (status: string) => {
    if (status === 'Published') return colors.success;
    if (status === 'Scheduled') return colors.info;
    return colors.warning;
  };

  const platformColor = (p: string) => {
    if (p === 'FB') return '#1877F2';
    if (p === 'IG') return '#E4405F';
    if (p === 'X') return isDark ? '#FFFFFF' : '#000000';
    return colors.primary;
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <GlassCard>
        <View style={styles.welcomeBanner}>
          <Ionicons name="megaphone" size={28} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>Marketing Hub</Text>
            <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>3 posts scheduled this week, 1 needs review</Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.statsRow}>
        {[
          { label: 'Posts This Week', value: '5', icon: 'document-text' as const },
          { label: 'Scheduled', value: '3', icon: 'time' as const },
          { label: 'Total Reach', value: '12.4K', icon: 'eye' as const },
          { label: 'Engagement', value: '4.8%', icon: 'trending-up' as const },
        ].map((stat, i) => (
          <GlassCard key={i} compact style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </GlassCard>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Suggested Post</Text>
      <GlassCard>
        <View style={styles.suggestedPost}>
          <View style={styles.suggestedHeader}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>JL</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.suggestedName, { color: colors.text }]}>Jennifer Lambert</Text>
              <Text style={[styles.suggestedHandle, { color: colors.textSecondary }]}>Lambert Realty Group</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.info + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.info }]}>AI Generated</Text>
            </View>
          </View>
          <Text style={[styles.suggestedBody, { color: colors.text }]}>
            Spring is the perfect time to sell! Our latest market analysis shows prices up 4.2% in your neighborhood. Curious about your home's value? Send me a DM for a free, no-obligation assessment.
          </Text>
          <View style={styles.suggestedPlatforms}>
            {['FB', 'IG'].map(p => (
              <View key={p} style={[styles.platformPill, { backgroundColor: platformColor(p) + '20' }]}>
                <Text style={[styles.platformPillText, { color: platformColor(p) }]}>{p}</Text>
              </View>
            ))}
          </View>
          <View style={styles.suggestedActions}>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="send" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Post Now</Text>
            </Pressable>
            <Pressable style={[styles.actionBtnOutline, { borderColor: colors.border }]}>
              <Ionicons name="create-outline" size={16} color={colors.text} />
              <Text style={[styles.actionBtnOutlineText, { color: colors.text }]}>Edit</Text>
            </Pressable>
            <Pressable style={[styles.actionBtnOutline, { borderColor: colors.border }]}>
              <Ionicons name="time-outline" size={16} color={colors.text} />
              <Text style={[styles.actionBtnOutlineText, { color: colors.text }]}>Schedule</Text>
            </Pressable>
          </View>
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Content Library</Text>
      <GlassCard>
        <View style={styles.libraryRow}>
          <View style={styles.libraryItem}>
            <Ionicons name="image" size={24} color={colors.primary} />
            <Text style={[styles.libraryValue, { color: colors.text }]}>47</Text>
            <Text style={[styles.libraryLabel, { color: colors.textSecondary }]}>Images</Text>
          </View>
          <View style={[styles.libraryDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.libraryItem}>
            <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
            <Text style={[styles.libraryValue, { color: colors.text }]}>23</Text>
            <Text style={[styles.libraryLabel, { color: colors.textSecondary }]}>Templates</Text>
          </View>
          <View style={[styles.libraryDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.libraryItem}>
            <Ionicons name="videocam" size={24} color={colors.primary} />
            <Text style={[styles.libraryValue, { color: colors.text }]}>8</Text>
            <Text style={[styles.libraryLabel, { color: colors.textSecondary }]}>Videos</Text>
          </View>
        </View>
      </GlassCard>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Autopilot Status</Text>
      <GlassCard>
        <View style={styles.autopilotRow}>
          <View style={styles.autopilotItem}>
            <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.autopilotName, { color: colors.text }]}>Facebook</Text>
              <Text style={[styles.autopilotSub, { color: colors.textSecondary }]}>Lambert Realty Page</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.success }]}>Connected</Text>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.autopilotItem}>
            <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.autopilotName, { color: colors.text }]}>Instagram</Text>
              <Text style={[styles.autopilotSub, { color: colors.textSecondary }]}>@lambert_realty</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusText, { color: colors.success }]}>Connected</Text>
          </View>
          <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.autopilotItem}>
            <Ionicons name="logo-twitter" size={24} color={isDark ? '#FFF' : '#000'} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.autopilotName, { color: colors.text }]}>X (Twitter)</Text>
              <Text style={[styles.autopilotSub, { color: colors.textSecondary }]}>Not connected</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: colors.textTertiary }]} />
            <Text style={[styles.statusText, { color: colors.textTertiary }]}>Disconnected</Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );

  const renderContent = () => (
    <View style={styles.section}>
      {CONTENT_ITEMS.map(item => (
        <GlassCard key={item.id} style={{ marginBottom: 12 }}>
          <View style={styles.contentCard}>
            <View style={styles.contentHeader}>
              <View style={[styles.typeBadge, { backgroundColor: item.type === 'Social Post' ? colors.primary + '20' : item.type === 'Ad Copy' ? colors.warning + '20' : colors.info + '20' }]}>
                <Text style={[styles.typeBadgeText, { color: item.type === 'Social Post' ? colors.primary : item.type === 'Ad Copy' ? colors.warning : colors.info }]}>{item.type}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: statusColor(item.status) }]}>{item.status}</Text>
              </View>
            </View>
            <Text style={[styles.contentTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.contentPreview, { color: colors.textSecondary }]} numberOfLines={2}>{item.preview}</Text>
            <View style={styles.contentFooter}>
              <View style={styles.platformRow}>
                {item.platforms.map(p => (
                  <View key={p} style={[styles.platformDot, { backgroundColor: platformColor(p) + '20' }]}>
                    <Text style={[styles.platformDotText, { color: platformColor(p) }]}>{p}</Text>
                  </View>
                ))}
              </View>
              {item.date ? <Text style={[styles.contentDate, { color: colors.textTertiary }]}>{item.date}</Text> : null}
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.section}>
      <GlassCard>
        <Text style={[styles.scheduleWeek, { color: colors.text }]}>Week of Feb 10 - Feb 16</Text>
      </GlassCard>
      <View style={{ height: 12 }} />
      {SCHEDULE_DATA.map((day, i) => (
        <GlassCard key={i} style={{ marginBottom: 10 }}>
          <View style={styles.dayRow}>
            <View style={[styles.dayLabel, { backgroundColor: day.posts.length > 0 ? colors.primary + '15' : 'transparent' }]}>
              <Text style={[styles.dayText, { color: day.posts.length > 0 ? colors.primary : colors.textTertiary }]}>{day.day}</Text>
            </View>
            <View style={styles.dayContent}>
              {day.posts.length === 0 ? (
                <Text style={[styles.noPost, { color: colors.textTertiary }]}>No posts scheduled</Text>
              ) : (
                day.posts.map((post, j) => (
                  <View key={j} style={styles.postItem}>
                    <View style={[styles.postDot, { backgroundColor: platformColor(post.platform) }]} />
                    <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
                    <Text style={[styles.postTime, { color: colors.textSecondary }]}>{post.time}</Text>
                    <View style={[styles.platformMini, { backgroundColor: platformColor(post.platform) + '20' }]}>
                      <Text style={[styles.platformMiniText, { color: platformColor(post.platform) }]}>{post.platform}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </GlassCard>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <GlassCard>
        <View style={styles.analyticsPeriod}>
          <Ionicons name="calendar" size={18} color={colors.primary} />
          <Text style={[styles.analyticsPeriodText, { color: colors.text }]}>Last 30 Days</Text>
        </View>
      </GlassCard>
      <View style={{ height: 12 }} />
      <GlassCard>
        <Text style={[styles.analyticsTitle, { color: colors.text }]}>Performance Overview</Text>
        {ANALYTICS_DATA.map((item, i) => (
          <View key={i} style={styles.analyticsRow}>
            <View style={styles.analyticsLabelRow}>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{item.value.toLocaleString()}</Text>
            </View>
            <View style={[styles.barBg, { backgroundColor: colors.divider }]}>
              <View style={[styles.barFill, { width: `${(item.value / item.max) * 100}%`, backgroundColor: item.color }]} />
            </View>
          </View>
        ))}
      </GlassCard>
      <View style={{ height: 12 }} />
      <View style={styles.statsRow}>
        {[
          { label: 'Avg CTR', value: '3.2%', icon: 'finger-print' as const, change: '+0.4%' },
          { label: 'Cost/Click', value: '$0.42', icon: 'cash' as const, change: '-$0.08' },
        ].map((stat, i) => (
          <GlassCard key={i} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
            <Text style={[styles.statChange, { color: colors.success }]}>{stat.change}</Text>
          </GlassCard>
        ))}
      </View>
      <View style={{ height: 12 }} />
      <GlassCard>
        <Text style={[styles.analyticsTitle, { color: colors.text }]}>Top Performing Content</Text>
        {CONTENT_ITEMS.filter(c => c.status === 'Published').slice(0, 3).map((item, i) => (
          <View key={i} style={[styles.topContentRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}>
            <Text style={[styles.topRank, { color: colors.primary }]}>#{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.topTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.topMeta, { color: colors.textSecondary }]}>{item.platforms.join(', ')} - {item.date}</Text>
            </View>
          </View>
        ))}
      </GlassCard>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Marketing Hub" showBack />
      <View style={[styles.tabBar, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.divider }]}>
        {TABS.map(tab => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}>
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Content' && renderContent()}
        {activeTab === 'Schedule' && renderSchedule()}
        {activeTab === 'Analytics' && renderAnalytics()}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    padding: 16,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center' as const,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  welcomeSub: {
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    minHeight: 80,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statChange: {
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: 20,
    marginBottom: 10,
  },
  suggestedPost: {},
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  suggestedName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  suggestedHandle: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  suggestedBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  suggestedPlatforms: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  platformPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  platformPillText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  suggestedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  actionBtnOutlineText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
  },
  libraryItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  libraryValue: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginTop: 6,
  },
  libraryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  libraryDivider: {
    width: 1,
    height: 40,
  },
  autopilotRow: {},
  autopilotItem: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  autopilotName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  autopilotSub: {
    fontSize: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  rowDivider: {
    height: 1,
    marginVertical: 4,
  },
  contentCard: {},
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  contentPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  contentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  platformRow: {
    flexDirection: 'row',
    gap: 6,
  },
  platformDot: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  platformDotText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  contentDate: {
    fontSize: 12,
  },
  scheduleWeek: {
    fontSize: 15,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  dayRow: {
    flexDirection: 'row',
  },
  dayLabel: {
    width: 44,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center' as const,
  },
  noPost: {
    fontSize: 13,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingVertical: 3,
    gap: 8,
  },
  postDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  postTitle: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
  postTime: {
    fontSize: 11,
  },
  platformMini: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  platformMiniText: {
    fontSize: 9,
    fontWeight: '600' as const,
  },
  analyticsPeriod: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  analyticsPeriodText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  analyticsTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 14,
  },
  analyticsRow: {
    marginBottom: 14,
  },
  analyticsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between' as const,
    marginBottom: 6,
  },
  analyticsLabel: {
    fontSize: 13,
  },
  analyticsValue: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  topContentRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingVertical: 10,
    gap: 12,
  },
  topRank: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  topMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
