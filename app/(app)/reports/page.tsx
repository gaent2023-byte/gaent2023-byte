'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { StatusPill } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, Plus } from 'lucide-react';

type Report = Database['public']['Tables']['reports']['Row'] & {
  suppliers: { company_name: string } | null;
};

export default function ReportsPage() {
  const supabase = createBrowserClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('reports')
      .select('*, suppliers!inner(company_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReports((data ?? []) as Report[]);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Opinion Reports"
        description={`${reports.length} reports generated`}
        actions={
          <Link href="/suppliers"><Button><Plus className="mr-1.5 h-4 w-4" /> New Report</Button></Link>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No reports yet"
          description="Generate a Supplier Opinion Report from any supplier's detail page."
          action={<Link href="/suppliers"><Button>Browse Suppliers</Button></Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Report Title</th>
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.suppliers?.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">v{r.version}</td>
                  <td className="px-4 py-3"><StatusPill status={r.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/reports/${r.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      Open <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
