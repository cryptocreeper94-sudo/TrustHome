import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrustShieldInline } from '@/components/ui/TrustShieldBadge';
import { Footer } from '@/components/ui/Footer';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { BentoGrid } from '@/components/ui/BentoGrid';
import { HorizontalCarousel } from '@/components/ui/HorizontalCarousel';
import { AccordionSection } from '@/components/ui/AccordionSection';

const CATEGORIES = ['All', 'Inspectors', 'Lenders', 'Title', 'Appraisers', 'Contractors'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<string, string> = {
  Inspectors: '#E74C3C',
  Lenders: '#3498DB',
  Title: '#9B59B6',
  Appraisers: '#F39C12',
  Contractors: '#2ECC71',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Inspectors: 'search',
  Lenders: 'card',
  Title: 'shield',
  Appraisers: 'calculator',
  Contractors: 'hammer',
};

interface Vendor {
  id: string;
  name: string;
  company: string;
  category: string;
  initial: string;
  trustScore: number;
  activeTransactions: number;
  phone: string;
  lastUsed: string;
  specialties: string[];
  recentTransactions: string[];
}

const SAMPLE_VENDORS: Vendor[] = [
  { id: '1', name: 'Michael Torres', company: 'ProCheck Inspections', category: 'Inspectors', initial: 'MT', trustScore: 98, activeTransactions: 3, phone: '(555) 234-5678', lastUsed: 'Feb 5, 2026', specialties: ['Residential', 'Radon Testing', 'Mold Assessment'], recentTransactions: ['742 Elm Street - Buyer Inspection', '1200 Oak Ave - Pre-listing'] },
  { id: '2', name: 'Sarah Chen', company: 'Pacific Lending Group', category: 'Lenders', initial: 'SC', trustScore: 96, activeTransactions: 5, phone: '(555) 345-6789', lastUsed: 'Feb 7, 2026', specialties: ['Conventional', 'FHA', 'VA Loans', 'Jumbo'], recentTransactions: ['890 Pine St - Pre-approval', '234 Maple Dr - Closing'] },
  { id: '3', name: 'David Park', company: 'ClearTitle Services', category: 'Title', initial: 'DP', trustScore: 95, activeTransactions: 4, phone: '(555) 456-7890', lastUsed: 'Feb 6, 2026', specialties: ['Title Search', 'Escrow Services', 'Commercial Closings'], recentTransactions: ['567 Cedar Ln - Title Search', '1100 Birch Rd - Closing'] },
  { id: '4', name: 'Angela Martinez', company: 'Valley Appraisals', category: 'Appraisers', initial: 'AM', trustScore: 94, activeTransactions: 2, phone: '(555) 567-8901', lastUsed: 'Feb 3, 2026', specialties: ['Residential', 'Multi-family', 'Luxury Properties'], recentTransactions: ['456 Willow Way - Full Appraisal'] },
  { id: '5', name: 'James Wilson', company: 'Wilson Home Repair', category: 'Contractors', initial: 'JW', trustScore: 92, activeTransactions: 1, phone: '(555) 678-9012', lastUsed: 'Jan 28, 2026', specialties: ['Roofing', 'HVAC', 'Plumbing', 'Electrical'], recentTransactions: ['742 Elm St - Roof Repair Estimate'] },
  { id: '6', name: 'Lisa Nguyen', company: 'Premier Home Inspections', category: 'Inspectors', initial: 'LN', trustScore: 97, activeTransactions: 2, phone: '(555) 789-0123', lastUsed: 'Feb 4, 2026', specialties: ['Residential', 'Pool & Spa', 'Termite'], recentTransactions: ['321 Spruce Ave - Full Inspection'] },
  { id: '7', name: 'Robert Kim', company: 'Horizon Mortgage', category: 'Lenders', initial: 'RK', trustScore: 91, activeTransactions: 3, phone: '(555) 890-1234', lastUsed: 'Feb 1, 2026', specialties: ['First-time Buyers', 'Refinance', 'Construction Loans'], recentTransactions: ['678 Ash St - Pre-approval', '900 Palm Dr - Rate Lock'] },
  { id: '8', name: 'Karen Thompson', company: 'Precision Appraisals', category: 'Appraisers', initial: 'KT', trustScore: 93, activeTransactions: 1, phone: '(555) 901-2345', lastUsed: 'Jan 30, 2026', specialties: ['Residential', 'Estate Valuations', 'FHA Appraisals'], recentTransactions: ['1500 Magnolia Blvd - Appraisal'] },
  { id: '9', name: 'Carlos Rivera', company: 'Rivera Contracting', category: 'Contractors', initial: 'CR', trustScore: 90, activeTransactions: 2, phone: '(555) 012-3456', lastUsed: 'Feb 2, 2026', specialties: ['Kitchen Remodel', 'Bathroom', 'Painting', 'Flooring'], recentTransactions: ['234 Maple Dr - Kitchen Quote', '567 Cedar Ln - Paint Estimate'] },
];

interface ReferralPartner {
  name: string;
  company: string;
  initial: string;
  referrals: number;
  commission: string;
}

const REFERRAL_PARTNERS: ReferralPartner[] = [
  { name: 'Sarah Chen', company: 'Pacific Lending Group', initial: 'SC', referrals: 12, commission: '$4,800' },
  { name: 'Michael Torres', company: 'ProCheck Inspections', initial: 'MT', referrals: 8, commission: '$2,400' },
  { name: 'David Park', company: 'ClearTitle Services', initial: 'DP', referrals: 6, commission: '$3,200' },
];

function VendorCard({ vendor, isExpanded, onToggle, catColor, colors }: {
  vendor: Vendor;
  isExpanded: boolean;
  onToggle: () => void;
  catColor: string;
  colors: any;
}) {
  return (
    <GlassCard style={{ marginBottom: 12 }} onPress={onToggle}>
      <View style={styles.vendorCard}>
        <View style={styles.vendorTop}>
          <View style={[styles.vendorAvatar, { backgroundColor: catColor }]}>
            <Text style={styles.vendorAvatarText}>{vendor.initial}</Text>
          </View>
          <View style={styles.vendorInfo}>
            <Text style={[styles.vendorName, { color: colors.text }]}>{vendor.name}</Text>
            <Text style={[styles.vendorCompany, { color: colors.textSecondary }]}>{vendor.company}</Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: catColor }]}>{vendor.category}</Text>
          </View>
        </View>

        <View style={styles.vendorMetrics}>
          <View style={styles.metricItem}>
            <TrustShieldInline score={vendor.trustScore} showTier />
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="briefcase" size={14} color={colors.primary} />
            <Text style={[styles.metricValue, { color: colors.text }]}>{vendor.activeTransactions}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="call" size={14} color={colors.primary} />
            <Text style={[styles.metricPhone, { color: colors.text }]}>{vendor.phone}</Text>
          </View>
          <Text style={[styles.lastUsed, { color: colors.textTertiary }]}>{vendor.lastUsed}</Text>
        </View>

        {isExpanded && (
          <View style={[styles.expandedSection, { borderTopColor: colors.divider }]}>
            <Text style={[styles.expandedTitle, { color: colors.text }]}>Specialties</Text>
            <View style={styles.tagRow}>
              {vendor.specialties.map((s: string, i: number) => (
                <View key={i} style={[styles.tag, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{s}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.expandedTitle, { color: colors.text, marginTop: 12 }]}>Recent Transactions</Text>
            {vendor.recentTransactions.map((t: string, i: number) => (
              <View key={i} style={styles.txRow}>
                <Ionicons name="document-text-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.txText, { color: colors.textSecondary }]}>{t}</Text>
              </View>
            ))}

            <View style={styles.expandedActions}>
              <Pressable style={[styles.expandedBtn, { backgroundColor: colors.success }]}>
                <Ionicons name="call" size={16} color="#FFF" />
                <Text style={styles.expandedBtnText}>Call</Text>
              </Pressable>
              <Pressable style={[styles.expandedBtn, { backgroundColor: colors.info }]}>
                <Ionicons name="chatbubble" size={16} color="#FFF" />
                <Text style={styles.expandedBtnText}>Message</Text>
              </Pressable>
              <Pressable style={[styles.expandedBtn, { backgroundColor: colors.primary }]}>
                <Ionicons name="add-circle" size={16} color="#FFF" />
                <Text style={styles.expandedBtnText}>Assign to Deal</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={() => Linking.openURL(`https://dwtl.io/verify/${vendor.id}`)}
              style={styles.verifyLink}
            >
              <Ionicons name="link-outline" size={13} color={colors.primary} />
              <Text style={[styles.verifyLinkText, { color: colors.primary }]}>Verify on dwtl.io</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.expandIndicator}>
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textTertiary} />
        </View>
      </View>
    </GlassCard>
  );
}

export default function NetworkScreen() {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const subcontractorsQuery = useQuery<any[]>({
    queryKey: ['/api/subcontractors'],
  });

  const apiSubcontractors = subcontractorsQuery.data && Array.isArray(subcontractorsQuery.data) && subcontractorsQuery.data.length > 0 
    ? subcontractorsQuery.data 
    : null;

  const vendorsList = apiSubcontractors || SAMPLE_VENDORS;

  const catColor = (cat: string) => CATEGORY_COLORS[cat] || colors.primary;

  const topVendors = useMemo(() =>
    [...vendorsList].sort((a, b) => b.trustScore - a.trustScore).slice(0, 5),
    [vendorsList]
  );

  const vendorsByCategory = useMemo(() => {
    const groups: Record<string, Vendor[]> = {};
    const cats = ['Inspectors', 'Lenders', 'Title', 'Appraisers', 'Contractors'];
    cats.forEach(c => { groups[c] = []; });
    vendorsList.forEach(v => {
      if (groups[v.category]) groups[v.category].push(v);
    });
    return groups;
  }, [vendorsList]);

  const visibleCategories = useMemo(() => {
    if (activeCategory === 'All') {
      return ['Inspectors', 'Lenders', 'Title', 'Appraisers', 'Contractors'].filter(
        c => vendorsByCategory[c] && vendorsByCategory[c].length > 0
      );
    }
    return [activeCategory];
  }, [activeCategory, vendorsByCategory]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Professional Network" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      {apiSubcontractors && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 16, marginTop: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34C759' }} />
          <Text style={{ fontSize: 10, color: colors.textTertiary }}>Live data</Text>
        </View>
      )}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <BentoGrid columns={3} gap={10}>
            {[
              { label: 'Connected Vendors', value: '24', icon: 'people' as const },
              { label: 'Referrals This Month', value: '7', icon: 'swap-horizontal' as const },
              { label: 'Avg Trust Score', value: '94.2', icon: 'shield-checkmark' as const },
            ].map((stat, i) => (
              <GlassCard key={i} compact style={styles.statCard}>
                <Ionicons name={stat.icon} size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </GlassCard>
            ))}
          </BentoGrid>

          <HorizontalCarousel title="Top Trust Scores" itemWidth={180} style={{ marginTop: 16 }}>
            {topVendors.map(vendor => (
              <GlassCard key={vendor.id} compact style={styles.carouselCard}>
                <View style={styles.carouselCardInner}>
                  <View style={[styles.carouselAvatar, { backgroundColor: catColor(vendor.category) }]}>
                    <Text style={styles.carouselAvatarText}>{vendor.initial}</Text>
                  </View>
                  <Text style={[styles.carouselName, { color: colors.text }]} numberOfLines={1}>{vendor.name}</Text>
                  <Text style={[styles.carouselCompany, { color: colors.textSecondary }]} numberOfLines={1}>{vendor.company}</Text>
                  <View style={styles.carouselBadge}>
                    <TrustShieldInline score={vendor.trustScore} showTier />
                  </View>
                </View>
              </GlassCard>
            ))}
          </HorizontalCarousel>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll} contentContainerStyle={styles.pillRow}>
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: activeCategory === cat ? colors.primary : colors.backgroundSecondary,
                    borderColor: activeCategory === cat ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.pillText, { color: activeCategory === cat ? '#FFF' : colors.textSecondary }]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {subcontractorsQuery.isLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          {visibleCategories.map((category, catIdx) => {
            const vendors = vendorsByCategory[category] || [];
            if (vendors.length === 0) return null;
            return (
              <AccordionSection
                key={category}
                title={category}
                icon={CATEGORY_ICONS[category]}
                iconColor={CATEGORY_COLORS[category]}
                badge={vendors.length}
                defaultOpen={activeCategory === 'All' ? true : catIdx === 0}
              >
                {vendors.map(vendor => (
                  <VendorCard
                    key={vendor.id}
                    vendor={vendor}
                    isExpanded={expandedId === vendor.id}
                    onToggle={() => setExpandedId(expandedId === vendor.id ? null : vendor.id)}
                    catColor={catColor(vendor.category)}
                    colors={colors}
                  />
                ))}
              </AccordionSection>
            );
          })}

          <AccordionSection
            title="Referral Partners"
            icon="swap-horizontal"
            iconColor="#1A8A7E"
            badge={REFERRAL_PARTNERS.length}
            defaultOpen={activeCategory === 'All'}
          >
            {REFERRAL_PARTNERS.map((partner, i) => (
              <GlassCard key={i} style={{ marginBottom: 10 }}>
                <View style={styles.referralCard}>
                  <View style={[styles.referralAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.referralAvatarText}>{partner.initial}</Text>
                  </View>
                  <View style={styles.referralInfo}>
                    <Text style={[styles.referralName, { color: colors.text }]}>{partner.name}</Text>
                    <Text style={[styles.referralCompany, { color: colors.textSecondary }]}>{partner.company}</Text>
                  </View>
                  <View style={styles.referralStats}>
                    <View style={styles.referralStatItem}>
                      <Text style={[styles.referralStatValue, { color: colors.text }]}>{partner.referrals}</Text>
                      <Text style={[styles.referralStatLabel, { color: colors.textSecondary }]}>Referrals</Text>
                    </View>
                    <View style={styles.referralStatItem}>
                      <Text style={[styles.referralStatValue, { color: colors.success }]}>{partner.commission}</Text>
                      <Text style={[styles.referralStatLabel, { color: colors.textSecondary }]}>Earned</Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            ))}
          </AccordionSection>
        </View>
        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.network.title}
        description={SCREEN_HELP.network.description}
        details={SCREEN_HELP.network.details}
        examples={SCREEN_HELP.network.examples}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  carouselCard: {
    width: 180,
    minHeight: 140,
  },
  carouselCardInner: {
    alignItems: 'center' as const,
    gap: 6,
  },
  carouselAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  carouselAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  carouselName: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  carouselCompany: {
    fontSize: 11,
    textAlign: 'center' as const,
  },
  carouselBadge: {
    marginTop: 2,
  },
  pillScroll: {
    marginTop: 16,
    marginBottom: 16,
  },
  pillRow: {
    gap: 8,
    paddingRight: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  vendorCard: {},
  vendorTop: {
    flexDirection: 'row',
    alignItems: 'center' as const,
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  vendorAvatarText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  vendorCompany: {
    fontSize: 12,
    marginTop: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  vendorMetrics: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    marginTop: 10,
    gap: 12,
    flexWrap: 'wrap' as const,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  metricLabel: {
    fontSize: 11,
  },
  metricPhone: {
    fontSize: 12,
  },
  lastUsed: {
    fontSize: 11,
    marginLeft: 'auto' as const,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 3,
  },
  txText: {
    fontSize: 12,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  expandedBtn: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  expandedBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  verifyLink: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    marginTop: 12,
    paddingVertical: 6,
  },
  verifyLinkText: {
    fontSize: 12,
    fontWeight: '500' as const,
    textDecorationLine: 'underline' as const,
  },
  expandIndicator: {
    alignItems: 'center' as const,
    marginTop: 8,
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center' as const,
  },
  referralAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  referralAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  referralInfo: {
    flex: 1,
    marginLeft: 12,
  },
  referralName: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  referralCompany: {
    fontSize: 12,
    marginTop: 1,
  },
  referralStats: {
    flexDirection: 'row',
    gap: 16,
  },
  referralStatItem: {
    alignItems: 'center' as const,
  },
  referralStatValue: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  referralStatLabel: {
    fontSize: 10,
    marginTop: 1,
  },
});
