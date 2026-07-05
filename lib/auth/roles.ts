export type Role =
  | 'super_admin'
  | 'org_admin'
  | 'credit_analyst'
  | 'relationship_manager'
  | 'procurement_officer'
  | 'verification_officer'
  | 'auditor'
  | 'read_only';

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Administrator',
  org_admin: 'Organization Administrator',
  credit_analyst: 'Credit Analyst',
  relationship_manager: 'Relationship Manager',
  procurement_officer: 'Procurement Officer',
  verification_officer: 'Verification Officer',
  auditor: 'Auditor',
  read_only: 'Read-only User',
};

export type Permission =
  | 'view_dashboard'
  | 'view_suppliers'
  | 'create_supplier'
  | 'edit_supplier'
  | 'delete_supplier'
  | 'view_financials'
  | 'edit_financials'
  | 'view_verification'
  | 'conduct_verification'
  | 'view_risk'
  | 'edit_risk'
  | 'view_ai'
  | 'generate_report'
  | 'edit_report'
  | 'approve_report'
  | 'export_report'
  | 'manage_users'
  | 'view_audit'
  | 'manage_org';

const ALL: Permission[] = [
  'view_dashboard', 'view_suppliers', 'create_supplier', 'edit_supplier', 'delete_supplier',
  'view_financials', 'edit_financials', 'view_verification', 'conduct_verification',
  'view_risk', 'edit_risk', 'view_ai', 'generate_report', 'edit_report', 'approve_report',
  'export_report', 'manage_users', 'view_audit', 'manage_org',
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ALL,
  org_admin: ALL.filter((p) => p !== 'manage_org' ? true : true),
  credit_analyst: ['view_dashboard', 'view_suppliers', 'create_supplier', 'edit_supplier', 'view_financials', 'edit_financials', 'view_verification', 'view_risk', 'edit_risk', 'view_ai', 'generate_report', 'edit_report', 'export_report', 'view_audit'],
  relationship_manager: ['view_dashboard', 'view_suppliers', 'create_supplier', 'edit_supplier', 'view_financials', 'view_verification', 'view_risk', 'view_ai', 'generate_report', 'edit_report', 'export_report'],
  procurement_officer: ['view_dashboard', 'view_suppliers', 'create_supplier', 'edit_supplier', 'view_verification', 'view_risk', 'view_ai', 'generate_report', 'export_report'],
  verification_officer: ['view_dashboard', 'view_suppliers', 'edit_supplier', 'view_verification', 'conduct_verification', 'view_risk', 'generate_report', 'export_report'],
  auditor: ['view_dashboard', 'view_suppliers', 'view_financials', 'view_verification', 'view_risk', 'view_ai', 'generate_report', 'export_report', 'view_audit'],
  read_only: ['view_dashboard', 'view_suppliers', 'view_financials', 'view_verification', 'view_risk', 'view_ai', 'generate_report', 'export_report'],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canManageUsers(role: Role | undefined): boolean {
  return role === 'super_admin' || role === 'org_admin';
}
