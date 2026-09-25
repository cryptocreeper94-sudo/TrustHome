import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, ImageSourcePropType, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, useSharedValue, withTiming, withSequence,
  Easing, runOnJS, interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeroSlide {
  image: ImageSourcePropType;
  label: string;
}

interface KenBurnsHeroProps {
  slides: HeroSlide[];
  children?: React.ReactNode;
  height?: number;
  interval?: number;
}

const SLIDE_DURATION = 7000;
const FADE_DURATION = 1200;

export function KenBurnsHero({ slides, children, height = 320, interval = SLIDE_DURATION }: KenBurnsHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentOpacity = useSharedValue(1);
  const nextOpacity = useSharedValue(0);
  const currentScale = useSharedValue(1);
  const nextScale = useSharedValue(1.15);
  const currentTranslateX = useSharedValue(0);
  const nextTranslateX = useSharedValue(0);

  const startKenBurns = useCallback((scaleVal: Animated.SharedValue<number>, translateVal: Animated.SharedValue<number>, idx: number) => {
    // Alternate between zoom-in-left and zoom-in-right for variety
    const direction = idx % 2 === 0 ? 1 : -1;
    scaleVal.value = 1.0;
    translateVal.value = 0;
    scaleVal.value = withTiming(1.15, { duration: interval + FADE_DURATION, easing: Easing.linear });
    translateVal.value = withTiming(direction * 20, { duration: interval + FADE_DURATION, easing: Easing.linear });
  }, [interval]);

  const transition = useCallback(() => {
    setIsTransitioning(true);
    
    // Fade out current, fade in next
    currentOpacity.value = withTiming(0, { duration: FADE_DURATION, easing: Easing.inOut(Easing.ease) });
    nextOpacity.value = withTiming(1, { duration: FADE_DURATION, easing: Easing.inOut(Easing.ease) });

    // Start Ken Burns on next
    startKenBurns(nextScale, nextTranslateX, nextIndex);

    setTimeout(() => {
      // Swap: next becomes current
      setCurrentIndex(nextIndex);
      setNextIndex((nextIndex + 1) % slides.length);
      
      // Reset values
      currentOpacity.value = 1;
      nextOpacity.value = 0;
      currentScale.value = nextScale.value;
      currentTranslateX.value = nextTranslateX.value;
      nextScale.value = 1.0;
      nextTranslateX.value = 0;
      
      setIsTransitioning(false);
    }, FADE_DURATION);
  }, [currentIndex, nextIndex, slides.length, startKenBurns]);

  useEffect(() => {
    startKenBurns(currentScale, currentTranslateX, currentIndex);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isTransitioning) {
        transition();
      }
    }, interval);
    return () => clearInterval(timer);
  }, [interval, isTransitioning, transition]);

  const currentImageStyle = useAnimatedStyle(() => ({
    opacity: currentOpacity.value,
    transform: [
      { scale: currentScale.value },
      { translateX: currentTranslateX.value },
    ],
  }));

  const nextImageStyle = useAnimatedStyle(() => ({
    opacity: nextOpacity.value,
    transform: [
      { scale: nextScale.value },
      { translateX: nextTranslateX.value },
    ],
  }));

  // Dot indicator style
  const dotStyle = (idx: number) => ({
    width: idx === currentIndex ? 24 : 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: idx === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  });

  return (
    <View style={[styles.container, { height }]}>
      {/* Current image */}
      <Animated.Image
        source={slides[currentIndex]?.image}
        style={[styles.image, { height: height + 40 }, currentImageStyle]}
        resizeMode="cover"
      />
      {/* Next image (preloaded, fades in during transition) */}
      <Animated.Image
        source={slides[nextIndex]?.image}
        style={[styles.image, { height: height + 40 }, nextImageStyle]}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.7)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      {/* Content overlay */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

// Keep backward compatibility — alias VideoHero to KenBurnsHero
export function VideoHero({ videos, children, height = 320 }: { videos: { src: any; label: string; fallbackImage?: ImageSourcePropType }[]; children?: React.ReactNode; height?: number; showDots?: boolean; showMuteButton?: boolean }) {
  const slides = videos.map(v => ({ image: v.fallbackImage || v.src, label: v.label }));
  return <KenBurnsHero slides={slides} height={height}>{children}</KenBurnsHero>;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    width: SCREEN_WIDTH + 40,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
