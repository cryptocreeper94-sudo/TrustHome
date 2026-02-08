import React, { createContext, useContext, useState, useMemo, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ user: AuthUser | null }>({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const user = data?.user ?? null;
  const isAuthenticated = !!user;
  const isAgentAuthenticated = isAuthenticated && user?.role === 'agent';

  const [currentRole, setCurrentRole] = useState<UserRole>('client_buyer');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

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
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    setCurrentRole('client_buyer');
  }, [queryClient]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), []);
  const openAiAssistant = useCallback(() => setAiAssistantOpen(true), []);
  const closeAiAssistant = useCallback(() => setAiAssistantOpen(false), []);
  const toggleAiAssistant = useCallback(() => setAiAssistantOpen(prev => !prev), []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated,
    currentRole,
    setCurrentRole,
    isAgentAuthenticated,
    signOut,
    drawerOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    aiAssistantOpen,
    openAiAssistant,
    closeAiAssistant,
    toggleAiAssistant,
  }), [user, isLoading, isAuthenticated, currentRole, isAgentAuthenticated, signOut, drawerOpen, aiAssistantOpen, openDrawer, closeDrawer, toggleDrawer, openAiAssistant, closeAiAssistant, toggleAiAssistant]);

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
