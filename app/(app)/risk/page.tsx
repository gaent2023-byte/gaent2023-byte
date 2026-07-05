'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { RatingChip, RiskBadge } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Scale, ArrowRight } from 'lucide-react';

type Risk = Database['public']['Tables']['risk_assessments']['Row'] & {
  suppliers: { company_name: string } | null;
};

export default function RiskPage() {
  const supabase = createBrowserClient();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('risk_assessments')
      .select('*, suppliers!inner(company_name)')
      .order('overall_score', { ascending: false })
      .then(({ data }) => {
        setRisks((data ?? []) as Risk[]);
        setLoading(false);
      });
  }, [supabase]);

  const stats = {
    critical: risks.filter((r) => r.severity === 'critical').length,
    high: risks.filter((r) => r.severity === 'high').length,
    moderate: risks.filter((r) => r.severity === 'moderate').length,
    low: risks.filter((r) => r.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Risk Assessments" description={`${risks.length} suppliers assessed`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Critical', value: stats.critical, color: 'text-destructive' },
          { label: 'High', value: stats.high, color: 'text-destructive' },
          { label: 'Moderate', value: stats.moderate, color: 'text-warning' },
          { label: 'Low', value: stats.low, color: 'text-success' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-5">
            <p className="text-xs text-muted-foreground">{s.label} Risk</p>
            <p className={`mt-2 text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : risks.length === 0 ? (
        <EmptyState icon={<Scale className="h-6 w-6" />} title="No risk assessments" description="Risk scores are computed from each supplier's detail page." />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Supplier</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Assessed</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{r.suppliers?.company_name ?? '—'}</td>
                  <td className="px-4 py-3"><RatingChip rating={r.rating ?? '—'} /></td>
                  <td className="px-4 py-3"><RiskBadge severity={r.severity} /></td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{r.overall_score}/100</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.assessed_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/suppliers/${r.supplier_id}`} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
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
