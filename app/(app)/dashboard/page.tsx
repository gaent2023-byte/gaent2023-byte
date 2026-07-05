'use client';

import Link from 'next/link';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useAuth } from '@/components/providers/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { KpiCard } from '@/components/shared/kpi-card';
import { SectionCard } from '@/components/shared/section-card';
import { RiskBadge, RatingChip } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Building2,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Clock,
  AlarmClock,
  Search,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const RISK_COLORS: Record<string, string> = {
  low: 'hsl(var(--success))',
  moderate: 'hsl(var(--warning))',
  high: 'hsl(var(--destructive))',
  critical: '#7f1d1d',
};

export default function DashboardPage() {
  const { membership } = useAuth();
  const data = useDashboardData();

  if (!data || data.loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Executive Dashboard" description="Loading…" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <EmptyState
        title="Could not load dashboard"
        description={data.error}
        className="mt-10"
      />
    );
  }

  const industryData = data.industryBreakdown
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((d) => ({ name: d.industry_code ?? 'Unknown', count: d.count }));

  const riskData = data.riskDistribution.map((d) => ({
    name: d.severity,
    value: d.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Executive Dashboard"
        description={`Welcome back${membership ? `, ${membership.organization_name}` : ''}. Here's your supplier risk intelligence overview.`}
        actions={
          <Link
            href="/suppliers/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Building2 className="h-4 w-4" />
            Add Supplier
          </Link>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Suppliers"
          value={data.totalSuppliers.toLocaleString()}
          icon={<Building2 className="h-5 w-5" />}
          tone="default"
          trend={{ value: '+12% this quarter', direction: 'up' }}
        />
        <KpiCard
          label="Reports Generated"
          value={data.reportsGenerated.toLocaleString()}
          icon={<FileText className="h-5 w-5" />}
          tone="info"
          trend={{ value: '+5 this week', direction: 'up' }}
        />
        <KpiCard
          label="High / Critical Risk"
          value={data.highRisk.toLocaleString()}
          icon={<ShieldAlert className="h-5 w-5" />}
          tone="danger"
          trend={{ value: 'Needs attention', direction: 'flat' }}
        />
        <KpiCard
          label="Verification Pending"
          value={data.verificationPending.toLocaleString()}
          icon={<ShieldQuestion className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Medium Risk"
          value={data.mediumRisk.toLocaleString()}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="Low Risk"
          value={data.lowRisk.toLocaleString()}
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="success"
        />
        <KpiCard
          label="Expiring Reports (30d)"
          value={data.expiringReports.toLocaleString()}
          icon={<Clock className="h-5 w-5" />}
          tone="warning"
        />
        <KpiCard
          label="AI Risk Alerts"
          value={data.aiAlerts.length.toLocaleString()}
          icon={<AlarmClock className="h-5 w-5" />}
          tone="danger"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Supplier Growth Trend"
          description="New suppliers added per month"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.growthTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#growthGrad)"
                name="Suppliers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Risk Distribution" description="By severity">
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {riskData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name] ?? 'hsl(var(--muted))'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No risk data yet" description="Risk assessments will appear here." className="border-0" />
          )}
        </SectionCard>
      </div>

      {/* Industry + Country */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Industry-wise Analysis" description="Supplier count by industry">
          {industryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={industryData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Suppliers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No industry data" className="border-0" />
          )}
        </SectionCard>

        <SectionCard title="Country-wise Analysis" description="Top supplier countries">
          {data.countryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={data.countryBreakdown.sort((a, b) => b.count - a.count).slice(0, 8)}
                margin={{ top: 5, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="country"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} name="Suppliers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No country data" className="border-0" />
          )}
        </SectionCard>
      </div>

      {/* Alerts + Recent Searches + Top Risk */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="AI Risk Alerts"
          description="Unacknowledged alerts"
          className="lg:col-span-1"
          bodyClassName="p-0"
        >
          {data.aiAlerts.length > 0 ? (
            <ul className="divide-y">
              {data.aiAlerts.slice(0, 6).map((alert) => (
                <li key={alert.id} className="flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {alert.suppliers?.company_name}
                    </p>
                    <div className="mt-1.5">
                      <RiskBadge severity={alert.severity} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No active alerts" className="border-0" />
          )}
        </SectionCard>

        <SectionCard title="Recent Searches" description="Your latest queries" bodyClassName="p-0">
          {data.recentSearches.length > 0 ? (
            <ul className="divide-y">
              {data.recentSearches.map((s) => (
                <li key={s.id} className="flex items-center gap-3 p-4">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{s.query}</p>
                    <p className="text-xs text-muted-foreground">{s.results_count} results</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No recent searches" className="border-0" />
          )}
        </SectionCard>

        <SectionCard title="Highest Risk Suppliers" description="Top by overall score" bodyClassName="p-0">
          {data.riskBySupplier.length > 0 ? (
            <ul className="divide-y">
              {data.riskBySupplier.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                  <Link
                    href={`/suppliers/${r.supplier_id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium text-foreground hover:text-primary"
                  >
                    {r.suppliers?.company_name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <RatingChip rating={r.rating ?? '—'} />
                    <span className="text-sm font-semibold tabular-nums text-foreground">{r.overall_score}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No risk data" className="border-0" />
          )}
        </SectionCard>
      </div>

      {/* Recent suppliers */}
      <SectionCard title="Recently Added Suppliers" bodyClassName="p-0">
        {data.recentSuppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium">Industry</th>
                  <th className="px-4 py-2.5 font-medium">Country</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Added</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.recentSuppliers.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-foreground">{s.company_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.industry_code ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.country ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-muted-foreground">{s.status.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/suppliers/${s.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No suppliers yet"
            description="Add your first supplier to start generating reports."
            action={
              <Link
                href="/suppliers/new"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Building2 className="h-4 w-4" /> Add Supplier
              </Link>
            }
            className="border-0"
          />
        )}
      </SectionCard>
    </div>
  );
}
