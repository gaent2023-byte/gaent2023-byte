-- Fix 1: Allow authenticated users to insert a new organization
DROP POLICY IF EXISTS "insert_org" ON public.organizations;
CREATE POLICY "insert_org" ON public.organizations FOR INSERT
  TO authenticated WITH CHECK (true);

-- Fix 2: Fix circular RLS on organization_members INSERT.
-- The old policy checked current_org_id() which returns NULL for users
-- who have no membership yet, blocking first-time onboarding entirely.
-- Replace with two policies:
--   a) Self-registration: user inserts their own first membership (no existing row)
--   b) Admin invite: org admin inserts a row for someone else
DROP POLICY IF EXISTS "insert_membership_admin" ON public.organization_members;

CREATE POLICY "insert_own_first_membership" ON public.organization_members FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "insert_membership_by_admin" ON public.organization_members FOR INSERT
  TO authenticated WITH CHECK (
    organization_id = public.current_org_id()
    AND EXISTS (
      SELECT 1 FROM public.organization_members m
      WHERE m.organization_id = public.current_org_id()
        AND m.user_id = auth.uid()
        AND m.role IN ('super_admin', 'org_admin')
    )
  );
