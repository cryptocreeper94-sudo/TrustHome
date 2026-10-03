import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Shown on workspace screens when the visitor isn't a signed-in agent:
 * explains that the cards are sample data and links to sign-in.
 * When `live` is true it shows a small "Your workspace" indicator instead.
 */
export function SampleDataBanner({ live, count, noun = 'items' }: { live: boolean; count?: number; noun?: string }) {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  if (live) {
    return (
      <View style={styles.liveRow} testID="workspace-live-indicator">
        <View style={styles.liveDot} />
        <Text style={[styles.liveText, { color: colors.textTertiary }]}>
          Your workspace{typeof count === 'number' ? ` \u00b7 ${count} ${noun}` : ''}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.banner, {
        backgroundColor: isDark ? 'rgba(26,138,126,0.12)' : 'rgba(26,138,126,0.08)',
        borderColor: 'rgba(26,138,126,0.35)',
      }]}
      testID="sample-data-banner"
    >
      <Ionicons name="eye-outline" size={16} color="#1A8A7E" />
      <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
        Sample data. Sign in to use your own private workspace.
      </Text>
      <Pressable onPress={() => router.push('/team' as any)} style={styles.bannerBtn} testID="sample-data-signin">
        <Text style={styles.bannerBtnText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, marginTop: 6, marginBottom: 2 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#34D399' },
  liveText: { fontSize: 11, fontWeight: '500' },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, marginVertical: 8,
  },
  bannerText: { flex: 1, fontSize: 12, lineHeight: 17 },
  bannerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1A8A7E' },
  bannerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
