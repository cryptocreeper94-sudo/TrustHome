import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { useQuery } from '@tanstack/react-query';

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

interface ApiLead {
  id: string;
  tenantId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  propertyType: string | null;
  timeline: string | null;
  urgencyScore: number | null;
  budget: string | null;
  description: string | null;
  source: string;
  referralSource: string | null;
  status: string;
  createdAt: string;
}

const SAMPLE_LEADS: Lead[] = [
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

const STAGE_COLORS: Record<string, string> = {
  'New': '#007AFF',
  'Contacted': '#FF9500',
  'Qualified': '#AF52DE',
  'Proposal': '#FF3B30',
  'Won': '#34C759',
};

function mapApiLead(api: ApiLead): Lead {
  const name = [api.firstName, api.lastName].filter(Boolean).join(' ') || api.phone || 'Unknown';
  const phone = api.phone ? api.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : '';
  const score = api.urgencyScore ?? (api.status === 'new' ? 40 : api.status === 'contacted' ? 60 : 50);
  const temperature: Lead['temperature'] = score >= 75 ? 'hot' : score >= 50 ? 'warm' : 'cold';
  const stageMap: Record<string, Lead['stage']> = { new: 'New', contacted: 'Contacted', qualified: 'Qualified', proposal: 'Proposal', won: 'Won' };
  const stage = stageMap[api.status] || 'New';
  const budget = api.budget || 'TBD';
  const createdDate = new Date(api.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const lastActivity = diffDays === 0 ? 'Today' : diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  
  return {
    id: api.id,
    name,
    phone,
    email: api.email || '',
    source: api.source === 'popup_modal' ? 'Website' : api.source === 'website' ? 'Website' : api.source,
    budget,
    score,
    temperature,
    stage,
    property: api.address || 'TBD',
    lastActivity,
    notes: api.description || api.timeline || '',
  };
}

const tempColors = { hot: '#FF3B30', warm: '#FF9500', cold: '#007AFF' };

function getScoreColor(score: number) {
  if (score >= 80) return '#34C759';
  if (score >= 60) return '#FF9500';
  return '#FF3B30';
}

export default function LeadsScreen() {
  const { colors, isDark } = useTheme();

  const leadsQuery = useQuery<ApiLead[]>({
    queryKey: ['/api/leads'],
  });

  const apiLeads = leadsQuery.data && !('error' in leadsQuery.data) && Array.isArray(leadsQuery.data) 
    ? leadsQuery.data.map(mapApiLead) 
    : null;
  const LEADS = apiLeads && apiLeads.length > 0 ? apiLeads : SAMPLE_LEADS;

  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [filterTemp, setFilterTemp] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');

  const hotCount = LEADS.filter(l => l.temperature === 'hot').length;
  const wonCount = LEADS.filter(l => l.stage === 'Won').length;
  const hotLeads = LEADS.filter(l => l.temperature === 'hot');

  const filteredLeads = filterTemp === 'all' ? LEADS : LEADS.filter(l => l.temperature === filterTemp);

  const computedSources = (() => {
    const sourceColors: Record<string, string> = {
      'Referral': '#1A8A7E', 'Zillow': '#007AFF', 'Realtor.com': '#FF9500',
      'Open House': '#34C759', 'Website': '#AF52DE', 'Facebook': '#3B5998',
      'Instagram': '#E1306C', 'popup_modal': '#AF52DE', 'other': '#8E8E93',
    };
    const defaultColors = ['#1A8A7E', '#007AFF', '#FF9500', '#34C759', '#AF52DE', '#3B5998', '#E1306C'];
    const counts: Record<string, number> = {};
    LEADS.forEach(l => {
      const src = l.source || 'Other';
      counts[src] = (counts[src] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], i) => ({
        label,
        count,
        color: sourceColors[label] || defaultColors[i % defaultColors.length],
      }));
  })();

  const maxSourceCount = Math.max(...computedSources.map(s => s.count));
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Leads & CRM" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {leadsQuery.isLoading && (
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}

        <BentoGrid columns={3} gap={10} style={styles.bentoStats}>
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
        </BentoGrid>

        {apiLeads && apiLeads.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4, marginTop: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' }} />
            <Text style={{ fontSize: 10, color: colors.textTertiary }}>Live data</Text>
          </View>
        )}

        {hotLeads.length > 0 && (
          <HorizontalCarousel title="Hot Leads" itemWidth={180} style={styles.hotCarousel}>
            {hotLeads.map(lead => (
              <GlassCard key={lead.id} compact style={styles.hotCard}>
                <View style={styles.hotCardInner}>
                  <View style={styles.hotCardTop}>
                    <View style={[styles.scoreCircleSm, { borderColor: getScoreColor(lead.score) }]}>
                      <Text style={[styles.scoreCircleSmText, { color: getScoreColor(lead.score) }]}>{lead.score}</Text>
                    </View>
                    <View style={[styles.tempBadgeSm, { backgroundColor: tempColors[lead.temperature] + '22' }]}>
                      <Text style={[styles.tempBadgeSmText, { color: tempColors[lead.temperature] }]}>{lead.temperature}</Text>
                    </View>
                  </View>
                  <Text style={[styles.hotCardName, { color: colors.text }]} numberOfLines={1}>{lead.name}</Text>
                  <Text style={[styles.hotCardBudget, { color: colors.primary }]}>{lead.budget}</Text>
                </View>
              </GlassCard>
            ))}
          </HorizontalCarousel>
        )}

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
          <View style={styles.pipelineAccordions}>
            {STAGES.map(stage => {
              const stageLeads = LEADS.filter(l => l.stage === stage);
              const stageColor = STAGE_COLORS[stage] || colors.primary;
              return (
                <AccordionSection
                  key={stage}
                  title={stage}
                  icon={stage === 'Won' ? 'trophy' : stage === 'Proposal' ? 'document-text' : stage === 'Qualified' ? 'checkmark-circle' : stage === 'Contacted' ? 'chatbubble-ellipses' : 'add-circle'}
                  iconColor={stageColor}
                  badge={stageLeads.length}
                  badgeColor={stageColor}
                  defaultOpen={stage === 'Qualified' || stage === 'Proposal'}
                >
                  {stageLeads.length === 0 ? (
                    <Text style={[styles.emptyStage, { color: colors.textTertiary }]}>No leads in this stage</Text>
                  ) : (
                    stageLeads.map(lead => (
                      <View key={lead.id} style={[styles.pipelineCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: colors.cardGlassBorder }]}>
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
                    ))
                  )}
                </AccordionSection>
              );
            })}
          </View>
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

        <AccordionSection
          title="Lead Sources"
          icon="pie-chart"
          iconColor="#1A8A7E"
          defaultOpen={true}
          badge={computedSources.length}
          badgeColor="#1A8A7E"
          style={styles.sourcesAccordion}
        >
          {computedSources.map((src, i) => (
            <View key={i} style={styles.sourceRow}>
              <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>{src.label}</Text>
              <View style={styles.barWrap}>
                <View style={[styles.bar, { width: `${(src.count / maxSourceCount) * 100}%`, backgroundColor: src.color }]} />
              </View>
              <Text style={[styles.sourceCount, { color: colors.text }]}>{src.count}</Text>
            </View>
          ))}
        </AccordionSection>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
  bentoStats: { marginTop: 16 },
  statCard: { minHeight: 80 },
  statInner: { alignItems: 'center' as const, gap: 4 },
  statValue: { fontSize: 22, fontWeight: '700' as const },
  statLabel: { fontSize: 12, fontWeight: '500' as const },
  hotCarousel: { marginTop: 16 },
  hotCard: { width: 180, minHeight: 90 },
  hotCardInner: { gap: 4 },
  hotCardTop: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const },
  hotCardName: { fontSize: 14, fontWeight: '600' as const },
  hotCardBudget: { fontSize: 13, fontWeight: '700' as const },
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
  pipelineAccordions: { marginBottom: 8 },
  pipelineCard: { borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1 },
  pipelineCardName: { fontSize: 13, fontWeight: '600' as const },
  pipelineCardBudget: { fontSize: 12, fontWeight: '600' as const, marginTop: 4 },
  pipelineCardRow: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginTop: 6 },
  tempBadgeSm: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tempBadgeSmText: { fontSize: 10, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  scoreCircleSm: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreCircleSmText: { fontSize: 10, fontWeight: '700' as const },
  emptyStage: { fontSize: 12, fontStyle: 'italic' as const, paddingVertical: 8 },
  sourcesAccordion: { marginTop: 20 },
  sourceRow: { flexDirection: 'row', alignItems: 'center' as const, marginBottom: 10 },
  sourceLabel: { width: 80, fontSize: 12, fontWeight: '500' as const },
  barWrap: { flex: 1, height: 14, borderRadius: 7, backgroundColor: 'rgba(128,128,128,0.12)', marginHorizontal: 8, overflow: 'hidden' as const },
  bar: { height: '100%', borderRadius: 7 },
  sourceCount: { width: 20, fontSize: 13, fontWeight: '600' as const, textAlign: 'right' as const },
});
