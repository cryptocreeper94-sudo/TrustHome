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
  const { drawerOpen, closeDrawer, currentRole, setCurrentRole } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isAgent = currentRole === 'agent';

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
            <View>
              <Text style={[styles.drawerTitle, { color: colors.text }]}>TrustHome</Text>
              <Text style={[styles.roleLabel, { color: colors.textSecondary }]}>
                {isAgent ? 'Agent Dashboard' : 'Client Portal'}
              </Text>
            </View>
            <Pressable onPress={closeDrawer} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.roleSwitch, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
            <Pressable
              onPress={() => setCurrentRole('agent')}
              style={[styles.roleBtn, isAgent && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.roleBtnText, { color: isAgent ? colors.textInverse : colors.textSecondary }]}>Agent</Text>
            </Pressable>
            <Pressable
              onPress={() => setCurrentRole('client_buyer')}
              style={[styles.roleBtn, !isAgent && { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.roleBtnText, { color: !isAgent ? colors.textInverse : colors.textSecondary }]}>Client</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, i) => {
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
            <Pressable style={styles.menuItem}>
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text style={[styles.menuLabel, { color: colors.error }]}>Sign Out</Text>
            </Pressable>
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
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
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
  roleSwitch: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  roleBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
