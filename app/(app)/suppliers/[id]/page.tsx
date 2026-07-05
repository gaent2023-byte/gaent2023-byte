'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupplierDetail } from '@/hooks/use-supplier-detail';
import { PageHeader } from '@/components/shared/page-header';
import { SectionCard, DetailField } from '@/components/shared/section-card';
import { RatingChip, RiskBadge, StatusPill } from '@/components/shared/badges';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FinancialTab } from '@/components/supplier/financial-tab';
import { RiskTab } from '@/components/supplier/risk-tab';
import {
  Building2, FileText, MapPin, Users, Shield, Banknote, CreditCard,
  Scale, CheckCircle2, AlertTriangle, Sparkles, ArrowLeft, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const data = useSupplierDetail(params.id);
  const [tab, setTab] = useState('profile');

  if (data.loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted/40" />
        <div className="h-64 animate-pulse rounded-lg border bg-muted/40" />
      </div>
    );
  }

  if (data.error || !data.supplier) {
    return (
      <EmptyState
        title="Supplier not found"
        description={data.error ?? 'The supplier you are looking for does not exist.'
        }
        action={<Button variant="outline" onClick={() => router.push('/suppliers')}><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Suppliers</Button>}
      />
    );
  }

  const s = data.supplier;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/suppliers" className="hover:text-foreground">Suppliers</Link>
        <span>/</span>
        <span className="text-foreground">{s.company_name}</span>
      </div>

      <PageHeader
        title={s.company_name}
        description={s.trade_name ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            {data.risk && <RatingChip rating={data.risk.rating ?? '—'} />}
            <StatusPill status={s.status} />
            <Link href={`/suppliers/${s.id}/report`}>
              <Button><FileText className="mr-1.5 h-4 w-4" /> Generate Report</Button>
            </Link>
          </div>
        }
      />

      {/* Summary strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Industry', value: s.industry_code ?? '—', icon: Building2 },
          { label: 'Location', value: [s.city, s.country].filter(Boolean).join(', ') || '—', icon: MapPin },
          { label: 'Years in Business', value: s.years_in_business?.toString() ?? '—', icon: Scale },
          { label: 'Employees', value: s.employee_strength?.toLocaleString() ?? '—', icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="truncate text-sm font-medium text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {data.risk && (
        <div className="flex items-center gap-3 rounded-lg border border-warning/20 bg-warning/5 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/10 text-warning">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Risk Assessment: <RiskBadge severity={data.risk.severity} /> Overall score {data.risk.overall_score}/100
            </p>
            <p className="text-xs text-muted-foreground">Assessed {new Date(data.risk.assessed_at).toLocaleDateString()}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/40 p-1">
          {[
            { key: 'profile', label: 'Profile', icon: Building2 },
            { key: 'financials', label: 'Financials', icon: Banknote },
            { key: 'banking', label: 'Banking', icon: Banknote },
            { key: 'payment', label: 'Payment', icon: CreditCard },
            { key: 'verification', label: 'Verification', icon: Shield },
            { key: 'compliance', label: 'Compliance', icon: CheckCircle2 },
            { key: 'litigation', label: 'Litigation', icon: Scale },
            { key: 'risk', label: 'Risk', icon: AlertTriangle },
            { key: 'ai', label: 'AI Opinion', icon: Sparkles },
            { key: 'reports', label: 'Reports', icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="gap-1.5 data-[state=active]:bg-card">
              <Icon className="h-3.5 w-3.5" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionCard title="Basic Information">
              <dl className="grid grid-cols-2 gap-4">
                <DetailField label="Company Name">{s.company_name}</DetailField>
                <DetailField label="Trade Name">{s.trade_name}</DetailField>
                <DetailField label="Constitution"><span className="capitalize">{s.constitution?.replace(/_/g, ' ')}</span></DetailField>
                <DetailField label="Registration Number">{s.registration_number}</DetailField>
                <DetailField label="Tax Number">{s.tax_number}</DetailField>
                <DetailField label="GST/VAT">{s.gst_vat}</DetailField>
                <DetailField label="PAN/TIN">{s.pan_tin}</DetailField>
                <DetailField label="CIN">{s.cin}</DetailField>
                <DetailField label="LEI">{s.lei}</DetailField>
                <DetailField label="DUNS">{s.duns}</DetailField>
                <DetailField label="Industry">{s.industry_code}</DetailField>
                <DetailField label="Business Category">{s.business_category}</DetailField>
                <DetailField label="Date of Incorporation">{s.date_of_incorporation ? new Date(s.date_of_incorporation).toLocaleDateString() : null}</DetailField>
                <DetailField label="Years in Business">{s.years_in_business}</DetailField>
                <DetailField label="Employee Strength">{s.employee_strength?.toLocaleString()}</DetailField>
                <DetailField label="Status"><StatusPill status={s.status} /></DetailField>
              </dl>
            </SectionCard>

            <SectionCard title="Contact Information">
              <dl className="grid grid-cols-2 gap-4">
                <DetailField label="Website">{s.website}</DetailField>
                <DetailField label="Email">{s.email}</DetailField>
                <DetailField label="Phone">{s.phone}</DetailField>
                <DetailField label="Mobile">{s.mobile}</DetailField>
                <DetailField label="Country">{s.country}</DetailField>
                <DetailField label="State">{s.state}</DetailField>
                <DetailField label="City">{s.city}</DetailField>
              </dl>
              {data.addresses.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Addresses</p>
                  <div className="space-y-2">
                    {data.addresses.map((a) => (
                      <div key={a.id} className="rounded-md border p-3 text-sm">
                        <p className="font-medium capitalize text-foreground">{a.type.replace(/_/g, ' ')}</p>
                        <p className="text-muted-foreground">{[a.address_line1, a.address_line2, a.city, a.state, a.country, a.postal_code].filter(Boolean).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Key Personnel" bodyClassName="p-0">
            {data.personnel.length > 0 ? (
              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.personnel.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {p.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                      <p className="truncate text-xs capitalize text-muted-foreground">{p.role.replace(/_/g, ' ')}{p.designation ? ` • ${p.designation}` : ''}</p>
                    </div>
                    {p.id_verified && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-success" />}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Users className="h-6 w-6" />} title="No personnel added" className="border-0" />
            )}
          </SectionCard>

          {data.businessProfile && (
            <SectionCard title="Business Profile">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField label="Products">{data.businessProfile.products}</DetailField>
                <DetailField label="Services">{data.businessProfile.services}</DetailField>
                <DetailField label="Manufacturing Facilities">{data.businessProfile.manufacturing_facilities}</DetailField>
                <DetailField label="Installed Capacity">{data.businessProfile.installed_capacity}</DetailField>
                <DetailField label="Capacity Utilization">{data.businessProfile.capacity_utilization != null ? `${data.businessProfile.capacity_utilization}%` : null}</DetailField>
                <DetailField label="Annual Production">{data.businessProfile.annual_production}</DetailField>
                <DetailField label="Export Countries">{data.businessProfile.export_countries}</DetailField>
                <DetailField label="Import Countries">{data.businessProfile.import_countries}</DetailField>
                <DetailField label="Distribution Network">{data.businessProfile.distribution_network}</DetailField>
                <DetailField label="Major Customers">{data.businessProfile.major_customers}</DetailField>
                <DetailField label="Major Suppliers">{data.businessProfile.major_suppliers}</DetailField>
              </dl>
            </SectionCard>
          )}
        </TabsContent>

        <TabsContent value="financials" className="mt-4">
          <FinancialTab ratios={data.financialRatios} statements={data.financialStatements} />
        </TabsContent>

        <TabsContent value="banking" className="mt-4">
          <SectionCard title="Banking Information" bodyClassName="p-0">
            {data.banking.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Bank</th>
                    <th className="px-4 py-2.5 font-medium">Facility</th>
                    <th className="px-4 py-2.5 font-medium">Exposure</th>
                    <th className="px-4 py-2.5 font-medium">Relationship</th>
                    <th className="px-4 py-2.5 font-medium">Security</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.banking.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{b.bank_name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.facility_type ?? '—'}</td>
                      <td className="px-4 py-3 tabular-nums">{b.existing_exposure?.toLocaleString() ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.relationship_years ? `${b.relationship_years} yrs` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.security_offered ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={<Banknote className="h-6 w-6" />} title="No banking info" description="Add banking facilities and exposure details." className="border-0" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <SectionCard title="Payment Behaviour">
            {data.payment ? (
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <DetailField label="Avg Payment Delay">{data.payment.avg_payment_delay_days ? `${data.payment.avg_payment_delay_days} days` : null}</DetailField>
                <DetailField label="Dishonoured Cheques">{data.payment.dishonoured_cheques}</DetailField>
                <DetailField label="Rating">{data.payment.rating}</DetailField>
                <DetailField label="Default History">{data.payment.default_history}</DetailField>
                <DetailField label="Credit History">{data.payment.credit_history}</DetailField>
                <DetailField label="Vendor Feedback">{data.payment.vendor_feedback}</DetailField>
                <DetailField label="Buyer Feedback">{data.payment.buyer_feedback}</DetailField>
              </dl>
            ) : (
              <EmptyState icon={<CreditCard className="h-6 w-6" />} title="No payment data" className="border-0" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <SectionCard title="Site Verifications" bodyClassName="p-0">
            {data.verifications.length > 0 ? (
              <div className="divide-y">
                {data.verifications.map((v) => (
                  <div key={v.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{new Date(v.visit_date).toLocaleDateString()} — {v.surveyor_name ?? 'Unknown surveyor'}</p>
                        <p className="text-xs text-muted-foreground">{v.remarks}</p>
                      </div>
                      <StatusPill status={v.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {v.office_verified && <span className="rounded bg-success/10 px-2 py-0.5 text-xs text-success">Office</span>}
                      {v.factory_verified && <span className="rounded bg-success/10 px-2 py-0.5 text-xs text-success">Factory</span>}
                      {v.warehouse_verified && <span className="rounded bg-success/10 px-2 py-0.5 text-xs text-success">Warehouse</span>}
                      {v.machinery_verified && <span className="rounded bg-success/10 px-2 py-0.5 text-xs text-success">Machinery</span>}
                      {v.employee_verified && <span className="rounded bg-success/10 px-2 py-0.5 text-xs text-success">Employee</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Shield className="h-6 w-6" />} title="No verifications" description="Schedule a site verification visit." className="border-0" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <SectionCard title="Compliance Records" bodyClassName="p-0">
            {data.compliance.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2.5 font-medium">Type</th>
                    <th className="px-4 py-2.5 font-medium">Reference</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.compliance.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{c.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.reference_number ?? '—'}</td>
                      <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={<CheckCircle2 className="h-6 w-6" />} title="No compliance records" className="border-0" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="litigation" className="mt-4">
          <SectionCard title="Litigation Records" bodyClassName="p-0">
            {data.litigation.length > 0 ? (
              <div className="divide-y">
                {data.litigation.map((l) => (
                  <div key={l.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize text-foreground">{l.case_type.replace(/_/g, ' ')} — {l.case_number ?? 'No ref'}</p>
                        <p className="text-xs text-muted-foreground">{l.court_or_authority ?? '—'}</p>
                        {l.summary && <p className="mt-1 text-sm text-muted-foreground">{l.summary}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {l.claim_amount != null && <span className="text-sm tabular-nums">{l.claim_amount.toLocaleString()}</span>}
                        <StatusPill status={l.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Scale className="h-6 w-6" />} title="No litigation records" description="No legal cases or proceedings recorded." className="border-0" />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="risk" className="mt-4">
          <RiskTab supplierId={s.id} risk={data.risk} riskHistory={data.riskHistory} />
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <SectionCard title="AI Intelligence Opinion">
            {data.aiOpinions.length > 0 ? (
              <div className="space-y-4">
                {data.aiOpinions.map((op) => (
                  <div key={op.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{op.generated_by_model ?? 'AI Engine'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(op.generated_at).toLocaleString()}</span>
                    </div>
                    {op.summary && <p className="mt-3 text-sm text-foreground">{op.summary}</p>}
                    {op.recommendation && (
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <span className="font-medium">Recommendation:</span>
                        <span className={cn(
                          'rounded px-2 py-0.5 text-xs font-semibold capitalize',
                          op.recommendation === 'approve' ? 'bg-success/10 text-success' :
                          op.recommendation === 'reject' ? 'bg-destructive/10 text-destructive' :
                          'bg-warning/10 text-warning'
                        )}>{op.recommendation}</span>
                        {op.default_probability != null && <span className="text-muted-foreground">Default prob: {op.default_probability}%</span>}
                        {op.confidence != null && <span className="text-muted-foreground">Confidence: {op.confidence}%</span>}
                      </div>
                    )}
                    {op.rationale && <p className="mt-2 text-sm text-muted-foreground">{op.rationale}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="No AI opinion generated"
                description="Run the AI intelligence module to generate an executive summary, default probability, and recommendation."
                action={<a href={`/suppliers/${s.id}/ai`}><Button><Sparkles className="mr-1.5 h-4 w-4" /> Generate AI Opinion</Button></a>}
              />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <SectionCard title="Supplier Opinion Reports" bodyClassName="p-0">
            {data.reports.length > 0 ? (
              <div className="divide-y">
                {data.reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <Link href={`/reports/${r.id}`} className="truncate text-sm font-medium text-foreground hover:text-primary">{r.title}</Link>
                      <p className="text-xs text-muted-foreground">v{r.version} • {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={r.status} />
                      <Link href={`/reports/${r.id}`}><Button variant="outline" size="sm">Open</Button></Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileText className="h-6 w-6" />}
                title="No reports generated"
                description="Generate a professional Supplier Opinion Report."
                action={<Link href={`/suppliers/${s.id}/report`}><Button><Plus className="mr-1.5 h-4 w-4" /> Generate Report</Button></Link>}
                className="border-0"
              />
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
