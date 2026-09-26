import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Modal, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface MenuItem {
  icon: string;
  emoji: string;
  label: string;
  route?: string;
  onPress?: () => void;
  agentOnly?: boolean;
  dividerAfter?: boolean;
}

const E: Record<string, string> = {
  'home': '🏠',
  'swap-horizontal-outline': '📝',
  'business-outline': '🏢',
  'calendar-outline': '📅',
  'chatbubbles-outline': '💬',
  'document-text-outline': '📄',
  'people-outline': '👥',
  'megaphone-outline': '📣',
  'newspaper-outline': '📰',
  'bar-chart-outline': '📊',
  'globe-outline': '🌐',
  'briefcase-outline': '💼',
  'film-outline': '🎬',
  'leaf-outline': '🌳',
  'color-palette-outline': '🎨',
  'brush-outline': '🖌️',
  'person-outline': '👤',
  'grid-outline': '⊞',
  'code-slash-outline': '💻',
  'map-outline': '🗟a️',
  'shield-checkmark-outline': '🛡️',
  'gift-outline': '🎁',
  'help-circle-outline': '❓',
  'sunny-outline': '☀️',
  'moon-outline': '🌙',
  'log-in-outline': '🔑',
  'log-out-outline': '🚪',
  'hand-right-outline': '✋',
  'exit-outline': '🚪',
  'close': '✕',
};

function AnimatedMenuItem({ item, index, onPress, colors }: { item: MenuItem; index: number; onPress: (item: MenuItem) => void; colors: any }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(250).springify().damping(18)}>
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [
          styles.menuItem,
          pressed && { backgroundColor: colors.backgroundTertiary, opacity: 0.8 },
        ]}
      >
        <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{item.emoji}</Text>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
      </Pressable>
      {item.dividerAfter ? (
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      ) : null}
    </Animated.View>
  );
}

export function DrawerMenu() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { drawerOpen, closeDrawer, currentRole, isAuthenticated, isAgentAuthenticated, signOut, user, demoMode, exitDemo, replayWelcomeGuide, isBrowsing, exitBrowse } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isAgent = isAgentAuthenticated && !isBrowsing;

  const menuItems: MenuItem[] = isBrowsing ? [
    { icon: 'home', emoji: E['home'], label: 'Home', route: '/' },
    { icon: 'shield-checkmark-outline', emoji: E['shield-checkmark-outline'], label: 'Trust Layer', route: '/ecosystem' },
    { icon: 'help-circle-outline', emoji: E['help-circle-outline'], label: 'Help & Support', route: '/support' },
  ] : [
    { icon: 'home', emoji: E['home'], label: 'Home', route: '/' },
    { icon: 'swap-horizontal-outline', emoji: E['swap-horizontal-outline'], label: 'Transactions', route: '/transactions' },
    { icon: 'business-outline', emoji: E['business-outline'], label: 'Properties', route: '/properties' },
    { icon: 'calendar-outline', emoji: E['calendar-outline'], label: 'Showings', route: '/showings' },
    { icon: 'chatbubbles-outline', emoji: E['chatbubbles-outline'], label: 'Messages', route: '/messages', dividerAfter: true },
    { icon: 'document-text-outline', emoji: E['document-text-outline'], label: 'Documents', route: '/documents' },
    { icon: 'people-outline', emoji: E['people-outline'], label: 'Leads', route: '/leads', agentOnly: true },
    { icon: 'megaphone-outline', emoji: E['megaphone-outline'], label: 'Marketing', route: '/marketing', agentOnly: true },
    { icon: 'newspaper-outline', emoji: E['newspaper-outline'], label: 'Blog', route: '/blog', agentOnly: true },
    { icon: 'bar-chart-outline', emoji: E['bar-chart-outline'], label: 'Analytics', route: '/analytics', agentOnly: true },
    { icon: 'globe-outline', emoji: E['globe-outline'], label: 'Network', route: '/network', agentOnly: true, dividerAfter: true },
    { icon: 'briefcase-outline', emoji: E['briefcase-outline'], label: 'Business Suite', route: '/business', agentOnly: true },
    { icon: 'film-outline', emoji: E['film-outline'], label: 'Media Studio', route: '/media-studio', agentOnly: true },
    { icon: 'leaf-outline', emoji: E['leaf-outline'], label: 'Tree Services', route: '/tree-services', agentOnly: true },
    { icon: 'color-palette-outline', emoji: E['color-palette-outline'], label: 'Branding', route: '/branding', agentOnly: true },
    { icon: 'brush-outline', emoji: E['brush-outline'], label: 'Room Visualizer', onPress: () => Linking.openURL('https://paintpros.io/npp/estimate'), dividerAfter: true },
    { icon: 'person-outline', emoji: E['person-outline'], label: 'Profile & Settings', route: '/settings' },
    { icon: 'grid-outline', emoji: E['grid-outline'], label: 'Command Center', route: '/command-center', agentOnly: true },
    { icon: 'code-slash-outline', emoji: E['code-slash-outline'], label: 'Developer Console', route: '/developer', agentOnly: true },
    { icon: 'map-outline', emoji: E['map-outline'], label: 'Platform Tour', onPress: () => { router.push('/'); setTimeout(replayWelcomeGuide, 300); }, agentOnly: true },
    { icon: 'shield-checkmark-outline', emoji: E['shield-checkmark-outline'], label: 'Trust Layer', route: '/ecosystem' },
    { icon: 'gift-outline', emoji: E['gift-outline'], label: 'Share & Earn', route: '/affiliate' },
    { icon: 'help-circle-outline', emoji: E['help-circle-outline'], label: 'Help & Support', route: '/support' },
  ];

  const handleItemPress = (item: MenuItem) => {
    closeDrawer();
    if (item.onPress) {
      item.onPress();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  const handleSignOut = async () => {
    closeDrawer();
    await signOut();
    router.replace('/');
  };

  const handleSignIn = () => {
    closeDrawer();
    router.push('/auth');
  };

  if (!drawerOpen) return null;

  return (
    <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={closeDrawer}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer}>
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
          />
        </Pressable>

        <Animated.View
          entering={SlideInRight.duration(250).springify().damping(20)}
          exiting={SlideOutRight.duration(200)}
          style={[
            styles.drawer,
            {
              backgroundColor: colors.backgroundSecondary,
              paddingTop: Platform.OS === 'web' ? 67 : insets.top,
              paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom,
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.headerLeft}>
              {isAuthenticated && user ? (
                <>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarText, { color: colors.textInverse }]}>
                      {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.drawerTitle, { color: colors.text }]} numberOfLines={1}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={[styles.roleLabel, { color: (demoMode || isBrowsing) ? colors.primary : colors.textSecondary }]}>
                      {isBrowsing ? 'Exploring' : demoMode ? 'Demo Explorer' : isAgent ? 'Agent Dashboard' : 'Client Portal'}
                    </Text>
                  </View>
                </>
              ) : (
                <View>
                  <Text style={[styles.drawerTitle, { color: colors.text }]}>TrustHome</Text>
                  <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>Guest</Text>
                </View>
              )}
            </View>
            <Pressable onPress={closeDrawer} style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={{ fontSize: 20, color: colors.text }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {menuItems.filter(item => !item.agentOnly || isAgent).map((item, index) => (
              <AnimatedMenuItem
                key={item.label}
                item={item}
                index={index}
                onPress={handleItemPress}
                colors={colors}
              />
            ))}
          </ScrollView>

          <View style={[styles.drawerFooter, { borderTopColor: colors.divider }]}>
            <Pressable onPress={toggleTheme} style={({ pressed }) => [styles.themeToggle, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{isDark ? '☀️' : '🌙'}</Text>
              <Text style={[styles.themeText, { color: colors.textSecondary }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
            </Pressable>
            {isBrowsing ? (
              <Pressable
                onPress={() => { closeDrawer(); router.push('/team'); }}
                style={styles.menuItem}
                testID="drawer-get-started"
              >
                <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🔑</Text>
                <Text style={[styles.menuLabel, { color: colors.primary }]}>Sign In / Get Started</Text>
              </Pressable>
            ) : demoMode ? (
              <>
                <Pressable
                  onPress={() => { closeDrawer(); router.replace('/team'); setTimeout(exitDemo, 150); }}
                  style={styles.menuItem}
                  testID="drawer-request-access"
                >
                  <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>✋</Text>
                  <Text style={[styles.menuLabel, { color: colors.primary }]}>Request Access</Text>
                </Pressable>
                <Pressable
                  onPress={() => { closeDrawer(); router.replace('/team'); setTimeout(exitDemo, 150); }}
                  style={styles.menuItem}
                  testID="drawer-exit-demo"
                >
                  <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🚪</Text>
                  <Text style={[styles.menuLabel, { color: colors.error }]}>Exit Demo</Text>
                </Pressable>
              </>
            ) : isAuthenticated ? (
              <Pressable onPress={handleSignOut} style={styles.menuItem} testID="drawer-sign-out">
                <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🚪</Text>
                <Text style={[styles.menuLabel, { color: colors.error }]}>Sign Out</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleSignIn} style={styles.menuItem} testID="drawer-sign-in">
                <Text style={{ fontSize: 18, width: 28, textAlign: 'center' }}>🔑</Text>
                <Text style={[styles.menuLabel, { color: colors.primary }]}>Sign In</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: '82%',
    maxWidth: 360,
    height: '100%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  roleLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuScroll: {
    flex: 1,
    paddingHorizontal: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  drawerFooter: {
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 14,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
