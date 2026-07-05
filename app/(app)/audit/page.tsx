'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { FileSearch } from 'lucide-react';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export default function AuditPage() {
  const supabase = createBrowserClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs((data ?? []) as AuditLog[]);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description={`${logs.length} logged actions`} />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<FileSearch className="h-6 w-6" />} title="No audit logs yet" description="Sensitive actions like report generation, exports, and data changes will be logged here." />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Entity</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.entity_type ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
