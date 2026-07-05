'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { StatusPill } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, ArrowRight } from 'lucide-react';

type Verification = Database['public']['Tables']['site_verifications']['Row'] & {
  suppliers: { company_name: string } | null;
};

export default function VerificationsPage() {
  const supabase = createBrowserClient();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_verifications')
      .select('*, suppliers!inner(company_name)')
      .order('visit_date', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setVerifications((data ?? []) as Verification[]);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <div className="space-y-6">
      <PageHeader title="Site Verifications" description={`${verifications.length} verification visits`} />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : verifications.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-6 w-6" />}
          title="No verifications scheduled"
          description="Site verifications are tracked from each supplier's detail page."
          action={<Link href="/suppliers" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Browse Suppliers</Link>}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Visit Date</th>
                <th className="px-4 py-3 font-medium">Surveyor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {verifications.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{v.suppliers?.company_name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(v.visit_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.surveyor_name ?? '—'}</td>
                  <td className="px-4 py-3"><StatusPill status={v.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/suppliers/${v.supplier_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                      View <ArrowRight className="h-3 w-3" />
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
