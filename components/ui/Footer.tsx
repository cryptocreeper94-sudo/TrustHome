import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Linking, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const { width } = useWindowDimensions();
  const isMobile = width < 500;
  const dwscClickRef = useRef({ count: 0, timer: null as ReturnType<typeof setTimeout> | null });
  const handleDWSCClick = () => {
    dwscClickRef.current.count++;
    if (dwscClickRef.current.count === 3) {
      dwscClickRef.current.count = 0;
      if (dwscClickRef.current.timer) clearTimeout(dwscClickRef.current.timer);
      Linking.openURL('https://dwsc.io/#portal');
    } else {
      if (dwscClickRef.current.timer) clearTimeout(dwscClickRef.current.timer);
      dwscClickRef.current.timer = setTimeout(() => { dwscClickRef.current.count = 0; }, 800);
    }
  };

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
    <View style={[
      styles.container,
      { backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : colors.backgroundTertiary },
    ]}>
      <LinearGradient
        colors={['rgba(26,138,126,0.4)', 'rgba(139,92,246,0.3)', 'rgba(34,211,238,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />

      <View style={[
        styles.subFooter,
        { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : colors.divider },
      ]}>
        <View style={[styles.columns, { gap: isMobile ? 12 : 16 }]}>
          {FOOTER_COLUMNS.map((col, i) => (
            <View key={i} style={[styles.column, { minWidth: isMobile ? '42%' as any : 140 }]}>
              <Text style={[
                styles.colTitle,
                { color: isDark ? 'rgba(255,255,255,0.7)' : colors.text, fontSize: isMobile ? 11 : 13 },
              ]}>
                {col.title}
              </Text>
              {col.links.map((link, j) => (
                <Pressable
                  key={j}
                  onPress={() => handleLinkPress(link)}
                  hitSlop={4}
                  style={({ pressed }) => [styles.colLinkPressable, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={[
                    styles.colLink,
                    { color: isDark ? 'rgba(255,255,255,0.45)' : colors.textSecondary, fontSize: isMobile ? 12 : 13 },
                  ]}>
                    {link.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomRow}>
          <Pressable onPress={() => Linking.openURL('https://darkwavestudios.io')} style={({ pressed }) => [styles.bottomLinkPressable, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.bottomText, styles.bottomLink, { color: isDark ? 'rgba(255,255,255,0.45)' : colors.textSecondary }]}>darkwavestudios.io</Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: isDark ? 'rgba(255,255,255,0.2)' : colors.textTertiary }]}>{'\u00B7'}</Text>
          <Text style={[styles.bottomText, { color: isDark ? 'rgba(255,255,255,0.3)' : colors.textTertiary }]}>{'\u00A9'} 2026</Text>
          <Text style={[styles.bottomDot, { color: isDark ? 'rgba(255,255,255,0.2)' : colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => Linking.openURL('https://trustshield.tech')} style={({ pressed }) => [styles.bottomLinkPressable, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.bottomText, { color: isDark ? 'rgba(255,255,255,0.45)' : colors.textSecondary }]}>
              Powered by <Text style={styles.bottomLink}>trustshield.tech</Text>
            </Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: isDark ? 'rgba(255,255,255,0.2)' : colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => Linking.openURL('https://dwtl.io')} style={({ pressed }) => [styles.bottomLinkPressable, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.bottomText, styles.bottomLink, { color: isDark ? 'rgba(255,255,255,0.45)' : colors.textSecondary }]}>dwtl.io</Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: isDark ? 'rgba(255,255,255,0.2)' : colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => router.push('/ecosystem' as any)} style={({ pressed }) => [styles.bottomLinkPressable, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.bottomText, styles.bottomLink, { color: '#22d3ee' }]}>Trust Layer</Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: isDark ? 'rgba(255,255,255,0.2)' : colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={() => router.push('/team' as any)} style={({ pressed }) => [styles.bottomLinkPressable, { opacity: pressed ? 0.6 : 1 }]} testID="footer-team-link">
            <Text style={[styles.bottomText, styles.bottomLink, { color: '#1A8A7E' }]}>Team</Text>
          </Pressable>
          <Text style={[styles.bottomDot, { color: isDark ? 'rgba(255,255,255,0.2)' : colors.textTertiary }]}>{'\u00B7'}</Text>
          <Pressable onPress={handleDWSCClick} style={({ pressed }) => [styles.bottomLinkPressable, { opacity: pressed ? 0.6 : 1 }]} testID="footer-dwsc-link">
            <Text style={[styles.bottomText, { color: isDark ? 'rgba(255,255,255,0.25)' : colors.textTertiary }]}>◈</Text>
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  accentLine: {
    height: 1,
    width: '100%',
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
  },
  column: {
    flex: 1,
    marginBottom: 12,
  },
  colTitle: {
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  colLinkPressable: {
    minHeight: 44,
    justifyContent: 'center' as const,
  },
  colLink: {},
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
  bottomLinkPressable: {
    minHeight: 44,
    justifyContent: 'center' as const,
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
