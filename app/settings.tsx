import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { TrustShieldBadge } from '@/components/ui/TrustShieldBadge';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
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
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  defaultOpen?: boolean;
  items: SettingsItem[];
}

export default function SettingsScreen() {
  const { colors, isDark, mode, setMode } = useTheme();
  const { replayWelcomeGuide, isJenniferUser, replayPartnerDashboard } = useApp();
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const router = useRouter();

  const trustLayerQuery = useQuery<any>({
    queryKey: ['/api/trustlayer/status'],
  });

  const mlsQuery = useQuery<any[]>({
    queryKey: ['/api/mls/config?agentId=demo'],
  });

  const mlsConfigs = mlsQuery.data || [];
  const mlsConnected = mlsConfigs.length > 0;
  const mlsStatus = mlsConnected ? (mlsConfigs.some((c: any) => c.status === 'connected') ? 'Connected' : 'Pending') : 'Not Connected';
  const mlsStatusColor = mlsConnected ? (mlsConfigs.some((c: any) => c.status === 'connected') ? colors.success : colors.warning) : colors.textSecondary;

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
      icon: 'person',
      iconColor: '#007AFF',
      defaultOpen: true,
      items: [
        { icon: 'person-outline', label: 'Edit Profile', type: 'nav' },
        { icon: 'lock-closed-outline', label: 'Change Password', type: 'nav' },
        { icon: 'shield-checkmark-outline', label: 'Two-Factor Auth', type: 'toggle', toggleKey: 'twoFactor' },
      ],
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      iconColor: '#FF9500',
      items: [
        { icon: 'notifications-outline', label: 'Push Notifications', type: 'toggle', toggleKey: 'pushNotifications' },
        { icon: 'mail-outline', label: 'Email Alerts', type: 'toggle', toggleKey: 'emailAlerts' },
        { icon: 'chatbubble-outline', label: 'SMS Alerts', type: 'toggle', toggleKey: 'smsAlerts' },
        { icon: 'alarm-outline', label: 'Deadline Reminders', type: 'toggle', toggleKey: 'deadlineReminders' },
      ],
    },
    {
      title: 'Preferences',
      icon: 'color-palette',
      iconColor: '#AF52DE',
      items: [
        { icon: 'color-palette-outline', label: 'Theme', type: 'status', value: themeLabel },
        { icon: 'eye-outline', label: 'Default View', type: 'status', value: 'Agent' },
        { icon: 'calendar-outline', label: 'Calendar Sync', type: 'status', value: 'Connected', statusColor: colors.success },
      ],
    },
    {
      title: 'White Label Branding',
      icon: 'brush',
      iconColor: '#1A8A7E',
      items: [
        { icon: 'brush-outline', label: 'Brand Colors', type: 'nav' },
        { icon: 'image-outline', label: 'Logo Upload', type: 'nav' },
        { icon: 'globe-outline', label: 'Custom Domain', type: 'status', value: 'Active', statusColor: colors.success },
      ],
    },
    {
      title: 'Integrations',
      icon: 'git-network',
      iconColor: '#34C759',
      items: [
        { icon: 'git-network-outline', label: 'CRM Connection', type: 'status', value: 'Connected', statusColor: colors.success },
        { icon: 'chatbubbles-outline', label: 'Signal Chat', type: 'status', value: 'Active', statusColor: colors.success },
        { icon: 'shield-outline', label: 'Trust Layer (DWTL)', type: 'status', value: trustLayerQuery.data?.configured ? 'Connected' : 'Not Configured', statusColor: trustLayerQuery.data?.configured ? colors.success : colors.warning },
        { icon: 'home-outline', label: 'MLS Connection', type: 'status', value: mlsStatus, statusColor: mlsStatusColor },
      ],
    },
    {
      title: 'Legal',
      icon: 'document-text',
      iconColor: '#FF3B30',
      items: [
        { icon: 'document-text-outline', label: 'Terms of Service', type: 'nav' },
        { icon: 'lock-open-outline', label: 'Privacy Policy', type: 'nav' },
        { icon: 'download-outline', label: 'Data Export', type: 'nav' },
      ],
    },
  ];

  const renderSettingsRow = (item: SettingsItem, index: number) => (
    <Pressable
      key={index}
      onPress={() => {
        if (item.label === 'Theme') cycleTheme();
        if (item.label === 'MLS Connection') router.push('/mls-setup');
      }}
      style={[
        styles.settingsRow,
        index > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
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
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Profile & Settings" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
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

          <View style={{ marginTop: 14 }}>
            <TrustShieldBadge score={97.4} verified showLink />
          </View>

          <View style={styles.accordionGroup}>
            {SECTIONS.map((section, si) => (
              <AccordionSection
                key={si}
                title={section.title}
                icon={section.icon}
                iconColor={section.iconColor}
                defaultOpen={section.defaultOpen}
              >
                {section.items.map((item, ii) => renderSettingsRow(item, ii))}
              </AccordionSection>
            ))}

            {isJenniferUser && (
              <AccordionSection
                title="Partner Dashboard"
                icon="shield-checkmark"
                iconColor="#D4AF37"
                defaultOpen
              >
                <Pressable
                  onPress={replayPartnerDashboard}
                  style={styles.settingsRow}
                >
                  <View style={[styles.settingsIcon, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                    <Ionicons name="stats-chart" size={18} color="#D4AF37" />
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>View Partner Dashboard</Text>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusValue, { color: '#D4AF37' }]}>51% Owner</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </Pressable>
                <Pressable
                  onPress={replayPartnerDashboard}
                  style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}
                >
                  <View style={[styles.settingsIcon, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                    <Ionicons name="trending-up" size={18} color="#D4AF37" />
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>Revenue Projections</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </Pressable>
                <Pressable
                  onPress={replayPartnerDashboard}
                  style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}
                >
                  <View style={[styles.settingsIcon, { backgroundColor: 'rgba(212,175,55,0.12)' }]}>
                    <Ionicons name="layers" size={18} color="#D4AF37" />
                  </View>
                  <Text style={[styles.settingsLabel, { color: colors.text }]}>White-Label & Franchise Info</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                </Pressable>
              </AccordionSection>
            )}

            <AccordionSection
              title="Help"
              icon="help-circle"
              iconColor="#007AFF"
            >
              <Pressable
                onPress={replayWelcomeGuide}
                style={styles.settingsRow}
              >
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="map-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>Replay Welcome Tour</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </Pressable>
              <Pressable
                onPress={() => setShowHelp(true)}
                style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: colors.divider }]}
              >
                <View style={[styles.settingsIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="help-circle-outline" size={18} color={colors.primary} />
                </View>
                <Text style={[styles.settingsLabel, { color: colors.text }]}>About This Screen</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </Pressable>
            </AccordionSection>
          </View>

          <Pressable style={[styles.signOutBtn, { borderColor: colors.error }]}>
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
          </Pressable>
        </View>
        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.settings.title}
        description={SCREEN_HELP.settings.description}
        details={SCREEN_HELP.settings.details}
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
  accordionGroup: {
    marginTop: 24,
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
