'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard } from '@/components/shared/section-card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';

export default function GenerateAiPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createBrowserClient();
  const { membership } = useAuth();
  const [loading, setLoading] = useState(true);
  const [supplierName, setSupplierName] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('suppliers').select('company_name').eq('id', params.id).maybeSingle().then(({ data }) => {
      setSupplierName(data?.company_name ?? null);
      setLoading(false);
    });
  }, [supabase, params.id]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch(`${supabaseUrl}/functions/v1/ai-intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ supplierId: params.id }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${res.status})`);
      }

      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'AI generation failed');

      router.push(`/suppliers/${params.id}?tab=ai`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate AI opinion');
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  if (!supplierName) {
    return <EmptyState title="Supplier not found" />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Generate AI Opinion"
        description={`Run AI intelligence analysis for ${supplierName}.`}
      />

      <SectionCard title="What the AI will analyze">
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>The AI Intelligence Module will analyze the supplier's available data to produce:</p>
          <ul className="ml-4 space-y-2">
            {[
              'Executive summary of supplier health',
              'Financial deterioration detection',
              'Default probability prediction',
              'Fraud indicator identification',
              'Peer comparison against industry benchmarks',
              'Recommended credit limit',
              'Approve / reject / review recommendation with rationale',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </SectionCard>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Analyzing…</> : <><Sparkles className="mr-1.5 h-4 w-4" /> Generate AI Opinion</>}
        </Button>
      </div>
    </div>
  );
}
