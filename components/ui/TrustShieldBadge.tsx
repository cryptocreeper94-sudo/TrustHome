import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

type TrustTier = 'gold' | 'silver' | 'bronze' | 'unverified';

interface TrustShieldBadgeProps {
  score: number;
  verified?: boolean;
  compact?: boolean;
  showLink?: boolean;
  blockchainRef?: string;
}

const TIER_CONFIG: Record<TrustTier, { label: string; color: string; bg: string; icon: 'shield-check' | 'shield-half-full' | 'shield-outline' }> = {
  gold: { label: 'Gold', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)', icon: 'shield-check' },
  silver: { label: 'Silver', color: '#8E9AAF', bg: 'rgba(142,154,175,0.12)', icon: 'shield-check' },
  bronze: { label: 'Bronze', color: '#CD7F32', bg: 'rgba(205,127,50,0.12)', icon: 'shield-half-full' },
  unverified: { label: 'Pending', color: '#737373', bg: 'rgba(115,115,115,0.10)', icon: 'shield-outline' },
};

function getTier(score: number): TrustTier {
  if (score >= 90) return 'gold';
  if (score >= 75) return 'silver';
  if (score >= 60) return 'bronze';
  return 'unverified';
}

export function TrustShieldBadge({ score, verified = true, compact = false, showLink = false, blockchainRef }: TrustShieldBadgeProps) {
  const { colors, isDark } = useTheme();
  const tier = getTier(score);
  const config = TIER_CONFIG[tier];

  const openVerification = () => {
    const url = blockchainRef
      ? `https://dwtl.io/verify/${blockchainRef}`
      : 'https://dwtl.io';
    Linking.openURL(url);
  };

  if (compact) {
    return (
      <Pressable onPress={showLink ? openVerification : undefined} style={[styles.compactBadge, { backgroundColor: config.bg }]}>
        <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.compactScore, { color: config.color }]}>{score}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderColor: config.color + '30' }]}>
      <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
        <MaterialCommunityIcons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.badgeInfo}>
        <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Trust Score</Text>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreValue, { color: colors.text }]}>{score}</Text>
          <View style={[styles.tierPill, { backgroundColor: config.bg }]}>
            <Text style={[styles.tierText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
      </View>
      {verified && (
        <Pressable onPress={openVerification} style={[styles.verifyBtn, { backgroundColor: config.bg }]}>
          <MaterialCommunityIcons name="link-variant" size={13} color={config.color} />
          <Text style={[styles.verifyText, { color: config.color }]}>Verify</Text>
        </Pressable>
      )}
    </View>
  );
}

export function TrustShieldInline({ score, showTier = false }: { score: number; showTier?: boolean }) {
  const tier = getTier(score);
  const config = TIER_CONFIG[tier];

  return (
    <View style={styles.inlineRow}>
      <MaterialCommunityIcons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.inlineScore, { color: config.color }]}>{score}</Text>
      {showTier && (
        <Text style={[styles.inlineTier, { color: config.color }]}>{config.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  badgeInfo: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  verifyText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  compactScore: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineScore: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  inlineTier: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
});
