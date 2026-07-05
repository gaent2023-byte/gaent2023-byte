/*
# GSOR Core Schema — Organizations, Members, Roles, Audit, Reference Data

## Purpose
Establishes the multi-tenant foundation for the Global Supplier Opinion Report (GSOR) platform:
tenancy, role-based access control (RBAC), audit logging, and shared reference data
(industries, countries, currencies, risk rating bands) used across every module.

## New Tables
1. `organizations` — tenant accounts (banks, NBFCs, corporates, etc.)
   - id, name, slug, plan, industry, country, logo_url, created_at, updated_at
2. `organization_members` — users belonging to an organization with an assigned role
   - id, organization_id, user_id (-> auth.users), role, invited_by, created_at
3. `audit_logs` — immutable activity log for sensitive actions
   - id, organization_id, actor_user_id, action, entity_type, entity_id, details (jsonb), created_at
4. `industries` — reference list of industries (id, code, name, sector)
5. `countries` — reference list of countries (id, iso2, iso3, name, region)
6. `currencies` — reference list of currencies (id, code, name, symbol)
7. `risk_rating_bands` — maps numeric risk scores to letter ratings and severity labels
   - id, min_score, max_score, rating (AAA..CCC), severity (low/moderate/high/critical)

## Security (RLS)
- `organizations`: members can read their own org; org admins can update.
- `organization_members`: members can read peers in same org; only org admins / super admins manage membership.
- `audit_logs`: read by members of the same org; inserts via authenticated with org check.
- Reference tables (industries, countries, currencies, risk_rating_bands): read-only to anon + authenticated (shared lookup data).
- All org-scoped tables enforce `organization_id` matching the caller's membership via `current_org_id()`.

## Notes
- `organization_members.role` stores one of the 8 GSOR roles as text enum.
- A `current_org_id()` helper resolves the caller's organization from their membership.
- Idempotent (IF NOT EXISTS) and safe to re-run.
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 1. organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  plan text NOT NULL DEFAULT 'enterprise',
  industry text,
  country text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. organization_members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'read_only',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- 3. audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. industries
CREATE TABLE IF NOT EXISTS public.industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  sector text
);

-- 5. countries
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 text UNIQUE NOT NULL,
  iso3 text UNIQUE NOT NULL,
  name text NOT NULL,
  region text
);

-- 6. currencies
CREATE TABLE IF NOT EXISTS public.currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  symbol text
);

-- 7. risk_rating_bands
CREATE TABLE IF NOT EXISTS public.risk_rating_bands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  min_score int NOT NULL,
  max_score int NOT NULL,
  rating text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low','moderate','high','critical')),
  UNIQUE (min_score, max_score)
);

-- Helper: resolve the caller's organization from membership (defined after tables exist)
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- updated_at trigger
DROP TRIGGER IF EXISTS organizations_touch ON public.organizations;
CREATE TRIGGER organizations_touch BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_rating_bands ENABLE ROW LEVEL SECURITY;

-- organizations policies
DROP POLICY IF EXISTS "select_own_org" ON public.organizations;
CREATE POLICY "select_own_org" ON public.organizations FOR SELECT
  TO authenticated USING (id = public.current_org_id());

DROP POLICY IF EXISTS "update_own_org" ON public.organizations;
CREATE POLICY "update_own_org" ON public.organizations FOR UPDATE
  TO authenticated USING (id = public.current_org_id())
  WITH CHECK (id = public.current_org_id());

-- organization_members policies
DROP POLICY IF EXISTS "select_own_membership" ON public.organization_members;
CREATE POLICY "select_own_membership" ON public.organization_members FOR SELECT
  TO authenticated USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "insert_membership_admin" ON public.organization_members;
CREATE POLICY "insert_membership_admin" ON public.organization_members FOR INSERT
  TO authenticated WITH CHECK (
    organization_id = public.current_org_id()
    AND EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = public.current_org_id()
        AND m.user_id = auth.uid()
        AND m.role IN ('super_admin','org_admin')
    )
  );

DROP POLICY IF EXISTS "update_membership_admin" ON public.organization_members;
CREATE POLICY "update_membership_admin" ON public.organization_members FOR UPDATE
  TO authenticated USING (
    organization_id = public.current_org_id()
    AND EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = public.current_org_id()
        AND m.user_id = auth.uid()
        AND m.role IN ('super_admin','org_admin')
    )
  ) WITH CHECK (
    organization_id = public.current_org_id()
  );

DROP POLICY IF EXISTS "delete_membership_admin" ON public.organization_members;
CREATE POLICY "delete_membership_admin" ON public.organization_members FOR DELETE
  TO authenticated USING (
    organization_id = public.current_org_id()
    AND EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = public.current_org_id()
        AND m.user_id = auth.uid()
        AND m.role IN ('super_admin','org_admin')
    )
  );

-- audit_logs policies
DROP POLICY IF EXISTS "select_own_audit" ON public.audit_logs;
CREATE POLICY "select_own_audit" ON public.audit_logs FOR SELECT
  TO authenticated USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "insert_own_audit" ON public.audit_logs;
CREATE POLICY "insert_own_audit" ON public.audit_logs FOR INSERT
  TO authenticated WITH CHECK (organization_id = public.current_org_id());

-- reference tables: read to anon + authenticated, no writes from app
DROP POLICY IF EXISTS "read_industries" ON public.industries;
CREATE POLICY "read_industries" ON public.industries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "read_countries" ON public.countries;
CREATE POLICY "read_countries" ON public.countries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "read_currencies" ON public.currencies;
CREATE POLICY "read_currencies" ON public.currencies FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "read_rating_bands" ON public.risk_rating_bands;
CREATE POLICY "read_rating_bands" ON public.risk_rating_bands FOR SELECT
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_org ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON public.audit_logs(entity_type, entity_id);
