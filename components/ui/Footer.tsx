import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface FooterLink {
  label: string;
  url?: string;
  onPress?: () => void;
  route?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export function Footer() {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const FOOTER_COLUMNS: FooterColumn[] = [
    {
      title: 'For Agents',
      links: [
        { label: 'Dashboard', onPress: () => {} },
        { label: 'CRM Integration', onPress: () => {} },
        { label: 'Marketing Tools', onPress: () => {} },
        { label: 'Analytics', onPress: () => {} },
        { label: 'Pricing', onPress: () => {} },
      ],
    },
    {
      title: 'For Professionals',
      links: [
        { label: 'Inspector Tools', onPress: () => {} },
        { label: 'Lender Portal', onPress: () => {} },
        { label: 'Title Services', onPress: () => {} },
        { label: 'Appraiser Tools', onPress: () => {} },
        { label: 'Contractor Hub', onPress: () => {} },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', onPress: () => {} },
        { label: 'MLS Information', url: 'https://www.nar.realtor/mls' },
        { label: 'API Documentation', onPress: () => {} },
        { label: 'Blog', onPress: () => {} },
        { label: 'Contact Us', onPress: () => {} },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', onPress: () => {} },
        { label: 'Privacy Policy', onPress: () => {} },
        { label: 'Data Protection', onPress: () => {} },
        { label: 'Cookie Policy', onPress: () => {} },
        { label: 'Licensing', onPress: () => {} },
      ],
    },
  ];

  const handleLinkPress = (link: FooterLink) => {
    if (link.route) {
      router.push(link.route as any);
    } else if (link.url) {
      Linking.openURL(link.url);
    } else if (link.onPress) {
      link.onPress();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.backgroundSecondary : colors.backgroundTertiary }]}>
      <View style={[styles.subFooter, { borderBottomColor: colors.divider }]}>
        <View style={styles.columns}>
          {FOOTER_COLUMNS.map((col, i) => (
            <View key={i} style={styles.column}>
              <Text style={[styles.colTitle, { color: colors.text }]}>{col.title}</Text>
              {col.links.map((link, j) => (
                <Pressable key={j} onPress={() => handleLinkPress(link)} hitSlop={4}>
                  <Text style={[styles.colLink, { color: colors.textSecondary }]}>{link.label}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')}>
            <Text style={[styles.bottomText, styles.bottomLink, { color: colors.textSecondary }]}>darkwavestudios.io</Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: colors.textTertiary }]}>{'\u00B7'}</Text>
          <Text style={[styles.bottomText, { color: colors.textTertiary }]}>{'\u00A9'} 2026</Text>
          <Text style={[styles.bottomDot, { color: colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => Linking.openURL('https://trustshield.tech')}>
            <Text style={[styles.bottomText, { color: colors.textSecondary }]}>
              Powered by <Text style={styles.bottomLink}>trustshield.tech</Text>
            </Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => Linking.openURL('https://dwtl.io')}>
            <Text style={[styles.bottomText, styles.bottomLink, { color: colors.textSecondary }]}>dwtl.io</Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => router.push('/team' as any)} testID="footer-team-link">
            <Text style={[styles.bottomText, styles.bottomLink, { color: colors.primary }]}>Team</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 32,
  },
  subFooter: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  columns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  column: {
    minWidth: 140,
    flex: 1,
    marginBottom: 12,
  },
  colTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  colLink: {
    fontSize: 13,
    lineHeight: 24,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  bottomText: {
    fontSize: 11,
  },
  bottomLink: {
    fontWeight: '500' as const,
  },
  bottomDot: {
    fontSize: 11,
  },
});
