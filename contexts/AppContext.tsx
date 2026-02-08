import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';

type UserRole = 'agent' | 'client_buyer' | 'client_seller';

interface AppContextValue {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isAgentAuthenticated: boolean;
  agentSignIn: () => void;
  agentSignOut: () => void;
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
  const [currentRole, setCurrentRole] = useState<UserRole>('client_buyer');
  const [isAgentAuthenticated, setIsAgentAuthenticated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const agentSignIn = useCallback(() => {
    setIsAgentAuthenticated(true);
    setCurrentRole('agent');
  }, []);

  const agentSignOut = useCallback(() => {
    setIsAgentAuthenticated(false);
    setCurrentRole('client_buyer');
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), []);
  const openAiAssistant = useCallback(() => setAiAssistantOpen(true), []);
  const closeAiAssistant = useCallback(() => setAiAssistantOpen(false), []);
  const toggleAiAssistant = useCallback(() => setAiAssistantOpen(prev => !prev), []);

  const value = useMemo(() => ({
    currentRole,
    setCurrentRole,
    isAgentAuthenticated,
    agentSignIn,
    agentSignOut,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    aiAssistantOpen,
    openAiAssistant,
    closeAiAssistant,
    toggleAiAssistant,
  }), [currentRole, isAgentAuthenticated, drawerOpen, aiAssistantOpen, agentSignIn, agentSignOut, openDrawer, closeDrawer, toggleDrawer, openAiAssistant, closeAiAssistant, toggleAiAssistant]);

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
