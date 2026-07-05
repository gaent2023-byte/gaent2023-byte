'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type Report = Database['public']['Tables']['reports']['Row'];
type ReportSection = Database['public']['Tables']['report_sections']['Row'];
type Supplier = Database['public']['Tables']['suppliers']['Row'];

export type ReportDetailData = {
  report: Report | null;
  sections: ReportSection[];
  supplier: Supplier | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useReportDetail(reportId: string): ReportDetailData {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [state, setState] = useState<ReportDetailData>({
    report: null, sections: [], supplier: null, loading: true, error: null, refetch: () => {},
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { data: report, error: rErr } = await supabase
        .from('reports').select('*').eq('id', reportId).maybeSingle();
      if (rErr) throw rErr;
      if (!report) {
        setState((s) => ({ ...s, report: null, loading: false, error: 'Report not found' }));
        return;
      }

      const [secRes, supRes] = await Promise.all([
        supabase.from('report_sections').select('*').eq('report_id', reportId).order('order_index'),
        supabase.from('suppliers').select('*').eq('id', report.supplier_id).maybeSingle(),
      ]);

      setState({
        report: report as Report,
        sections: (secRes.data ?? []) as ReportSection[],
        supplier: (supRes.data ?? null) as Supplier | null,
        loading: false,
        error: null,
        refetch: load,
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Failed' }));
    }
  }, [supabase, reportId]);

  useEffect(() => { load(); }, [load]);
  return state;
}
