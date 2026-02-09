import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getQueryFn, apiRequest } from '@/lib/query-client';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

type UserRole = 'agent' | 'client_buyer' | 'client_seller';

interface AppContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAgentAuthenticated: boolean;
  signOut: () => Promise<void>;
  demoMode: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  aiAssistantOpen: boolean;
  openAiAssistant: () => void;
  closeAiAssistant: () => void;
  toggleAiAssistant: () => void;
  signalChatOpen: boolean;
  openSignalChat: () => void;
  closeSignalChat: () => void;
  toggleSignalChat: () => void;
  showWelcomeGuide: boolean;
  setShowWelcomeGuide: (show: boolean) => void;
  replayWelcomeGuide: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ user: AuthUser | null }>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('client_buyer');
  const [demoMode, setDemoMode] = useState(false);

  const realUser = data?.user ?? null;

  const DEMO_USER: AuthUser = {
    id: 'demo-user',
    email: 'demo@trusthome.io',
    firstName: 'Demo',
    lastName: 'Explorer',
    role: 'agent',
  };

  const user = demoMode ? DEMO_USER : realUser;
  const isAuthenticated = !!user;
  const isAgentAuthenticated = isAuthenticated && user?.role === 'agent';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [signalChatOpen, setSignalChatOpen] = useState(false);
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);
  const [guideChecked, setGuideChecked] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !guideChecked) {
      AsyncStorage.getItem('trusthome_guide_seen').then((val) => {
        if (!val) {
          setShowWelcomeGuide(true);
        }
        setGuideChecked(true);
      }).catch(() => setGuideChecked(true));
    }
  }, [isAuthenticated, guideChecked]);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'agent') {
        setCurrentRole('agent');
      } else {
        setCurrentRole('client_buyer');
      }
    }
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      await apiRequest('POST', '/api/auth/logout');
    } catch {}
    setDemoMode(false);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    setCurrentRole('client_buyer');
  }, [queryClient]);

  const enterDemo = useCallback(() => {
    setDemoMode(true);
    setCurrentRole('agent');
  }, []);

  const exitDemo = useCallback(() => {
    setDemoMode(false);
    setCurrentRole('client_buyer');
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), []);
  const openAiAssistant = useCallback(() => setAiAssistantOpen(true), []);
  const closeAiAssistant = useCallback(() => setAiAssistantOpen(false), []);
  const toggleAiAssistant = useCallback(() => setAiAssistantOpen(prev => !prev), []);
  const openSignalChat = useCallback(() => setSignalChatOpen(true), []);
  const closeSignalChat = useCallback(() => setSignalChatOpen(false), []);
  const toggleSignalChat = useCallback(() => setSignalChatOpen(prev => !prev), []);

  const handleSetShowWelcomeGuide = useCallback((show: boolean) => {
    setShowWelcomeGuide(show);
    if (!show) {
      AsyncStorage.setItem('trusthome_guide_seen', 'true').catch(() => {});
    }
  }, []);

  const replayWelcomeGuide = useCallback(() => {
    setShowWelcomeGuide(true);
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    currentRole,
    setCurrentRole,
    isAgentAuthenticated,
    signOut,
    demoMode,
    enterDemo,
    exitDemo,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    aiAssistantOpen,
    openAiAssistant,
    closeAiAssistant,
    toggleAiAssistant,
    signalChatOpen,
    openSignalChat,
    closeSignalChat,
    toggleSignalChat,
    showWelcomeGuide,
    setShowWelcomeGuide: handleSetShowWelcomeGuide,
    replayWelcomeGuide,
  }), [user, isLoading, isAuthenticated, currentRole, isAgentAuthenticated, signOut, demoMode, enterDemo, exitDemo, drawerOpen, aiAssistantOpen, signalChatOpen, showWelcomeGuide, openDrawer, closeDrawer, toggleDrawer, openAiAssistant, closeAiAssistant, toggleAiAssistant, openSignalChat, closeSignalChat, toggleSignalChat, handleSetShowWelcomeGuide, replayWelcomeGuide]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
