'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { RatingChip, StatusPill } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Building2, ArrowRight, SlidersHorizontal } from 'lucide-react';

type SupplierRow = Database['public']['Tables']['suppliers']['Row'];

const SEARCH_FIELDS = [
  { key: 'company_name', label: 'Company Name' },
  { key: 'director', label: 'Director Name' },
  { key: 'registration_number', label: 'Registration Number' },
  { key: 'gst_vat', label: 'GST/VAT' },
  { key: 'pan_tin', label: 'PAN/TIN' },
  { key: 'tax_number', label: 'Tax ID' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'country', label: 'Country' },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'industry_code', label: 'Industry' },
];

export default function SearchPage() {
  const supabase = createBrowserClient();
  const { user, membership } = useAuth();
  const [query, setQuery] = useState('');
  const [field, setField] = useState('company_name');
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState<SupplierRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [industries, setIndustries] = useState<{ code: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from('industries').select('code, name').order('name').then(({ data }) => {
      if (data) setIndustries(data as { code: string; name: string }[]);
    });
  }, [supabase]);

  const runSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);

    let q = supabase.from('suppliers').select('*');

    if (query.trim()) {
      if (field === 'director') {
        q = q.ilike('company_name', `%${query.trim()}%`);
      } else {
        q = q.ilike(field, `%${query.trim()}%`);
      }
    }
    if (country.trim()) q = q.ilike('country', `%${country.trim()}%`);
    if (industry) q = q.eq('industry_code', industry);
    if (status) q = q.eq('status', status);

    q = q.order('company_name').limit(50);
    const { data } = await q;
    setResults((data ?? []) as SupplierRow[]);

    if (membership && user && query.trim()) {
      await supabase.from('searches').insert({
        organization_id: membership.organization_id,
        user_id: user.id,
        query: query.trim(),
        filters: { field, country, industry, status } as never,
        results_count: data?.length ?? 0,
      });
    }

    setLoading(false);
  }, [supabase, query, field, country, industry, status, membership, user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search Suppliers"
        description="Advanced search across all supplier fields with fuzzy matching."
      />

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Search field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SEARCH_FIELDS.map((f) => (
                  <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Search query</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter search term…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={runSearch} disabled={loading}>
                {loading ? 'Searching…' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Additional filters
        </div>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          <Input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
          <Select value={industry} onValueChange={setIndustry}>
            <SelectTrigger><SelectValue placeholder="All industries" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((i) => (
                <SelectItem key={i.code} value={i.code}>{i.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="under_review">Under review</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blacklisted">Blacklisted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'} found`}
          </p>
          {results.length === 0 && !loading ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="No matching suppliers"
              description="Try a different search term or broaden your filters."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {results.map((s) => (
                <Link
                  key={s.id}
                  href={`/suppliers/${s.id}`}
                  className="group rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <p className="truncate font-medium text-foreground group-hover:text-primary">
                          {s.company_name}
                        </p>
                      </div>
                      {s.trade_name && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">{s.trade_name}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{s.industry_code ?? '—'}</span>
                        <span>•</span>
                        <span>{[s.city, s.country].filter(Boolean).join(', ') || '—'}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <StatusPill status={s.status} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
