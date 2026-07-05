'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Building2,
  MapPin,
  Users,
  Package,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';

const STEPS = [
  { key: 'basic', label: 'Basic Information', icon: Building2 },
  { key: 'contact', label: 'Contact Information', icon: MapPin },
  { key: 'personnel', label: 'Key Personnel', icon: Users },
  { key: 'business', label: 'Business Profile', icon: Package },
];

const CONSTITUTIONS = ['proprietorship', 'partnership', 'llp', 'private_limited', 'public_limited', 'government', 'trust', 'cooperative', 'ngo'];

export default function NewSupplierPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { membership } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [basic, setBasic] = useState({
    company_name: '', trade_name: '', constitution: '', registration_number: '',
    tax_number: '', gst_vat: '', pan_tin: '', cin: '', lei: '', duns: '',
    industry_code: '', business_category: '', date_of_incorporation: '', country: '',
    state: '', city: '', website: '', email: '', phone: '', mobile: '',
    employee_strength: '', years_in_business: '', status: 'active',
  });
  const [business, setBusiness] = useState({
    products: '', services: '', manufacturing_facilities: '', installed_capacity: '',
    capacity_utilization: '', annual_production: '', export_countries: '',
    import_countries: '', distribution_network: '', major_customers: '', major_suppliers: '',
  });

  const updateBasic = (k: string, v: string) => setBasic((p) => ({ ...p, [k]: v }));
  const updateBusiness = (k: string, v: string) => setBusiness((p) => ({ ...p, [k]: v }));

  const canProceed = () => {
    if (step === 0) return basic.company_name.trim().length > 0;
    return true;
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    if (!membership) {
      setError('No organization context.');
      setSaving(false);
      return;
    }

    const supplierInsert = {
      company_name: basic.company_name,
      trade_name: basic.trade_name || null,
      constitution: basic.constitution || null,
      registration_number: basic.registration_number || null,
      tax_number: basic.tax_number || null,
      gst_vat: basic.gst_vat || null,
      pan_tin: basic.pan_tin || null,
      cin: basic.cin || null,
      lei: basic.lei || null,
      duns: basic.duns || null,
      industry_code: basic.industry_code || null,
      business_category: basic.business_category || null,
      date_of_incorporation: basic.date_of_incorporation || null,
      years_in_business: basic.years_in_business ? Number(basic.years_in_business) : null,
      country: basic.country || null,
      state: basic.state || null,
      city: basic.city || null,
      website: basic.website || null,
      email: basic.email || null,
      phone: basic.phone || null,
      mobile: basic.mobile || null,
      employee_strength: basic.employee_strength ? Number(basic.employee_strength) : null,
      status: basic.status,
    };

    const { data: supplier, error: sErr } = await supabase
      .from('suppliers')
      .insert(supplierInsert)
      .select()
      .single();

    if (sErr) {
      setError(sErr.message);
      setSaving(false);
      return;
    }

    const bp = {
      supplier_id: supplier.id,
      products: business.products || null,
      services: business.services || null,
      manufacturing_facilities: business.manufacturing_facilities || null,
      installed_capacity: business.installed_capacity || null,
      capacity_utilization: business.capacity_utilization ? Number(business.capacity_utilization) : null,
      annual_production: business.annual_production || null,
      export_countries: business.export_countries || null,
      import_countries: business.import_countries || null,
      distribution_network: business.distribution_network || null,
      major_customers: business.major_customers || null,
      major_suppliers: business.major_suppliers || null,
    };
    await supabase.from('supplier_business_profiles').insert(bp).eq('supplier_id', supplier.id);

    // Initialize a default risk assessment
    await supabase.from('risk_assessments').insert({ supplier_id: supplier.id });

    router.push(`/suppliers/${supplier.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Add New Supplier"
        description="Create a comprehensive supplier profile across four sections."
        actions={
          <Button variant="outline" onClick={() => router.back()}>
            <ChevronLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
        }
      />

      {/* Stepper */}
      <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step;
          return (
            <div key={s.key} className="flex flex-1 items-center">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                    done && 'border-success bg-success/10 text-success',
                    active && 'border-primary bg-primary text-primary-foreground',
                    !done && !active && 'border-border bg-muted text-muted-foreground'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span
                  className={cn(
                    'hidden text-sm font-medium sm:block',
                    active ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-3 h-0.5 flex-1 rounded', done ? 'bg-success' : 'bg-border')} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Company Name *</Label>
                <Input value={basic.company_name} onChange={(e) => updateBasic('company_name', e.target.value)} placeholder="Acme Manufacturing Ltd." />
              </div>
              <div className="space-y-1.5">
                <Label>Trade Name</Label>
                <Input value={basic.trade_name} onChange={(e) => updateBasic('trade_name', e.target.value)} placeholder="Acme" />
              </div>
              <div className="space-y-1.5">
                <Label>Business Constitution</Label>
                <Select value={basic.constitution} onValueChange={(v) => updateBasic('constitution', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {CONSTITUTIONS.map((c) => (
                      <SelectItem key={c} value={c} className="capitalize">{c.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Registration Number</Label>
                <Input value={basic.registration_number} onChange={(e) => updateBasic('registration_number', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tax Number</Label>
                <Input value={basic.tax_number} onChange={(e) => updateBasic('tax_number', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>GST/VAT</Label>
                <Input value={basic.gst_vat} onChange={(e) => updateBasic('gst_vat', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>PAN/TIN</Label>
                <Input value={basic.pan_tin} onChange={(e) => updateBasic('pan_tin', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>CIN</Label>
                <Input value={basic.cin} onChange={(e) => updateBasic('cin', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>LEI</Label>
                <Input value={basic.lei} onChange={(e) => updateBasic('lei', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>DUNS</Label>
                <Input value={basic.duns} onChange={(e) => updateBasic('duns', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Input value={basic.industry_code} onChange={(e) => updateBasic('industry_code', e.target.value)} placeholder="MFG" />
              </div>
              <div className="space-y-1.5">
                <Label>Business Category</Label>
                <Input value={basic.business_category} onChange={(e) => updateBasic('business_category', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Incorporation</Label>
                <Input type="date" value={basic.date_of_incorporation} onChange={(e) => updateBasic('date_of_incorporation', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Years in Business</Label>
                <Input type="number" value={basic.years_in_business} onChange={(e) => updateBasic('years_in_business', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Employee Strength</Label>
                <Input type="number" value={basic.employee_strength} onChange={(e) => updateBasic('employee_strength', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={basic.status} onValueChange={(v) => updateBasic('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Contact Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={basic.country} onChange={(e) => updateBasic('country', e.target.value)} placeholder="United States" />
              </div>
              <div className="space-y-1.5">
                <Label>State / Province</Label>
                <Input value={basic.state} onChange={(e) => updateBasic('state', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={basic.city} onChange={(e) => updateBasic('city', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Website</Label>
                <Input value={basic.website} onChange={(e) => updateBasic('website', e.target.value)} placeholder="https://" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={basic.email} onChange={(e) => updateBasic('email', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={basic.phone} onChange={(e) => updateBasic('phone', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input value={basic.mobile} onChange={(e) => updateBasic('mobile', e.target.value)} />
              </div>
            </div>
            <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Detailed registered, factory, branch, and warehouse addresses can be added from the supplier detail page.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Key Personnel</h3>
            <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Directors, partners, and key executives can be added with photographs and identity documents from the supplier detail page after creation.
            </p>
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <div className="text-muted-foreground">
                <Users className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">Personnel added after supplier creation</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Business Profile</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Products</Label>
                <Textarea value={business.products} onChange={(e) => updateBusiness('products', e.target.value)} placeholder="List of products manufactured or traded…" rows={2} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Services</Label>
                <Textarea value={business.services} onChange={(e) => updateBusiness('services', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Manufacturing Facilities</Label>
                <Textarea value={business.manufacturing_facilities} onChange={(e) => updateBusiness('manufacturing_facilities', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Installed Capacity</Label>
                <Input value={business.installed_capacity} onChange={(e) => updateBusiness('installed_capacity', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Capacity Utilization (%)</Label>
                <Input type="number" value={business.capacity_utilization} onChange={(e) => updateBusiness('capacity_utilization', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Annual Production</Label>
                <Input value={business.annual_production} onChange={(e) => updateBusiness('annual_production', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Export Countries</Label>
                <Input value={business.export_countries} onChange={(e) => updateBusiness('export_countries', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Import Countries</Label>
                <Input value={business.import_countries} onChange={(e) => updateBusiness('import_countries', e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Distribution Network</Label>
                <Textarea value={business.distribution_network} onChange={(e) => updateBusiness('distribution_network', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Major Customers</Label>
                <Textarea value={business.major_customers} onChange={(e) => updateBusiness('major_customers', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Major Suppliers</Label>
                <Textarea value={business.major_suppliers} onChange={(e) => updateBusiness('major_suppliers', e.target.value)} rows={2} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="mr-1.5 h-4 w-4" /> Previous
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={!canProceed()}>
            Next <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSave} disabled={saving || !canProceed()}>
            {saving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Creating…</> : <><Check className="mr-1.5 h-4 w-4" /> Create Supplier</>}
          </Button>
        )}
      </div>
    </div>
  );
}
