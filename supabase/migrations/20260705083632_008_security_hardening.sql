-- =============================================================
-- Security hardening: fix all flagged issues in one migration
-- =============================================================

-- 1. Move pg_trgm out of public schema into extensions schema
-- (create extensions schema if it doesn't exist)
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- 2. Fix mutable search_path on all affected functions
--    by re-creating them with SET search_path = ''
--    and fully-qualifying all object references.

-- touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- current_org_id
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- supplier_in_my_org
CREATE OR REPLACE FUNCTION public.supplier_in_my_org(suuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.suppliers s
    WHERE s.id = suuid AND s.organization_id = public.current_org_id()
  );
$$;

-- record_risk_history
CREATE OR REPLACE FUNCTION public.record_risk_history()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.risk_score_history (supplier_id, overall_score, rating, severity)
  VALUES (NEW.supplier_id, NEW.overall_score, NEW.rating, NEW.severity);
  RETURN NEW;
END;
$$;

-- compute_risk_score
CREATE OR REPLACE FUNCTION public.compute_risk_score(suuid uuid)
RETURNS public.risk_assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rec public.risk_assessments;
  overall int;
  band record;
BEGIN
  SELECT * INTO rec FROM public.risk_assessments WHERE supplier_id = suuid;
  IF NOT FOUND THEN
    INSERT INTO public.risk_assessments (supplier_id, financial_risk, operational_risk, compliance_risk,
      business_risk, market_risk, country_risk, political_risk, esg_risk, reputation_risk,
      supply_chain_risk, fraud_risk, overall_score, rating, severity)
    VALUES (suuid, 50,50,50,50,50,50,50,50,50,50,50, 50, 'BBB','moderate')
    RETURNING * INTO rec;
    RETURN rec;
  END IF;

  overall := (
    rec.financial_risk + rec.operational_risk + rec.compliance_risk + rec.business_risk +
    rec.market_risk + rec.country_risk + rec.political_risk + rec.esg_risk +
    rec.reputation_risk + rec.supply_chain_risk + rec.fraud_risk
  ) / 11;

  SELECT * INTO band FROM public.risk_rating_bands
    WHERE overall >= min_score AND overall <= max_score LIMIT 1;

  UPDATE public.risk_assessments
    SET overall_score = overall,
        rating = COALESCE(band.rating, 'BBB'),
        severity = COALESCE(band.severity, 'moderate'),
        assessed_at = now()
    WHERE supplier_id = suuid
    RETURNING * INTO rec;

  RETURN rec;
END;
$$;

-- 3. Revoke EXECUTE on SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.supplier_in_my_org(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.compute_risk_score(uuid) FROM anon;

-- 4. Revoke EXECUTE on SECURITY DEFINER functions from authenticated
--    (they are called internally by RLS policies, not via direct RPC)
REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.supplier_in_my_org(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_risk_score(uuid) FROM authenticated;

-- Re-grant to authenticated only for compute_risk_score since it IS
-- legitimately called by the application via rpc (risk scoring action).
-- current_org_id and supplier_in_my_org are internal RLS helpers only.
GRANT EXECUTE ON FUNCTION public.compute_risk_score(uuid) TO authenticated;

-- 5. Tighten the always-true INSERT policy on organizations.
--    A user should only be able to create an org on their own behalf
--    (first org — no existing membership). The check ensures they have
--    no prior membership, which matches the onboarding intent.
DROP POLICY IF EXISTS "insert_org" ON public.organizations;
CREATE POLICY "insert_org" ON public.organizations FOR INSERT
  TO authenticated WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );
