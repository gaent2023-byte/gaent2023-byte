export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: string;
          industry: string | null;
          country: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: string;
          industry?: string | null;
          country?: string | null;
          logo_url?: string | null;
        };
        Update: Partial<OrganizationsInsert>;
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          invited_by?: string | null;
        };
        Update: Partial<OrganizationMembersInsert>;
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string | null;
          actor_user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          actor_user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json | null;
        };
        Update: Partial<AuditLogsInsert>;
      };
      industries: {
        Row: { id: string; code: string; name: string; sector: string | null };
        Insert: { id?: string; code: string; name: string; sector?: string | null };
        Update: Partial<IndustriesInsert>;
      };
      countries: {
        Row: { id: string; iso2: string; iso3: string; name: string; region: string | null };
        Insert: { id?: string; iso2: string; iso3: string; name: string; region?: string | null };
        Update: Partial<CountriesInsert>;
      };
      currencies: {
        Row: { id: string; code: string; name: string; symbol: string | null };
        Insert: { id?: string; code: string; name: string; symbol?: string | null };
        Update: Partial<CurrenciesInsert>;
      };
      risk_rating_bands: {
        Row: { id: string; min_score: number; max_score: number; rating: string; severity: string };
        Insert: { id?: string; min_score: number; max_score: number; rating: string; severity: string };
        Update: Partial<RiskRatingBandsInsert>;
      };
      suppliers: {
        Row: {
          id: string;
          organization_id: string;
          company_name: string;
          trade_name: string | null;
          constitution: string | null;
          registration_number: string | null;
          tax_number: string | null;
          gst_vat: string | null;
          pan_tin: string | null;
          cin: string | null;
          lei: string | null;
          duns: string | null;
          industry_code: string | null;
          business_category: string | null;
          date_of_incorporation: string | null;
          years_in_business: number | null;
          country: string | null;
          state: string | null;
          city: string | null;
          website: string | null;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          gps_lat: number | null;
          gps_lng: number | null;
          employee_strength: number | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string;
          company_name: string;
          trade_name?: string | null;
          constitution?: string | null;
          registration_number?: string | null;
          tax_number?: string | null;
          gst_vat?: string | null;
          pan_tin?: string | null;
          cin?: string | null;
          lei?: string | null;
          duns?: string | null;
          industry_code?: string | null;
          business_category?: string | null;
          date_of_incorporation?: string | null;
          years_in_business?: number | null;
          country?: string | null;
          state?: string | null;
          city?: string | null;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          mobile?: string | null;
          gps_lat?: number | null;
          gps_lng?: number | null;
          employee_strength?: number | null;
          status?: string;
        };
        Update: Partial<SuppliersInsert>;
      };
      supplier_addresses: {
        Row: {
          id: string;
          supplier_id: string;
          type: string;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          postal_code: string | null;
          gps_lat: number | null;
          gps_lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          type: string;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          postal_code?: string | null;
          gps_lat?: number | null;
          gps_lng?: number | null;
        };
        Update: Partial<SupplierAddressesInsert>;
      };
      supplier_contacts: {
        Row: {
          id: string;
          supplier_id: string;
          name: string | null;
          designation: string | null;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          name?: string | null;
          designation?: string | null;
          email?: string | null;
          phone?: string | null;
          mobile?: string | null;
          is_primary?: boolean;
        };
        Update: Partial<SupplierContactsInsert>;
      };
      supplier_personnel: {
        Row: {
          id: string;
          supplier_id: string;
          name: string;
          role: string;
          designation: string | null;
          photo_url: string | null;
          id_doc_url: string | null;
          id_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          name: string;
          role: string;
          designation?: string | null;
          photo_url?: string | null;
          id_doc_url?: string | null;
          id_verified?: boolean;
        };
        Update: Partial<SupplierPersonnelInsert>;
      };
      supplier_business_profiles: {
        Row: {
          id: string;
          supplier_id: string;
          products: string | null;
          services: string | null;
          manufacturing_facilities: string | null;
          installed_capacity: string | null;
          capacity_utilization: number | null;
          annual_production: string | null;
          export_countries: string | null;
          import_countries: string | null;
          distribution_network: string | null;
          major_customers: string | null;
          major_suppliers: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          products?: string | null;
          services?: string | null;
          manufacturing_facilities?: string | null;
          installed_capacity?: string | null;
          capacity_utilization?: number | null;
          annual_production?: string | null;
          export_countries?: string | null;
          import_countries?: string | null;
          distribution_network?: string | null;
          major_customers?: string | null;
          major_suppliers?: string | null;
        };
        Update: Partial<SupplierBusinessProfilesInsert>;
      };
      supplier_products: {
        Row: {
          id: string;
          supplier_id: string;
          name: string;
          category: string | null;
          type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          name: string;
          category?: string | null;
          type?: string;
          description?: string | null;
        };
        Update: Partial<SupplierProductsInsert>;
      };
      financial_statements: {
        Row: {
          id: string;
          supplier_id: string;
          fiscal_year: number;
          statement_type: string;
          source_doc_url: string | null;
          data: Json | null;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          fiscal_year: number;
          statement_type: string;
          source_doc_url?: string | null;
          data?: Json | null;
          currency?: string;
        };
        Update: Partial<FinancialStatementsInsert>;
      };
      financial_ratios: {
        Row: {
          id: string;
          supplier_id: string;
          fiscal_year: number;
          revenue: number | null;
          ebitda: number | null;
          gross_profit: number | null;
          net_profit: number | null;
          net_worth: number | null;
          debt: number | null;
          current_ratio: number | null;
          quick_ratio: number | null;
          debt_equity_ratio: number | null;
          interest_coverage: number | null;
          working_capital: number | null;
          roe: number | null;
          roa: number | null;
          inventory_turnover: number | null;
          receivable_days: number | null;
          payable_days: number | null;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          fiscal_year: number;
          revenue?: number | null;
          ebitda?: number | null;
          gross_profit?: number | null;
          net_profit?: number | null;
          net_worth?: number | null;
          debt?: number | null;
          current_ratio?: number | null;
          quick_ratio?: number | null;
          debt_equity_ratio?: number | null;
          interest_coverage?: number | null;
          working_capital?: number | null;
          roe?: number | null;
          roa?: number | null;
          inventory_turnover?: number | null;
          receivable_days?: number | null;
          payable_days?: number | null;
        };
        Update: Partial<FinancialRatiosInsert>;
      };
      banking_info: {
        Row: {
          id: string;
          supplier_id: string;
          bank_name: string | null;
          facility_type: string | null;
          working_capital: number | null;
          term_loan: number | null;
          bank_guarantees: number | null;
          letter_of_credit: number | null;
          existing_exposure: number | null;
          relationship_years: number | null;
          security_offered: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          bank_name?: string | null;
          facility_type?: string | null;
          working_capital?: number | null;
          term_loan?: number | null;
          bank_guarantees?: number | null;
          letter_of_credit?: number | null;
          existing_exposure?: number | null;
          relationship_years?: number | null;
          security_offered?: string | null;
        };
        Update: Partial<BankingInfoInsert>;
      };
      payment_behaviour: {
        Row: {
          id: string;
          supplier_id: string;
          avg_payment_delay_days: number | null;
          default_history: string | null;
          dishonoured_cheques: number | null;
          credit_history: string | null;
          vendor_feedback: string | null;
          buyer_feedback: string | null;
          rating: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          avg_payment_delay_days?: number | null;
          default_history?: string | null;
          dishonoured_cheques?: number | null;
          credit_history?: string | null;
          vendor_feedback?: string | null;
          buyer_feedback?: string | null;
          rating?: string | null;
        };
        Update: Partial<PaymentBehaviourInsert>;
      };
      site_verifications: {
        Row: {
          id: string;
          supplier_id: string;
          visit_date: string;
          surveyor_name: string | null;
          gps_lat: number | null;
          gps_lng: number | null;
          office_verified: boolean;
          factory_verified: boolean;
          warehouse_verified: boolean;
          machinery_verified: boolean;
          employee_verified: boolean;
          remarks: string | null;
          recommendations: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          visit_date: string;
          surveyor_name?: string | null;
          gps_lat?: number | null;
          gps_lng?: number | null;
          office_verified?: boolean;
          factory_verified?: boolean;
          warehouse_verified?: boolean;
          machinery_verified?: boolean;
          employee_verified?: boolean;
          remarks?: string | null;
          recommendations?: string | null;
          status?: string;
        };
        Update: Partial<SiteVerificationsInsert>;
      };
      verification_media: {
        Row: {
          id: string;
          verification_id: string;
          media_type: string;
          file_url: string;
          caption: string | null;
          gps_lat: number | null;
          gps_lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          verification_id: string;
          media_type: string;
          file_url: string;
          caption?: string | null;
          gps_lat?: number | null;
          gps_lng?: number | null;
        };
        Update: Partial<VerificationMediaInsert>;
      };
      compliance_records: {
        Row: {
          id: string;
          supplier_id: string;
          type: string;
          reference_number: string | null;
          status: string;
          issue_date: string | null;
          expiry_date: string | null;
          issuing_authority: string | null;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          type: string;
          reference_number?: string | null;
          status?: string;
          issue_date?: string | null;
          expiry_date?: string | null;
          issuing_authority?: string | null;
          remarks?: string | null;
        };
        Update: Partial<ComplianceRecordsInsert>;
      };
      litigation_records: {
        Row: {
          id: string;
          supplier_id: string;
          case_type: string;
          case_number: string | null;
          court_or_authority: string | null;
          filing_date: string | null;
          status: string;
          claim_amount: number | null;
          summary: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          case_type: string;
          case_number?: string | null;
          court_or_authority?: string | null;
          filing_date?: string | null;
          status?: string;
          claim_amount?: number | null;
          summary?: string | null;
        };
        Update: Partial<LitigationRecordsInsert>;
      };
      documents: {
        Row: {
          id: string;
          supplier_id: string | null;
          organization_id: string;
          name: string;
          file_url: string;
          file_type: string | null;
          category: string | null;
          size_bytes: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id?: string | null;
          organization_id?: string;
          name: string;
          file_url: string;
          file_type?: string | null;
          category?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
        };
        Update: Partial<DocumentsInsert>;
      };
      risk_assessments: {
        Row: {
          id: string;
          supplier_id: string;
          financial_risk: number;
          operational_risk: number;
          compliance_risk: number;
          business_risk: number;
          market_risk: number;
          country_risk: number;
          political_risk: number;
          esg_risk: number;
          reputation_risk: number;
          supply_chain_risk: number;
          fraud_risk: number;
          overall_score: number;
          rating: string | null;
          severity: string;
          assessed_by: string | null;
          assessed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          financial_risk?: number;
          operational_risk?: number;
          compliance_risk?: number;
          business_risk?: number;
          market_risk?: number;
          country_risk?: number;
          political_risk?: number;
          esg_risk?: number;
          reputation_risk?: number;
          supply_chain_risk?: number;
          fraud_risk?: number;
          overall_score?: number;
          rating?: string | null;
          severity?: string;
          assessed_by?: string | null;
        };
        Update: Partial<RiskAssessmentsInsert>;
      };
      risk_score_history: {
        Row: {
          id: string;
          supplier_id: string;
          overall_score: number;
          rating: string | null;
          severity: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          overall_score: number;
          rating?: string | null;
          severity?: string | null;
        };
        Update: Partial<RiskScoreHistoryInsert>;
      };
      ai_opinions: {
        Row: {
          id: string;
          supplier_id: string;
          summary: string | null;
          signals: Json | null;
          default_probability: number | null;
          recommended_credit_limit: number | null;
          recommendation: string | null;
          confidence: number | null;
          rationale: string | null;
          peer_comparison: Json | null;
          generated_by_model: string | null;
          generated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          summary?: string | null;
          signals?: Json | null;
          default_probability?: number | null;
          recommended_credit_limit?: number | null;
          recommendation?: string | null;
          confidence?: number | null;
          rationale?: string | null;
          peer_comparison?: Json | null;
          generated_by_model?: string | null;
        };
        Update: Partial<AiOpinionsInsert>;
      };
      ai_alerts: {
        Row: {
          id: string;
          supplier_id: string;
          alert_type: string;
          severity: string;
          title: string;
          message: string | null;
          acknowledged: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          alert_type: string;
          severity: string;
          title: string;
          message?: string | null;
          acknowledged?: boolean;
        };
        Update: Partial<AiAlertsInsert>;
      };
      reports: {
        Row: {
          id: string;
          supplier_id: string;
          title: string;
          status: string;
          version: number;
          prepared_by: string | null;
          approved_by: string | null;
          expiry_date: string | null;
          qr_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          title: string;
          status?: string;
          version?: number;
          prepared_by?: string | null;
          approved_by?: string | null;
          expiry_date?: string | null;
          qr_token?: string;
        };
        Update: Partial<ReportsInsert>;
      };
      report_sections: {
        Row: {
          id: string;
          report_id: string;
          section_key: string;
          title: string;
          order_index: number;
          content: Json | null;
          edited_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          section_key: string;
          title: string;
          order_index?: number;
          content?: Json | null;
          edited_by?: string | null;
        };
        Update: Partial<ReportSectionsInsert>;
      };
      report_exports: {
        Row: {
          id: string;
          report_id: string;
          format: string;
          file_url: string | null;
          generated_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          format: string;
          file_url?: string | null;
          generated_by?: string | null;
        };
        Update: Partial<ReportExportsInsert>;
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          type: string;
          title: string;
          message: string | null;
          related_entity_type: string | null;
          related_entity_id: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          type: string;
          title: string;
          message?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          read?: boolean;
        };
        Update: Partial<NotificationsInsert>;
      };
      searches: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          query: string;
          filters: Json | null;
          results_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          query: string;
          filters?: Json | null;
          results_count?: number;
        };
        Update: Partial<SearchesInsert>;
      };
    };
    Functions: {
      compute_risk_score: { Args: { suuid: string }; Returns: Json };
    };
  };
};

type OrganizationsInsert = Database['public']['Tables']['organizations']['Insert'];
type OrganizationMembersInsert = Database['public']['Tables']['organization_members']['Insert'];
type AuditLogsInsert = Database['public']['Tables']['audit_logs']['Insert'];
type IndustriesInsert = Database['public']['Tables']['industries']['Insert'];
type CountriesInsert = Database['public']['Tables']['countries']['Insert'];
type CurrenciesInsert = Database['public']['Tables']['currencies']['Insert'];
type RiskRatingBandsInsert = Database['public']['Tables']['risk_rating_bands']['Insert'];
type SuppliersInsert = Database['public']['Tables']['suppliers']['Insert'];
type SupplierAddressesInsert = Database['public']['Tables']['supplier_addresses']['Insert'];
type SupplierContactsInsert = Database['public']['Tables']['supplier_contacts']['Insert'];
type SupplierPersonnelInsert = Database['public']['Tables']['supplier_personnel']['Insert'];
type SupplierBusinessProfilesInsert = Database['public']['Tables']['supplier_business_profiles']['Insert'];
type SupplierProductsInsert = Database['public']['Tables']['supplier_products']['Insert'];
type FinancialStatementsInsert = Database['public']['Tables']['financial_statements']['Insert'];
type FinancialRatiosInsert = Database['public']['Tables']['financial_ratios']['Insert'];
type BankingInfoInsert = Database['public']['Tables']['banking_info']['Insert'];
type PaymentBehaviourInsert = Database['public']['Tables']['payment_behaviour']['Insert'];
type SiteVerificationsInsert = Database['public']['Tables']['site_verifications']['Insert'];
type VerificationMediaInsert = Database['public']['Tables']['verification_media']['Insert'];
type ComplianceRecordsInsert = Database['public']['Tables']['compliance_records']['Insert'];
type LitigationRecordsInsert = Database['public']['Tables']['litigation_records']['Insert'];
type DocumentsInsert = Database['public']['Tables']['documents']['Insert'];
type RiskAssessmentsInsert = Database['public']['Tables']['risk_assessments']['Insert'];
type RiskScoreHistoryInsert = Database['public']['Tables']['risk_score_history']['Insert'];
type AiOpinionsInsert = Database['public']['Tables']['ai_opinions']['Insert'];
type AiAlertsInsert = Database['public']['Tables']['ai_alerts']['Insert'];
type ReportsInsert = Database['public']['Tables']['reports']['Insert'];
type ReportSectionsInsert = Database['public']['Tables']['report_sections']['Insert'];
type ReportExportsInsert = Database['public']['Tables']['report_exports']['Insert'];
type NotificationsInsert = Database['public']['Tables']['notifications']['Insert'];
type SearchesInsert = Database['public']['Tables']['searches']['Insert'];
