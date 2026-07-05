-- Risk assessments for Indian suppliers
INSERT INTO public.risk_assessments (supplier_id, financial_risk, operational_risk, compliance_risk, business_risk, market_risk, country_risk, political_risk, esg_risk, reputation_risk, supply_chain_risk, fraud_risk, overall_score, rating, severity)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 15, 18, 12, 15, 20, 28, 25, 22, 12, 18, 12, 18, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000002', 18, 20, 14, 16, 22, 28, 25, 20, 14, 20, 14, 19, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000003', 22, 24, 18, 20, 25, 28, 25, 22, 18, 22, 18, 22, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000004', 35, 38, 32, 38, 42, 35, 38, 52, 28, 38, 25, 37, 'A', 'low'),
  ('b1000000-0000-0000-0000-000000000005', 30, 28, 25, 30, 32, 30, 28, 35, 22, 28, 22, 28, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000006', 25, 22, 18, 22, 28, 28, 25, 28, 18, 25, 18, 23, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000007', 38, 35, 32, 38, 42, 35, 32, 42, 28, 38, 28, 35, 'A', 'low'),
  ('b1000000-0000-0000-0000-000000000008', 20, 22, 18, 20, 25, 28, 25, 25, 15, 22, 15, 21, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000009', 28, 25, 22, 25, 30, 28, 25, 30, 20, 25, 20, 25, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000010', 22, 20, 18, 20, 25, 28, 25, 28, 15, 22, 15, 21, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000011', 28, 25, 22, 25, 30, 28, 25, 38, 20, 25, 18, 26, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000012', 35, 32, 28, 35, 38, 30, 28, 35, 28, 32, 25, 31, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000013', 25, 22, 20, 22, 28, 28, 25, 28, 18, 25, 18, 23, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000014', 22, 25, 18, 22, 28, 28, 25, 22, 15, 22, 15, 22, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000015', 28, 25, 22, 25, 30, 28, 25, 30, 20, 25, 18, 25, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000016', 35, 32, 28, 35, 38, 30, 28, 32, 28, 32, 25, 31, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000017', 52, 48, 45, 50, 52, 35, 32, 52, 42, 48, 38, 45, 'BBB', 'moderate'),
  ('b1000000-0000-0000-0000-000000000018', 58, 55, 52, 55, 55, 35, 32, 55, 45, 52, 42, 49, 'BBB', 'moderate'),
  ('b1000000-0000-0000-0000-000000000019', 45, 42, 38, 45, 48, 32, 30, 45, 35, 42, 32, 39, 'A', 'low'),
  ('b1000000-0000-0000-0000-000000000020', 22, 20, 18, 22, 30, 28, 25, 28, 15, 22, 15, 22, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000021', 28, 25, 22, 25, 35, 28, 25, 28, 20, 25, 18, 25, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000022', 32, 28, 25, 30, 38, 28, 25, 30, 22, 28, 20, 28, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000023', 45, 42, 38, 45, 48, 30, 28, 42, 35, 45, 32, 39, 'A', 'low'),
  ('b1000000-0000-0000-0000-000000000024', 48, 45, 42, 48, 50, 30, 28, 42, 38, 48, 35, 41, 'BBB', 'moderate'),
  ('b1000000-0000-0000-0000-000000000025', 42, 38, 35, 42, 45, 30, 28, 40, 32, 38, 28, 36, 'A', 'low'),
  ('b1000000-0000-0000-0000-000000000026', 28, 25, 22, 25, 30, 28, 25, 28, 20, 25, 18, 25, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000027', 30, 28, 25, 28, 32, 28, 25, 28, 22, 28, 20, 27, 'AAA', 'low'),
  ('b1000000-0000-0000-0000-000000000028', 28, 25, 22, 28, 32, 28, 25, 28, 20, 25, 18, 25, 'AA', 'low'),
  ('b1000000-0000-0000-0000-000000000029', 55, 52, 48, 55, 52, 32, 30, 48, 42, 52, 38, 46, 'BBB', 'moderate'),
  ('b1000000-0000-0000-0000-000000000030', 58, 55, 52, 55, 52, 32, 30, 50, 45, 55, 42, 48, 'BBB', 'moderate')
ON CONFLICT (supplier_id) DO NOTHING;

-- Compliance records
INSERT INTO public.compliance_records (supplier_id, type, reference_number, status, issue_date, expiry_date, issuing_authority) VALUES
  ('b1000000-0000-0000-0000-000000000001','ISO 27001','ISO-27001-TCS-2024','compliant','2024-01-01','2027-01-01','Bureau Veritas'),
  ('b1000000-0000-0000-0000-000000000001','GST Registration','27AAACT1234A1ZI','compliant','2017-07-01','2028-07-01','GSTN India'),
  ('b1000000-0000-0000-0000-000000000002','CMMI Level 5','CMMI-L5-INF-2023','compliant','2023-06-01','2026-06-01','CMMI Institute'),
  ('b1000000-0000-0000-0000-000000000003','ISO 9001','ISO-9001-WIP-2023','compliant','2023-05-15','2026-05-15','DNV GL'),
  ('b1000000-0000-0000-0000-000000000004','Environmental Clearance','EC-MoEF-RIL-2024','compliant','2024-03-01','2029-03-01','MoEF India'),
  ('b1000000-0000-0000-0000-000000000005','ISO 9001','ISO-9001-LT-2023','compliant','2023-08-01','2026-08-01','TUV SUD'),
  ('b1000000-0000-0000-0000-000000000006','WHO-GMP','WHO-GMP-SUNP-2024','compliant','2024-02-01','2027-02-01','WHO'),
  ('b1000000-0000-0000-0000-000000000006','USFDA Registration','USFDA-SUNP-2024','compliant','2024-01-15','2027-01-15','USFDA'),
  ('b1000000-0000-0000-0000-000000000007','ISO 14001','ISO-14001-MM-2023','compliant','2023-10-01','2026-10-01','Bureau Veritas'),
  ('b1000000-0000-0000-0000-000000000008','ISO 9001','ISO-9001-BAJ-2023','compliant','2023-07-01','2026-07-01','TUV Rheinland'),
  ('b1000000-0000-0000-0000-000000000013','USFDA Registration','USFDA-DRL-2024','compliant','2024-03-01','2027-03-01','USFDA'),
  ('b1000000-0000-0000-0000-000000000013','EU GMP Certificate','EU-GMP-DRL-2024','compliant','2024-01-01','2027-01-01','EMA'),
  ('b1000000-0000-0000-0000-000000000017','ISO 45001','ISO-45001-JSW-2023','compliant','2023-09-01','2026-09-01','BSI'),
  ('b1000000-0000-0000-0000-000000000018','ISO 14001','ISO-14001-TS-2022','expired','2022-06-01','2025-06-01','DNV GL'),
  ('b1000000-0000-0000-0000-000000000019','Environmental NOC','NOC-PCB-UTC-2023','compliant','2023-04-01','2026-04-01','CPCB India'),
  ('b1000000-0000-0000-0000-000000000024','IATF 16949','IATF-MIN-2024','compliant','2024-02-01','2027-02-01','TUV SUD'),
  ('b1000000-0000-0000-0000-000000000029','Factory Licence','FL-KA-ABB-2024','pending','2024-01-01','2025-01-01','Karnataka Factories Dept')
ON CONFLICT DO NOTHING;

-- Banking info
INSERT INTO public.banking_info (supplier_id, bank_name, facility_type, working_capital, term_loan, existing_exposure, relationship_years, security_offered) VALUES
  ('b1000000-0000-0000-0000-000000000001','HDFC Bank','Working Capital Demand Loan',500000000,0,500000000,20,'Receivables'),
  ('b1000000-0000-0000-0000-000000000002','ICICI Bank','Cash Credit',300000000,0,300000000,18,'Receivables'),
  ('b1000000-0000-0000-0000-000000000003','Axis Bank','Revolving Credit',200000000,0,200000000,15,'Receivables'),
  ('b1000000-0000-0000-0000-000000000004','SBI','Term Loan',2000000000,8000000000,10000000000,40,'Plant & refineries'),
  ('b1000000-0000-0000-0000-000000000005','SBI','Project Finance',1000000000,5000000000,6000000000,35,'Project assets'),
  ('b1000000-0000-0000-0000-000000000006','HDFC Bank','Cash Credit',200000000,500000000,700000000,22,'Plant & machinery'),
  ('b1000000-0000-0000-0000-000000000007','Bank of India','Working Capital',800000000,2000000000,2800000000,28,'Land & plant'),
  ('b1000000-0000-0000-0000-000000000008','Kotak Mahindra Bank','Cash Credit',150000000,50000000,200000000,25,'Inventory & plant'),
  ('b1000000-0000-0000-0000-000000000017','SBI','Term Loan',1500000000,6000000000,7500000000,20,'Steel plants'),
  ('b1000000-0000-0000-0000-000000000018','SBI','Term Loan',2000000000,8000000000,10000000000,40,'Steel plants, mines'),
  ('b1000000-0000-0000-0000-000000000019','HDFC Bank','Non-Fund Based',500000000,2000000000,2500000000,15,'Cement plants'),
  ('b1000000-0000-0000-0000-000000000020','HDFC Bank','Working Capital',300000000,100000000,400000000,30,'Inventory & debtors'),
  ('b1000000-0000-0000-0000-000000000024','ICICI Bank','Term Loan',100000000,200000000,300000000,12,'Plant & machinery')
ON CONFLICT DO NOTHING;

-- Key personnel
INSERT INTO public.supplier_personnel (supplier_id, name, role, designation, id_verified) VALUES
  ('b1000000-0000-0000-0000-000000000001','K. Krithivasan','ceo','Chief Executive Officer & MD',true),
  ('b1000000-0000-0000-0000-000000000001','Samir Seksaria','cfo','Chief Financial Officer',true),
  ('b1000000-0000-0000-0000-000000000002','Salil Parekh','ceo','Chief Executive Officer & MD',true),
  ('b1000000-0000-0000-0000-000000000002','Jayesh Sanghrajka','cfo','Chief Financial Officer',true),
  ('b1000000-0000-0000-0000-000000000003','Srinivas Pallia','ceo','Chief Executive Officer',true),
  ('b1000000-0000-0000-0000-000000000003','Aparna Iyer','cfo','Chief Financial Officer',true),
  ('b1000000-0000-0000-0000-000000000004','Mukesh D. Ambani','director','Chairman & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000004','V. Srikanth','cfo','Chief Financial Officer',true),
  ('b1000000-0000-0000-0000-000000000005','S.N. Subrahmanyan','ceo','Managing Director & CEO',true),
  ('b1000000-0000-0000-0000-000000000005','Shankar Raman','cfo','Chief Financial Officer',true),
  ('b1000000-0000-0000-0000-000000000006','Dilip Shanghvi','director','Founder & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000007','Anish Shah','ceo','Managing Director & CEO',true),
  ('b1000000-0000-0000-0000-000000000008','Rajiv Bajaj','ceo','Managing Director',true),
  ('b1000000-0000-0000-0000-000000000009','Amit Syngle','ceo','Managing Director & CEO',true),
  ('b1000000-0000-0000-0000-000000000010','Rohit Jawa','ceo','Chief Executive Officer & MD',true),
  ('b1000000-0000-0000-0000-000000000011','Sanjiv Puri','ceo','Chairman & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000012','Baba N. Kalyani','director','Chairman & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000013','Erez Israeli','ceo','Chief Executive Officer',true),
  ('b1000000-0000-0000-0000-000000000014','Mohit Joshi','ceo','Chief Executive Officer & MD',true),
  ('b1000000-0000-0000-0000-000000000015','Bharat Puri','ceo','Managing Director',true),
  ('b1000000-0000-0000-0000-000000000016','Anil Rai Gupta','director','Chairman & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000017','Sajjan Jindal','director','Chairman & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000018','T.V. Narendran','ceo','Chief Executive Officer & MD',true),
  ('b1000000-0000-0000-0000-000000000019','K.C. Jhanwar','ceo','Managing Director',true),
  ('b1000000-0000-0000-0000-000000000020','Hisashi Takeuchi','ceo','Managing Director & CEO',true),
  ('b1000000-0000-0000-0000-000000000021','Niranjan Gupta','ceo','Chief Executive Officer',true),
  ('b1000000-0000-0000-0000-000000000022','K.N. Radhakrishnan','ceo','President & Chief Executive Officer',true),
  ('b1000000-0000-0000-0000-000000000023','Subir Chakraborty','ceo','Managing Director & CEO',true),
  ('b1000000-0000-0000-0000-000000000024','Nirmal K. Minda','director','Chairman & Managing Director',true),
  ('b1000000-0000-0000-0000-000000000025','Pirojsha Godrej','director','Executive Chairperson',true)
ON CONFLICT DO NOTHING;

-- AI alerts for flagged suppliers
INSERT INTO public.ai_alerts (supplier_id, alert_type, severity, title, message, acknowledged) VALUES
  ('b1000000-0000-0000-0000-000000000017','debt_coverage','moderate','Debt-equity ratio elevated','JSW Steel debt-equity ratio at 0.55 exceeds sector threshold of 0.45. Monitor refinancing risk.',false),
  ('b1000000-0000-0000-0000-000000000018','interest_coverage','moderate','Interest coverage declining','Tata Steel interest coverage dropped to 4.2x against a 5x benchmark. Track quarterly earnings.',false),
  ('b1000000-0000-0000-0000-000000000029','compliance_expiry','moderate','Factory licence renewal pending','ABB India factory licence for Nashik plant due for renewal within 90 days. Escalate to compliance team.',false),
  ('b1000000-0000-0000-0000-000000000024','supply_chain','moderate','Single-source dependency risk','Minda Industries has over 40% components sourced from a single Japanese supplier. Diversification recommended.',false),
  ('b1000000-0000-0000-0000-000000000018','esg_flag','moderate','ISO 14001 certification expired','Tata Steel ISO 14001 certification expired June 2025. Environmental compliance risk for EU export contracts.',false)
ON CONFLICT DO NOTHING;

-- Sample reports
INSERT INTO public.reports (id, supplier_id, title, status, version, expiry_date)
VALUES
  ('c1000000-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','Supplier Opinion Report - TCS FY2025','published',1,'2026-06-30'),
  ('c1000000-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000002','Supplier Opinion Report - Infosys FY2025','approved',1,'2026-06-30'),
  ('c1000000-0000-0000-0000-000000000003','b1000000-0000-0000-0000-000000000004','Supplier Opinion Report - Reliance Industries FY2025','in_review',1,'2026-03-31'),
  ('c1000000-0000-0000-0000-000000000004','b1000000-0000-0000-0000-000000000017','Supplier Opinion Report - JSW Steel FY2025','draft',1,'2025-09-30'),
  ('c1000000-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000018','Supplier Opinion Report - Tata Steel FY2025','draft',1,'2025-09-30')
ON CONFLICT (id) DO NOTHING;
