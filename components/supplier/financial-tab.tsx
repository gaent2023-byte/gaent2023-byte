'use client';

import type { Database } from '@/lib/database.types';
import { SectionCard, DetailField } from '@/components/shared/section-card';
import { EmptyState } from '@/components/shared/empty-state';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, FileSpreadsheet } from 'lucide-react';

type FinancialRatio = Database['public']['Tables']['financial_ratios']['Row'];
type FinancialStatement = Database['public']['Tables']['financial_statements']['Row'];

function fmtMoney(v: number | null | undefined, currency = 'USD') {
  if (v == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(v);
}
function fmtNum(v: number | null | undefined, suffix = '') {
  if (v == null) return '—';
  return `${v.toLocaleString()}${suffix}`;
}

const RATIO_FIELDS: { key: keyof FinancialRatio; label: string; suffix?: string }[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'ebitda', label: 'EBITDA' },
  { key: 'gross_profit', label: 'Gross Profit' },
  { key: 'net_profit', label: 'Net Profit' },
  { key: 'net_worth', label: 'Net Worth' },
  { key: 'debt', label: 'Debt' },
  { key: 'current_ratio', label: 'Current Ratio', suffix: 'x' },
  { key: 'quick_ratio', label: 'Quick Ratio', suffix: 'x' },
  { key: 'debt_equity_ratio', label: 'Debt/Equity', suffix: 'x' },
  { key: 'interest_coverage', label: 'Interest Coverage', suffix: 'x' },
  { key: 'working_capital', label: 'Working Capital' },
  { key: 'roe', label: 'ROE', suffix: '%' },
  { key: 'roa', label: 'ROA', suffix: '%' },
  { key: 'inventory_turnover', label: 'Inventory Turnover', suffix: 'x' },
  { key: 'receivable_days', label: 'Receivable Days', suffix: 'd' },
  { key: 'payable_days', label: 'Payable Days', suffix: 'd' },
];

export function FinancialTab({
  ratios,
  statements,
}: {
  ratios: FinancialRatio[];
  statements: FinancialStatement[];
}) {
  const latest = ratios[ratios.length - 1];
  const trendData = ratios.map((r) => ({ year: r.fiscal_year, revenue: r.revenue, ebitda: r.ebitda, net_profit: r.net_profit }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="5-Year Financial Trend" description="Revenue, EBITDA & Net Profit">
          {trendData.length > 1 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Legend formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Line type="monotone" dataKey="ebitda" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                <Line type="monotone" dataKey="net_profit" stroke="hsl(var(--chart-3))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="No financial trend data" description="Add financial ratios per fiscal year to see trends." className="border-0" />
          )}
        </SectionCard>

        <SectionCard title="Key Ratios (Latest Year)" description={latest ? `FY ${latest.fiscal_year}` : undefined}>
          {latest ? (
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {RATIO_FIELDS.slice(6).map((f) => (
                <DetailField key={f.key} label={f.label}>
                  {f.key === 'revenue' || f.key === 'ebitda' || f.key === 'gross_profit' || f.key === 'net_profit' || f.key === 'net_worth' || f.key === 'debt' || f.key === 'working_capital'
                    ? fmtMoney(latest[f.key] as number | null)
                    : fmtNum(latest[f.key] as number | null, f.suffix)}
                </DetailField>
              ))}
            </dl>
          ) : (
            <EmptyState title="No ratios computed" className="border-0" />
          )}
        </SectionCard>
      </div>

      {latest && (
        <SectionCard title="Financial Summary" description="Latest year figures">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {RATIO_FIELDS.slice(0, 6).map((f) => (
              <DetailField key={f.key} label={f.label}>
                {fmtMoney(latest[f.key] as number | null)}
              </DetailField>
            ))}
          </dl>
        </SectionCard>
      )}

      <SectionCard title="Financial Statements" description="Imported balance sheets, P&L, cash flow" bodyClassName="p-0">
        {statements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Fiscal Year</th>
                  <th className="px-4 py-2.5 font-medium">Type</th>
                  <th className="px-4 py-2.5 font-medium">Currency</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="px-4 py-2.5 font-medium">Imported</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {statements.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{s.fiscal_year}</td>
                    <td className="px-4 py-3 capitalize">{s.statement_type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">{s.currency}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.source_doc_url ? 'Uploaded' : 'Manual'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={<FileSpreadsheet className="h-6 w-6" />} title="No financial statements imported" description="Import balance sheets, P&L, and cash flow statements to auto-calculate ratios." className="border-0" />
        )}
      </SectionCard>

      {ratios.length > 1 && (
        <SectionCard title="Ratio Trends" description="All ratios across years">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratios.map((r) => ({ year: r.fiscal_year, current: r.current_ratio, quick: r.quick_ratio, debt_eq: r.debt_equity_ratio }))} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Legend formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
              <Bar dataKey="current" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="quick" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="debt_eq" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      )}
    </div>
  );
}
