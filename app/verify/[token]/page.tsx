'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { StatusPill, RatingChip } from '@/components/shared/badges';
import { ShieldCheck, QrCode, AlertCircle, Loader2 } from 'lucide-react';

type Report = Database['public']['Tables']['reports']['Row'] & {
  suppliers: { company_name: string; industry_code: string | null; country: string | null } | null;
};
type Section = Database['public']['Tables']['report_sections']['Row'];

export default function VerifyPage() {
  const params = useParams<{ token: string }>();
  const supabase = createBrowserClient();
  const [report, setReport] = useState<Report | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [status, setStatus] = useState<'loading' | 'found' | 'not_found'>('loading');

  useEffect(() => {
    supabase
      .from('reports')
      .select('*, suppliers!inner(company_name, industry_code, country)')
      .eq('qr_token', params.token)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setReport(data as Report);
          supabase
            .from('report_sections')
            .select('*')
            .eq('report_id', data.id)
            .order('order_index')
            .then(({ data: secs }) => setSections((secs ?? []) as Section[]));
          setStatus('found');
        } else {
          setStatus('not_found');
        }
      });
  }, [supabase, params.token]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Report Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The verification token <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{params.token}</code> does not match any valid report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Report Verification</h1>
            <p className="text-xs text-muted-foreground">GSOR — Global Supplier Opinion Report</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{report?.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {report?.suppliers?.company_name}
                {report?.suppliers?.industry_code && ` • ${report.suppliers.industry_code}`}
                {report?.suppliers?.country && ` • ${report.suppliers.country}`}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <StatusPill status={report?.status ?? '—'} />
                <span className="text-xs text-muted-foreground">
                  Generated {report ? new Date(report.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-primary/20 text-primary">
                <QrCode className="h-8 w-8" />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{report?.qr_token.slice(0, 12)}…</span>
            </div>
          </div>
        </div>

        {sections.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Report Sections</h3>
            {sections.slice(0, 5).map((s, i) => {
              const content = (s.content as { heading: string; body: string }) ?? { heading: s.title, body: '' };
              return (
                <div key={s.id} className="rounded-lg border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">{i + 1}. {content.heading}</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground line-clamp-4">{content.body}</p>
                </div>
              );
            })}
            {sections.length > 5 && (
              <p className="text-center text-xs text-muted-foreground">
                + {sections.length - 5} more sections in the full report
              </p>
            )}
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          This report has been verified as authentic by the GSOR platform.
        </p>
      </div>
    </div>
  );
}
