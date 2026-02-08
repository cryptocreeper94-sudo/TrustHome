import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Footer } from '@/components/ui/Footer';

interface SettingsItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  type: 'nav' | 'toggle' | 'status';
  value?: string;
  toggleKey?: string;
  statusColor?: string;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const { colors, isDark, mode, setMode } = useTheme();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    twoFactor: true,
    pushNotifications: true,
    emailAlerts: true,
    smsAlerts: false,
    deadlineReminders: true,
  });

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const themeLabel = mode === 'system' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light';

  const cycleTheme = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  const SECTIONS: SettingsSection[] = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', type: 'nav' },
        { icon: 'lock-closed-outline', label: 'Change Password', type: 'nav' },
        { icon: 'shield-checkmark-outline', label: 'Two-Factor Auth', type: 'toggle', toggleKey: 'twoFactor' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { icon: 'notifications-outline', label: 'Push Notifications', type: 'toggle', toggleKey: 'pushNotifications' },
        { icon: 'mail-outline', label: 'Email Alerts', type: 'toggle', toggleKey: 'emailAlerts' },
        { icon: 'chatbubble-outline', label: 'SMS Alerts', type: 'toggle', toggleKey: 'smsAlerts' },
        { icon: 'alarm-outline', label: 'Deadline Reminders', type: 'toggle', toggleKey: 'deadlineReminders' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'color-palette-outline', label: 'Theme', type: 'status', value: themeLabel },
        { icon: 'eye-outline', label: 'Default View', type: 'status', value: 'Agent' },
        { icon: 'calendar-outline', label: 'Calendar Sync', type: 'status', value: 'Connected', statusColor: colors.success },
      ],
    },
    {
      title: 'White Label Branding',
      items: [
        { icon: 'brush-outline', label: 'Brand Colors', type: 'nav' },
        { icon: 'image-outline', label: 'Logo Upload', type: 'nav' },
        { icon: 'globe-outline', label: 'Custom Domain', type: 'status', value: 'Active', statusColor: colors.success },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { icon: 'git-network-outline', label: 'CRM Connection', type: 'status', value: 'Connected', statusColor: colors.success },
        { icon: 'chatbubbles-outline', label: 'Signal Chat', type: 'status', value: 'Active', statusColor: colors.success },
        { icon: 'shield-outline', label: 'Trust Shield', type: 'status', value: 'Verified', statusColor: colors.success },
        { icon: 'home-outline', label: 'MLS Connection', type: 'status', value: 'Synced', statusColor: colors.success },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: 'document-text-outline', label: 'Terms of Service', type: 'nav' },
        { icon: 'lock-open-outline', label: 'Privacy Policy', type: 'nav' },
        { icon: 'download-outline', label: 'Data Export', type: 'nav' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Profile & Settings" showBack />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <GlassCard>
            <View style={styles.profileSection}>
              <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.profileAvatarText}>JL</Text>
              </View>
              <Text style={[styles.profileName, { color: colors.text }]}>Jennifer Lambert</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>jennifer@lambertrealty.com</Text>
              <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>(555) 123-4567</Text>
              <View style={styles.profileMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="card-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>License #RE-2024-84721</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>Lambert Realty Group</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <GlassCard style={{ marginTop: 14 }}>
            <View style={styles.trustRow}>
              <View style={styles.trustLeft}>
                <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.trustLabel, { color: colors.textSecondary }]}>Trust Score</Text>
                  <Text style={[styles.trustValue, { color: colors.text }]}>97.4</Text>
                </View>
              </View>
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="link" size={14} color={colors.primary} />
                <Text style={[styles.verifiedText, { color: colors.primary }]}>Blockchain Verified</Text>
              </View>
            </View>
          </GlassCard>

          {SECTIONS.map((section, si) => (
            <View key={si} style={styles.settingsGroup}>
              <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{section.title}</Text>
              <GlassCard>
                {section.items.map((item, ii) => (
                  <Pressable
                    key={ii}
                    onPress={() => {
                      if (item.label === 'Theme') cycleTheme();
                    }}
                    style={[
                      styles.settingsRow,
                      ii > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                    ]}
                  >
                    <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name={item.icon} size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.settingsLabel, { color: colors.text }]}>{item.label}</Text>
                    {item.type === 'toggle' && item.toggleKey && (
                      <Switch
                        value={toggles[item.toggleKey]}
                        onValueChange={() => handleToggle(item.toggleKey!)}
                        trackColor={{ false: colors.border, true: colors.primary + '60' }}
                        thumbColor={toggles[item.toggleKey] ? colors.primary : colors.textTertiary}
                      />
                    )}
                    {item.type === 'status' && (
                      <View style={styles.statusRow}>
                        <Text style={[styles.statusValue, { color: item.statusColor || colors.textSecondary }]}>{item.value}</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                      </View>
                    )}
                    {item.type === 'nav' && (
                      <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                    )}
                  </Pressable>
                ))}
              </GlassCard>
            </View>
          ))}

          <Pressable style={[styles.signOutBtn, { borderColor: colors.error }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
          </Pressable>
        </View>
        <Footer />
      </ScrollView>
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
  profileSection: {
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  profileAvatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700' as const,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  profileDetail: {
    fontSize: 14,
    marginTop: 2,
  },
  profileMeta: {
    marginTop: 12,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  trustLeft: {
    flexDirection: 'row',
    alignItems: 'center' as const,
  },
  trustLabel: {
    fontSize: 12,
  },
  trustValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 5,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  settingsGroup: {
    marginTop: 24,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  settingsIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    gap: 6,
  },
  statusValue: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 32,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
