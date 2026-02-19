import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
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
  'New': '#60A5FA',
  'Contacted': '#FBBF24',
  'Qualified': '#A78BFA',
  'Proposal': '#F87171',
  'Won': '#34D399',
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

const tempColors = { hot: '#F87171', warm: '#FBBF24', cold: '#60A5FA' };

function getScoreColor(score: number) {
  if (score >= 80) return '#34D399';
  if (score >= 60) return '#FBBF24';
  return '#F87171';
}

function SkeletonLoader() {
  const { isDark } = useTheme();
  const shimmerBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  return (
    <View style={{ gap: 12, paddingVertical: 8 }}>
      {[1, 2, 3].map(i => (
        <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(300)}>
          <View style={{ height: 80, backgroundColor: shimmerBg, borderRadius: 16 }} />
        </Animated.View>
      ))}
    </View>
  );
}

function AnimatedActionButton({ icon, color, onPress }: { icon: keyof typeof Ionicons.glyphMap; color: string; onPress?: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[styles.actionBtn, { backgroundColor: color + '22' }]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </Pressable>
    </Animated.View>
  );
}

function AnimatedFilterChip({ label, isActive, color, borderColor, onPress }: { label: string; isActive: boolean; color: string; borderColor: string; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={animStyle}>
      <Pressable
        style={[styles.filterChip, { backgroundColor: isActive ? color : 'transparent', borderColor: isActive ? color : borderColor }]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      >
        <Text style={[styles.filterChipText, { color: isActive ? '#FFF' : 'rgba(255,255,255,0.6)' }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedLeadCard({ lead, isExpanded, onToggle, index }: { lead: Lead; isExpanded: boolean; onToggle: () => void; index: number }) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <GlassCard style={styles.leadCard} onPress={onToggle}>
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
              <AnimatedActionButton icon="call" color="#34D399" />
              <AnimatedActionButton icon="mail" color="#60A5FA" />
              <AnimatedActionButton icon="chatbubble" color="#A78BFA" />
              <AnimatedActionButton icon="calendar" color="#FBBF24" />
            </View>
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

function AnimatedPipelineCard({ lead, index }: { lead: Lead; index: number }) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(350)} style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      >
        <View style={[styles.pipelineCard, { backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.08)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
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
      </Pressable>
    </Animated.View>
  );
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
      'Referral': '#1A8A7E', 'Zillow': '#60A5FA', 'Realtor.com': '#FBBF24',
      'Open House': '#34D399', 'Website': '#A78BFA', 'Facebook': '#3B5998',
      'Instagram': '#E1306C', 'popup_modal': '#A78BFA', 'other': '#94A3B8',
    };
    const defaultColors = ['#1A8A7E', '#60A5FA', '#FBBF24', '#34D399', '#A78BFA', '#3B5998', '#E1306C'];
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

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Header title="Leads & CRM" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {leadsQuery.isLoading && <SkeletonLoader />}

        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <BentoGrid columns={3} gap={10} style={styles.bentoStats}>
            <GlassCard style={styles.statCard} compact>
              <View style={styles.statInner}>
                <Ionicons name="people" size={22} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{LEADS.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
            </GlassCard>
            <GlassCard style={styles.statCard} compact>
              <View style={styles.statInner}>
                <Ionicons name="flame" size={22} color={tempColors.hot} />
                <Text style={[styles.statValue, { color: colors.text }]}>{hotCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Hot</Text>
              </View>
            </GlassCard>
            <GlassCard style={styles.statCard} compact>
              <View style={styles.statInner}>
                <Ionicons name="trophy" size={22} color="#D4AF37" />
                <Text style={[styles.statValue, { color: colors.text }]}>{wonCount}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Won</Text>
              </View>
            </GlassCard>
          </BentoGrid>
        </Animated.View>

        {apiLeads && apiLeads.length > 0 && (
          <Animated.View entering={FadeInDown.duration(300).delay(80)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#34D399' }} />
            <Text style={{ fontSize: 11, color: colors.textTertiary, fontWeight: '500' as const }}>Live data</Text>
          </Animated.View>
        )}

        {hotLeads.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
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
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(240)}>
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
        </Animated.View>

        {viewMode === 'pipeline' ? (
          <Animated.View entering={FadeInDown.duration(400).delay(320)}>
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
                      stageLeads.map((lead, idx) => (
                        <AnimatedPipelineCard key={lead.id} lead={lead} index={idx} />
                      ))
                    )}
                  </AccordionSection>
                );
              })}
            </View>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(400).delay(320)}>
              <View style={styles.filterRow}>
                {(['all', 'hot', 'warm', 'cold'] as const).map(t => (
                  <AnimatedFilterChip
                    key={t}
                    label={t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    isActive={filterTemp === t}
                    color={t === 'all' ? colors.primary : tempColors[t]}
                    borderColor={colors.border}
                    onPress={() => setFilterTemp(t)}
                  />
                ))}
              </View>
            </Animated.View>

            {filteredLeads.map((lead, index) => (
              <AnimatedLeadCard
                key={lead.id}
                lead={lead}
                isExpanded={expandedLead === lead.id}
                onToggle={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                index={index}
              />
            ))}
          </>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
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
        </Animated.View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 16 },
  bentoStats: { marginTop: 16 },
  statCard: { minHeight: 84 },
  statInner: { alignItems: 'center' as const, gap: 6 },
  statValue: { fontSize: 24, fontWeight: '800' as const },
  statLabel: { fontSize: 12, fontWeight: '600' as const },
  hotCarousel: { marginTop: 20 },
  hotCard: { width: 180, minHeight: 94 },
  hotCardInner: { gap: 6 },
  hotCardTop: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const },
  hotCardName: { fontSize: 15, fontWeight: '600' as const },
  hotCardBudget: { fontSize: 14, fontWeight: '700' as const },
  toggleRow: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 14 },
  toggleBtn: { flexDirection: 'row', alignItems: 'center' as const, gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, minHeight: 44 },
  toggleText: { fontSize: 14, fontWeight: '600' as const },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, borderWidth: 1, minHeight: 44, justifyContent: 'center' as const },
  filterChipText: { fontSize: 13, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  leadCard: { marginBottom: 12, minHeight: 72 },
  leadRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 12 },
  scoreCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreText: { fontSize: 14, fontWeight: '700' as const },
  leadInfo: { flex: 1 },
  leadName: { fontSize: 16, fontWeight: '600' as const },
  leadSource: { fontSize: 13, marginTop: 2 },
  tempBadge: { flexDirection: 'row', alignItems: 'center' as const, gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, minHeight: 32 },
  tempText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  propertyRow: { flexDirection: 'row', alignItems: 'center' as const, gap: 6, marginTop: 10, marginLeft: 56 },
  propertyText: { fontSize: 13 },
  expandedSection: { marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  expandedLabel: { fontSize: 11, fontWeight: '600' as const, textTransform: 'uppercase' as const, letterSpacing: 0.6, marginTop: 8 },
  expandedValue: { fontSize: 14, marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center' as const, justifyContent: 'center' as const },
  pipelineAccordions: { marginBottom: 8 },
  pipelineCard: { borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1 },
  pipelineCardName: { fontSize: 14, fontWeight: '600' as const },
  pipelineCardBudget: { fontSize: 13, fontWeight: '700' as const, marginTop: 4 },
  pipelineCardRow: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginTop: 8 },
  tempBadgeSm: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tempBadgeSmText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  scoreCircleSm: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreCircleSmText: { fontSize: 11, fontWeight: '700' as const },
  emptyStage: { fontSize: 13, fontStyle: 'italic' as const, paddingVertical: 10 },
  sourcesAccordion: { marginTop: 24 },
  sourceRow: { flexDirection: 'row', alignItems: 'center' as const, marginBottom: 12 },
  sourceLabel: { width: 84, fontSize: 13, fontWeight: '500' as const },
  barWrap: { flex: 1, height: 16, borderRadius: 8, backgroundColor: 'rgba(128,128,128,0.12)', marginHorizontal: 10, overflow: 'hidden' as const },
  bar: { height: '100%', borderRadius: 8 },
  sourceCount: { width: 24, fontSize: 14, fontWeight: '700' as const, textAlign: 'right' as const },
});
