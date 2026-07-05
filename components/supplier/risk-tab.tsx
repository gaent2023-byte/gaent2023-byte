'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { SectionCard } from '@/components/shared/section-card';
import { RiskBadge, RatingChip } from '@/components/shared/badges';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/empty-state';
import { Shield, RefreshCw, Loader2 } from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

type Risk = Database['public']['Tables']['risk_assessments']['Row'];
type RiskHistory = Database['public']['Tables']['risk_score_history']['Row'];

const RISK_CATEGORIES: { key: keyof Risk; label: string }[] = [
  { key: 'financial_risk', label: 'Financial' },
  { key: 'operational_risk', label: 'Operational' },
  { key: 'compliance_risk', label: 'Compliance' },
  { key: 'business_risk', label: 'Business' },
  { key: 'market_risk', label: 'Market' },
  { key: 'country_risk', label: 'Country' },
  { key: 'political_risk', label: 'Political' },
  { key: 'esg_risk', label: 'ESG' },
  { key: 'reputation_risk', label: 'Reputation' },
  { key: 'supply_chain_risk', label: 'Supply Chain' },
  { key: 'fraud_risk', label: 'Fraud' },
];

function scoreColor(score: number) {
  if (score <= 40) return 'hsl(var(--success))';
  if (score <= 65) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

export function RiskTab({ supplierId, risk, riskHistory }: { supplierId: string; risk: Risk | null; riskHistory: RiskHistory[] }) {
  const supabase = createBrowserClient();
  const [recalculating, setRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setRecalculating(true);
    const { error } = await supabase.rpc('compute_risk_score', { suuid: supplierId });
    setRecalculating(false);
    if (!error) window.location.reload();
  };

  if (!risk) {
    return (
      <EmptyState
        icon={<Shield className="h-6 w-6" />}
        title="No risk assessment yet"
        description="Initialize a risk assessment to compute the overall score."
        action={<Button onClick={handleRecalculate} disabled={recalculating}>
          {recalculating ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Computing…</> : 'Compute Risk Score'}
        </Button>}
      />
    );
  }

  const categoryData = RISK_CATEGORIES.map((c) => ({
    name: c.label,
    score: risk[c.key] as number,
    fill: scoreColor(risk[c.key] as number),
  }));

  const historyData = riskHistory.map((h) => ({
    date: new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: h.overall_score,
  }));

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Overall Risk Score" className="lg:col-span-1">
          <div className="flex flex-col items-center">
            <div className="relative h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ score: risk.overall_score, fill: scoreColor(risk.overall_score) }]} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="score" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tabular-nums text-foreground">{risk.overall_score}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <RatingChip rating={risk.rating ?? '—'} />
              <RiskBadge severity={risk.severity} />
            </div>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleRecalculate} disabled={recalculating}>
              {recalculating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
              Recalculate
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Score History" description="Overall score over time" className="lg:col-span-2">
          {historyData.length > 1 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="Limited history" description="Score history builds as assessments are updated." className="border-0" />
          )}
        </SectionCard>
      </div>

      {/* Category Breakdown */}
      <SectionCard title="Risk Category Breakdown" description="11 risk dimensions (lower is better)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryData.map((c) => (
            <div key={c.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: c.fill }}>{c.score}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${c.score}%`, backgroundColor: c.fill }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
