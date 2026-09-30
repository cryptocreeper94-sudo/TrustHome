import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View, Image, StyleSheet, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeProvider as NavThemeProvider, DarkTheme } from '@react-navigation/native';
import { AppProvider } from "@/contexts/AppContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { DrawerMenu } from "@/components/ui/DrawerMenu";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <>
      <NavThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: 'transparent' } }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="properties" />
        <Stack.Screen name="showings" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="kiosk" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="documents" />
        <Stack.Screen name="leads" />
        <Stack.Screen name="marketing" />
        <Stack.Screen name="blog" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="network" />
        <Stack.Screen name="branding" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="developer" />
        <Stack.Screen name="team" />
        <Stack.Screen name="business" />
        <Stack.Screen name="media-studio" />
        <Stack.Screen name="mls-setup" />
        <Stack.Screen name="tree-services" />
        <Stack.Screen name="support" />
        <Stack.Screen name="hallmark" />
        <Stack.Screen name="affiliate" />
        <Stack.Screen name="command-center" />
      </Stack>
      </NavThemeProvider>
      <DrawerMenu />
    </>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <ThemeProvider>
              <AppProvider>
                <LocationProvider>
                  <View style={{ flex: 1, backgroundColor: '#000', minHeight: Platform.OS === 'web' ? '100vh' : '100%' }}>
                    <Image 
                      source={require('@/assets/images/luxury-bg.jpg')} 
                      style={[
                        StyleSheet.absoluteFill, 
                        { width: '100%', height: '100%', opacity: 1 },
                        Platform.OS === 'web' && { position: 'fixed', width: '100vw', height: '100vh' } as any
                      ]} 
                      resizeMode="cover"
                    />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', pointerEvents: 'none' }, Platform.OS === 'web' && { position: 'fixed', width: '100vw', height: '100vh' } as any]} />
                    <RootLayoutNav />
                  </View>
                </LocationProvider>
              </AppProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
