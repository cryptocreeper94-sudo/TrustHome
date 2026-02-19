---
name: premium-ui
description: Mandatory Premium UI System for TrustHome and all DarkWave Trust Layer ecosystem apps. Must be referenced before building or modifying any page, component, or feature. Covers glassmorphism, Bento grid, animations, color palette, spacing, responsive design, and anti-patterns.
---

# DWTL Premium UI System — TrustHome Reference

## Purpose
This is the mandatory UI standard for every page, component, and feature across the DarkWave Trust Layer ecosystem. No exceptions. Every screen must feel like a premium fintech app — dark, glassy, responsive, animated, and polished.

## Important: Platform Adaptation
TrustHome is built with **Expo React Native** (not web/Tailwind). All principles below apply, but implementations use React Native's `StyleSheet`, `react-native-reanimated`, `expo-linear-gradient`, and native components. The design language is identical — only the syntax differs.

---

## 1. Layout: True Bento Grid (3-Column)

React Native implementation:

```tsx
const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 10;
const GRID_PADDING = 16;
const GRID_COLS = 2; // 2 on mobile, conceptually 3 on tablet/web
const TILE_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS;
```

### Rules
- Mobile: 1-2 columns, full-width cards
- Tablet/Web: 2-3 columns
- Gap: 10px minimum
- Container: Always `paddingHorizontal: 16`
- Featured/hero cards can span full width

---

## 2. Glassmorphism (GlassCard)

Always use `<GlassCard>` from `@/components/ui/GlassCard` or manual glassmorphism.

### Manual Glassmorphism (React Native)
```tsx
{
  backgroundColor: isDark ? 'rgba(12,18,36,0.65)' : 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
  borderRadius: 16,
  padding: 16,
}
```

### Variants
- **Default card:** `rgba(12,18,36,0.65)` with `borderColor: rgba(255,255,255,0.08)`
- **Stat card:** `rgba(255,255,255,0.03)` with `borderColor: rgba(255,255,255,0.05)`
- **Feature card:** `rgba(255,255,255,0.05)` with `borderColor: rgba(255,255,255,0.10)`
- **Elevated card:** Add `shadowColor: 'rgba(0,255,255,0.15)', shadowRadius: 40`

---

## 3. Glow & Hover/Press Effects

### Animated press feedback (react-native-reanimated)
```tsx
const scale = useSharedValue(1);
const animStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const onPressIn = () => { scale.value = withSpring(0.97); };
const onPressOut = () => { scale.value = withSpring(1); };
```

### Shadow depth
```tsx
{
  shadowColor: 'rgba(6,182,212,0.2)',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 30,
  elevation: 12,
}
```

---

## 4. Spacing & Padding

### Card padding
- Standard card: `padding: 16`
- Feature/hero card: `padding: 20` to `padding: 24`
- Large showcase card: `padding: 28` to `padding: 32`

### Section margins
- Between major sections: `marginBottom: 24`
- Between sub-sections: `marginBottom: 16`
- Between page-level sections with headers: `marginBottom: 40`

### CRITICAL: Text never touches card edges
- Minimum `padding: 16` on every card
- Content inside cards always has its own padding/margins

---

## 5. Mobile-First Responsive Design

### Touch Targets
- Minimum 44px height/width for all interactive elements
- Buttons: `height: 44` minimum
- Icon buttons: `width: 44, height: 44` minimum
- List items with tap: `paddingVertical: 12` minimum

### Font Sizes
- Headlines: 28-32pt
- Section headers: 20-24pt
- Body text: 14-16pt
- Small labels: 11-12pt (never below 10pt)

---

## 6. Carousels

Use `<HorizontalCarousel>` from `@/components/ui/HorizontalCarousel` or horizontal `FlatList`/`ScrollView`:

```tsx
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
  snapToInterval={CARD_WIDTH + 12}
  decelerationRate="fast"
>
  {items.map(item => (
    <GlassCard key={item.id} style={{ width: CARD_WIDTH }}>
      {/* content */}
    </GlassCard>
  ))}
</ScrollView>
```

---

## 7. Accordions

Use `<AccordionSection>` from `@/components/ui/AccordionSection`:
- Glassmorphism background
- Smooth animated expand/collapse
- Chevron rotation indicator

---

## 8. Animations & Motion

### Page entrance (react-native-reanimated)
```tsx
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

<Animated.View entering={FadeInDown.duration(500).delay(100)}>
  {/* Content */}
</Animated.View>
```

### Staggered children
```tsx
{items.map((item, i) => (
  <Animated.View
    key={item.id}
    entering={FadeInDown.delay(i * 80).duration(400)}
  >
    {/* Content */}
  </Animated.View>
))}
```

### Micro-interactions
```tsx
// Press scale
const scale = useSharedValue(1);
onPressIn: scale.value = withSpring(0.95)
onPressOut: scale.value = withSpring(1)
```

---

## 9. Shimmer/Skeleton Loading

```tsx
// Use Animated opacity loop or simple View placeholders
<View style={{ height: 24, width: 160, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6 }} />
<View style={{ height: 16, width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, marginTop: 8 }} />
```

---

## 10. Color Palette

### Dark Theme (Primary)
- Page background: `#020617` (slate-950)
- Card background: `#0f172a` (slate-900) or `#0A0F14`
- Surface: `rgba(255,255,255,0.05)`
- Elevated surface: `rgba(255,255,255,0.03)` to `rgba(255,255,255,0.08)`

### Brand Colors
- **TrustHome Teal:** `#1A8A7E` (primary)
- **Cyan accent:** `#22D3EE` (borders: `rgba(6,182,212,0.3)`)
- **Purple accent:** `#A78BFA` / `#7C3AED`
- **Gold (partner):** `#D4AF37`

### Text
- Primary: `#FFFFFF`
- Secondary: `rgba(255,255,255,0.7)` or `#94A3B8`
- Muted: `rgba(255,255,255,0.5)` or `#64748B`
- Subtle: `rgba(255,255,255,0.3)`

### Semantic
- Success: `#34D399` with `rgba(52,211,153,0.1)` bg
- Warning: `#FBBF24` with `rgba(251,191,36,0.1)` bg
- Error: `#F87171` with `rgba(248,113,113,0.1)` bg
- Info: `#60A5FA` with `rgba(96,165,250,0.1)` bg

### Gradients (LinearGradient)
```tsx
// Primary card gradient
colors={['#1A8A7E', '#0F766E']}
// Dark card gradient
colors={['rgba(12,18,36,0.9)', 'rgba(6,10,20,0.95)']}
// Icon background gradient
colors={['rgba(6,182,212,0.2)', 'rgba(124,58,237,0.2)']}
```

### Light Theme
- Page background: `#F8FAFB`
- Card background: `#FFFFFF` or `rgba(0,0,0,0.02)`
- Card borders: `rgba(0,0,0,0.06)`
- Primary text: `#1A1A1A`
- Secondary text: `#6B7280`

---

## 11. Premium Badges

```tsx
// Status badge with glow
<View style={{
  paddingHorizontal: 10, paddingVertical: 4,
  backgroundColor: 'rgba(34,211,238,0.15)',
  borderWidth: 1, borderColor: 'rgba(34,211,238,0.25)',
  borderRadius: 20,
}}>
  <Text style={{ fontSize: 10, fontWeight: '700', color: '#22D3EE', textTransform: 'uppercase', letterSpacing: 1 }}>
    Live
  </Text>
</View>
```

---

## 12. Image Cards (ImageBackground)

```tsx
<ImageBackground source={image} style={styles.card} imageStyle={{ borderRadius: 16 }}>
  <LinearGradient
    colors={['transparent', 'rgba(0,0,0,0.8)']}
    style={styles.cardOverlay}
  >
    <Text style={styles.cardTitle}>{title}</Text>
  </LinearGradient>
</ImageBackground>
```

---

## 13. Component Checklist

Every interactive component MUST include:

- [ ] GlassCard wrapper or manual glassmorphism styling
- [ ] `react-native-reanimated` entrance animation
- [ ] Responsive padding (minimum 16px)
- [ ] Responsive text sizes (mobile-first)
- [ ] Minimum 44px touch targets
- [ ] Press feedback (scale animation or opacity)
- [ ] Loading/skeleton state
- [ ] Error state display
- [ ] Light/dark theme support via `useTheme()`

---

## 14. Anti-Patterns (NEVER DO THESE)

- Never use flat white backgrounds without depth in dark mode
- Never leave text touching card edges (always pad)
- Never use cards without borders (minimum `borderWidth: 1`)
- Never skip glassmorphism on cards
- Never hardcode pixel widths on responsive layouts
- Never use animation loops that cause strobing/flashing on mobile
- Never use font sizes below 10pt
- Never skip press feedback on interactive elements
- Never use raw `<View>` for feature cards — use GlassCard or manual glassmorphism
- Never use `bg-white` or light backgrounds in dark mode

---

## 15. Page Template

```tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';

export default function PageName() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={{
            fontSize: 28, fontWeight: '800',
            color: colors.text, marginBottom: 8,
          }}>
            Page Title
          </Text>
        </Animated.View>

        {/* Bento Grid Content */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <GlassCard style={{ flex: 1, minWidth: '45%' }}>
            {/* Card content */}
          </GlassCard>
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}
```

---

## 16. Dynamic Theming Per Ecosystem App

Each app in the DarkWave ecosystem uses its own accent:

- **TrustHome:** Teal `#1A8A7E` / Cyan `#22D3EE`
- **Trust Layer (DWTL):** Cyan `#22D3EE` / Purple `#A78BFA`
- **Trust Shield:** Green `#34D399` / Cyan `#22D3EE`
- **The Veil:** Purple `#A78BFA` / Pink `#F472B6`
- **Chronicles:** Amber `#FBBF24` / Orange `#FB923C`
- **Guardian:** Green `#34D399` / Cyan `#22D3EE`
