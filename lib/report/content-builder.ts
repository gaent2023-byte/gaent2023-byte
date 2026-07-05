import type { Database } from '@/lib/database.types';
import { DISCLAIMER_TEXT, type ReportSectionKey } from './sections';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type BusinessProfile = Database['public']['Tables']['supplier_business_profiles']['Row'];
type Risk = Database['public']['Tables']['risk_assessments']['Row'];
type AiOpinion = Database['public']['Tables']['ai_opinions']['Row'];
type FinancialRatio = Database['public']['Tables']['financial_ratios']['Row'];
type Personnel = Database['public']['Tables']['supplier_personnel']['Row'];
type Contact = Database['public']['Tables']['supplier_contacts']['Row'];
type Compliance = Database['public']['Tables']['compliance_records']['Row'];
type Litigation = Database['public']['Tables']['litigation_records']['Row'];
type Banking = Database['public']['Tables']['banking_info']['Row'];

export type ReportContext = {
  supplier: Supplier;
  businessProfile: BusinessProfile | null;
  risk: Risk | null;
  aiOpinion: AiOpinion | null;
  financialRatios: FinancialRatio[];
  personnel: Personnel[];
  contacts: Contact[];
  compliance: Compliance[];
  litigation: Litigation[];
  banking: Banking[];
  organizationName: string;
};

export function buildSectionContent(
  key: ReportSectionKey,
  ctx: ReportContext
): { heading: string; body: string; data?: unknown } {
  const s = ctx.supplier;
  const bp = ctx.businessProfile;
  const risk = ctx.risk;
  const ai = ctx.aiOpinion;
  const latestFin = ctx.financialRatios[ctx.financialRatios.length - 1];

  switch (key) {
    case 'cover_page':
      return {
        heading: 'Supplier Opinion Report',
        body: `Company: ${s.company_name}\nPrepared by: ${ctx.organizationName}\nDate: ${new Date().toLocaleDateString()}\nReport ID: SOR-${Date.now().toString(36).toUpperCase()}`,
      };
    case 'executive_summary':
      return {
        heading: 'Executive Summary',
        body: `${s.company_name} is a ${s.constitution?.replace(/_/g, ' ') ?? 'business'} incorporated${s.date_of_incorporation ? ` on ${new Date(s.date_of_incorporation).toLocaleDateString()}` : ''}${s.country ? ` in ${s.country}` : ''}, operating in the ${s.industry_code ?? 'unspecified'} industry. ${risk ? `The overall risk score is ${risk.overall_score}/100, rated ${risk.rating} (${risk.severity} risk).` : 'No risk assessment has been conducted.'} ${ai?.summary ?? ''}`.trim(),
      };
    case 'supplier_profile':
      return {
        heading: 'Supplier Profile',
        body: `Company Name: ${s.company_name}\nTrade Name: ${s.trade_name ?? '—'}\nConstitution: ${s.constitution ?? '—'}\nRegistration Number: ${s.registration_number ?? '—'}\nTax Number: ${s.tax_number ?? '—'}\nGST/VAT: ${s.gst_vat ?? '—'}\nPAN/TIN: ${s.pan_tin ?? '—'}\nCIN: ${s.cin ?? '—'}\nLEI: ${s.lei ?? '—'}\nDUNS: ${s.duns ?? '—'}\nIndustry: ${s.industry_code ?? '—'}\nDate of Incorporation: ${s.date_of_incorporation ?? '—'}\nYears in Business: ${s.years_in_business ?? '—'}\nEmployee Strength: ${s.employee_strength ?? '—'}`,
      };
    case 'business_overview':
      return {
        heading: 'Business Overview',
        body: bp ? `Products: ${bp.products ?? '—'}\nServices: ${bp.services ?? '—'}\nManufacturing Facilities: ${bp.manufacturing_facilities ?? '—'}\nInstalled Capacity: ${bp.installed_capacity ?? '—'}\nCapacity Utilization: ${bp.capacity_utilization != null ? bp.capacity_utilization + '%' : '—'}\nAnnual Production: ${bp.annual_production ?? '—'}\nExport Countries: ${bp.export_countries ?? '—'}\nImport Countries: ${bp.import_countries ?? '—'}\nDistribution Network: ${bp.distribution_network ?? '—'}` : 'No business profile data available.',
      };
    case 'contact_information':
      return {
        heading: 'Contact Information',
        body: `Website: ${s.website ?? '—'}\nEmail: ${s.email ?? '—'}\nPhone: ${s.phone ?? '—'}\nMobile: ${s.mobile ?? '—'}\nCountry: ${s.country ?? '—'}\nState: ${s.state ?? '—'}\nCity: ${s.city ?? '—'}`,
      };
    case 'ownership_details':
      return {
        heading: 'Ownership Details',
        body: ctx.personnel.length > 0
          ? ctx.personnel.map((p) => `${p.role.replace(/_/g, ' ')}: ${p.name}${p.designation ? ` (${p.designation})` : ''}${p.id_verified ? ' [ID Verified]' : ''}`).join('\n')
          : 'No ownership or key personnel information available.',
      };
    case 'financial_analysis':
      return {
        heading: 'Financial Analysis',
        body: latestFin
          ? `Latest Fiscal Year: ${latestFin.fiscal_year}\nRevenue: ${latestFin.revenue ?? '—'}\nEBITDA: ${latestFin.ebitda ?? '—'}\nGross Profit: ${latestFin.gross_profit ?? '—'}\nNet Profit: ${latestFin.net_profit ?? '—'}\nNet Worth: ${latestFin.net_worth ?? '—'}\nDebt: ${latestFin.debt ?? '—'}\nCurrent Ratio: ${latestFin.current_ratio ?? '—'}\nQuick Ratio: ${latestFin.quick_ratio ?? '—'}\nDebt/Equity: ${latestFin.debt_equity_ratio ?? '—'}\nInterest Coverage: ${latestFin.interest_coverage ?? '—'}\nWorking Capital: ${latestFin.working_capital ?? '—'}\nROE: ${latestFin.roe ?? '—'}\nROA: ${latestFin.roa ?? '—'}\nInventory Turnover: ${latestFin.inventory_turnover ?? '—'}\nReceivable Days: ${latestFin.receivable_days ?? '—'}\nPayable Days: ${latestFin.payable_days ?? '—'}`
          : 'No financial data available.',
        data: ctx.financialRatios,
      };
    case 'banking_information':
      return {
        heading: 'Banking Information',
        body: ctx.banking.length > 0
          ? ctx.banking.map((b) => `Bank: ${b.bank_name ?? '—'}, Facility: ${b.facility_type ?? '—'}, Exposure: ${b.existing_exposure ?? '—'}, Relationship: ${b.relationship_years ?? '—'} years, Security: ${b.security_offered ?? '—'}`).join('\n')
          : 'No banking information available.',
      };
    case 'capacity_assessment':
      return {
        heading: 'Capacity Assessment',
        body: bp ? `Installed Capacity: ${bp.installed_capacity ?? '—'}\nCurrent Utilization: ${bp.capacity_utilization != null ? bp.capacity_utilization + '%' : '—'}\nAnnual Production: ${bp.annual_production ?? '—'}\nManufacturing Facilities: ${bp.manufacturing_facilities ?? '—'}` : 'No capacity data available.',
      };
    case 'market_reputation':
      return {
        heading: 'Market Reputation',
        body: bp ? `Major Customers: ${bp.major_customers ?? '—'}\nDistribution Network: ${bp.distribution_network ?? '—'}` : 'No reputation data available.',
      };
    case 'existing_customers':
      return {
        heading: 'Existing Customers',
        body: bp?.major_customers ?? 'No customer data available.',
      };
    case 'existing_suppliers':
      return {
        heading: 'Existing Suppliers',
        body: bp?.major_suppliers ?? 'No supplier data available.',
      };
    case 'compliance_status':
      return {
        heading: 'Compliance Status',
        body: ctx.compliance.length > 0
          ? ctx.compliance.map((c) => `${c.type}: ${c.status}${c.expiry_date ? ` (expires ${new Date(c.expiry_date).toLocaleDateString()})` : ''}${c.reference_number ? ` [${c.reference_number}]` : ''}`).join('\n')
          : 'No compliance records available.',
      };
    case 'litigation_review':
      return {
        heading: 'Litigation Review',
        body: ctx.litigation.length > 0
          ? ctx.litigation.map((l) => `${l.case_type.replace(/_/g, ' ')}: ${l.case_number ?? 'No ref'} — ${l.status}${l.claim_amount ? ` (claim: ${l.claim_amount})` : ''}${l.summary ? `\n  ${l.summary}` : ''}`).join('\n')
          : 'No litigation records available.',
      };
    case 'risk_assessment':
      return {
        heading: 'Risk Assessment',
        body: risk
          ? `Overall Score: ${risk.overall_score}/100\nRating: ${risk.rating ?? '—'}\nSeverity: ${risk.severity}\n\nCategory Scores:\nFinancial: ${risk.financial_risk}\nOperational: ${risk.operational_risk}\nCompliance: ${risk.compliance_risk}\nBusiness: ${risk.business_risk}\nMarket: ${risk.market_risk}\nCountry: ${risk.country_risk}\nPolitical: ${risk.political_risk}\nESG: ${risk.esg_risk}\nReputation: ${risk.reputation_risk}\nSupply Chain: ${risk.supply_chain_risk}\nFraud: ${risk.fraud_risk}`
          : 'No risk assessment conducted.',
        data: risk,
      };
    case 'swot_analysis':
      return {
        heading: 'SWOT Analysis',
        body: `Strengths:\n- ${s.years_in_business ? `${s.years_in_business} years in business` : 'Established operations'}\n- ${bp?.installed_capacity ? `Capacity: ${bp.installed_capacity}` : 'Operational capacity'}\n\nWeaknesses:\n- ${risk && risk.overall_score > 55 ? 'Elevated risk profile' : 'Areas for improvement identified'}\n\nOpportunities:\n- ${bp?.export_countries ? `Export markets: ${bp.export_countries}` : 'Market expansion potential'}\n\nThreats:\n- ${ctx.litigation.length > 0 ? `${ctx.litigation.length} litigation case(s) pending` : 'Regulatory and market risks'}`,
      };
    case 'ai_opinion':
      return {
        heading: 'AI Opinion',
        body: ai
          ? `Summary: ${ai.summary ?? '—'}\nRecommendation: ${ai.recommendation ?? '—'}\nDefault Probability: ${ai.default_probability != null ? ai.default_probability + '%' : '—'}\nConfidence: ${ai.confidence != null ? ai.confidence + '%' : '—'}\n\nRationale: ${ai.rationale ?? '—'}`
          : 'No AI opinion has been generated for this supplier.',
      };
    case 'recommendation':
      return {
        heading: 'Recommendation',
        body: risk
          ? `Based on the overall risk score of ${risk.overall_score}/100 (${risk.rating} rating), ${risk.severity === 'low' ? 'we recommend approval with standard monitoring.' : risk.severity === 'moderate' ? 'we recommend approval with enhanced monitoring and periodic review.' : risk.severity === 'high' ? 'we recommend conditional approval with strict covenants and frequent monitoring.' : 'we recommend rejection or deferral pending remediation of identified risks.'}`
          : 'No recommendation available without a risk assessment.',
      };
    case 'credit_rating':
      return {
        heading: 'Credit Rating',
        body: risk ? `Rating: ${risk.rating ?? '—'}\nSeverity: ${risk.severity}\nScore: ${risk.overall_score}/100` : 'Not rated.',
      };
    case 'risk_score':
      return {
        heading: 'Risk Score',
        body: risk ? `Overall: ${risk.overall_score}/100\nFinancial: ${risk.financial_risk}\nOperational: ${risk.operational_risk}\nCompliance: ${risk.compliance_risk}\nBusiness: ${risk.business_risk}\nMarket: ${risk.market_risk}\nCountry: ${risk.country_risk}\nPolitical: ${risk.political_risk}\nESG: ${risk.esg_risk}\nReputation: ${risk.reputation_risk}\nSupply Chain: ${risk.supply_chain_risk}\nFraud: ${risk.fraud_risk}` : 'No risk score computed.',
      };
    case 'analyst_comments':
      return {
        heading: 'Analyst Comments',
        body: 'Analyst comments to be added during report review. This section allows the credit analyst to provide additional qualitative insights and observations not captured in the automated sections above.',
      };
    case 'disclaimer':
      return {
        heading: 'Disclaimer',
        body: DISCLAIMER_TEXT,
      };
    default:
      return { heading: key, body: '' };
  }
}
