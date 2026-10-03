import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Dimensions, ActivityIndicator, Modal, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { useTenantList, apiErrorMessage, timeAgo } from '@/lib/tenant-api';
import { SampleDataBanner } from '@/components/ui/SampleDataBanner';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  budget: string;
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  stage: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost';
  property: string;
  lastActivity: string;
  notes: string;
}

/** Row shape returned by GET /api/leads (tenant-scoped). */
interface ApiLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  source: string;
  budget: string | null;
  score: number;
  temperature: 'hot' | 'warm' | 'cold';
  stage: Lead['stage'];
  propertyInterest: string | null;
  notes: string | null;
  lastActivityAt: string;
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
  'Qualified': '#38bdf8',
  'Proposal': '#F87171',
  'Won': '#34D399',
};

function mapApiLead(api: ApiLead): Lead {
  const name = [api.firstName, api.lastName].filter(Boolean).join(' ') || api.email || 'Unnamed lead';
  return {
    id: api.id,
    name,
    phone: api.phone || '',
    email: api.email || '',
    source: api.source || 'Manual',
    budget: api.budget || 'TBD',
    score: api.score,
    temperature: api.temperature,
    stage: api.stage,
    property: api.propertyInterest || 'TBD',
    lastActivity: timeAgo(api.lastActivityAt),
    notes: api.notes || '',
  };
}

const NEXT_STAGE: Partial<Record<Lead['stage'], Lead['stage']>> = {
  New: 'Contacted', Contacted: 'Qualified', Qualified: 'Proposal', Proposal: 'Won',
};

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
        <Text style={[styles.filterChipText, { color: isActive ? '#FFF' : color }]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function AnimatedLeadCard({ lead, isExpanded, onToggle, index, onAdvance, onDelete }: {
  lead: Lead; isExpanded: boolean; onToggle: () => void; index: number;
  onAdvance?: () => void; onDelete?: () => void;
}) {
  const { colors } = useTheme();
  const next = NEXT_STAGE[lead.stage];
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
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <AnimatedActionButton icon="call" color="#34D399" onPress={lead.phone ? () => Linking.openURL(`tel:${lead.phone.replace(/[^\d+]/g, '')}`) : undefined} />
              <AnimatedActionButton icon="mail" color="#60A5FA" onPress={lead.email ? () => Linking.openURL(`mailto:${lead.email}`) : undefined} />
              <AnimatedActionButton icon="chatbubble" color="#38bdf8" onPress={lead.phone ? () => Linking.openURL(`sms:${lead.phone.replace(/[^\d+]/g, '')}`) : undefined} />
            </View>

            <Text style={[styles.expandedLabel, { color: colors.textSecondary }]}>DETAILS</Text>
            <View style={{ marginTop: 8, gap: 6 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Stage: <Text style={{ color: STAGE_COLORS[lead.stage] || colors.text, fontWeight: '700' }}>{lead.stage}</Text></Text>
              {!!lead.email && <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{lead.email}</Text>}
              {!!lead.phone && <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{lead.phone}</Text>}
              <Text style={{ color: colors.textTertiary, fontSize: 12 }}>Last activity: {lead.lastActivity}</Text>
              {!!lead.notes && <Text style={{ color: colors.text, fontSize: 13, marginTop: 4, lineHeight: 19 }}>{lead.notes}</Text>}
            </View>

            {(onAdvance || onDelete) && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                {onAdvance && next && (
                  <Pressable testID={`lead-advance-${lead.id}`} onPress={onAdvance} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A8A7E', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Move to {next}</Text>
                  </Pressable>
                )}
                {onDelete && (
                  <Pressable testID={`lead-delete-${lead.id}`} onPress={onDelete} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#F8717166', alignItems: 'center' }}>
                    <Text style={{ color: '#F87171', fontWeight: '700', fontSize: 13 }}>Delete</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}
      </GlassCard>
    </Animated.View>
  );
}

function AnimatedPipelineCard({ lead, index }: { lead: Lead; index: number }) {
  const [showHelp, setShowHelp] = useState(false);
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
  const [showHelp, setShowHelp] = useState(false);
  const { colors, isDark } = useTheme();
  const leadsApi = useTenantList<ApiLead>('/api/leads');
  const [showAddModal, setShowAddModal] = useState(false);
  const emptyLead = { firstName: '', lastName: '', phone: '', email: '', source: 'Website', budget: '', propertyInterest: '', notes: '' };
  const [newLead, setNewLead] = useState(emptyLead);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleAddLead = async () => {
    if (!leadsApi.isLive) { setFormError('Sign in to save leads to your workspace.'); return; }
    if (!newLead.firstName.trim()) { setFormError('First name is required.'); return; }
    setIsSubmitting(true);
    setFormError('');
    try {
      await leadsApi.create.mutateAsync(newLead);
      setShowAddModal(false);
      setNewLead(emptyLead);
    } catch (e) {
      setFormError(apiErrorMessage(e));
    } finally {
      setIsSubmitting(false);
    }
  };

  const leadsQuery = { isLoading: leadsApi.isLoading };
  const LEADS: Lead[] = leadsApi.isLive ? leadsApi.items.map(mapApiLead) : SAMPLE_LEADS;

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
      'Open House': '#34D399', 'Website': '#38bdf8', 'Facebook': '#3B5998',
      'Instagram': '#E1306C', 'popup_modal': '#38bdf8', 'other': '#94A3B8',
    };
    const defaultColors = ['#1A8A7E', '#60A5FA', '#FBBF24', '#34D399', '#38bdf8', '#3B5998', '#E1306C'];
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

  const maxSourceCount = Math.max(1, ...computedSources.map(s => s.count));

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#0B1021' : 'rgba(0,0,0,0.65)' }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header imageBanner={require('@/assets/images/guide-leads.jpg')} 
        title="Leads & CRM" 
        subtitle="Capture · Nurture · Convert"
        showBack 
        transparent={false}
         
        rightAction={
          <Pressable onPress={() => setShowAddModal(true)} style={[styles.headerAddBtn, { backgroundColor: colors.primaryAction }]}>
            <Ionicons name="add" size={20} color="#FFF" />

        <Text style={[styles.headerAddText, { color: '#FFF' }]}>Add Lead</Text>
          </Pressable>
        }
      />
        {leadsQuery.isLoading && <SkeletonLoader />}

        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <BentoGrid columns={3} gap={10} style={styles.bentoStats}>
            <GlassCard style={styles.statCard} compact>
              <View style={styles.statInner}>
                <Ionicons name="people" size={22} color="#FFF" />
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

        <SampleDataBanner live={leadsApi.isLive} count={LEADS.length} noun="leads" />

        {leadsApi.isLive && !leadsApi.isLoading && LEADS.length === 0 && (
          <GlassCard style={{ marginTop: 12, alignItems: 'center', paddingVertical: 28 }}>
            <Ionicons name="people-outline" size={32} color={colors.textTertiary} />
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginTop: 10 }}>No leads yet</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: 'center' }}>Add your first lead to start building your pipeline.</Text>
            <Pressable testID="leads-empty-add" onPress={() => setShowAddModal(true)} style={{ marginTop: 14, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#1A8A7E' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Add Lead</Text>
            </Pressable>
          </GlassCard>
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
              style={[styles.toggleBtn, { backgroundColor: viewMode === 'list' ? '#1A8A7E' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons name="list" size={16} color={viewMode === 'list' ? '#FFF' : colors.textSecondary} />
              <Text style={[styles.toggleText, { color: viewMode === 'list' ? '#FFF' : colors.textSecondary }]}>List</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, { backgroundColor: viewMode === 'pipeline' ? '#1A8A7E' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
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
                    color={t === 'all' ? '#1A8A7E' : tempColors[t]}
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
                onAdvance={leadsApi.isLive && NEXT_STAGE[lead.stage] ? () => leadsApi.update.mutate({ id: lead.id, stage: NEXT_STAGE[lead.stage] }) : undefined}
                onDelete={leadsApi.isLive ? () => { setExpandedLead(null); leadsApi.remove.mutate(lead.id); } : undefined}
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

      <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1D24' : '#FFF', borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Lead</Text>
              <Pressable onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>First Name</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.firstName} onChangeText={t => setNewLead({...newLead, firstName: t})} placeholder="John" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Last Name</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.lastName} onChangeText={t => setNewLead({...newLead, lastName: t})} placeholder="Doe" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.email} onChangeText={t => setNewLead({...newLead, email: t})} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.phone} onChangeText={t => setNewLead({...newLead, phone: t})} placeholder="(555) 123-4567" keyboardType="phone-pad" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Budget</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.budget} onChangeText={t => setNewLead({...newLead, budget: t})} placeholder="$500,000" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Source</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.source} onChangeText={t => setNewLead({...newLead, source: t})} placeholder="Referral, Zillow, Open House…" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Property of interest</Text>
                <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.propertyInterest} onChangeText={t => setNewLead({...newLead, propertyInterest: t})} placeholder="123 Main St (optional)" placeholderTextColor={colors.textTertiary} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Notes</Text>
                <TextInput multiline style={[styles.input, { minHeight: 70, textAlignVertical: 'top', color: colors.text, borderColor: colors.border, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }]} value={newLead.notes} onChangeText={t => setNewLead({...newLead, notes: t})} placeholder="Pre-approved, wants 3BR…" placeholderTextColor={colors.textTertiary} />
              </View>
              {!!formError && <Text style={{ color: '#F87171', fontSize: 13, marginTop: 4 }}>{formError}</Text>}
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: colors.divider }]}>
              <Pressable style={[styles.modalBtn, { backgroundColor: isDark ? '#0B1021' : colors.backgroundTertiary }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, { backgroundColor: colors.primaryAction }]} onPress={handleAddLead} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Add Lead</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32, paddingHorizontal: 16 },
  bentoStats: { marginTop: 16 },
  statCard: {
    minHeight: 84,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
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
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    minHeight: 44,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  toggleText: { fontSize: 14, fontWeight: '600' as const },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  filterChipText: { fontSize: 13, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  leadCard: {
    marginBottom: 12,
    minHeight: 72,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
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
  pipelineCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  pipelineCardName: { fontSize: 14, fontWeight: '600' as const },
  pipelineCardBudget: { fontSize: 13, fontWeight: '700' as const, marginTop: 4 },
  pipelineCardRow: { flexDirection: 'row', alignItems: 'center' as const, justifyContent: 'space-between' as const, marginTop: 8 },
  tempBadgeSm: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tempBadgeSmText: { fontSize: 11, fontWeight: '600' as const, textTransform: 'capitalize' as const },
  scoreCircleSm: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center' as const, justifyContent: 'center' as const },
  scoreCircleSmText: { fontSize: 11, fontWeight: '700' as const },
  emptyStage: { fontSize: 13, fontStyle: 'italic' as const, paddingVertical: 10 },
  sourcesAccordion: {
    marginTop: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderRadius: 16,
  },
  sourceRow: { flexDirection: 'row', alignItems: 'center' as const, marginBottom: 12 },
  sourceLabel: { width: 84, fontSize: 13, fontWeight: '500' as const },
  barWrap: { flex: 1, height: 16, borderRadius: 8, backgroundColor: 'rgba(128,128,128,0.12)', marginHorizontal: 10, overflow: 'hidden' as const },
  bar: { height: '100%', borderRadius: 8 },
  sourceCount: { width: 24, fontSize: 14, fontWeight: '700' as const, textAlign: 'right' as const },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    minHeight: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerAddText: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnText: {
    fontWeight: '600' as const,
    fontSize: 14,
  },
});
