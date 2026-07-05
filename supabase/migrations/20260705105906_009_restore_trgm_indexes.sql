-- Restore trigram GIN indexes (dropped when pg_trgm was moved to extensions schema)
CREATE INDEX IF NOT EXISTS idx_suppliers_name_trgm ON public.suppliers USING GIN (company_name extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_reg_trgm ON public.suppliers USING GIN (registration_number extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_gst_trgm ON public.suppliers USING GIN (gst_vat extensions.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_suppliers_pan_trgm ON public.suppliers USING GIN (pan_tin extensions.gin_trgm_ops);
