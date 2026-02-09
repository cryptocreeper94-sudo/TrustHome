import React, { ReactNode } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

interface BentoGridProps {
  children: ReactNode;
  columns?: 2 | 3;
  gap?: number;
  style?: any;
}

export function BentoGrid({ children, columns = 3, gap = 10, style }: BentoGridProps) {
  const { width } = useWindowDimensions();
  const effectiveCols = width >= 768 ? columns : 2;

  return (
    <View style={[styles.grid, { gap }, style]}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const span = (child.props as any).span || 1;
        const cellWidth = span >= effectiveCols
          ? '100%'
          : span === 2 && effectiveCols === 3
            ? `${((2 / 3) * 100) - 1}%`
            : `${((1 / effectiveCols) * 100) - ((gap * (effectiveCols - 1)) / effectiveCols)}%`;
        return (
          <View style={{ width: cellWidth as any, flexGrow: span >= effectiveCols ? 0 : 1 }}>
            {child}
          </View>
        );
      })}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
});
