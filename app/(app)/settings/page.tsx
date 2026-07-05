'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard, DetailField } from '@/components/shared/section-card';
import { ROLE_LABELS } from '@/lib/auth/roles';
import { Shield, Building2, Lock, Database } from 'lucide-react';

export default function SettingsPage() {
  const supabase = createBrowserClient();
  const { membership, user } = useAuth();
  const [org, setOrg] = useState<{ name: string; slug: string; plan: string; industry: string | null; country: string | null } | null>(null);

  useEffect(() => {
    if (!membership) return;
    supabase.from('organizations').select('*').eq('id', membership.organization_id).maybeSingle().then(({ data }) => {
      if (data) setOrg(data as typeof org);
    });
  }, [supabase, membership]);

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your organization and account preferences." />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Organization" description="Your tenant details">
          <dl className="grid grid-cols-2 gap-4">
            <DetailField label="Name">{org?.name ?? '—'}</DetailField>
            <DetailField label="Slug">{org?.slug ?? '—'}</DetailField>
            <DetailField label="Plan"><span className="capitalize">{org?.plan ?? '—'}</span></DetailField>
            <DetailField label="Industry">{org?.industry ?? '—'}</DetailField>
            <DetailField label="Country">{org?.country ?? '—'}</DetailField>
          </dl>
        </SectionCard>

        <SectionCard title="Account" description="Your user profile">
          <dl className="grid grid-cols-1 gap-4">
            <DetailField label="Email">{user?.email ?? '—'}</DetailField>
            <DetailField label="Role">{membership ? ROLE_LABELS[membership.role] : '—'}</DetailField>
            <DetailField label="Organization">{membership?.organization_name ?? '—'}</DetailField>
          </dl>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { icon: Shield, title: 'Security', desc: 'MFA, session management, and access policies' },
          { icon: Building2, title: 'Multi-Tenancy', desc: 'Organization isolation with RLS enforcement' },
          { icon: Lock, title: 'Encryption', desc: 'Data encrypted at rest and in transit' },
          { icon: Database, title: 'Data & Backup', desc: 'PostgreSQL with point-in-time recovery' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border bg-card p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
