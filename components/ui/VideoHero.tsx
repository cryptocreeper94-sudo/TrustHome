import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface HeroVideo {
  src: any;
  label: string;
  fallbackImage?: ImageSourcePropType;
}

interface VideoHeroProps {
  videos: HeroVideo[];
  children?: React.ReactNode;
  height?: number;
  showDots?: boolean;
  showMuteButton?: boolean;
}

function WebVideoHero({ videos, children, height = 320, showDots = true, showMuteButton = true }: VideoHeroProps) {
  const { isDark } = useTheme();
  const [videoMuted, setVideoMuted] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [nextVideoIndex, setNextVideoIndex] = useState(1);
  const [isVideoTransitioning, setIsVideoTransitioning] = useState(false);
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);

  const fadeAudio = useCallback((video: HTMLVideoElement, fadeIn: boolean, duration = 500) => {
    const steps = 20;
    const stepTime = duration / steps;
    const startVolume = fadeIn ? 0 : 1;
    const endVolume = fadeIn ? 1 : 0;
    const volumeStep = (endVolume - startVolume) / steps;
    video.volume = startVolume;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      video.volume = Math.max(0, Math.min(1, startVolume + (volumeStep * step)));
      if (step >= steps) { clearInterval(interval); video.volume = endVolume; }
    }, stepTime);
  }, []);

  useEffect(() => {
    const handleVideoEnd = () => {
      const currentVideo = currentVideoRef.current;
      if (currentVideo && !videoMuted) fadeAudio(currentVideo, false, 500);
      setIsVideoTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex(nextVideoIndex);
        setNextVideoIndex((nextVideoIndex + 1) % videos.length);
        setIsVideoTransitioning(false);
      }, 400);
    };
    const video = currentVideoRef.current;
    if (video) {
      video.addEventListener('ended', handleVideoEnd);
      return () => video.removeEventListener('ended', handleVideoEnd);
    }
  }, [nextVideoIndex, videoMuted, fadeAudio, videos.length]);

  useEffect(() => {
    if (nextVideoRef.current) nextVideoRef.current.load();
  }, [nextVideoIndex]);

  useEffect(() => {
    if (currentVideoRef.current && !isVideoTransitioning) {
      const video = currentVideoRef.current;
      video.volume = 0;
      video.play().catch(() => {});
      if (!videoMuted) fadeAudio(video, true, 500);
    }
  }, [currentVideoIndex, isVideoTransitioning, videoMuted, fadeAudio]);

  const handleDotPress = useCallback((idx: number) => {
    if (idx !== currentVideoIndex) {
      setIsVideoTransitioning(true);
      setTimeout(() => {
        setCurrentVideoIndex(idx);
        setNextVideoIndex((idx + 1) % videos.length);
        setIsVideoTransitioning(false);
      }, 700);
    }
  }, [currentVideoIndex, videos.length]);

  return (
    <View style={[webStyles.container, { height }]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
        {/* @ts-ignore - HTML video element for web */}
        <video
          ref={currentVideoRef}
          key={`current-${currentVideoIndex}`}
          autoPlay
          muted={videoMuted}
          playsInline
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.7s ease',
            opacity: isVideoTransitioning ? 0 : 1,
          }}
        >
          <source src={videos[currentVideoIndex].src} type="video/mp4" />
        </video>
        {/* @ts-ignore */}
        <video
          ref={nextVideoRef}
          key={`next-${nextVideoIndex}`}
          muted={videoMuted}
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.7s ease',
            opacity: isVideoTransitioning ? 1 : 0,
          }}
        >
          <source src={videos[nextVideoIndex].src} type="video/mp4" />
        </video>
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)', isDark ? 'rgba(7,11,22,0.9)' : 'rgba(0,0,0,0.7)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {showMuteButton && (
        <Pressable
          onPress={() => setVideoMuted(!videoMuted)}
          style={webStyles.muteBtn}
        >
          <Ionicons name={videoMuted ? 'volume-mute' : 'volume-high'} size={18} color="rgba(255,255,255,0.8)" />
        </Pressable>
      )}

      {showDots && videos.length > 1 && (
        <View style={webStyles.dotsRow}>
          <View style={webStyles.dotsContainer}>
            {videos.map((video, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleDotPress(idx)}
                style={[
                  webStyles.dot,
                  currentVideoIndex === idx ? webStyles.dotActive : webStyles.dotInactive,
                ]}
              />
            ))}
          </View>
          <Text style={webStyles.dotLabel}>{videos[currentVideoIndex].label}</Text>
        </View>
      )}

      <View style={webStyles.contentOverlay}>
        {children}
      </View>
    </View>
  );
}

function NativeVideoHero({ videos, children, height = 320, showDots = true }: VideoHeroProps) {
  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const interval = setInterval(() => {
      opacity.value = withTiming(0, { duration: 500 }, () => {
        setCurrentIndex(prev => (prev + 1) % videos.length);
        opacity.value = withTiming(1, { duration: 500 });
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [videos.length, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const fallback = videos[currentIndex].fallbackImage;

  return (
    <View style={[webStyles.container, { height }]}>
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        {fallback ? (
          <Image source={fallback} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1A8A7E' }]} />
        )}
      </Animated.View>
      <LinearGradient
        colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)', isDark ? 'rgba(7,11,22,0.9)' : 'rgba(0,0,0,0.7)']}
        style={StyleSheet.absoluteFill}
      />
      {showDots && videos.length > 1 && (
        <View style={webStyles.dotsRow}>
          <View style={webStyles.dotsContainer}>
            {videos.map((_, idx) => (
              <Pressable
                key={idx}
                onPress={() => setCurrentIndex(idx)}
                style={[
                  webStyles.dot,
                  currentIndex === idx ? webStyles.dotActive : webStyles.dotInactive,
                ]}
              />
            ))}
          </View>
          <Text style={webStyles.dotLabel}>{videos[currentIndex].label}</Text>
        </View>
      )}
      <View style={webStyles.contentOverlay}>
        {children}
      </View>
    </View>
  );
}

export function VideoHero(props: VideoHeroProps) {
  if (Platform.OS === 'web') {
    return <WebVideoHero {...props} />;
  }
  return <NativeVideoHero {...props} />;
}

const webStyles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  muteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } as any : {}),
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    zIndex: 30,
    alignItems: 'center',
    gap: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)' } as any : {}),
  },
  dot: {
    borderRadius: 4,
    height: 6,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  contentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    padding: 20,
  },
});
