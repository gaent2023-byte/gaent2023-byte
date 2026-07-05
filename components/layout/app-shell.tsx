'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { createBrowserClient } from '@/lib/supabase/client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { Scale, Loader2 } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, membership, loading, refreshMembership } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/signin');
    }
  }, [loading, user, router]);

  // If user exists but membership is null, try refreshing once more
  // (handles the race where org was just created but context hasn't updated)
  useEffect(() => {
    if (!loading && user && !membership) {
      refreshMembership();
    }
  }, [loading, user, membership, refreshMembership]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading GSOR…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!membership) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">No organization assigned</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account is not linked to an organization. Please contact your administrator to be
            added to a tenant, or create a new organization.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => router.push('/onboarding')}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create organization
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/signin'; }}
              className="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
