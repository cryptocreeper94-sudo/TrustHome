import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { DrawerMenu } from "@/components/ui/DrawerMenu";
import { AiAssistant } from "@/components/ui/AiAssistant";
import { SignalChat } from "@/components/ui/SignalChat";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="properties" />
        <Stack.Screen name="showings" />
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
        <Stack.Screen name="support" />
      </Stack>
      <DrawerMenu />
      <SignalChat />
      <AiAssistant />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <ThemeProvider>
              <AppProvider>
                <LocationProvider>
                  <RootLayoutNav />
                </LocationProvider>
              </AppProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
