# GSOR — Global Supplier Opinion Report & Risk Intelligence Platform

An enterprise-grade SaaS platform for searching, verifying, assessing, monitoring, and generating professional Supplier Opinion Reports with AI-assisted risk intelligence.

## Architecture

- **Frontend:** Next.js 13 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend:** Next.js Route Handlers + Supabase Edge Functions (Deno)
- **Database:** PostgreSQL (Supabase) with Row Level Security (RLS)
- **Auth:** Supabase Auth (email/password) with multi-tenant RBAC
- **AI:** Custom risk intelligence engine deployed as a Supabase Edge Function

## Database Schema

### Core (Multi-Tenant)
- `organizations` — tenant accounts (banks, NBFCs, corporates)
- `organization_members` — users with assigned roles per organization
- `audit_logs` — immutable activity log
- `industries`, `countries`, `currencies`, `risk_rating_bands` — reference data

### Supplier Master
- `suppliers` — master supplier records with full-text search (tsvector + trigram)
- `supplier_addresses`, `supplier_contacts`, `supplier_personnel`
- `supplier_business_profiles`, `supplier_products`

### Assessment Modules
- `financial_statements`, `financial_ratios` — 5-year trend data
- `banking_info`, `payment_behaviour`
- `site_verifications`, `verification_media`
- `compliance_records`, `litigation_records`
- `documents` — generic file store

### Risk & AI
- `risk_assessments` — 11 risk sub-scores + overall score + rating (AAA–CCC)
- `risk_score_history` — append-only score timeline
- `ai_opinions` — AI-generated summaries, recommendations, default probability
- `ai_alerts` — surfaced risk signals

### Reports
- `reports` — Supplier Opinion Report master with QR verification tokens
- `report_sections` — 22 editable report sections
- `report_exports` — generated export artifacts (PDF, DOCX, XLSX, HTML)

### System
- `notifications` — in-app notification center
- `searches` — recent search log

## RBAC Roles

| Role | Key Capabilities |
|------|------------------|
| Super Administrator | Full access to all features |
| Organization Administrator | Manage team, all supplier/report operations |
| Credit Analyst | Financial analysis, risk editing, report generation |
| Relationship Manager | Supplier management, report generation |
| Procurement Officer | Supplier management, verifications |
| Verification Officer | Conduct site verifications |
| Auditor | Read-only access + audit logs |
| Read-only User | View access to suppliers and reports |

## Risk Engine

The `compute_risk_score()` Postgres function averages 11 risk sub-scores:
Financial, Operational, Compliance, Business, Market, Country, Political, ESG,
Reputation, Supply Chain, and Fraud — mapping to rating bands:

| Score Range | Rating | Severity |
|-------------|--------|----------|
| 0–20 | AAA | Low |
| 21–30 | AA | Low |
| 31–40 | A | Low |
| 41–55 | BBB | Moderate |
| 56–65 | BB | Moderate |
| 66–75 | B | High |
| 76–100 | CCC | Critical |

## AI Intelligence Module

Deployed as `ai-intelligence` Edge Function. Analyzes supplier data to produce:
- Executive summary
- Default probability prediction
- Fraud indicator detection
- Recommended credit limit
- Approve/reject/review recommendation with rationale
- Risk alerts for high-severity signals

## Getting Started

1. The Supabase database is pre-provisioned with schema and demo data
2. Sign up at `/signup` to create your organization
3. The demo organization ("GSOR Demo Bank") has 12 sample suppliers with full data
4. Explore the dashboard, supplier profiles, risk assessments, and generate reports

## Demo Data

A demo organization with 12 suppliers across 9 countries and 9 industries is seeded,
including financial ratios (5-year trends), risk assessments spanning all rating bands,
compliance records, banking info, personnel, litigation, and site verifications.
