import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  onPress?: () => void;
  agentOnly?: boolean;
  dividerAfter?: boolean;
}

export function DrawerMenu() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { drawerOpen, closeDrawer, currentRole, isAuthenticated, isAgentAuthenticated, signOut, user } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isAgent = isAgentAuthenticated;

  const menuItems: MenuItem[] = [
    { icon: 'home-outline', label: 'Dashboard', route: '/' },
    { icon: 'swap-horizontal-outline', label: 'Transactions', route: '/transactions' },
    { icon: 'business-outline', label: 'Properties', route: '/properties' },
    { icon: 'calendar-outline', label: 'Showings', route: '/showings' },
    { icon: 'chatbubbles-outline', label: 'Messages', route: '/messages', dividerAfter: true },
    { icon: 'document-text-outline', label: 'Documents', route: '/documents' },
    { icon: 'people-outline', label: 'Leads', route: '/leads', agentOnly: true },
    { icon: 'megaphone-outline', label: 'Marketing', route: '/marketing', agentOnly: true },
    { icon: 'bar-chart-outline', label: 'Analytics', route: '/analytics', agentOnly: true },
    { icon: 'globe-outline', label: 'Network', route: '/network', agentOnly: true, dividerAfter: true },
    { icon: 'color-palette-outline', label: 'Branding', route: '/branding', agentOnly: true },
    { icon: 'person-outline', label: 'Profile & Settings', route: '/settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', route: '/support' },
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
    router.replace('/auth');
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
                    <Text style={styles.avatarText}>
                      {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.drawerTitle, { color: colors.text }]} numberOfLines={1}>
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
                      {isAgent ? 'Agent Dashboard' : 'Client Portal'}
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
            <Pressable onPress={closeDrawer} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              if (item.agentOnly && !isAgent) return null;
              return (
                <React.Fragment key={item.label}>
                  <Pressable
                    onPress={() => handleItemPress(item)}
                    style={({ pressed }) => [
                      styles.menuItem,
                      pressed && { backgroundColor: colors.backgroundTertiary },
                    ]}
                  >
                    <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  </Pressable>
                  {item.dividerAfter ? (
                    <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </ScrollView>

          <View style={[styles.drawerFooter, { borderTopColor: colors.divider }]}>
            <Pressable onPress={toggleTheme} style={styles.themeToggle}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.textSecondary} />
              <Text style={[styles.themeText, { color: colors.textSecondary }]}>{isDark ? 'Light Mode' : 'Dark Mode'}</Text>
            </Pressable>
            {isAuthenticated ? (
              <Pressable onPress={handleSignOut} style={styles.menuItem} testID="drawer-sign-out">
                <Ionicons name="log-out-outline" size={22} color={colors.error} />
                <Text style={[styles.menuLabel, { color: colors.error }]}>Sign Out</Text>
              </Pressable>
            ) : (
              <Pressable onPress={handleSignIn} style={styles.menuItem} testID="drawer-sign-in">
                <Ionicons name="log-in-outline" size={22} color={colors.primary} />
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
    color: '#FFFFFF',
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
    paddingVertical: 13,
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
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 14,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
