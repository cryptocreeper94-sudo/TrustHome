import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';

type UserRole = 'agent' | 'client_buyer' | 'client_seller';

interface AppContextValue {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  aiAssistantOpen: boolean;
  openAiAssistant: () => void;
  closeAiAssistant: () => void;
  toggleAiAssistant: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>('agent');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), []);
  const openAiAssistant = useCallback(() => setAiAssistantOpen(true), []);
  const closeAiAssistant = useCallback(() => setAiAssistantOpen(false), []);
  const toggleAiAssistant = useCallback(() => setAiAssistantOpen(prev => !prev), []);

  const value = useMemo(() => ({
    currentRole,
    setCurrentRole,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    aiAssistantOpen,
    openAiAssistant,
    closeAiAssistant,
    toggleAiAssistant,
  }), [currentRole, drawerOpen, aiAssistantOpen, openDrawer, closeDrawer, toggleDrawer, openAiAssistant, closeAiAssistant, toggleAiAssistant]);

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
