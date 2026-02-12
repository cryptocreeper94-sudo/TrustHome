import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { AccordionSection } from '@/components/ui/AccordionSection';
import { InfoButton, InfoModal } from '@/components/ui/InfoModal';
import { SCREEN_HELP } from '@/constants/helpContent';
import { Footer } from '@/components/ui/Footer';

interface BrandColor {
  label: string;
  hex: string;
}

const BRAND_COLORS: BrandColor[] = [
  { label: 'Teal', hex: '#1A8A7E' },
  { label: 'Blue', hex: '#007AFF' },
  { label: 'Purple', hex: '#AF52DE' },
  { label: 'Coral', hex: '#FF6B6B' },
];

interface WhiteLabelItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  status: string;
  statusColor: 'success' | 'warning' | 'primary';
}

const WHITE_LABEL_ITEMS: WhiteLabelItem[] = [
  { icon: 'globe-outline', label: 'Custom Domain', status: 'Active', statusColor: 'success' },
  { icon: 'mail-outline', label: 'Email Templates', status: 'Configured', statusColor: 'success' },
  { icon: 'people-outline', label: 'Client Portal Branding', status: 'Pending Setup', statusColor: 'warning' },
];

export default function BrandingScreen() {
  const { colors, isDark } = useTheme();
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('#1A8A7E');

  const agentLandingUrl = 'https://trusthome.io/agent/demo';

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing will sync with your ecosystem account.',
      [{ text: 'OK' }]
    );
  };

  const handleLogoUpload = () => {
    Alert.alert(
      'Upload Logo',
      'Logo upload will sync with DarkWave Media Studio.',
      [{ text: 'OK' }]
    );
  };

  const handleCopyLink = async () => {
    await Clipboard.setStringAsync(agentLandingUrl);
    Alert.alert('Copied', 'Landing page link copied to clipboard.', [{ text: 'OK' }]);
  };

  const handlePreviewPage = () => {
    Linking.openURL(agentLandingUrl);
  };

  const handleGenerateQR = () => {
    Alert.alert(
      'Generate QR Code',
      'QR code generation will be available in a future update.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Branding & Profile" showBack rightAction={<InfoButton onPress={() => setShowHelp(true)} />} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <View style={styles.accordionGroup}>
              <AccordionSection
                title="Agent Profile"
                icon="person"
                iconColor="#007AFF"
                defaultOpen
              >
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.profileSection}>
                    <View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={styles.profileAvatarText}>JL</Text>
                    </View>
                    <Text style={[styles.profileName, { color: colors.text }]}>Jennifer Lambert</Text>
                    <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>jennifer@lambertrealty.com</Text>
                    <Text style={[styles.profileDetail, { color: colors.textSecondary }]}>(555) 123-4567</Text>
                    <View style={styles.profileMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>Lambert Realty Group</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="card-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>License #RE-2024-84721</Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
                <Pressable
                  onPress={handleEditProfile}
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="create-outline" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Edit Profile</Text>
                </Pressable>
              </AccordionSection>

              <AccordionSection
                title="Brand Colors"
                icon="color-palette"
                iconColor="#AF52DE"
              >
                <View style={styles.colorPreviewRow}>
                  <View style={[styles.colorSwatch, { backgroundColor: selectedColor }]} />
                  <View style={styles.colorPreviewInfo}>
                    <Text style={[styles.colorPreviewLabel, { color: colors.text }]}>Primary Brand Color</Text>
                    <Text style={[styles.colorPreviewHex, { color: colors.textSecondary }]}>{selectedColor.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.colorOptionsRow}>
                  {BRAND_COLORS.map((bc) => (
                    <Pressable
                      key={bc.hex}
                      onPress={() => setSelectedColor(bc.hex)}
                      style={styles.colorOptionWrap}
                    >
                      <View style={[
                        styles.colorCircle,
                        { backgroundColor: bc.hex },
                        selectedColor === bc.hex && styles.colorCircleSelected,
                      ]}>
                        {selectedColor === bc.hex && (
                          <Ionicons name="checkmark" size={20} color="#FFF" />
                        )}
                      </View>
                      <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>{bc.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </AccordionSection>

              <AccordionSection
                title="Logo & Assets"
                icon="image"
                iconColor="#FF9500"
              >
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.logoPlaceholder}>
                    <View style={[styles.logoIconCircle, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                    </View>
                    <Text style={[styles.logoTitle, { color: colors.text }]}>Custom Logo</Text>
                    <Text style={[styles.logoDesc, { color: colors.textSecondary }]}>
                      Upload your brokerage or personal brand logo. Supported formats: PNG, SVG, JPEG.
                    </Text>
                  </View>
                </GlassCard>
                <Pressable
                  onPress={handleLogoUpload}
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Upload Logo</Text>
                </Pressable>
              </AccordionSection>

              <AccordionSection
                title="Agent Landing Page"
                icon="globe"
                iconColor="#34C759"
              >
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.landingPreview}>
                    <View style={[styles.landingUrlRow, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <Ionicons name="link-outline" size={16} color={colors.primary} />
                      <Text style={[styles.landingUrl, { color: colors.text }]} numberOfLines={1}>{agentLandingUrl}</Text>
                    </View>
                    <Text style={[styles.landingDesc, { color: colors.textSecondary }]}>
                      Share this link with clients to showcase your profile, listings, and reviews.
                    </Text>
                  </View>
                </GlassCard>
                <View style={styles.landingActions}>
                  <Pressable
                    onPress={handleCopyLink}
                    style={[styles.actionBtnHalf, { backgroundColor: colors.primary }]}
                  >
                    <Ionicons name="copy-outline" size={18} color="#FFF" />
                    <Text style={styles.actionBtnText}>Copy Link</Text>
                  </Pressable>
                  <Pressable
                    onPress={handlePreviewPage}
                    style={[styles.actionBtnHalf, { backgroundColor: colors.info }]}
                  >
                    <Ionicons name="open-outline" size={18} color="#FFF" />
                    <Text style={styles.actionBtnText}>Preview</Text>
                  </Pressable>
                </View>
              </AccordionSection>

              <AccordionSection
                title="QR Code"
                icon="qr-code"
                iconColor="#E74C3C"
              >
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.qrSection}>
                    <View style={[styles.qrPlaceholder, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
                      <Ionicons name="qr-code-outline" size={64} color={colors.textTertiary} />
                    </View>
                    <Text style={[styles.qrDesc, { color: colors.textSecondary }]}>
                      Generate a personalized QR code for client onboarding. Clients can scan to access your landing page and start the transaction process.
                    </Text>
                  </View>
                </GlassCard>
                <Pressable
                  onPress={handleGenerateQR}
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="qr-code-outline" size={18} color="#FFF" />
                  <Text style={styles.actionBtnText}>Generate QR Code</Text>
                </Pressable>
              </AccordionSection>

              <AccordionSection
                title="White-Label Settings"
                icon="briefcase"
                iconColor="#1A8A7E"
              >
                <Text style={[styles.wlDesc, { color: colors.textSecondary }]}>
                  Configure white-label branding for your brokerage. Customize the client-facing experience with your own domain, email templates, and portal branding.
                </Text>
                {WHITE_LABEL_ITEMS.map((item, index) => (
                  <View
                    key={index}
                    style={[
                      styles.wlRow,
                      index > 0 && { borderTopWidth: 1, borderTopColor: colors.divider },
                    ]}
                  >
                    <View style={[styles.wlIcon, { backgroundColor: colors.primaryLight }]}>
                      <Ionicons name={item.icon} size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.wlLabel, { color: colors.text }]}>{item.label}</Text>
                    <View style={styles.wlStatus}>
                      <View style={[styles.wlDot, { backgroundColor: colors[item.statusColor] }]} />
                      <Text style={[styles.wlStatusText, { color: colors[item.statusColor] }]}>{item.status}</Text>
                    </View>
                  </View>
                ))}
              </AccordionSection>
            </View>
          </Animated.View>
        </View>
        <Footer />
      </ScrollView>
      <InfoModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title={SCREEN_HELP.branding.title}
        description={SCREEN_HELP.branding.description}
        details={SCREEN_HELP.branding.details}
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
  accordionGroup: {
    marginTop: 0,
  },
  profileSection: {
    alignItems: 'center' as const,
    paddingVertical: 8,
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  profileAvatarText: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700' as const,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  profileDetail: {
    fontSize: 14,
    marginTop: 3,
  },
  profileMeta: {
    marginTop: 12,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  actionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  actionBtnHalf: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  colorPreviewRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
    gap: 14,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  colorPreviewInfo: {
    flex: 1,
  },
  colorPreviewLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  colorPreviewHex: {
    fontSize: 13,
    marginTop: 2,
  },
  colorOptionsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingVertical: 8,
  },
  colorOptionWrap: {
    alignItems: 'center' as const,
    gap: 6,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  logoPlaceholder: {
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  logoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 12,
  },
  logoTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 6,
  },
  logoDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center' as const,
  },
  landingPreview: {
    gap: 10,
  },
  landingUrlRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  landingUrl: {
    fontSize: 14,
    fontWeight: '500' as const,
    flex: 1,
  },
  landingDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  landingActions: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  qrSection: {
    alignItems: 'center' as const,
    gap: 12,
    paddingVertical: 8,
  },
  qrPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  qrDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center' as const,
  },
  wlDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  wlRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  wlIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  wlLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
  },
  wlStatus: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  wlDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  wlStatusText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
});
