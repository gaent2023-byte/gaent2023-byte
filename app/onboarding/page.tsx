'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Building2, Check, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) {
        setCheckingSession(false);
        if (!user) router.replace('/signin');
      }
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      clearTimeout(timeout);
      if (session?.user) {
        setUser(session.user);
        setCheckingSession(false);
      } else {
        router.replace('/signin');
      }
    }).catch(() => {
      clearTimeout(timeout);
      router.replace('/signin');
    });

    return () => { mounted = false; clearTimeout(timeout); };
  }, [supabase, router, user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) return;
    setCreating(true);

    try {
      const slug = slugify(orgName) + '-' + Math.random().toString(36).slice(2, 6);

      const { data: org, error: orgErr } = await supabase
        .from('organizations')
        .insert({ name: orgName, slug, industry: industry || null, country: country || null })
        .select()
        .single();

      if (orgErr) throw new Error(orgErr.message);

      const { error: memErr } = await supabase
        .from('organization_members')
        .insert({ organization_id: org.id, user_id: user.id, role: 'org_admin' });

      if (memErr) throw new Error(memErr.message);

      setDone(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create organization');
      setCreating(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Scale className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold">Set up your organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your GSOR workspace to begin assessing suppliers.
          </p>
        </div>

        {done ? (
          <div className="animate-scale-in rounded-lg border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-medium text-foreground">Organization created</p>
            <p className="mt-1 text-sm text-muted-foreground">Redirecting to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-1.5">
              <Label htmlFor="orgName">Organization name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="orgName"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Bank"
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry">Industry (optional)</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Banking"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">Country (optional)</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="United States"
              />
            </div>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating…</> : 'Create organization'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
