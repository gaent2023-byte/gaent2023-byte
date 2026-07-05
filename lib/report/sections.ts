export type ReportSectionKey =
  | 'cover_page' | 'executive_summary' | 'supplier_profile' | 'business_overview'
  | 'contact_information' | 'ownership_details' | 'financial_analysis' | 'banking_information'
  | 'capacity_assessment' | 'market_reputation' | 'existing_customers' | 'existing_suppliers'
  | 'compliance_status' | 'litigation_review' | 'risk_assessment' | 'swot_analysis'
  | 'ai_opinion' | 'recommendation' | 'credit_rating' | 'risk_score'
  | 'analyst_comments' | 'disclaimer';

export const REPORT_SECTIONS: { key: ReportSectionKey; title: string; order: number }[] = [
  { key: 'cover_page', title: 'Cover Page', order: 1 },
  { key: 'executive_summary', title: 'Executive Summary', order: 2 },
  { key: 'supplier_profile', title: 'Supplier Profile', order: 3 },
  { key: 'business_overview', title: 'Business Overview', order: 4 },
  { key: 'contact_information', title: 'Contact Information', order: 5 },
  { key: 'ownership_details', title: 'Ownership Details', order: 6 },
  { key: 'financial_analysis', title: 'Financial Analysis', order: 7 },
  { key: 'banking_information', title: 'Banking Information', order: 8 },
  { key: 'capacity_assessment', title: 'Capacity Assessment', order: 9 },
  { key: 'market_reputation', title: 'Market Reputation', order: 10 },
  { key: 'existing_customers', title: 'Existing Customers', order: 11 },
  { key: 'existing_suppliers', title: 'Existing Suppliers', order: 12 },
  { key: 'compliance_status', title: 'Compliance Status', order: 13 },
  { key: 'litigation_review', title: 'Litigation Review', order: 14 },
  { key: 'risk_assessment', title: 'Risk Assessment', order: 15 },
  { key: 'swot_analysis', title: 'SWOT Analysis', order: 16 },
  { key: 'ai_opinion', title: 'AI Opinion', order: 17 },
  { key: 'recommendation', title: 'Recommendation', order: 18 },
  { key: 'credit_rating', title: 'Credit Rating', order: 19 },
  { key: 'risk_score', title: 'Risk Score', order: 20 },
  { key: 'analyst_comments', title: 'Analyst Comments', order: 21 },
  { key: 'disclaimer', title: 'Disclaimer', order: 22 },
];

export const DISCLAIMER_TEXT =
  'This Supplier Opinion Report (SOR) has been prepared by GSOR based on information available from public sources, documents provided by the supplier, and independent verification conducted at the time of assessment. The opinions, ratings, and recommendations expressed herein are based on the data available as of the date of this report and are subject to change. GSOR does not guarantee the accuracy, completeness, or reliability of the information provided and shall not be liable for any decisions made based on this report. This report is confidential and intended solely for the use of the requesting organization. It may not be reproduced, distributed, or shared with third parties without express written consent.';
