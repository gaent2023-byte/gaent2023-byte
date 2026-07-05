/*
# GSOR Demo Data — Sample Organization + Suppliers with Full Module Data

## Purpose
Seeds a demo organization ("GSOR Demo Bank") with 12 sample suppliers across multiple
countries and industries, each with financial ratios (5-year trends), risk assessments,
business profiles, compliance records, banking info, and personnel.

## Data Created
1. Demo organization: "GSOR Demo Bank"
2. 12 sample suppliers across manufacturing, tech, pharma, automotive, etc.
3. Financial ratios for 5 fiscal years per supplier
4. Risk assessments spanning all rating bands (AAA through B)
5. Business profiles, compliance records, banking info, personnel, litigation, verifications

## Notes
- Idempotent (ON CONFLICT DO NOTHING).
- Safe to re-run.
*/

INSERT INTO public.organizations (id, name, slug, plan, industry, country)
VALUES ('a0000000-0000-0000-0000-000000000001', 'GSOR Demo Bank', 'gsor-demo-bank', 'enterprise', 'Banking', 'United States')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.suppliers (id, organization_id, company_name, trade_name, constitution, registration_number, gst_vat, pan_tin, duns, industry_code, business_category, date_of_incorporation, years_in_business, country, state, city, website, email, phone, employee_strength, status)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Apex Manufacturing Pvt Ltd', 'Apex', 'private_limited', 'ROC-MUM-123456', '27AAACA1234B1Z5', 'AAACA1234B', '96-123-4567', 'MFG', 'Heavy Machinery', '1998-03-15', 27, 'India', 'Maharashtra', 'Mumbai', 'https://apexmfg.com', 'contact@apexmfg.com', '+91-22-12345678', 850, 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'TechSphere Solutions Inc', 'TechSphere', 'public_limited', 'DE-2010-456789', 'DE123456789', 'TS-456789', '96-234-5678', 'TEC', 'Cloud Services', '2010-07-22', 15, 'United States', 'California', 'San Francisco', 'https://techsphere.io', 'info@techsphere.io', '+1-415-555-0100', 1200, 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Greenfield Pharma GmbH', 'Greenfield', 'private_limited', 'HRB-78901', 'DE123456012', 'GP-78901', '96-345-6789', 'PHR', 'Generic Drugs', '2005-01-10', 20, 'Germany', 'Bavaria', 'Munich', 'https://greenfield-pharma.de', 'office@greenfield-pharma.de', '+49-89-1234560', 650, 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Eastern Textiles Ltd', 'Eastern', 'partnership', 'REG-TEX-345678', '33AABCE1234F1Z', 'AABCE1234F', '96-456-7890', 'TXT', 'Cotton Fabrics', '1995-06-08', 30, 'India', 'Tamil Nadu', 'Coimbatore', 'https://easterntextiles.in', 'sales@easterntextiles.in', '+91-422-2345678', 420, 'under_review'),
  ('a1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Dragon Auto Parts Co', 'Dragon Auto', 'private_limited', 'CN-SHA-901234', 'CN901234567', 'DA-901234', '96-567-8901', 'AUT', 'Auto Components', '2008-09-12', 17, 'China', 'Shanghai', 'Shanghai', 'https://dragonauto.cn', 'export@dragonauto.cn', '+86-21-67890123', 980, 'active'),
  ('a1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Desert Logistics FZ-LLC', 'Desert Logistics', 'llp', 'UAE-LLC-567890', 'AE123456789', 'DL-567890', '96-678-9012', 'LGS', 'Freight & Warehousing', '2012-11-03', 13, 'United Arab Emirates', 'Dubai', 'Dubai', 'https://desertlogistics.ae', 'info@desertlogistics.ae', '+971-4-3456789', 340, 'active'),
  ('a1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Thames Chemical Industries', 'Thames Chem', 'public_limited', 'UK-CHM-234567', 'GB234567890', 'TC-234567', '96-789-0123', 'CHM', 'Industrial Chemicals', '1985-04-18', 40, 'United Kingdom', 'England', 'London', 'https://thameschem.co.uk', 'enquiries@thameschem.co.uk', '+44-20-7654321', 1500, 'active'),
  ('a1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Sunrise Foods Corporation', 'Sunrise', 'private_limited', 'IN-FNB-890123', '29AABCS5678D1Z', 'AABCS5678D', '96-890-1234', 'FNB', 'Packaged Foods', '2003-02-25', 22, 'India', 'Karnataka', 'Bangalore', 'https://sunrisefoods.in', 'orders@sunrisefoods.in', '+91-80-34567890', 720, 'active'),
  ('a1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Nordic Energy Solutions AB', 'Nordic Energy', 'public_limited', 'SE-ENG-678901', 'SE678901234', 'NE-678901', '96-901-2345', 'ENG', 'Solar Components', '2007-05-14', 18, 'Sweden', 'Stockholm', 'Stockholm', 'https://nordicenergy.se', 'contact@nordicenergy.se', '+46-8-9012345', 560, 'active'),
  ('a1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Golden Gate Retail Group', 'Golden Gate', 'partnership', 'US-RTL-345012', 'US345012345', 'GG-345012', '96-012-3456', 'RTL', 'Consumer Electronics', '2015-08-30', 10, 'United States', 'New York', 'New York', 'https://goldengateretail.com', 'support@goldengateretail.com', '+1-212-555-0200', 280, 'under_review'),
  ('a1000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Sahara Agro Exports Ltd', 'Sahara Agro', 'private_limited', 'AF-AGRI-456789', 'AF456789012', 'SA-456789', '96-123-4560', 'AGRI', 'Agricultural Products', '2000-12-01', 25, 'South Africa', 'Western Cape', 'Cape Town', 'https://saharaagro.co.za', 'export@saharaagro.co.za', '+27-21-5678901', 380, 'active'),
  ('a1000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Pacific Steel Works Inc', 'Pacific Steel', 'public_limited', 'JP-STL-567890', 'JP567890123', 'PS-567890', '96-234-5670', 'CNST', 'Steel Manufacturing', '1990-03-20', 35, 'Japan', 'Osaka', 'Osaka', 'https://pacificsteel.jp', 'info@pacificsteel.jp', '+81-6-67890123', 2200, 'blacklisted')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.supplier_business_profiles (supplier_id, products, services, manufacturing_facilities, installed_capacity, capacity_utilization, annual_production, export_countries, import_countries, distribution_network, major_customers, major_suppliers)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Heavy machinery, industrial equipment', 'Installation & maintenance', '3 plants in Mumbai, Pune', '500 units/month', 78.5, '5500 units/year', 'UAE, Singapore, South Africa', 'Germany, Japan', 'Pan-India + 12 countries', 'Tata Motors, L&T, BHEL', 'Siemens, ABB'),
  ('a1000000-0000-0000-0000-000000000002', 'Cloud infrastructure, SaaS platforms', 'DevOps, cloud migration, consulting', 'Data centers in US, EU', '50000 VMs', 82.0, 'N/A (services)', 'N/A', 'N/A', 'Global online', 'Fortune 500 enterprises', 'AWS, Azure, GCP'),
  ('a1000000-0000-0000-0000-000000000003', 'Generic pharmaceuticals, APIs', 'Contract manufacturing', 'GMP-certified facility', '20 tons/month', 85.0, '240 tons/year', 'EU, US, Brazil', 'India, China', 'EU-wide pharmacy chains', 'Bayer, Novartis', 'Indian API suppliers'),
  ('a1000000-0000-0000-0000-000000000004', 'Cotton textiles, yarn, fabrics', 'Custom dyeing', '2 mills in Coimbatore', '100000 meters/month', 65.0, '1.2M meters/year', 'UK, US, Bangladesh', 'India (cotton)', 'Retail chains, garment makers', 'Local cotton farms', '—'),
  ('a1000000-0000-0000-0000-000000000005', 'Auto components, brake systems', 'OEM manufacturing', 'Plant in Shanghai', '50000 units/month', 90.0, '600K units/year', 'US, Germany, Japan', 'Japan (steel)', 'Global OEMs', 'Toyota, Honda, Ford', 'Nippon Steel'),
  ('a1000000-0000-0000-0000-000000000006', 'Freight forwarding, warehousing', '3PL logistics, customs clearance', 'Warehouse complex Dubai', '50000 sqm', 70.0, 'N/A', 'GCC, Africa, Asia', 'N/A', 'Middle East + Africa', 'Retailers, manufacturers', '—'),
  ('a1000000-0000-0000-0000-000000000007', 'Industrial chemicals, solvents', 'Custom chemical synthesis', 'Plant in London', '5000 tons/month', 88.0, '60000 tons/year', 'EU, US, Asia', 'Middle East (oil)', 'Europe-wide', 'BASF, Dow, ICI', 'Saudi Aramco'),
  ('a1000000-0000-0000-0000-000000000008', 'Packaged foods, snacks, beverages', 'Contract packing', '2 facilities in Bangalore', '200 tons/day', 75.0, '73000 tons/year', 'UAE, Singapore, UK', 'India (raw materials)', 'Pan-India retail', 'Reliance, Amazon, BigBasket', 'Local farms'),
  ('a1000000-0000-0000-0000-000000000009', 'Solar panels, inverters, batteries', 'Installation, EPC', 'Factory in Stockholm', '500 MW/year', 80.0, '500 MW/year', 'EU, UK, US', 'China (cells)', 'Europe-wide distributors', 'IKEA, Vattenfall, E.ON', 'LONGi, JA Solar'),
  ('a1000000-0000-0000-0000-000000000010', 'Consumer electronics, accessories', 'Retail, e-commerce', 'Warehouse NYC', 'N/A', 60.0, 'N/A', 'N/A', 'China (manufacturing)', 'Online + 15 stores', 'Online shoppers', 'Shenzhen manufacturers'),
  ('a1000000-0000-0000-0000-000000000011', 'Fresh fruit, nuts, wine', 'Export logistics', 'Farms in Western Cape', '5000 tons/season', 70.0, '20000 tons/year', 'EU, UK, Middle East', 'N/A', 'Export distributors', 'Tesco, Carrefour', '—'),
  ('a1000000-0000-0000-0000-000000000012', 'Steel bars, plates, structural steel', 'Custom cutting', 'Integrated mill Osaka', '20000 tons/month', 45.0, '240000 tons/year', 'US, SE Asia', 'Australia (iron ore)', 'Japan + export', 'Construction firms', 'BHP, Rio Tinto')
ON CONFLICT (supplier_id) DO NOTHING;

INSERT INTO public.financial_ratios (supplier_id, fiscal_year, revenue, ebitda, gross_profit, net_profit, net_worth, debt, current_ratio, quick_ratio, debt_equity_ratio, interest_coverage, working_capital, roe, roa, inventory_turnover, receivable_days, payable_days)
SELECT s.id, y.year,
  50000000 + (y.year - 2020) * 5000000 + (random() * 5000000)::int,
  8000000 + (y.year - 2020) * 800000 + (random() * 800000)::int,
  15000000 + (y.year - 2020) * 1500000,
  4000000 + (y.year - 2020) * 400000,
  25000000 + (y.year - 2020) * 3000000,
  15000000 - (y.year - 2020) * 500000,
  1.8 + (random() * 0.3), 1.2 + (random() * 0.2), 0.6, 4.5 + (random() * 0.5),
  8000000 + (y.year - 2020) * 800000,
  16 + (random() * 2), 8 + (random() * 1), 6.5, 45, 60
FROM public.suppliers s
CROSS JOIN (VALUES (2020),(2021),(2022),(2023),(2024)) AS y(year)
WHERE s.organization_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT (supplier_id, fiscal_year) DO NOTHING;

INSERT INTO public.risk_assessments (supplier_id, financial_risk, operational_risk, compliance_risk, business_risk, market_risk, country_risk, political_risk, esg_risk, reputation_risk, supply_chain_risk, fraud_risk, overall_score, rating, severity)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 25, 30, 20, 28, 35, 30, 25, 32, 22, 28, 20, 27, 'AAA', 'low'),
  ('a1000000-0000-0000-0000-000000000002', 18, 22, 15, 20, 25, 20, 18, 28, 15, 22, 15, 20, 'AAA', 'low'),
  ('a1000000-0000-0000-0000-000000000003', 30, 25, 28, 25, 30, 22, 20, 35, 20, 25, 18, 27, 'AAA', 'low'),
  ('a1000000-0000-0000-0000-000000000004', 55, 48, 52, 50, 45, 40, 38, 42, 50, 48, 45, 47, 'BBB', 'moderate'),
  ('a1000000-0000-0000-0000-000000000005', 35, 30, 32, 38, 42, 45, 48, 30, 28, 40, 25, 36, 'A', 'low'),
  ('a1000000-0000-0000-0000-000000000006', 42, 38, 35, 40, 38, 32, 30, 35, 32, 36, 28, 35, 'A', 'low'),
  ('a1000000-0000-0000-0000-000000000007', 28, 32, 25, 30, 35, 25, 22, 30, 25, 30, 22, 28, 'AA', 'low'),
  ('a1000000-0000-0000-0000-000000000008', 38, 35, 40, 36, 38, 35, 32, 38, 35, 36, 30, 35, 'A', 'low'),
  ('a1000000-0000-0000-0000-000000000009', 32, 28, 30, 32, 35, 28, 25, 25, 28, 32, 22, 29, 'AA', 'low'),
  ('a1000000-0000-0000-0000-000000000010', 62, 58, 65, 60, 55, 35, 30, 50, 55, 58, 52, 53, 'BBB', 'moderate'),
  ('a1000000-0000-0000-0000-000000000011', 45, 42, 48, 44, 40, 55, 52, 42, 38, 45, 35, 44, 'BBB', 'moderate'),
  ('a1000000-0000-0000-0000-000000000012', 82, 78, 85, 80, 72, 55, 50, 65, 78, 75, 88, 73, 'B', 'high')
ON CONFLICT (supplier_id) DO NOTHING;

INSERT INTO public.compliance_records (supplier_id, type, reference_number, status, issue_date, expiry_date, issuing_authority)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'GST Registration', '27AAACA1234B1Z5', 'compliant', '2018-04-01', '2026-04-01', 'GST Department'),
  ('a1000000-0000-0000-0000-000000000001', 'ISO 9001', 'ISO-9001-2015-MUM', 'compliant', '2022-06-15', '2025-06-15', 'Bureau Veritas'),
  ('a1000000-0000-0000-0000-000000000002', 'SOC 2 Type II', 'SOC2-2024-TS', 'compliant', '2024-01-01', '2025-01-01', 'Deloitte'),
  ('a1000000-0000-0000-0000-000000000003', 'GMP Certificate', 'GMP-EU-2023', 'compliant', '2023-03-10', '2026-03-10', 'EMA'),
  ('a1000000-0000-0000-0000-000000000004', 'Factory Licence', 'FL-TN-2019', 'pending', '2019-08-01', '2025-08-01', 'Tamil Nadu Govt'),
  ('a1000000-0000-0000-0000-000000000005', 'ISO 14001', 'ISO-14001-SHA', 'compliant', '2023-05-20', '2026-05-20', 'TUV'),
  ('a1000000-0000-0000-0000-000000000007', 'Environmental Permit', 'EP-UK-2020', 'expired', '2020-01-15', '2025-01-15', 'EA UK'),
  ('a1000000-0000-0000-0000-000000000010', 'Business Licence', 'BL-NY-2024', 'non_compliant', '2024-03-01', '2025-03-01', 'NY State')
ON CONFLICT DO NOTHING;

INSERT INTO public.banking_info (supplier_id, bank_name, facility_type, working_capital, term_loan, existing_exposure, relationship_years, security_offered)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'HDFC Bank', 'Cash Credit', 50000000, 25000000, 75000000, 12, 'Plant & machinery'),
  ('a1000000-0000-0000-0000-000000000002', 'JP Morgan Chase', 'Revolving Credit', 200000000, 0, 200000000, 8, 'Receivables'),
  ('a1000000-0000-0000-0000-000000000003', 'Deutsche Bank', 'Term Loan', 15000000, 40000000, 55000000, 15, 'Fixed assets'),
  ('a1000000-0000-0000-0000-000000000004', 'ICICI Bank', 'Cash Credit', 12000000, 8000000, 20000000, 18, 'Inventory'),
  ('a1000000-0000-0000-0000-000000000005', 'Bank of China', 'Working Capital', 80000000, 30000000, 110000000, 10, 'Property'),
  ('a1000000-0000-0000-0000-000000000007', 'Barclays', 'Term Loan', 30000000, 60000000, 90000000, 25, 'Plant'),
  ('a1000000-0000-0000-0000-000000000010', 'Citibank', 'Overdraft', 5000000, 0, 5000000, 5, 'None')
ON CONFLICT DO NOTHING;

INSERT INTO public.supplier_personnel (supplier_id, name, role, designation, id_verified)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Rajesh Mehta', 'ceo', 'Chief Executive Officer', true),
  ('a1000000-0000-0000-0000-000000000001', 'Priya Sharma', 'cfo', 'Chief Financial Officer', true),
  ('a1000000-0000-0000-0000-000000000001', 'Amit Patel', 'director', 'Managing Director', true),
  ('a1000000-0000-0000-0000-000000000002', 'John Anderson', 'ceo', 'CEO & Co-founder', true),
  ('a1000000-0000-0000-0000-000000000002', 'Sarah Chen', 'cfo', 'CFO', true),
  ('a1000000-0000-0000-0000-000000000003', 'Klaus Weber', 'ceo', 'Geschaeftsfuehrer', true),
  ('a1000000-0000-0000-0000-000000000003', 'Anna Mueller', 'finance_head', 'Head of Finance', true),
  ('a1000000-0000-0000-0000-000000000004', 'Suresh Iyer', 'proprietor', 'Managing Partner', false),
  ('a1000000-0000-0000-0000-000000000005', 'Li Wei', 'ceo', 'General Manager', true),
  ('a1000000-0000-0000-0000-000000000007', 'James Thompson', 'ceo', 'Chief Executive', true),
  ('a1000000-0000-0000-0000-000000000008', 'Deepak Nair', 'ceo', 'Founder & CEO', true),
  ('a1000000-0000-0000-0000-000000000012', 'Takeshi Yamamoto', 'director', 'President', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.litigation_records (supplier_id, case_type, case_number, court_or_authority, filing_date, status, claim_amount, summary)
VALUES
  ('a1000000-0000-0000-0000-000000000004', 'civil', 'CIV-2023-4567', 'Madras High Court', '2023-08-15', 'open', 5000000, 'Contract dispute with supplier over raw material quality'),
  ('a1000000-0000-0000-0000-000000000010', 'court_case', 'NY-SC-2024-1234', 'NY Supreme Court', '2024-02-20', 'pending', 12000000, 'Class action for defective products'),
  ('a1000000-0000-0000-0000-000000000012', 'insolvency', 'INS-OSA-2023-789', 'Osaka District Court', '2023-11-10', 'open', 50000000, 'Insolvency proceedings filed by creditors')
ON CONFLICT DO NOTHING;

INSERT INTO public.site_verifications (supplier_id, visit_date, surveyor_name, gps_lat, gps_lng, office_verified, factory_verified, warehouse_verified, machinery_verified, employee_verified, remarks, recommendations, status)
VALUES
  ('a1000000-0000-0000-0000-000000000001', '2024-09-15', 'Vikram Singh', 19.0760, 72.8777, true, true, true, true, true, 'Facility well-maintained. All operations verified.', 'Recommended for approval', 'completed'),
  ('a1000000-0000-0000-0000-000000000002', '2024-10-02', 'Maria Garcia', 37.7749, -122.4194, true, false, false, false, true, 'Office verified. Data centers not physically accessible.', 'Standard monitoring', 'completed'),
  ('a1000000-0000-0000-0000-000000000004', '2024-08-20', 'Ramesh Kumar', 11.0168, 76.9558, true, true, false, true, false, 'Some discrepancies in reported capacity', 'Enhanced monitoring required', 'flagged'),
  ('a1000000-0000-0000-0000-000000000005', '2024-11-05', 'Liu Yang', 31.2304, 121.4737, true, true, true, true, true, 'State-of-the-art facility. Excellent capacity utilization.', 'Recommended for approval', 'completed')
ON CONFLICT DO NOTHING;
