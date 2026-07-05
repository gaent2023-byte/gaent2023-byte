/*
# GSOR Supplier Modules — Financials, Banking, Payment, Verification, Compliance, Litigation, Documents

## Purpose
Creates the assessment-module tables attached to each supplier: financial statements and
computed ratios with 5-year trends, banking information, payment behaviour, site verification
(with media), compliance records with expiry, litigation records, and a generic documents store.

## New Tables
1. `financial_statements` — uploaded/parsed balance sheet, P&L, cash flow, trial balance, bank statements
   - id, supplier_id, fiscal_year, statement_type, source_doc_url, data (jsonb), created_at
2. `financial_ratios` — computed ratios per fiscal year (revenue, ebitda, gross/net profit, net worth,
   debt, current/quick ratio, debt-equity, interest coverage, working capital, roe, roa,
   inventory turnover, receivable/payable days) — supports 5-year trend graphs
3. `banking_info` — existing banks, credit facilities, working capital, term loans, BGs, LCs,
   exposure, relationship, security offered
4. `payment_behaviour` — payment delays, default history, dishonoured cheques, credit history,
   vendor/buyer feedback
5. `site_verifications` — visit date, surveyor, GPS, office/factory/warehouse/machinery/employee
   verification flags, remarks, recommendations
6. `verification_media` — geo-tagged photographs, videos, PDFs, scanned documents for a verification
7. `compliance_records` — tax/GST returns, filings, environmental/labour, factory licence, ISO,
   MSME, IEC, trade licences with status + expiry
8. `litigation_records` — court cases, insolvency, arbitration, regulatory notices, criminal/civil
9. `documents` — generic org-scoped document store (file uploads to Supabase Storage)

## Security (RLS)
- All tables org-scoped via supplier -> organization ownership join (EXISTS subquery).
- Full CRUD for authenticated members of the owning organization.

## Notes
- `financial_ratios` rows are keyed by (supplier_id, fiscal_year) for trend joins.
- `compliance_records.expiry_date` powers the dashboard "expiring" KPIs.
- Idempotent and safe to re-run.
*/

CREATE TABLE IF NOT EXISTS public.financial_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  fiscal_year int NOT NULL,
  statement_type text NOT NULL CHECK (statement_type IN ('balance_sheet','profit_loss','cash_flow','trial_balance','bank_statement')),
  source_doc_url text,
  data jsonb,
  currency text DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.financial_ratios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  fiscal_year int NOT NULL,
  revenue numeric,
  ebitda numeric,
  gross_profit numeric,
  net_profit numeric,
  net_worth numeric,
  debt numeric,
  current_ratio numeric,
  quick_ratio numeric,
  debt_equity_ratio numeric,
  interest_coverage numeric,
  working_capital numeric,
  roe numeric,
  roa numeric,
  inventory_turnover numeric,
  receivable_days numeric,
  payable_days numeric,
  UNIQUE (supplier_id, fiscal_year)
);

CREATE TABLE IF NOT EXISTS public.banking_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  bank_name text,
  facility_type text,
  working_capital numeric,
  term_loan numeric,
  bank_guarantees numeric,
  letter_of_credit numeric,
  existing_exposure numeric,
  relationship_years int,
  security_offered text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.payment_behaviour (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  avg_payment_delay_days int,
  default_history text,
  dishonoured_cheques int,
  credit_history text,
  vendor_feedback text,
  buyer_feedback text,
  rating text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  surveyor_name text,
  gps_lat double precision,
  gps_lng double precision,
  office_verified boolean DEFAULT false,
  factory_verified boolean DEFAULT false,
  warehouse_verified boolean DEFAULT false,
  machinery_verified boolean DEFAULT false,
  employee_verified boolean DEFAULT false,
  remarks text,
  recommendations text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','flagged')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.verification_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id uuid NOT NULL REFERENCES public.site_verifications(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('photo','video','pdf','document')),
  file_url text NOT NULL,
  caption text,
  gps_lat double precision,
  gps_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  type text NOT NULL,
  reference_number text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('compliant','non_compliant','pending','expired')),
  issue_date date,
  expiry_date date,
  issuing_authority text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.litigation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  case_type text NOT NULL CHECK (case_type IN ('court_case','insolvency','arbitration','regulatory_notice','criminal','civil')),
  case_number text,
  court_or_authority text,
  filing_date date,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','dismissed','pending')),
  claim_amount numeric,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES public.suppliers(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL DEFAULT public.current_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  category text,
  size_bytes bigint,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ratios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banking_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_behaviour ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.litigation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Reusable ownership check expression via a helper function
CREATE OR REPLACE FUNCTION public.supplier_in_my_org(suuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.suppliers s
    WHERE s.id = suuid AND s.organization_id = public.current_org_id()
  );
$$;

-- financial_statements
DROP POLICY IF EXISTS "select_org_fs" ON public.financial_statements;
CREATE POLICY "select_org_fs" ON public.financial_statements FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_fs" ON public.financial_statements;
CREATE POLICY "insert_org_fs" ON public.financial_statements FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_fs" ON public.financial_statements;
CREATE POLICY "update_org_fs" ON public.financial_statements FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_fs" ON public.financial_statements;
CREATE POLICY "delete_org_fs" ON public.financial_statements FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- financial_ratios
DROP POLICY IF EXISTS "select_org_fr" ON public.financial_ratios;
CREATE POLICY "select_org_fr" ON public.financial_ratios FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_fr" ON public.financial_ratios;
CREATE POLICY "insert_org_fr" ON public.financial_ratios FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_fr" ON public.financial_ratios;
CREATE POLICY "update_org_fr" ON public.financial_ratios FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_fr" ON public.financial_ratios;
CREATE POLICY "delete_org_fr" ON public.financial_ratios FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- banking_info
DROP POLICY IF EXISTS "select_org_banking" ON public.banking_info;
CREATE POLICY "select_org_banking" ON public.banking_info FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_banking" ON public.banking_info;
CREATE POLICY "insert_org_banking" ON public.banking_info FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_banking" ON public.banking_info;
CREATE POLICY "update_org_banking" ON public.banking_info FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_banking" ON public.banking_info;
CREATE POLICY "delete_org_banking" ON public.banking_info FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- payment_behaviour
DROP POLICY IF EXISTS "select_org_payment" ON public.payment_behaviour;
CREATE POLICY "select_org_payment" ON public.payment_behaviour FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_payment" ON public.payment_behaviour;
CREATE POLICY "insert_org_payment" ON public.payment_behaviour FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_payment" ON public.payment_behaviour;
CREATE POLICY "update_org_payment" ON public.payment_behaviour FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_payment" ON public.payment_behaviour;
CREATE POLICY "delete_org_payment" ON public.payment_behaviour FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- site_verifications
DROP POLICY IF EXISTS "select_org_verif" ON public.site_verifications;
CREATE POLICY "select_org_verif" ON public.site_verifications FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_verif" ON public.site_verifications;
CREATE POLICY "insert_org_verif" ON public.site_verifications FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_verif" ON public.site_verifications;
CREATE POLICY "update_org_verif" ON public.site_verifications FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_verif" ON public.site_verifications;
CREATE POLICY "delete_org_verif" ON public.site_verifications FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- verification_media (ownership through verification -> supplier)
DROP POLICY IF EXISTS "select_org_verif_media" ON public.verification_media;
CREATE POLICY "select_org_verif_media" ON public.verification_media FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.site_verifications v JOIN public.suppliers s ON s.id=v.supplier_id WHERE v.id=verification_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_verif_media" ON public.verification_media;
CREATE POLICY "insert_org_verif_media" ON public.verification_media FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.site_verifications v JOIN public.suppliers s ON s.id=v.supplier_id WHERE v.id=verification_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "update_org_verif_media" ON public.verification_media;
CREATE POLICY "update_org_verif_media" ON public.verification_media FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.site_verifications v JOIN public.suppliers s ON s.id=v.supplier_id WHERE v.id=verification_id AND s.organization_id=public.current_org_id())) WITH CHECK (EXISTS (SELECT 1 FROM public.site_verifications v JOIN public.suppliers s ON s.id=v.supplier_id WHERE v.id=verification_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_verif_media" ON public.verification_media;
CREATE POLICY "delete_org_verif_media" ON public.verification_media FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.site_verifications v JOIN public.suppliers s ON s.id=v.supplier_id WHERE v.id=verification_id AND s.organization_id=public.current_org_id()));

-- compliance_records
DROP POLICY IF EXISTS "select_org_compliance" ON public.compliance_records;
CREATE POLICY "select_org_compliance" ON public.compliance_records FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_compliance" ON public.compliance_records;
CREATE POLICY "insert_org_compliance" ON public.compliance_records FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_compliance" ON public.compliance_records;
CREATE POLICY "update_org_compliance" ON public.compliance_records FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_compliance" ON public.compliance_records;
CREATE POLICY "delete_org_compliance" ON public.compliance_records FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- litigation_records
DROP POLICY IF EXISTS "select_org_litigation" ON public.litigation_records;
CREATE POLICY "select_org_litigation" ON public.litigation_records FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_litigation" ON public.litigation_records;
CREATE POLICY "insert_org_litigation" ON public.litigation_records FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_litigation" ON public.litigation_records;
CREATE POLICY "update_org_litigation" ON public.litigation_records FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_litigation" ON public.litigation_records;
CREATE POLICY "delete_org_litigation" ON public.litigation_records FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- documents
DROP POLICY IF EXISTS "select_org_documents" ON public.documents;
CREATE POLICY "select_org_documents" ON public.documents FOR SELECT
  TO authenticated USING (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "insert_org_documents" ON public.documents;
CREATE POLICY "insert_org_documents" ON public.documents FOR INSERT
  TO authenticated WITH CHECK (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "update_org_documents" ON public.documents;
CREATE POLICY "update_org_documents" ON public.documents FOR UPDATE
  TO authenticated USING (organization_id = public.current_org_id()) WITH CHECK (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "delete_org_documents" ON public.documents;
CREATE POLICY "delete_org_documents" ON public.documents FOR DELETE
  TO authenticated USING (organization_id = public.current_org_id());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fs_supplier ON public.financial_statements(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fr_supplier ON public.financial_ratios(supplier_id);
CREATE INDEX IF NOT EXISTS idx_banking_supplier ON public.banking_info(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payment_supplier ON public.payment_behaviour(supplier_id);
CREATE INDEX IF NOT EXISTS idx_verif_supplier ON public.site_verifications(supplier_id);
CREATE INDEX IF NOT EXISTS idx_verif_media_verif ON public.verification_media(verification_id);
CREATE INDEX IF NOT EXISTS idx_compliance_supplier ON public.compliance_records(supplier_id);
CREATE INDEX IF NOT EXISTS idx_compliance_expiry ON public.compliance_records(expiry_date);
CREATE INDEX IF NOT EXISTS idx_litigation_supplier ON public.litigation_records(supplier_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON public.documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_supplier ON public.documents(supplier_id);
