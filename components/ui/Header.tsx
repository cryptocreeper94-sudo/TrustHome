import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({ title = 'TrustHome', showBack = false, showClose = false, onClose, rightAction }: HeaderProps) {
  const { colors } = useTheme();
  const { toggleDrawer, demoMode, exitDemo } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
});
