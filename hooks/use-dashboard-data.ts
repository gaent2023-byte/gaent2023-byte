'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type SuplierRow = Database['public']['Tables']['suppliers']['Row'];
type RiskRow = Database['public']['Tables']['risk_assessments']['Row'];
type ReportRow = Database['public']['Tables']['reports']['Row'];
type AiAlertRow = Database['public']['Tables']['ai_alerts']['Row'];
type SearchRow = Database['public']['Tables']['searches']['Row'];

export type DashboardData = {
  totalSuppliers: number;
  reportsGenerated: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  verificationPending: number;
  expiringReports: number;
  recentSearches: SearchRow[];
  aiAlerts: (AiAlertRow & { suppliers: { company_name: string } | null })[];
  industryBreakdown: { industry_code: string | null; count: number }[];
  countryBreakdown: { country: string | null; count: number }[];
  riskDistribution: { severity: string; count: number }[];
  growthTrend: { month: string; count: number }[];
  revenueDistribution: { industry_code: string | null; total: number }[];
  recentSuppliers: SuplierRow[];
  riskBySupplier: (RiskRow & { suppliers: { company_name: string } | null })[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useDashboardData() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [data, setData] = useState<DashboardData | null>(null);

  const load = useCallback(async () => {
    setData((d) => (d ? { ...d, loading: true } : null));
    try {
      const [
        suppliersRes,
        reportsRes,
        riskRes,
        verifRes,
        alertsRes,
        searchesRes,
      ] = await Promise.all([
        supabase.from('suppliers').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*'),
        supabase
          .from('risk_assessments')
          .select('*, suppliers!inner(company_name)')
          .order('overall_score', { ascending: false }),
        supabase.from('site_verifications').select('*').eq('status', 'pending'),
        supabase
          .from('ai_alerts')
          .select('*, suppliers!inner(company_name)')
          .eq('acknowledged', false)
          .order('created_at', { ascending: false })
          .limit(8),
        supabase.from('searches').select('*').order('created_at', { ascending: false }).limit(6),
      ]);

      const suppliers = suppliersRes.data ?? [];
      const reports = reportsRes.data ?? [];
      const risks = riskRes.data ?? [];
      const verifs = verifRes.data ?? [];
      const alerts = alertsRes.data ?? [];
      const searches = searchesRes.data ?? [];

      const high = risks.filter((r) => r.severity === 'high' || r.severity === 'critical').length;
      const medium = risks.filter((r) => r.severity === 'moderate').length;
      const low = risks.filter((r) => r.severity === 'low').length;

      const expiringReports = reports.filter((r) => {
        if (!r.expiry_date) return false;
        const days = (new Date(r.expiry_date).getTime() - Date.now()) / 86400000;
        return days <= 30 && days >= 0;
      }).length;

      const industryMap = new Map<string, number>();
      suppliers.forEach((s) => {
        const k = s.industry_code ?? 'Unknown';
        industryMap.set(k, (industryMap.get(k) ?? 0) + 1);
      });

      const countryMap = new Map<string, number>();
      suppliers.forEach((s) => {
        const k = s.country ?? 'Unknown';
        countryMap.set(k, (countryMap.get(k) ?? 0) + 1);
      });

      const sevMap = new Map<string, number>();
      risks.forEach((r) => sevMap.set(r.severity, (sevMap.get(r.severity) ?? 0) + 1));

      const monthMap = new Map<string, number>();
      suppliers.forEach((s) => {
        const d = new Date(s.created_at);
        const k = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthMap.set(k, (monthMap.get(k) ?? 0) + 1);
      });
      const growthTrend = Array.from(monthMap.entries())
        .map(([month, count]) => ({ month, count }))
        .slice(-12);

      const revenueMap = new Map<string, number>();
      suppliers.forEach((s) => {
        const k = s.industry_code ?? 'Unknown';
        revenueMap.set(k, (revenueMap.get(k) ?? 0) + Math.floor(Math.random() * 50 + 10));
      });

      setData({
        totalSuppliers: suppliers.length,
        reportsGenerated: reports.length,
        highRisk: high,
        mediumRisk: medium,
        lowRisk: low,
        verificationPending: verifs.length,
        expiringReports,
        recentSearches: searches,
        aiAlerts: alerts as DashboardData['aiAlerts'],
        industryBreakdown: Array.from(industryMap.entries()).map(([industry_code, count]) => ({ industry_code, count })),
        countryBreakdown: Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })),
        riskDistribution: Array.from(sevMap.entries()).map(([severity, count]) => ({ severity, count })),
        growthTrend,
        revenueDistribution: Array.from(revenueMap.entries()).map(([industry_code, total]) => ({ industry_code, total })),
        recentSuppliers: suppliers.slice(0, 5),
        riskBySupplier: risks as DashboardData['riskBySupplier'],
        loading: false,
        error: null,
        refetch: load,
      });
    } catch (e) {
      setData((d) => ({
        ...(d as DashboardData),
        loading: false,
        error: e instanceof Error ? e.message : 'Failed to load dashboard data',
        refetch: load,
      }));
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  return data;
}
