'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { RatingChip, StatusPill } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Search, Plus, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

type SupplierWithRisk = Database['public']['Tables']['suppliers']['Row'] & {
  risk_assessments: { overall_score: number; rating: string | null; severity: string } | null;
};

const PAGE_SIZE = 12;

export default function SuppliersPage() {
  const supabase = createBrowserClient();
  const [suppliers, setSuppliers] = useState<SupplierWithRisk[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [country, setCountry] = useState('all');
  const [industries, setIndustries] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from('industries').select('code, name').order('name').then(({ data }) => {
      if (data) setIndustries(data as { code: string; name: string }[]);
    });
  }, [supabase]);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('suppliers').select(
      '*, risk_assessments(overall_score, rating, severity)',
      { count: 'exact' }
    );

    if (query.trim()) {
      q = q.or(`company_name.ilike.%${query.trim()}%,trade_name.ilike.%${query.trim()}%,registration_number.ilike.%${query.trim()}%,gst_vat.ilike.%${query.trim()}%,pan_tin.ilike.%${query.trim()}%,cin.ilike.%${query.trim()}%,duns.ilike.%${query.trim()}%,email.ilike.%${query.trim()}%,phone.ilike.%${query.trim()}%,city.ilike.%${query.trim}%`);
    }
    if (status !== 'all') q = q.eq('status', status);
    if (country !== 'all') q = q.eq('country', country);

    q = q.order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, count: c } = await q;
    setSuppliers((data ?? []) as SupplierWithRisk[]);
    setCount(c ?? 0);
    setLoading(false);
  }, [supabase, query, status, country, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier Master"
        description={`${count.toLocaleString()} suppliers in your database`}
        actions={
          <Link href="/suppliers/new">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" /> Add Supplier
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by company, registration, GST, PAN, email…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blacklisted">Blacklisted</SelectItem>
          </SelectContent>
        </Select>
        <Select value={country} onValueChange={(v) => { setCountry(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {industries.map((i) => (
              <SelectItem key={i.code} value={i.code}>{i.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="No suppliers found"
          description="Try adjusting your search or add a new supplier to get started."
          action={
            <Link href="/suppliers/new">
              <Button>
                <Plus className="mr-1.5 h-4 w-4" /> Add Supplier
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Industry</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {suppliers.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={`/suppliers/${s.id}`} className="font-medium text-foreground hover:text-primary">
                        {s.company_name}
                      </Link>
                      {s.trade_name && (
                        <p className="text-xs text-muted-foreground">{s.trade_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.industry_code ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[s.city, s.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {s.risk_assessments ? (
                        <div className="flex items-center gap-2">
                          <RatingChip rating={s.risk_assessments.rating ?? '—'} />
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {s.risk_assessments.overall_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not assessed</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusPill status={s.status} /></td>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, count)} of {count}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
