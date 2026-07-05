'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { hasPermission } from '@/lib/auth/roles';
import type { Permission } from '@/lib/auth/roles';
import {
  LayoutDashboard,
  Building2,
  FileText,
  ShieldCheck,
  Bell,
  Users,
  Search,
  Scale,
  BarChart3,
  Settings,
  FileSearch,
} from 'lucide-react';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
      { label: 'Search Suppliers', href: '/search', icon: Search, permission: 'view_suppliers' },
    ],
  },
  {
    label: 'Suppliers',
    items: [
      { label: 'Supplier Master', href: '/suppliers', icon: Building2, permission: 'view_suppliers' },
      { label: 'Verifications', href: '/verifications', icon: ShieldCheck, permission: 'view_verification' },
      { label: 'Risk Assessments', href: '/risk', icon: Scale, permission: 'view_risk' },
    ],
  },
  {
    label: 'Reports',
    items: [
      { label: 'Opinion Reports', href: '/reports', icon: FileText, permission: 'generate_report' },
      { label: 'AI Intelligence', href: '/ai', icon: BarChart3, permission: 'view_ai' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Team & Roles', href: '/team', icon: Users, permission: 'manage_users' },
      { label: 'Audit Logs', href: '/audit', icon: FileSearch, permission: 'view_audit' },
      { label: 'Settings', href: '/settings', icon: Settings, permission: 'manage_org' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { membership } = useAuth();
  const role = membership?.role;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Scale className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">GSOR</p>
          <p className="truncate text-[10px] text-muted-foreground">Risk Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.permission || hasPermission(role, item.permission));
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Link
          href="/notifications"
          className={cn(
            'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
            pathname?.startsWith('/notifications')
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </Link>
      </div>
    </aside>
  );
}
