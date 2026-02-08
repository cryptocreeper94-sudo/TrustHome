import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  budget: string;
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won';
  property: string;
  lastActivity: string;
  notes: string;
}

const LEADS: Lead[] = [
  { id: '1', name: 'Sarah Mitchell', phone: '(555) 234-8901', email: 'sarah.m@email.com', source: 'Zillow', budget: '$450,000', score: 92, temperature: 'hot', stage: 'Proposal', property: '1847 Oak Valley Dr', lastActivity: '2 hours ago', notes: 'Pre-approved, ready to make offer this week.' },
  { id: '2', name: 'James Rivera', phone: '(555) 876-5432', email: 'jrivera@email.com', source: 'Referral', budget: '$680,000', score: 87, temperature: 'hot', stage: 'Qualified', property: '302 Maple Heights Blvd', lastActivity: '1 day ago', notes: 'Looking for 4BR in school district. Second showing scheduled.' },
  { id: '3', name: 'Emily Chen', phone: '(555) 345-6789', email: 'echen@email.com', source: 'Open House', budget: '$320,000', score: 74, temperature: 'warm', stage: 'Contacted', property: '55 Riverside Ln', lastActivity: '3 days ago', notes: 'First-time buyer, needs guidance on financing.' },
  { id: '4', name: 'David Okafor', phone: '(555) 432-1098', email: 'dokafor@email.com', source: 'Website', budget: '$520,000', score: 65, temperature: 'warm', stage: 'New', property: 'TBD', lastActivity: '5 days ago', notes: 'Submitted inquiry via website contact form.' },
  { id: '5', name: 'Lisa Thompson', phone: '(555) 789-0123', email: 'lthompson@email.com', source: 'Realtor.com', budget: '$390,000', score: 81, temperature: 'hot', stage: 'Qualified', property: '410 Birch Creek Way', lastActivity: '6 hours ago', notes: 'Relocating from Denver, timeline is 60 days.' },
  { id: '6', name: 'Marcus Johnson', phone: '(555) 654-3210', email: 'mjohnson@email.com', source: 'Facebook', budget: '$275,000', score: 48, temperature: 'cold', stage: 'Contacted', property: 'TBD', lastActivity: '2 weeks ago', notes: 'Casually browsing, no urgency.' },
  { id: '7', name: 'Rachel Nguyen', phone: '(555) 111-2233', email: 'rnguyen@email.com', source: 'Referral', budget: '$1,200,000', score: 95, temperature: 'hot', stage: 'Won', property: '88 Lakeview Estates', lastActivity: '1 day ago', notes: 'Closed! Luxury buyer, refer for future listings.' },
  { id: '8', name: 'Carlos Gutierrez', phone: '(555) 998-7766', email: 'cgutierrez@email.com', source: 'Instagram', budget: '$340,000', score: 58, temperature: 'warm', stage: 'New', property: 'TBD', lastActivity: '4 days ago', notes: 'Interested in new construction townhomes.' },
];

const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'] as const;

const SOURCES = [
  { label: 'Referral', count: 2, color: '#1A8A7E' },
  { label: 'Zillow', count: 1, color: '#007AFF' },
  { label: 'Realtor.com', count: 1, color: '#FF9500' },
  { label: 'Open House', count: 1, color: '#34C759' },
  { label: 'Website', count: 1, color: '#AF52DE' },
  { label: 'Facebook', count: 1, color: '#3B5998' },
  { label: 'Instagram', count: 1, color: '#E1306C' },
];

const tempColors = { hot: '#FF3B30', warm: '#FF9500', cold: '#007AFF' };

function getScoreColor(score: number) {
  if (score >= 80) return '#34C759';
  if (score >= 60) return '#FF9500';
  return '#FF3B30';
}

export default function LeadsScreen() {
  const { colors, isDark } = useTheme();
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [filterTemp, setFilterTemp] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  const hotCount = LEADS.filter(l => l.temperature === 'hot').length;
  const wonCount = LEADS.filter(l => l.stage === 'Won').length;

  const filteredLeads = filterTemp === 'all' ? LEADS : LEADS.filter(l => l.temperature === filterTemp);
  const maxSourceCount = Math.max(...SOURCES.map(s => s.count));
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Leads & CRM" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <GlassCard style={styles.statCard} compact>
            <View style={styles.statInner}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{LEADS.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
            </View>
          </GlassCard>
          <GlassCard style={styles.statCard} compact>
            <View style={styles.statInner}>
              <Ionicons name="flame" size={20} color={tempColors.hot} />
              <Text style={[styles.statValue, { color: colors.text }]}>{hotCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hot</Text>
            </View>
          </GlassCard>
          <GlassCard style={styles.statCard} compact>
            <View style={styles.statInner}>
              <Ionicons name="trophy" size={20} color="#FFD700" />
              <Text style={[styles.statValue, { color: colors.text }]}>{wonCount}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Won</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={16} color={viewMode === 'list' ? '#FFF' : colors.textSecondary} />
            <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#FFF' : colors.textSecondary }]}>List</Text>
          </Pressable>
          <Pressable
            style={[styles.toggleBtn, viewMode === 'pipeline' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('pipeline')}
          >
            <Ionicons name="git-branch" size={16} color={viewMode === 'pipeline' ? '#FFF' : colors.textSecondary} />
            <Text style={[styles.toggleText, { color: viewMode === 'pipeline' ? '#FFF' : colors.textSecondary }]}>Pipeline</Text>
          </Pressable>
        </View>

        {viewMode === 'pipeline' ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pipelineScroll} contentContainerStyle={styles.pipelineContent}>
            {STAGES.map(stage => {
              const stageLeads = LEADS.filter(l => l.stage === stage);
              return (
                <View key={stage} style={[styles.pipelineCol, { backgroundColor: isDark ? colors.surfaceElevated : colors.backgroundTertiary, borderColor: colors.border }]}>
                  <View style={styles.pipelineHeader}>
                    <Text style={[styles.pipelineStageName, { color: colors.text }]}>{stage}</Text>
                    <View style={[styles.pipelineCount, { backgroundColor: colors.primary + '22' }]}>
                      <Text style={[styles.pipelineCountText, { color: colors.primary }]}>{stageLeads.length}</Text>
                    </View>
                  </View>
                  {stageLeads.map(lead => (
                    <View key={lead.id} style={[styles.pipelineCard, { backgroundColor: colors.cardGlass, borderColor: colors.cardGlassBorder }]}>
                      <Text style={[styles.pipelineCardName, { color: colors.text }]} numberOfLines={1}>{lead.name}</Text>
                      <Text style={[styles.pipelineCardBudget, { color: colors.primary }]}>{lead.budget}</Text>
                      <View style={styles.pipelineCardRow}>
                        <View style={[styles.tempBadgeSm, { backgroundColor: tempColors[lead.temperature] + '22' }]}>
                          <Text style={[styles.tempBadgeSmText, { color: tempColors[lead.temperature] }]}>{lead.temperature}</Text>
                        </View>
                        <View style={[styles.scoreCircleSm, { borderColor: getScoreColor(lead.score) }]}>
                          <Text style={[styles.scoreCircleSmText, { color: getScoreColor(lead.score) }]}>{lead.score}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <>
            <View style={styles.filterRow}>
              {(['all', 'hot', 'warm', 'cold'] as const).map(t => (
                <Pressable
                  key={t}
                  style={[styles.filterChip, filterTemp === t && { backgroundColor: t === 'all' ? colors.primary : tempColors[t], borderColor: t === 'all' ? colors.primary : tempColors[t] }, filterTemp !== t && { borderColor: colors.border }]}
                  onPress={() => setFilterTemp(t)}
                >
                  <Text style={[styles.filterChipText, { color: filterTemp === t ? '#FFF' : colors.textSecondary }]}>
                    {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {filteredLeads.map(lead => {
              const isExpanded = expandedLead === lead.id;
              return (
                <GlassCard key={lead.id} style={styles.leadCard} onPress={() => setExpandedLead(isExpanded ? null : lead.id)}>
                  <View style={styles.leadRow}>
                    <View style={[styles.scoreCircle, { borderColor: getScoreColor(lead.score) }]}>
                      <Text style={[styles.scoreText, { color: getScoreColor(lead.score) }]}>{lead.score}</Text>
                    </View>
                    <View style={styles.leadInfo}>
                      <Text style={[styles.leadName, { color: colors.text }]}>{lead.name}</Text>
                      <Text style={[styles.leadSource, { color: colors.textSecondary }]}>{lead.source} {'\u00B7'} {lead.budget}</Text>
                    </View>
                    <View style={[styles.tempBadge, { backgroundColor: tempColors[lead.temperature] + '18' }]}>
                      <Ionicons name={lead.temperature === 'hot' ? 'flame' : lead.temperature === 'warm' ? 'sunny' : 'snow'} size={12} color={tempColors[lead.temperature]} />
                      <Text style={[styles.tempText, { color: tempColors[lead.temperature] }]}>{lead.temperature}</Text>
                    </View>
                  </View>
                  {lead.property !== 'TBD' && (
                    <View style={styles.propertyRow}>
                      <Ionicons name="home-outline" size={13} color={colors.textTertiary} />
                      <Text style={[styles.propertyText, { color: colors.textTertiary }]}>{lead.property}</Text>
                    </View>
                  )}
                  {isExpanded && (
                    <View style={[styles.expandedSection, { borderTopColor: colors.divider }]}>
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Stage</Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>{lead.stage}</Text>
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Last Activity</Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>{lead.lastActivity}</Text>
                      <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>Notes</Text>
                      <Text style={[styles.expandedValue, { color: colors.text }]}>{lead.notes}</Text>
                      <View style={styles.actionRow}>
                        <Pressable style={[styles.actionBtn, { backgroundColor: '#34C759' + '22' }]}>
                          <Ionicons name="call" size={18} color="#34C759" />
                        </Pressable>
                        <Pressable style={[styles.actionBtn, { backgroundColor: '#007AFF' + '22' }]}>
                          <Ionicons name="mail" size={18} color="#007AFF" />
                        </Pressable>
                        <Pressable style={[styles.actionBtn, { backgroundColor: '#AF52DE' + '22' }]}>
                          <Ionicons name="chatbubble" size={18} color="#AF52DE" />
                        </Pressable>
                        <Pressable style={[styles.actionBtn, { backgroundColor: '#FF9500' + '22' }]}>
                          <Ionicons name="calendar" size={18} color="#FF9500" />
                        </Pressable>
                      </View>
                    </View>
                  )}
                </GlassCard>
              );
            })}
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Lead Sources</Text>
        </View>
        <GlassCard style={styles.sourcesCard}>
          {SOURCES.map((src, i) => (
            <View key={i} style={styles.sourceRow}>
              <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>{src.label}</Text>
              <View style={styles.barWrap}>
                <View style={[styles.bar, { width: `${(src.count / maxSourceCount) * 100}%`, backgroundColor: src.color }]} />
              </View>
              <Text style={[styles.sourceCount, { color: colors.text }]}>{src.count}</Text>
            </View>
          ))}
        </GlassCard>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: { minHeight: 80 },
  statInner: { alignItems: 'center' as const, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700' as const },
  statLabel: { fontSize: 12, fontWeight: '500' as const },
  toggleRow: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 12 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center' as const, gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  toggleText: { fontSize: 13, fontWeight: '600' as const },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  leadCard: { marginBottom: 10, minHeight: 70 },
  leadRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 12 },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreText: { fontSize: 14, fontWeight: '700' as const },
  leadInfo: { flex: 1 },
  leadName: { fontSize: 15, fontWeight: '600' as const },
  leadSource: { fontSize: 12, marginTop: 2 },
  tempBadge: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  tempText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  propertyRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, marginTop: 8, marginLeft: 56 },
  propertyText: { fontSize: 12 },
  expandedSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  expandedLabel: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.5, marginTop: 6 },
  expandedValue: { fontSize: 13, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center' as const, justifyContent: 'center' as const },
  pipelineScroll: { marginBottom: 8 },
  pipelineContent: { paddingVertical: 4, gap: 10 },
  pipelineCol: { width: 200, borderRadius: 16, padding: 12, borderWidth: 1, marginRight: 2 },
  pipelineHeader: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: 10 },
  pipelineStageName: { fontSize: 14, fontWeight: '700' as const },
  pipelineCount: { width: 24, height: 24, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
  pipelineCountText: { fontSize: 12, fontWeight: '700' as const },
  pipelineCard: { borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1 },
  pipelineCardName: { fontSize: 13, fontWeight: '600' as const },
  pipelineCardBudget: { fontSize: 12, fontWeight: '600' as const, marginTop: 4 },
  pipelineCardRow: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginTop: 6 },
  tempBadgeSm: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tempBadgeSmText: { fontSize: 10, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  scoreCircleSm: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreCircleSmText: { fontSize: 10, fontWeight: '700' as const },
  sectionHeader: { marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' as const },
  sourcesCard: { minHeight: 60, marginBottom: 4 },
  sourceRow: { flexDirection: 'row', alignItems: 'center' as const, marginBottom: 10 },
  sourceLabel: { width: 80, fontSize: 12, fontWeight: '500' as const },
  barWrap: { flex: 1, height: 14, borderRadius: 7, backgroundColor: 'rgba(128,128,128,0.12)', marginHorizontal: 8, overflow: 'hidden' as const },
  bar: { height: '100%', borderRadius: 7 },
  sourceCount: { width: 20, fontSize: 13, fontWeight: '600' as const, textAlign: 'right' as const },
});
