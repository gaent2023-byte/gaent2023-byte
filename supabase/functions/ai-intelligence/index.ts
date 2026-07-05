import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SupplierRow {
  id: string;
  organization_id: string;
  company_name: string;
  trade_name: string | null;
  constitution: string | null;
  industry_code: string | null;
  country: string | null;
  years_in_business: number | null;
  employee_strength: number | null;
  status: string;
}

interface RiskRow {
  overall_score: number;
  rating: string | null;
  severity: string;
  financial_risk: number;
  operational_risk: number;
  compliance_risk: number;
  fraud_risk: number;
}

interface FinancialRatio {
  fiscal_year: number;
  revenue: number | null;
  ebitda: number | null;
  net_profit: number | null;
  current_ratio: number | null;
  debt_equity_ratio: number | null;
  interest_coverage: number | null;
  roe: number | null;
}

interface ComplianceRow {
  status: string;
  expiry_date: string | null;
}

interface LitigationRow {
  case_type: string;
  status: string;
  claim_amount: number | null;
}

function calcDefaultProbability(risk: RiskRow | null, litigationCount: number, complianceIssues: number): number {
  let base = 5;
  if (risk) {
    base += (risk.overall_score - 30) * 0.6;
    base += risk.financial_risk * 0.15;
    base += risk.fraud_risk * 0.1;
  }
  base += litigationCount * 3;
  base += complianceIssues * 2;
  return Math.min(95, Math.max(1, Math.round(base)));
}

function calcCreditLimit(risk: RiskRow | null, latestFin: FinancialRatio | undefined): number {
  if (!latestFin || latestFin.revenue == null) return 0;
  const baseLimit = latestFin.revenue * 0.15;
  if (!risk) return Math.round(baseLimit);
  const factor = Math.max(0.1, (100 - risk.overall_score) / 100);
  return Math.round(baseLimit * factor);
}

function generateSummary(supplier: SupplierRow, risk: RiskRow | null, defaultProb: number, litigationCount: number): string {
  const parts: string[] = [];
  parts.push(`${supplier.company_name} is a ${supplier.constitution ?? 'business'}${supplier.country ? ` based in ${supplier.country}` : ''} operating in the ${supplier.industry_code ?? 'general'} sector${supplier.years_in_business ? ` with ${supplier.years_in_business} years in business` : ''}.`);
  if (risk) {
    parts.push(`The overall risk score of ${risk.overall_score}/100 indicates ${risk.severity} risk, rated ${risk.rating}.`);
  }
  parts.push(`The estimated 12-month default probability is ${defaultProb}%.`);
  if (litigationCount > 0) {
    parts.push(`${litigationCount} litigation case${litigationCount > 1 ? 's' : ''} on record require monitoring.`);
  }
  return parts.join(' ');
}

function detectSignals(risk: RiskRow | null, ratios: FinancialRatio[], compliance: ComplianceRow[], litigation: LitigationRow[]): Array<{ type: string; severity: string; title: string }> {
  const signals: Array<{ type: string; severity: string; title: string }> = [];

  if (risk) {
    if (risk.financial_risk > 65) signals.push({ type: 'financial_deterioration', severity: 'high', title: 'Elevated financial risk detected' });
    if (risk.fraud_risk > 70) signals.push({ type: 'fraud_indicator', severity: 'critical', title: 'High fraud risk indicators present' });
    if (risk.compliance_risk > 60) signals.push({ type: 'compliance_risk', severity: 'moderate', title: 'Compliance concerns identified' });
  }

  if (ratios.length >= 2) {
    const latest = ratios[ratios.length - 1];
    const prev = ratios[ratios.length - 2];
    if (latest.revenue != null && prev.revenue != null && latest.revenue < prev.revenue * 0.9) {
      signals.push({ type: 'revenue_decline', severity: 'high', title: 'Revenue declined year-over-year' });
    }
    if (latest.current_ratio != null && latest.current_ratio < 1) {
      signals.push({ type: 'liquidity_risk', severity: 'high', title: 'Current ratio below 1.0 — liquidity risk' });
    }
    if (latest.interest_coverage != null && latest.interest_coverage < 1.5) {
      signals.push({ type: 'interest_coverage', severity: 'moderate', title: 'Low interest coverage ratio' });
    }
  }

  const expired = compliance.filter((c) => c.status === 'expired' || (c.expiry_date && new Date(c.expiry_date) < new Date()));
  if (expired.length > 0) {
    signals.push({ type: 'expired_compliance', severity: 'moderate', title: `${expired.length} expired compliance document(s)` });
  }

  const openLitigation = litigation.filter((l) => l.status === 'open' || l.status === 'pending');
  if (openLitigation.length > 2) {
    signals.push({ type: 'litigation_cluster', severity: 'high', title: `${openLitigation.length} open litigation cases` });
  }

  return signals;
}

function recommend(defaultProb: number, risk: RiskRow | null, litigationCount: number): { recommendation: string; rationale: string } {
  if (!risk) {
    return { recommendation: 'review', rationale: 'Insufficient risk assessment data to make an automated recommendation. Manual review required.' };
  }
  if (risk.severity === 'critical' || defaultProb > 60) {
    return { recommendation: 'reject', rationale: `Overall risk score of ${risk.overall_score}/100 and ${defaultProb}% default probability exceed acceptable thresholds. Recommend rejection or deferral pending remediation.` };
  }
  if (risk.severity === 'high' || defaultProb > 35) {
    return { recommendation: 'review', rationale: `Elevated risk profile (${risk.overall_score}/100, ${defaultProb}% default probability${litigationCount > 0 ? `, ${litigationCount} litigation cases` : ''}). Recommend manual review with enhanced monitoring if approved.` };
  }
  return { recommendation: 'approve', rationale: `Risk score of ${risk.overall_score}/100 (${risk.rating}) and ${defaultProb}% default probability are within acceptable range. Recommend approval with standard monitoring.` };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { supplierId } = await req.json();
    if (!supplierId) {
      return new Response(JSON.stringify({ success: false, error: "supplierId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: supplier } = await supabase
      .from("suppliers").select("*").eq("id", supplierId).maybeSingle() as { data: SupplierRow | null };

    if (!supplier) {
      return new Response(JSON.stringify({ success: false, error: "Supplier not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: risk } = await supabase
      .from("risk_assessments").select("*").eq("supplier_id", supplierId).maybeSingle() as { data: RiskRow | null };

    const { data: ratios } = await supabase
      .from("financial_ratios").select("*").eq("supplier_id", supplierId).order("fiscal_year") as { data: FinancialRatio[] | null };

    const { data: compliance } = await supabase
      .from("compliance_records").select("*").eq("supplier_id", supplierId) as { data: ComplianceRow[] | null };

    const { data: litigation } = await supabase
      .from("litigation_records").select("*").eq("supplier_id", supplierId) as { data: LitigationRow[] | null };

    const finRatios = ratios ?? [];
    const compRecords = compliance ?? [];
    const litRecords = litigation ?? [];
    const complianceIssues = compRecords.filter((c) => c.status === 'non_compliant' || c.status === 'expired').length;
    const litigationCount = litRecords.filter((l) => l.status === 'open' || l.status === 'pending').length;

    const defaultProb = calcDefaultProbability(risk, litigationCount, complianceIssues);
    const creditLimit = calcCreditLimit(risk, finRatios[finRatios.length - 1]);
    const signals = detectSignals(risk, finRatios, compRecords, litRecords);
    const summary = generateSummary(supplier, risk, defaultProb, litigationCount);
    const { recommendation, rationale } = recommend(defaultProb, risk, litigationCount);

    const confidence = Math.min(95, 40 + (risk ? 25 : 0) + (finRatios.length > 0 ? 20 : 0) + (compRecords.length > 0 ? 10 : 0));

    const opinionRecord = {
      supplier_id: supplierId,
      summary,
      signals: signals as never,
      default_probability: defaultProb,
      recommended_credit_limit: creditLimit,
      recommendation,
      confidence,
      rationale,
      peer_comparison: { industry: supplier.industry_code, country: supplier.country } as never,
      generated_by_model: "gsor-engine-v1",
    };

    const { error: insertErr } = await supabase.from("ai_opinions").insert(opinionRecord);
    if (insertErr) throw insertErr;

    for (const sig of signals.filter((s) => s.severity === 'high' || s.severity === 'critical')) {
      await supabase.from("ai_alerts").insert({
        supplier_id: supplierId,
        alert_type: sig.type,
        severity: sig.severity,
        title: sig.title,
        message: `AI Intelligence Module detected: ${sig.title} for ${supplier.company_name}`,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      opinion: {
        summary,
        default_probability: defaultProb,
        recommended_credit_limit: creditLimit,
        recommendation,
        confidence,
        rationale,
        signals,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
