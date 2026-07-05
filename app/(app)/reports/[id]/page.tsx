'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { useReportDetail } from '@/hooks/use-report-detail';
import { useAuth } from '@/components/providers/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { StatusPill, RatingChip } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft, FileText, Download, Save, Check, Loader2,
  FileSpreadsheet, FileCode, FileDown, QrCode, ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SectionContent = { heading: string; body: string; data?: unknown };

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createBrowserClient();
  const { user } = useAuth();
  const { report, sections, supplier, loading, error, refetch } = useReportDetail(params.id);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const startEdit = (sectionKey: string, currentBody: string) => {
    setEditingSection(sectionKey);
    setEditBody(currentBody);
  };

  const saveEdit = async (sectionId: string) => {
    setSaving(true);
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const existing = (section.content as SectionContent) ?? { heading: section.title, body: '' };
    const updated = { ...existing, body: editBody };
    await supabase
      .from('report_sections')
      .update({ content: updated as never, edited_by: user?.id ?? null })
      .eq('id', sectionId);
    setSaving(false);
    setEditingSection(null);
    refetch();
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'xlsx' | 'html') => {
    setExporting(format);
    try {
      // Record the export
      await supabase.from('report_exports').insert({
        report_id: params.id,
        format,
        generated_by: user?.id ?? null,
      });

      if (format === 'html') {
        // Generate HTML in-browser and download
        const html = buildHtmlReport(report!, supplier, sections);
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report!.title.replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For PDF/DOCX/XLSX, trigger a printable view
        window.print();
      }
    } finally {
      setExporting(null);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    await supabase.from('reports').update({ status: newStatus, approved_by: newStatus === 'approved' ? user?.id : null }).eq('id', params.id);
    setStatusUpdating(false);
    refetch();
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (error || !report) {
    return <EmptyState title="Report not found" description={error ?? undefined} action={<Button variant="outline" onClick={() => router.push('/reports')}><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Reports</Button>} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/reports" className="hover:text-foreground">Reports</Link>
        <span>/</span>
        <span className="text-foreground">{report.title}</span>
      </div>

      <PageHeader
        title={report.title}
        description={`Version ${report.version} • Created ${new Date(report.created_at).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusPill status={report.status} />
            <Select value={report.status} onValueChange={updateStatus} disabled={statusUpdating}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Export bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-4 shadow-sm">
        <span className="mr-2 text-sm font-medium text-foreground">Export:</span>
        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} disabled={exporting === 'pdf'}>
          {exporting === 'pdf' ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileDown className="mr-1.5 h-4 w-4" />} PDF
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('docx')} disabled={exporting === 'docx'}>
          {exporting === 'docx' ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileText className="mr-1.5 h-4 w-4" />} Word
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')} disabled={exporting === 'xlsx'}>
          {exporting === 'xlsx' ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-1.5 h-4 w-4" />} Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport('html')} disabled={exporting === 'html'}>
          {exporting === 'html' ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileCode className="mr-1.5 h-4 w-4" />} HTML
        </Button>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <QrCode className="h-4 w-4" />
          <span>QR: {report.qr_token.slice(0, 8)}…</span>
        </div>
      </div>

      {/* Report sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => {
          const content = (section.content as SectionContent) ?? { heading: section.title, body: '' };
          const isEditing = editingSection === section.section_key;
          const isCover = section.section_key === 'cover_page';

          return (
            <SectionCard
              key={section.id}
              className={cn(isCover && 'bg-primary/5')}
              actions={
                !isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => startEdit(section.section_key, content.body)}>
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                    <Button size="sm" onClick={() => saveEdit(section.id)} disabled={saving}>
                      {saving ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1 h-3.5 w-3.5" />} Save
                    </Button>
                  </div>
                )
              }
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                  {idx + 1}
                </span>
                <h3 className="text-base font-semibold text-foreground">{content.heading}</h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={Math.max(4, editBody.split('\n').length + 1)}
                  className="font-mono text-sm"
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {content.body || <span className="text-muted-foreground italic">No content. Click Edit to add.</span>}
                </div>
              )}
            </SectionCard>
          );
        })}
      </div>

      {/* QR verification */}
      <SectionCard title="Report Verification" description="QR code verification token for report authenticity">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-primary/30 text-primary">
            <QrCode className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Verification Token</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{report.qr_token}</p>
            <Link href={`/verify/${report.qr_token}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <ShieldCheck className="h-3.5 w-3.5" /> Open verification page
            </Link>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function buildHtmlReport(
  report: { title: string; qr_token: string; created_at: string; status: string },
  supplier: { company_name: string } | null,
  sections: { section_key: string; title: string; content: unknown; order_index: number }[]
): string {
  const sectionHtml = sections
    .map((s, i) => {
      const c = (s.content as SectionContent) ?? { heading: s.title, body: '' };
      return `<section style="margin-bottom:32px"><h2 style="font-size:18px;font-weight:600;color:#1e3a5f;border-bottom:1px solid #e2e8f0;padding-bottom:8px">${i + 1}. ${c.heading}</h2><p style="white-space:pre-wrap;font-size:14px;line-height:1.7;color:#334155;margin-top:12px">${c.body || ''}</p></section>`;
    })
    .join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${report.title}</title>
  <style>body{font-family:Inter,Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;color:#1e293b}
  h1{font-size:28px;color:#1e3a5f;border-bottom:3px solid #1e3a5f;padding-bottom:12px}
  .meta{color:#64748b;font-size:13px;margin-bottom:32px}</style></head>
  <body><h1>${report.title}</h1>
  <div class="meta"><p>Supplier: ${supplier?.company_name ?? '—'}</p><p>Date: ${new Date(report.created_at).toLocaleDateString()}</p><p>Status: ${report.status}</p><p>QR Token: ${report.qr_token}</p></div>
  ${sectionHtml}
  <footer style="margin-top:48px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8"><p>Generated by GSOR — Global Supplier Opinion Report & Risk Intelligence Platform</p></footer>
  </body></html>`;
}
