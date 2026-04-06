'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { Session } from 'next-auth'

export interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isLoading: boolean;
  isAuthenticated: boolean;
  role: string | null;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthStateProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const role = session?.user?.role ?? null;
  const isAdmin = role === "admin";
  const isUser = role === "user" || (!!role && !isAdmin);

  const value = useMemo(
    () => ({ session, status, isLoading, isAuthenticated, role, isAdmin, isUser }),
    [session, status, isLoading, isAuthenticated, role, isAdmin, isUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthStateProvider>{children}</AuthStateProvider>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
