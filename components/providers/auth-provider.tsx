'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Role } from '@/lib/auth/roles';

export type Membership = {
  organization_id: string;
  role: Role;
  organization_name: string;
  organization_slug: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  membership: Membership | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMembership: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  membership: null,
  loading: true,
  signOut: async () => {},
  refreshMembership: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMembership = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('organization_members')
      .select(
        'organization_id, role, organizations(name, slug)'
      )
      .eq('user_id', uid)
      .limit(1)
      .maybeSingle();

    if (data) {
      const org = data.organizations as unknown as { name: string; slug: string };
      setMembership({
        organization_id: data.organization_id,
        role: data.role as Role,
        organization_name: org?.name ?? '',
        organization_slug: org?.slug ?? '',
      });
    } else {
      setMembership(null);
    }
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        loadMembership(s.user.id).finally(() => mounted && setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        (async () => {
          await loadMembership(s.user.id);
          setLoading(false);
        })();
      } else {
        setMembership(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [loadMembership, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setMembership(null);
  }, [supabase]);

  const refreshMembership = useCallback(async () => {
    if (user) await loadMembership(user.id);
  }, [user, loadMembership]);

  return (
    <AuthContext.Provider
      value={{ user, session, membership, loading, signOut, refreshMembership }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
