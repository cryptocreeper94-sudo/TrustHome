import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Modal, ScrollView, Linking } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  rightAction?: React.ReactNode;
}

function TrustLayerModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const trustQuery = useQuery<any>({
    queryKey: ['/api/trustlayer/status'],
  });

  const isConnected = trustQuery.data?.configured === true;

  const links = [
    { label: 'Trust Layer Portal', url: 'https://dwtl.io', icon: 'globe-outline' as const, desc: 'Manage trust profiles and certifications' },
    { label: 'Blockchain Explorer', url: 'https://dwsc.io/explorer', icon: 'cube-outline' as const, desc: 'View on-chain verification records' },
    { label: 'Trust Shield', url: 'https://trustshield.tech', icon: 'shield-checkmark-outline' as const, desc: 'Ecosystem security suite' },
    { label: 'DarkWave Studios', url: 'https://darkwavestudios.io', icon: 'business-outline' as const, desc: 'Parent ecosystem' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[modalStyles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[modalStyles.sheet, {
          backgroundColor: colors.backgroundSecondary,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16,
        }]}>
          <View style={modalStyles.handle}>
            <View style={[modalStyles.handleBar, { backgroundColor: colors.border }]} />
          </View>

          <View style={modalStyles.header}>
            <Text style={[modalStyles.title, { color: colors.text }]}>Trust Layer</Text>
            <Pressable onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={modalStyles.body} showsVerticalScrollIndicator={false}>
            <View style={[modalStyles.statusCard, { backgroundColor: isDark ? 'rgba(26,138,126,0.12)' : 'rgba(26,138,126,0.06)', borderColor: colors.primary + '30' }]}>
              <View style={[modalStyles.statusIconCircle, { backgroundColor: isConnected ? colors.primary + '20' : colors.warning + '20' }]}>
                <MaterialCommunityIcons
                  name={isConnected ? 'shield-check' : 'shield-alert'}
                  size={28}
                  color={isConnected ? colors.primary : colors.warning}
                />
              </View>
              <View style={modalStyles.statusInfo}>
                <Text style={[modalStyles.statusLabel, { color: colors.textSecondary }]}>Connection Status</Text>
                <Text style={[modalStyles.statusValue, { color: isConnected ? colors.primary : colors.warning }]}>
                  {isConnected ? 'Connected & Verified' : 'Not Configured'}
                </Text>
              </View>
              <View style={[modalStyles.statusDot, { backgroundColor: isConnected ? '#34C759' : colors.warning }]} />
            </View>

            <Text style={[modalStyles.sectionDesc, { color: colors.textSecondary }]}>
              Powered by the DarkWave Trust Layer (DWTL) — a custom Layer 1 blockchain providing immutable transaction records, document verification, and professional certification.
            </Text>

            <View style={modalStyles.linksSection}>
              {links.map((link, i) => (
                <Pressable
                  key={i}
                  onPress={() => Linking.openURL(link.url)}
                  style={[modalStyles.linkRow, { borderBottomColor: colors.divider }]}
                >
                  <View style={[modalStyles.linkIcon, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name={link.icon} size={18} color={colors.primary} />
                  </View>
                  <View style={modalStyles.linkInfo}>
                    <Text style={[modalStyles.linkLabel, { color: colors.text }]}>{link.label}</Text>
                    <Text style={[modalStyles.linkDesc, { color: colors.textTertiary }]}>{link.desc}</Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color={colors.textTertiary} />
                </Pressable>
              ))}
            </View>

            <View style={[modalStyles.hashCard, { backgroundColor: colors.backgroundTertiary }]}>
              <MaterialCommunityIcons name="link-variant" size={14} color={colors.textTertiary} />
              <Text style={[modalStyles.hashText, { color: colors.textTertiary }]} numberOfLines={1}>
                dwtl.io
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Header({ title = 'TrustHome', showBack = false, showClose = false, onClose, rightAction }: HeaderProps) {
  const { colors } = useTheme();
  const { toggleDrawer, demoMode, exitDemo, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showTrustLayer, setShowTrustLayer] = useState(false);

  const topPadding = Platform.OS === 'web' ? 4 : insets.top;

  return (
    <View style={{ backgroundColor: colors.primary }}>
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.content}>
          <View style={styles.left}>
            {showBack ? (
              <Pressable onPress={() => router.back()} style={styles.iconButton} testID="header-back">
                <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              </Pressable>
            ) : showClose ? (
              <Pressable onPress={onClose} style={styles.iconButton} testID="header-close">
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            ) : null}
            {isAuthenticated && (
              <Pressable
                onPress={() => setShowTrustLayer(true)}
                style={styles.trustStamp}
                hitSlop={6}
                testID="header-trust-stamp"
              >
                <MaterialCommunityIcons name="shield-check" size={20} color="rgba(255,255,255,0.9)" />
              </Pressable>
            )}
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>

          <View style={styles.right}>
            {rightAction || (
              <Pressable onPress={toggleDrawer} style={styles.iconButton} testID="header-menu">
                <Ionicons name="menu" size={24} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <TrustLayerModal visible={showTrustLayer} onClose={() => setShowTrustLayer(false)} />

      {demoMode && (
        <View style={styles.demoBanner}>
          <View style={styles.demoLeft}>
            <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
            <Text style={styles.demoText}>Demo Mode</Text>
          </View>
          <View style={styles.demoActions}>
            <Pressable
              style={styles.demoRequestBtn}
              onPress={() => { router.replace('/team'); setTimeout(exitDemo, 150); }}
              testID="demo-request-access"
            >
              <Text style={styles.demoRequestText}>Request Access</Text>
            </Pressable>
            <Pressable
              style={styles.demoExitBtn}
              onPress={() => { router.replace('/team'); setTimeout(exitDemo, 150); }}
              testID="demo-exit"
            >
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.8)" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  right: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  demoBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  demoLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  demoText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  demoActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  demoRequestBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  demoRequestText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  demoExitBtn: {
    width: 28,
    height: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  trustStamp: {
    width: 30,
    height: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginRight: 4,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  sheet: {
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    alignItems: 'center' as const,
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    flex: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  body: {
    paddingHorizontal: 20,
  },
  statusCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  linksSection: {
    marginBottom: 16,
  },
  linkRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  linkInfo: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  linkDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  hashCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginBottom: 8,
  },
  hashText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
});
