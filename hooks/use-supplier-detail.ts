'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type BusinessProfile = Database['public']['Tables']['supplier_business_profiles']['Row'];
type Address = Database['public']['Tables']['supplier_addresses']['Row'];
type Contact = Database['public']['Tables']['supplier_contacts']['Row'];
type Personnel = Database['public']['Tables']['supplier_personnel']['Row'];
type Product = Database['public']['Tables']['supplier_products']['Row'];
type FinancialRatio = Database['public']['Tables']['financial_ratios']['Row'];
type FinancialStatement = Database['public']['Tables']['financial_statements']['Row'];
type Banking = Database['public']['Tables']['banking_info']['Row'];
type Payment = Database['public']['Tables']['payment_behaviour']['Row'];
type Verification = Database['public']['Tables']['site_verifications']['Row'];
type Compliance = Database['public']['Tables']['compliance_records']['Row'];
type Litigation = Database['public']['Tables']['litigation_records']['Row'];
type Risk = Database['public']['Tables']['risk_assessments']['Row'];
type RiskHistory = Database['public']['Tables']['risk_score_history']['Row'];
type AiOpinion = Database['public']['Tables']['ai_opinions']['Row'];
type Report = Database['public']['Tables']['reports']['Row'];

export type SupplierDetailData = {
  supplier: Supplier | null;
  businessProfile: BusinessProfile | null;
  addresses: Address[];
  contacts: Contact[];
  personnel: Personnel[];
  products: Product[];
  financialRatios: FinancialRatio[];
  financialStatements: FinancialStatement[];
  banking: Banking[];
  payment: Payment | null;
  verifications: Verification[];
  compliance: Compliance[];
  litigation: Litigation[];
  risk: Risk | null;
  riskHistory: RiskHistory[];
  aiOpinions: AiOpinion[];
  reports: Report[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useSupplierDetail(supplierId: string): SupplierDetailData {
  const supabase = createBrowserClient();
  const [state, setState] = useState<SupplierDetailData>({
    supplier: null, businessProfile: null, addresses: [], contacts: [], personnel: [],
    products: [], financialRatios: [], financialStatements: [], banking: [], payment: null,
    verifications: [], compliance: [], litigation: [], risk: null, riskHistory: [],
    aiOpinions: [], reports: [], loading: true, error: null, refetch: () => {},
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data: supplier, error: sErr } = await supabase
        .from('suppliers').select('*').eq('id', supplierId).maybeSingle();
      if (sErr) throw sErr;
      if (!supplier) {
        setState((s) => ({ ...s, supplier: null, loading: false, error: 'Supplier not found' }));
        return;
      }

      const [
        bpRes, addrRes, contactRes, personnelRes, productRes,
        frRes, fsRes, bankRes, payRes, verifRes, compRes, litRes,
        riskRes, histRes, aiRes, reportRes,
      ] = await Promise.all([
        supabase.from('supplier_business_profiles').select('*').eq('supplier_id', supplierId).maybeSingle(),
        supabase.from('supplier_addresses').select('*').eq('supplier_id', supplierId).order('created_at'),
        supabase.from('supplier_contacts').select('*').eq('supplier_id', supplierId).order('created_at'),
        supabase.from('supplier_personnel').select('*').eq('supplier_id', supplierId).order('created_at'),
        supabase.from('supplier_products').select('*').eq('supplier_id', supplierId).order('created_at'),
        supabase.from('financial_ratios').select('*').eq('supplier_id', supplierId).order('fiscal_year'),
        supabase.from('financial_statements').select('*').eq('supplier_id', supplierId).order('fiscal_year'),
        supabase.from('banking_info').select('*').eq('supplier_id', supplierId).order('created_at'),
        supabase.from('payment_behaviour').select('*').eq('supplier_id', supplierId).maybeSingle(),
        supabase.from('site_verifications').select('*').eq('supplier_id', supplierId).order('visit_date', { ascending: false }),
        supabase.from('compliance_records').select('*').eq('supplier_id', supplierId).order('created_at'),
        supabase.from('litigation_records').select('*').eq('supplier_id', supplierId).order('filing_date', { ascending: false }),
        supabase.from('risk_assessments').select('*').eq('supplier_id', supplierId).maybeSingle(),
        supabase.from('risk_score_history').select('*').eq('supplier_id', supplierId).order('recorded_at'),
        supabase.from('ai_opinions').select('*').eq('supplier_id', supplierId).order('generated_at', { ascending: false }).limit(3),
        supabase.from('reports').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: false }),
      ]);

      setState({
        supplier: supplier as Supplier,
        businessProfile: bpRes.data as BusinessProfile | null,
        addresses: (addrRes.data ?? []) as Address[],
        contacts: (contactRes.data ?? []) as Contact[],
        personnel: (personnelRes.data ?? []) as Personnel[],
        products: (productRes.data ?? []) as Product[],
        financialRatios: (frRes.data ?? []) as FinancialRatio[],
        financialStatements: (fsRes.data ?? []) as FinancialStatement[],
        banking: (bankRes.data ?? []) as Banking[],
        payment: payRes.data as Payment | null,
        verifications: (verifRes.data ?? []) as Verification[],
        compliance: (compRes.data ?? []) as Compliance[],
        litigation: (litRes.data ?? []) as Litigation[],
        risk: riskRes.data as Risk | null,
        riskHistory: (histRes.data ?? []) as RiskHistory[],
        aiOpinions: (aiRes.data ?? []) as AiOpinion[],
        reports: (reportRes.data ?? []) as Report[],
        loading: false,
        error: null,
        refetch: load,
      });
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e instanceof Error ? e.message : 'Failed to load' }));
    }
  }, [supabase, supplierId]);

  useEffect(() => { load(); }, [load]);

  return state;
}
