/*
# GSOR Supplier Master — Suppliers, Addresses, Contacts, Personnel, Business Profile, Products

## Purpose
Creates the supplier master database at the heart of GSOR: a searchable, multi-tenant
registry of supplier companies with their contact info, key personnel, business profile,
and products/services. Supports the "Supplier Master Database" and "Search System" features.

## New Tables
1. `suppliers` — the master supplier record per organization
   - id, organization_id, company_name, trade_name, constitution, registration_number,
     tax_number, gst_vat, pan_tin, cin, lei, duns, industry_code, business_category,
     date_of_incorporation, years_in_business, country, state, city, website, email,
     phone, mobile, gps_lat, gps_lng, employee_strength, status, search_tsv, created_at, updated_at
   - `search_tsv` is a generated tsvector column feeding full-text search across name/director/registration/gst/pan/etc.
2. `supplier_addresses` — registered, factory, branch, warehouse locations
   - id, supplier_id, type, address_line1, address_line2, city, state, country, postal_code, gps_lat, gps_lng
3. `supplier_contacts` — general contact entries (email/phone) beyond the primary on supplier
   - id, supplier_id, name, designation, email, phone, mobile, is_primary
4. `supplier_personnel` — key people (proprietor, partners, directors, CEO, CFO, plant/procurement/finance heads)
   - id, supplier_id, name, role, designation, photo_url, id_doc_url, id_verified
5. `supplier_business_profiles` — one row per supplier: products, services, manufacturing,
   installed_capacity, capacity_utilization, annual_production, export_countries, import_countries,
   distribution_network, major_customers, major_suppliers
6. `supplier_products` — individual product/service line items
   - id, supplier_id, name, category, type (product/service), description

## Security (RLS)
- All tables are org-scoped via `organization_id` on `suppliers`; child tables inherit ownership
  through `supplier_id -> suppliers.id` joined to the caller's org.
- Full CRUD for authenticated members of the owning organization.
- `suppliers.organization_id` defaults to `current_org_id()` so inserts omitting it still succeed.

## Notes
- Trigram indexes on company_name, registration_number, gst_vat, pan_tin enable fuzzy search.
- Generated tsvector + GIN index powers advanced full-text search.
- Idempotent and safe to re-run.
*/

CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL DEFAULT public.current_org_id() REFERENCES public.organizations(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  trade_name text,
  constitution text CHECK (constitution IN ('proprietorship','partnership','llp','private_limited','public_limited','government','trust','cooperative','ngo')),
  registration_number text,
  tax_number text,
  gst_vat text,
  pan_tin text,
  cin text,
  lei text,
  duns text,
  industry_code text,
  business_category text,
  date_of_incorporation date,
  years_in_business int,
  country text,
  state text,
  city text,
  website text,
  email text,
  phone text,
  mobile text,
  gps_lat double precision,
  gps_lng double precision,
  employee_strength int,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','under_review','blacklisted')),
  search_tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(company_name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(trade_name,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(coalesce(registration_number,'') || ' ' || coalesce(gst_vat,'') || ' ' || coalesce(pan_tin,'') || ' ' || coalesce(tax_number,'') || ' ' || coalesce(cin,'') || ' ' || coalesce(duns,'') || ' ' || coalesce(lei,''),'')), 'A') ||
    setweight(to_tsvector('english', coalesce(coalesce(city,'') || ' ' || coalesce(state,'') || ' ' || coalesce(country,'') || ' ' || coalesce(industry_code,'') || ' ' || coalesce(business_category,''),'')), 'C')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('registered','factory','branch','warehouse')),
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  country text,
  postal_code text,
  gps_lat double precision,
  gps_lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text,
  designation text,
  email text,
  phone text,
  mobile text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('proprietor','partner','director','ceo','cfo','plant_head','procurement_head','finance_head','other')),
  designation text,
  photo_url text,
  id_doc_url text,
  id_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL UNIQUE REFERENCES public.suppliers(id) ON DELETE CASCADE,
  products text,
  services text,
  manufacturing_facilities text,
  installed_capacity text,
  capacity_utilization numeric,
  annual_production text,
  export_countries text,
  import_countries text,
  distribution_network text,
  major_customers text,
  major_suppliers text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  type text NOT NULL DEFAULT 'product' CHECK (type IN ('product','service')),
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- updated_at trigger on suppliers + business profiles
DROP TRIGGER IF EXISTS suppliers_touch ON public.suppliers;
CREATE TRIGGER suppliers_touch BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS supplier_bp_touch ON public.supplier_business_profiles;
CREATE TRIGGER supplier_bp_touch BEFORE UPDATE ON public.supplier_business_profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- suppliers policies (org-scoped)
DROP POLICY IF EXISTS "select_org_suppliers" ON public.suppliers;
CREATE POLICY "select_org_suppliers" ON public.suppliers FOR SELECT
  TO authenticated USING (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "insert_org_suppliers" ON public.suppliers;
CREATE POLICY "insert_org_suppliers" ON public.suppliers FOR INSERT
  TO authenticated WITH CHECK (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "update_org_suppliers" ON public.suppliers;
CREATE POLICY "update_org_suppliers" ON public.suppliers FOR UPDATE
  TO authenticated USING (organization_id = public.current_org_id())
  WITH CHECK (organization_id = public.current_org_id());

DROP POLICY IF EXISTS "delete_org_suppliers" ON public.suppliers;
CREATE POLICY "delete_org_suppliers" ON public.suppliers FOR DELETE
  TO authenticated USING (organization_id = public.current_org_id());

-- Child tables: ownership through supplier -> organization
DROP POLICY IF EXISTS "select_org_supplier_addresses" ON public.supplier_addresses;
CREATE POLICY "select_org_supplier_addresses" ON public.supplier_addresses FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

DROP POLICY IF EXISTS "insert_org_supplier_addresses" ON public.supplier_addresses;
CREATE POLICY "insert_org_supplier_addresses" ON public.supplier_addresses FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

DROP POLICY IF EXISTS "update_org_supplier_addresses" ON public.supplier_addresses;
CREATE POLICY "update_org_supplier_addresses" ON public.supplier_addresses FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

DROP POLICY IF EXISTS "delete_org_supplier_addresses" ON public.supplier_addresses;
CREATE POLICY "delete_org_supplier_addresses" ON public.supplier_addresses FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

-- contacts
DROP POLICY IF EXISTS "select_org_supplier_contacts" ON public.supplier_contacts;
CREATE POLICY "select_org_supplier_contacts" ON public.supplier_contacts FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_supplier_contacts" ON public.supplier_contacts;
CREATE POLICY "insert_org_supplier_contacts" ON public.supplier_contacts FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "update_org_supplier_contacts" ON public.supplier_contacts;
CREATE POLICY "update_org_supplier_contacts" ON public.supplier_contacts FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_supplier_contacts" ON public.supplier_contacts;
CREATE POLICY "delete_org_supplier_contacts" ON public.supplier_contacts FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

-- personnel
DROP POLICY IF EXISTS "select_org_supplier_personnel" ON public.supplier_personnel;
CREATE POLICY "select_org_supplier_personnel" ON public.supplier_personnel FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_supplier_personnel" ON public.supplier_personnel;
CREATE POLICY "insert_org_supplier_personnel" ON public.supplier_personnel FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "update_org_supplier_personnel" ON public.supplier_personnel;
CREATE POLICY "update_org_supplier_personnel" ON public.supplier_personnel FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_supplier_personnel" ON public.supplier_personnel;
CREATE POLICY "delete_org_supplier_personnel" ON public.supplier_personnel FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

-- business profiles
DROP POLICY IF EXISTS "select_org_supplier_bp" ON public.supplier_business_profiles;
CREATE POLICY "select_org_supplier_bp" ON public.supplier_business_profiles FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_supplier_bp" ON public.supplier_business_profiles;
CREATE POLICY "insert_org_supplier_bp" ON public.supplier_business_profiles FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "update_org_supplier_bp" ON public.supplier_business_profiles;
CREATE POLICY "update_org_supplier_bp" ON public.supplier_business_profiles FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_supplier_bp" ON public.supplier_business_profiles;
CREATE POLICY "delete_org_supplier_bp" ON public.supplier_business_profiles FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

-- products
DROP POLICY IF EXISTS "select_org_supplier_products" ON public.supplier_products;
CREATE POLICY "select_org_supplier_products" ON public.supplier_products FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "insert_org_supplier_products" ON public.supplier_products;
CREATE POLICY "insert_org_supplier_products" ON public.supplier_products FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "update_org_supplier_products" ON public.supplier_products;
CREATE POLICY "update_org_supplier_products" ON public.supplier_products FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS "delete_org_supplier_products" ON public.supplier_products;
CREATE POLICY "delete_org_supplier_products" ON public.supplier_products FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM public.suppliers s WHERE s.id = supplier_id AND s.organization_id = public.current_org_id()));

-- Indexes: full-text + trigram fuzzy + common filters
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON public.suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tsv ON public.suppliers USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON public.suppliers USING GIN (company_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_reg_trgm ON public.suppliers USING GIN (registration_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_gst_trgm ON public.suppliers USING GIN (gst_vat gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_pan_trgm ON public.suppliers USING GIN (pan_tin gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON public.suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_industry ON public.suppliers(industry_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON public.suppliers(status);
CREATE INDEX IF NOT EXISTS idx_supplier_addresses_supplier ON public.supplier_addresses(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contacts_supplier ON public.supplier_contacts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_personnel_supplier ON public.supplier_personnel(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON public.supplier_products(supplier_id);
