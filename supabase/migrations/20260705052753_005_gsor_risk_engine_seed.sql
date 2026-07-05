/*
# GSOR Risk Engine + Reference Seed Data

## Purpose
1. Adds `compute_risk_score()` — a Postgres function that recomputes an overall risk score
   (0-100) from the 11 sub-scores and maps it to a rating band (AAA..CCC) and severity.
2. Seeds reference data: risk rating bands, a representative set of industries, countries,
   and currencies used throughout the UI.

## Functions
- `compute_risk_score(supplier_uuid)` — averages the 11 category sub-scores into overall_score,
   looks up the matching `risk_rating_bands` row for rating + severity, updates the
   `risk_assessments` row (upsert), and returns the computed record.

## Seed Data
- `risk_rating_bands`: AAA (0-20 low), AA (21-30 low), A (31-40 low), BBB (41-55 moderate),
  BB (56-65 moderate), B (66-75 high), CCC (76-100 critical)
- `industries`: ~16 common industries across manufacturing, services, tech, energy, etc.
- `countries`: ~30 representative countries across regions
- `currencies`: USD, EUR, GBP, INR, JPY, CNY, AED, SGD

## Notes
- Uses ON CONFLICT DO NOTHING so seeds are idempotent.
- Safe to re-run.
*/

-- compute_risk_score function
CREATE OR REPLACE FUNCTION public.compute_risk_score(suuid uuid)
RETURNS public.risk_assessments
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Seed risk rating bands
INSERT INTO public.risk_rating_bands (min_score, max_score, rating, severity) VALUES
  (0,20,'AAA','low'),
  (21,30,'AA','low'),
  (31,40,'A','low'),
  (41,55,'BBB','moderate'),
  (56,65,'BB','moderate'),
  (66,75,'B','high'),
  (76,100,'CCC','critical')
ON CONFLICT (min_score, max_score) DO NOTHING;

-- Seed industries
INSERT INTO public.industries (code, name, sector) VALUES
  ('MFG','Manufacturing','Industrial'),
  ('AUT','Automotive','Industrial'),
  ('CHM','Chemicals','Industrial'),
  ('PHR','Pharmaceuticals','Healthcare'),
  ('TEC','Technology','Technology'),
  ('FIN','Financial Services','Services'),
  ('BNK','Banking','Services'),
  ('INS','Insurance','Services'),
  ('RTL','Retail','Consumer'),
  ('FNB','Food & Beverage','Consumer'),
  ('AGRI','Agriculture','Primary'),
  ('ENG','Energy & Utilities','Energy'),
  ('CNST','Construction','Industrial'),
  ('LGS','Logistics & Transport','Services'),
  ('TLC','Telecommunications','Technology'),
  ('TXT','Textiles & Apparel','Consumer')
ON CONFLICT (code) DO NOTHING;

-- Seed countries
INSERT INTO public.countries (iso2, iso3, name, region) VALUES
  ('US','USA','United States','North America'),
  ('GB','GBR','United Kingdom','Europe'),
  ('DE','DEU','Germany','Europe'),
  ('FR','FRA','France','Europe'),
  ('IT','ITA','Italy','Europe'),
  ('ES','ESP','Spain','Europe'),
  ('NL','NLD','Netherlands','Europe'),
  ('CH','CHE','Switzerland','Europe'),
  ('IN','IND','India','Asia'),
  ('CN','CHN','China','Asia'),
  ('JP','JPN','Japan','Asia'),
  ('SG','SGP','Singapore','Asia'),
  ('AE','ARE','United Arab Emirates','Middle East'),
  ('SA','SAU','Saudi Arabia','Middle East'),
  ('BR','BRA','Brazil','South America'),
  ('MX','MEX','Mexico','North America'),
  ('CA','CAN','Canada','North America'),
  ('AU','AUS','Australia','Oceania'),
  ('ZA','ZAF','South Africa','Africa'),
  ('KR','KOR','South Korea','Asia'),
  ('MY','MYS','Malaysia','Asia'),
  ('TH','THA','Thailand','Asia'),
  ('ID','IDN','Indonesia','Asia'),
  ('TR','TUR','Turkey','Europe/Asia'),
  ('PL','POL','Poland','Europe'),
  ('SE','SWE','Sweden','Europe'),
  ('EG','EGY','Egypt','Africa'),
  ('NG','NGA','Nigeria','Africa'),
  ('AR','ARG','Argentina','South America'),
  ('HK','HKG','Hong Kong','Asia')
ON CONFLICT (iso2) DO NOTHING;

-- Seed currencies
INSERT INTO public.currencies (code, name, symbol) VALUES
  ('USD','US Dollar','$'),
  ('EUR','Euro','€'),
  ('GBP','British Pound','£'),
  ('INR','Indian Rupee','₹'),
  ('JPY','Japanese Yen','¥'),
  ('CNY','Chinese Yuan','¥'),
  ('AED','UAE Dirham','د.إ'),
  ('SGD','Singapore Dollar','S$')
ON CONFLICT (code) DO NOTHING;
