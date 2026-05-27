/**
 * Authentication Context
 * Manages member/staff authentication using Supabase Auth
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

type Member = Tables<'members'>;
type Staff = Tables<'staff'>;

interface AuthState {
  user: Member | Staff | null;
  userType: 'member' | 'staff' | null;
  session: Session | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userType: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionChange(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSessionChange(session: Session | null) {
    if (!session) {
      setState({ user: null, userType: null, session: null, loading: false });
      return;
    }

    try {
      const email = session.user.email;
      if (!email) {
        setState({ user: null, userType: null, session: null, loading: false });
        return;
      }

      const [{ data: member }, { data: staff }] = await Promise.all([
        supabase.from('members').select('*').eq('email', email).maybeSingle(),
        supabase.from('staff').select('*').eq('email', email).maybeSingle(),
      ]);

      if (member) {
        setState({
          user: member,
          userType: 'member',
          session,
          loading: false,
        });
        return;
      }

      if (staff) {
        setState({
          user: staff,
          userType: 'staff',
          session,
          loading: false,
        });
        return;
      }

      // User has Supabase auth but no member/staff profile
      console.warn('User authenticated but no profile found:', email);
      await supabase.auth.signOut();
      setState({ user: null, userType: null, session: null, loading: false });
    } catch (error) {
      console.error('Error loading user profile:', error);
      setState({ user: null, userType: null, session: null, loading: false });
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
      setState({ user: null, userType: null, session: null, loading: false });
    } catch (error) {
      console.error('Error signing out:', error);
      setState({ user: null, userType: null, session: null, loading: false });
    }
  }

  async function refreshSession() {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      await handleSessionChange(session);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hooks
export function useMember() {
  const { user, userType } = useAuth();
  return userType === 'member' ? (user as Member) : null;
}

export function useStaff() {
  const { user, userType } = useAuth();
  return userType === 'staff' ? (user as Staff) : null;
}

export function useIsAuthenticated() {
  const { user, loading } = useAuth();
  return { isAuthenticated: !!user, loading };
}
