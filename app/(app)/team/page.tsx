'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import type { Database } from '@/lib/database.types';
import { ROLE_LABELS } from '@/lib/auth/roles';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserPlus } from 'lucide-react';

type Member = Database['public']['Tables']['organization_members']['Row'];

export default function TeamPage() {
  const supabase = createBrowserClient();
  const { membership } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!membership) return;
    supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', membership.organization_id)
      .order('created_at')
      .then(({ data }) => {
        setMembers((data ?? []) as Member[]);
        setLoading(false);
      });
  }, [supabase, membership]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & Roles"
        description={`${members.length} members in your organization`}
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <UserPlus className="h-4 w-4" /> Invite Member
          </button>
        }
      />

      <div className="rounded-lg border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Role-Based Access Control (RBAC)</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <div key={key} className="rounded-md border p-3">
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{key}</p>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title="No team members" />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {m.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-mono text-xs text-muted-foreground">{m.user_id.slice(0, 8)}…</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {ROLE_LABELS[m.role as keyof typeof ROLE_LABELS] ?? m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
