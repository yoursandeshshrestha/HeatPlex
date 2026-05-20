/**
 * Authentication Context
 * Manages member/staff authentication state using custom session system
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

type Member = Tables<'members'>;
type Staff = Tables<'staff'>;
type Session = Tables<'sessions'>;

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

  // Load session from sessionStorage on mount
  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const sessionId = sessionStorage.getItem('heatplex_session_id');
      if (!sessionId) {
        setState({ user: null, userType: null, session: null, loading: false });
        return;
      }

      // Fetch session from database
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !session) {
        sessionStorage.removeItem('heatplex_session_id');
        setState({ user: null, userType: null, session: null, loading: false });
        return;
      }

      // Check if session expired
      if (new Date(session.expires_at) < new Date()) {
        sessionStorage.removeItem('heatplex_session_id');
        setState({ user: null, userType: null, session: null, loading: false });
        return;
      }

      // Fetch user based on owner_type
      if (session.owner_type === 'member') {
        const { data: member } = await supabase
          .from('members')
          .select('*')
          .eq('id', session.owner_id)
          .single();

        if (member) {
          setState({
            user: member,
            userType: 'member',
            session,
            loading: false,
          });
        } else {
          setState({ user: null, userType: null, session: null, loading: false });
        }
      } else if (session.owner_type === 'staff') {
        const { data: staff } = await supabase
          .from('staff')
          .select('*')
          .eq('id', session.owner_id)
          .single();

        if (staff) {
          setState({
            user: staff,
            userType: 'staff',
            session,
            loading: false,
          });
        } else {
          setState({ user: null, userType: null, session: null, loading: false });
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setState({ user: null, userType: null, session: null, loading: false });
    }
  }

  async function signOut() {
    try {
      const sessionId = sessionStorage.getItem('heatplex_session_id');
      if (sessionId) {
        // Delete session from database
        await supabase.from('sessions').delete().eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      sessionStorage.removeItem('heatplex_session_id');
      setState({ user: null, userType: null, session: null, loading: false });
    }
  }

  async function refreshSession() {
    await loadSession();
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
