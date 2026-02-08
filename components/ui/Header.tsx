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
  const { toggleDrawer } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPadding, backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack ? (
            <Pressable onPress={() => router.back()} style={styles.iconButton} testID="header-back">
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ) : showClose ? (
            <Pressable onPress={onClose} style={styles.iconButton} testID="header-close">
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>

        <View style={styles.right}>
          {rightAction || (
            <Pressable onPress={toggleDrawer} style={styles.iconButton} testID="header-menu">
              <Ionicons name="menu" size={26} color={colors.text} />
            </Pressable>
          )}
        </View>
      </View>
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
    height: 50,
    paddingHorizontal: 16,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
});
