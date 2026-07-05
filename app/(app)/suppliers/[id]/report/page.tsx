'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { REPORT_SECTIONS } from '@/lib/report/sections';
import { buildSectionContent } from '@/lib/report/content-builder';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Check, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function GenerateReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createBrowserClient();
  const { membership } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supplier, setSupplier] = useState<{ company_name: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('suppliers').select('company_name').eq('id', params.id).maybeSingle().then(({ data }) => {
      setSupplier(data as { company_name: string } | null);
      setLoading(false);
    });
  }, [supabase, params.id]);

  const handleGenerate = async () => {
    setError(null);
    setGenerating(true);
    try {
      // Fetch all supplier data for the report
      const [sRes, bpRes, riskRes, aiRes, frRes, personnelRes, contactsRes, compRes, litRes, bankRes] = await Promise.all([
        supabase.from('suppliers').select('*').eq('id', params.id).maybeSingle(),
        supabase.from('supplier_business_profiles').select('*').eq('supplier_id', params.id).maybeSingle(),
        supabase.from('risk_assessments').select('*').eq('supplier_id', params.id).maybeSingle(),
        supabase.from('ai_opinions').select('*').eq('supplier_id', params.id).order('generated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('financial_ratios').select('*').eq('supplier_id', params.id).order('fiscal_year'),
        supabase.from('supplier_personnel').select('*').eq('supplier_id', params.id),
        supabase.from('supplier_contacts').select('*').eq('supplier_id', params.id),
        supabase.from('compliance_records').select('*').eq('supplier_id', params.id),
        supabase.from('litigation_records').select('*').eq('supplier_id', params.id),
        supabase.from('banking_info').select('*').eq('supplier_id', params.id),
      ]);

      if (sRes.error || !sRes.data) throw new Error('Supplier not found');

      const ctx = {
        supplier: sRes.data,
        businessProfile: bpRes.data,
        risk: riskRes.data,
        aiOpinion: aiRes.data,
        financialRatios: frRes.data ?? [],
        personnel: personnelRes.data ?? [],
        contacts: contactsRes.data ?? [],
        compliance: compRes.data ?? [],
        litigation: litRes.data ?? [],
        banking: bankRes.data ?? [],
        organizationName: membership?.organization_name ?? 'GSOR',
      };

      // Create report
      const { data: report, error: rErr } = await supabase
        .from('reports')
        .insert({
          supplier_id: params.id,
          title: `Supplier Opinion Report — ${sRes.data.company_name}`,
          status: 'draft',
          prepared_by: membership ? (await supabase.auth.getUser()).data.user?.id : null,
        })
        .select()
        .single();

      if (rErr) throw rErr;

      // Create all sections
      const sections = REPORT_SECTIONS.map((sec) => {
        const content = buildSectionContent(sec.key, ctx);
        return {
          report_id: report.id,
          section_key: sec.key,
          title: sec.title,
          order_index: sec.order,
          content: content as never,
        };
      });

      const { error: secErr } = await supabase.from('report_sections').insert(sections);
      if (secErr) throw secErr;

      router.push(`/reports/${report.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate report');
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!supplier) {
    return <EmptyState title="Supplier not found" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Generate Supplier Opinion Report"
        description={`Create a comprehensive 22-section report for ${supplier.company_name}.`}
      />

      <SectionCard title="Report Contents" description="The following sections will be auto-populated from supplier data:">
        <div className="grid gap-2 sm:grid-cols-2">
          {REPORT_SECTIONS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                {i + 1}
              </div>
              <span className="text-foreground">{s.title}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Before you continue" description="The report will be created as a draft. You can edit each section before exporting.">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Auto-populated from supplier master data</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Includes risk assessment and AI opinion (if available)</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> Fully editable before export to PDF, Word, Excel, or HTML</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> QR code verification token generated automatically</div>
        </div>
      </SectionCard>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Generating…</> : <><FileText className="mr-1.5 h-4 w-4" /> Generate Report <ArrowRight className="ml-1.5 h-4 w-4" /></>}
        </Button>
      </div>
    </div>
  );
}
