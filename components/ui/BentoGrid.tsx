import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

interface BentoGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  gap?: number;
  style?: any;
}

export function BentoGrid({ children, columns = 3, gap = 10, style }: BentoGridProps) {
  return (
    <View style={[styles.grid, { gap }, style]}>
      {children}
    </View>
  );
}

interface BentoRowProps {
  children: ReactNode;
  gap?: number;
  style?: any;
}

export function BentoRow({ children, gap = 10, style }: BentoRowProps) {
  return (
    <View style={[styles.row, { gap }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
});
