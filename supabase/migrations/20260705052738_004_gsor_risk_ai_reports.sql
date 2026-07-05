/*
# GSOR Risk, AI, Reports, Notifications

## Purpose
Creates the risk management engine store, AI intelligence outputs, the Supplier Opinion
Report (SOR) generator tables with editable sections, exports, and the notifications/workflow tables.

## New Tables
1. `risk_assessments` — per-supplier risk assessment with 11 sub-scores + overall + rating + severity
   - financial, operational, compliance, business, market, country, political, esg,
     reputation, supply_chain, fraud sub-scores (0-100 each), overall_score (0-100),
     rating (AAA..CCC from bands), severity (low/moderate/high/critical), assessed_by, assessed_at
2. `risk_score_history` — append-only history of overall scores for trend timeline
3. `ai_opinions` — AI Intelligence Module outputs per supplier
   - summary, signals (jsonb), default_probability, recommended_credit_limit,
     recommendation (approve/reject/review), confidence, rationale, peer_comparison (jsonb),
     generated_by_model, generated_at
4. `ai_alerts` — surfaced risk/anomaly alerts from the AI engine
   - supplier_id, alert_type, severity, title, message, acknowledged, created_at
5. `reports` — the Supplier Opinion Report master record
   - supplier_id, title, status (draft/in_review/approved/published/expired), version,
     prepared_by, approved_by, expiry_date, qr_token (for verification lookup), created_at, updated_at
6. `report_sections` — editable sections of a report (the 22 SOR sections)
   - report_id, section_key, title, order_index, content (jsonb: heading + body + data),
     edited_by, updated_at
7. `report_exports` — generated export artifacts
   - report_id, format (pdf/docx/xlsx/html), file_url, generated_by, created_at
8. `notifications` — in-app notifications center
   - organization_id, user_id, type, title, message, related_entity_type, related_entity_id,
     read, created_at
9. `searches` — recent searches log per organization (powers dashboard "Recent Searches")
   - organization_id, user_id, query, filters (jsonb), results_count, created_at

## Security (RLS)
- Risk + AI + reports + report_sections + report_exports: org-scoped via supplier ownership.
- notifications + searches: org-scoped directly by organization_id.

## Notes
- `reports.qr_token` is a unique token used by the public QR verification lookup page.
- `report_sections` enables per-section rich editing before export.
- Idempotent and safe to re-run.
*/

CREATE TABLE IF NOT EXISTS public.risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL UNIQUE REFERENCES public.suppliers(id) ON DELETE CASCADE,
  financial_risk int NOT NULL DEFAULT 50 CHECK (financial_risk BETWEEN 0 AND 100),
  operational_risk int NOT NULL DEFAULT 50,
  compliance_risk int NOT NULL DEFAULT 50,
  business_risk int NOT NULL DEFAULT 50,
  market_risk int NOT NULL DEFAULT 50,
  country_risk int NOT NULL DEFAULT 50,
  political_risk int NOT NULL DEFAULT 50,
  esg_risk int NOT NULL DEFAULT 50,
  reputation_risk int NOT NULL DEFAULT 50,
  supply_chain_risk int NOT NULL DEFAULT 50,
  fraud_risk int NOT NULL DEFAULT 50,
  overall_score int NOT NULL DEFAULT 50 CHECK (overall_score BETWEEN 0 AND 100),
  rating text,
  severity text NOT NULL DEFAULT 'moderate' CHECK (severity IN ('low','moderate','high','critical')),
  assessed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.risk_score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  overall_score int NOT NULL,
  rating text,
  severity text,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_opinions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  summary text,
  signals jsonb,
  default_probability numeric,
  recommended_credit_limit numeric,
  recommendation text CHECK (recommendation IN ('approve','reject','review')),
  confidence numeric,
  rationale text,
  peer_comparison jsonb,
  generated_by_model text,
  generated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','moderate','high','critical')),
  title text NOT NULL,
  message text,
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','published','expired')),
  version int NOT NULL DEFAULT 1,
  prepared_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expiry_date date,
  qr_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12),'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  title text NOT NULL,
  order_index int NOT NULL DEFAULT 0,
  content jsonb,
  edited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_id, section_key)
);

CREATE TABLE IF NOT EXISTS public.report_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  format text NOT NULL CHECK (format IN ('pdf','docx','xlsx','html')),
  file_url text,
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  related_entity_type text,
  related_entity_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  query text NOT NULL,
  filters jsonb,
  results_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- triggers
DROP TRIGGER IF EXISTS risk_touch ON public.risk_assessments;
CREATE TRIGGER risk_touch BEFORE UPDATE ON public.risk_assessments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS reports_touch ON public.reports;
CREATE TRIGGER reports_touch BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS report_sections_touch ON public.report_sections;
CREATE TRIGGER report_sections_touch BEFORE UPDATE ON public.report_sections
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- On insert/update of risk_assessments.overall_score, append to history
CREATE OR REPLACE FUNCTION public.record_risk_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.risk_score_history (supplier_id, overall_score, rating, severity)
  VALUES (NEW.supplier_id, NEW.overall_score, NEW.rating, NEW.severity);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS risk_history_ins ON public.risk_assessments;
CREATE TRIGGER risk_history_ins AFTER INSERT ON public.risk_assessments
FOR EACH ROW EXECUTE FUNCTION public.record_risk_history();

DROP TRIGGER IF EXISTS risk_history_upd ON public.risk_assessments;
CREATE TRIGGER risk_history_upd AFTER UPDATE OF overall_score, rating, severity ON public.risk_assessments
FOR EACH ROW WHEN (OLD.overall_score IS DISTINCT FROM NEW.overall_score OR OLD.rating IS DISTINCT FROM NEW.rating)
EXECUTE FUNCTION public.record_risk_history();

-- Enable RLS
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.searches ENABLE ROW LEVEL SECURITY;

-- risk_assessments
DROP POLICY IF EXISTS "select_org_risk" ON public.risk_assessments;
CREATE POLICY "select_org_risk" ON public.risk_assessments FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_risk" ON public.risk_assessments;
CREATE POLICY "insert_org_risk" ON public.risk_assessments FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_risk" ON public.risk_assessments;
CREATE POLICY "update_org_risk" ON public.risk_assessments FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_risk" ON public.risk_assessments;
CREATE POLICY "delete_org_risk" ON public.risk_assessments FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- risk_score_history
DROP POLICY IF EXISTS "select_org_risk_hist" ON public.risk_score_history;
CREATE POLICY "select_org_risk_hist" ON public.risk_score_history FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_risk_hist" ON public.risk_score_history;
CREATE POLICY "insert_org_risk_hist" ON public.risk_score_history FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_risk_hist" ON public.risk_score_history;
CREATE POLICY "delete_org_risk_hist" ON public.risk_score_history FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- ai_opinions
DROP POLICY IF EXISTS "select_org_ai_op" ON public.ai_opinions;
CREATE POLICY "select_org_ai_op" ON public.ai_opinions FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_ai_op" ON public.ai_opinions;
CREATE POLICY "insert_org_ai_op" ON public.ai_opinions FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_ai_op" ON public.ai_opinions;
CREATE POLICY "update_org_ai_op" ON public.ai_opinions FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_ai_op" ON public.ai_opinions;
CREATE POLICY "delete_org_ai_op" ON public.ai_opinions FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- ai_alerts
DROP POLICY IF EXISTS "select_org_ai_alerts" ON public.ai_alerts;
CREATE POLICY "select_org_ai_alerts" ON public.ai_alerts FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_ai_alerts" ON public.ai_alerts;
CREATE POLICY "insert_org_ai_alerts" ON public.ai_alerts FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_ai_alerts" ON public.ai_alerts;
CREATE POLICY "update_org_ai_alerts" ON public.ai_alerts FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_ai_alerts" ON public.ai_alerts;
CREATE POLICY "delete_org_ai_alerts" ON public.ai_alerts FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- reports
DROP POLICY IF EXISTS "select_org_reports" ON public.reports;
CREATE POLICY "select_org_reports" ON public.reports FOR SELECT
  TO authenticated USING (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "insert_org_reports" ON public.reports;
CREATE POLICY "insert_org_reports" ON public.reports FOR INSERT
  TO authenticated WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "update_org_reports" ON public.reports;
CREATE POLICY "update_org_reports" ON public.reports FOR UPDATE
  TO authenticated USING (public.supplier_in_my_org(supplier_id)) WITH CHECK (public.supplier_in_my_org(supplier_id));
DROP POLICY IF EXISTS "delete_org_reports" ON public.reports;
CREATE POLICY "delete_org_reports" ON public.reports FOR DELETE
  TO authenticated USING (public.supplier_in_my_org(supplier_id));

-- report_sections
DROP POLICY IF EXISTS "select_org_report_sections" ON public.report_sections;
CREATE POLICY "select_org_report_sections" ON public.report_sections FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_report_sections" ON public.report_sections;
CREATE POLICY "insert_org_report_sections" ON public.report_sections FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "update_org_report_sections" ON public.report_sections;
CREATE POLICY "update_org_report_sections" ON public.report_sections FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id())) WITH CHECK (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_report_sections" ON public.report_sections;
CREATE POLICY "delete_org_report_sections" ON public.report_sections FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));

-- report_exports
DROP POLICY IF EXISTS "select_org_report_exports" ON public.report_exports;
CREATE POLICY "select_org_report_exports" ON public.report_exports FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_report_exports" ON public.report_exports;
CREATE POLICY "insert_org_report_exports" ON public.report_exports FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_report_exports" ON public.report_exports;
CREATE POLICY "delete_org_report_exports" ON public.report_exports FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.reports r JOIN public.suppliers s ON s.id=r.supplier_id WHERE r.id=report_id AND s.organization_id=public.current_org_id()));

-- notifications
DROP POLICY IF EXISTS "select_org_notifications" ON public.notifications;
CREATE POLICY "select_org_notifications" ON public.notifications FOR SELECT
  TO authenticated USING (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "insert_org_notifications" ON public.notifications;
CREATE POLICY "insert_org_notifications" ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "update_org_notifications" ON public.notifications;
CREATE POLICY "update_org_notifications" ON public.notifications FOR UPDATE
  TO authenticated USING (organization_id = public.current_org_id()) WITH CHECK (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "delete_org_notifications" ON public.notifications;
CREATE POLICY "delete_org_notifications" ON public.notifications FOR DELETE
  TO authenticated USING (organization_id = public.current_org_id());

-- searches
DROP POLICY IF EXISTS "select_org_searches" ON public.searches;
CREATE POLICY "select_org_searches" ON public.searches FOR SELECT
  TO authenticated USING (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "insert_org_searches" ON public.searches;
CREATE POLICY "insert_org_searches" ON public.searches FOR INSERT
  TO authenticated WITH CHECK (organization_id = public.current_org_id());
DROP POLICY IF EXISTS "delete_org_searches" ON public.searches;
CREATE POLICY "delete_org_searches" ON public.searches FOR DELETE
  TO authenticated USING (organization_id = public.current_org_id());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_risk_supplier ON public.risk_assessments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_risk_hist_supplier ON public.risk_score_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ai_op_supplier ON public.ai_opinions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ai_alerts_supplier ON public.ai_alerts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_reports_supplier ON public.reports(supplier_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_expiry ON public.reports(expiry_date);
CREATE INDEX IF NOT EXISTS idx_report_sections_report ON public.report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_report ON public.report_exports(report_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_org ON public.searches(organization_id);
