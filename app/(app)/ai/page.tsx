'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { EmptyState } from '@/components/shared/empty-state';
import { RiskBadge } from '@/components/shared/badges';
import { Sparkles, AlertTriangle, TrendingUp, Brain } from 'lucide-react';

type AiAlert = Database['public']['Tables']['ai_alerts']['Row'] & {
  suppliers: { company_name: string } | null;
};
type AiOpinion = Database['public']['Tables']['ai_opinions']['Row'] & {
  suppliers: { company_name: string } | null;
};

export default function AiIntelligencePage() {
  const supabase = createBrowserClient();
  const [alerts, setAlerts] = useState<AiAlert[]>([]);
  const [opinions, setOpinions] = useState<AiOpinion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('ai_alerts').select('*, suppliers!inner(company_name)').order('created_at', { ascending: false }).limit(20),
      supabase.from('ai_opinions').select('*, suppliers!inner(company_name)').order('generated_at', { ascending: false }).limit(10),
    ]).then(([a, o]) => {
      setAlerts((a.data ?? []) as AiAlert[]);
      setOpinions((o.data ?? []) as AiOpinion[]);
      setLoading(false);
    });
  }, [supabase]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Intelligence"
        description="AI-generated supplier opinions, risk alerts, and fraud detection signals."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border bg-gradient-to-br from-primary/5 to-info/5 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{opinions.length}</p>
            <p className="text-xs text-muted-foreground">AI Opinions Generated</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-gradient-to-br from-warning/5 to-destructive/5 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{alerts.filter((a) => !a.acknowledged).length}</p>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-gradient-to-br from-success/5 to-primary/5 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/10 text-success">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {opinions.filter((o) => o.recommendation === 'approve').length}
            </p>
            <p className="text-xs text-muted-foreground">Approved by AI</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Recent AI Opinions" description="Latest supplier assessments" bodyClassName="p-0">
          {opinions.length > 0 ? (
            <div className="divide-y">
              {opinions.map((op) => (
                <div key={op.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{op.suppliers?.company_name}</p>
                    <span className="text-xs text-muted-foreground">{new Date(op.generated_at).toLocaleDateString()}</span>
                  </div>
                  {op.summary && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{op.summary}</p>}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {op.recommendation && (
                      <span className={`rounded px-2 py-0.5 font-semibold capitalize ${
                        op.recommendation === 'approve' ? 'bg-success/10 text-success' :
                        op.recommendation === 'reject' ? 'bg-destructive/10 text-destructive' :
                        'bg-warning/10 text-warning'
                      }`}>{op.recommendation}</span>
                    )}
                    {op.default_probability != null && <span className="text-muted-foreground">Default: {op.default_probability}%</span>}
                    {op.confidence != null && <span className="text-muted-foreground">Confidence: {op.confidence}%</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Sparkles className="h-6 w-6" />} title="No AI opinions yet" description="Generate AI opinions from supplier detail pages." className="border-0" />
          )}
        </SectionCard>

        <SectionCard title="Risk Alerts" description="AI-detected anomalies and signals" bodyClassName="p-0">
          {alerts.length > 0 ? (
            <div className="divide-y">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{a.suppliers?.company_name}</p>
                    {a.message && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{a.message}</p>}
                  </div>
                  <RiskBadge severity={a.severity} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<AlertTriangle className="h-6 w-6" />} title="No active alerts" className="border-0" />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
