import * as React from 'react';
import { cn } from '@/lib/utils';

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-success/10 text-success border-success/20',
  moderate: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  critical: 'bg-destructive text-destructive-foreground border-destructive',
};

const RATING_STYLES: Record<string, string> = {
  AAA: 'bg-success/10 text-success border-success/30',
  AA: 'bg-success/10 text-success border-success/30',
  A: 'bg-success/5 text-success border-success/20',
  BBB: 'bg-info/10 text-info border-info/30',
  BB: 'bg-warning/10 text-warning border-warning/30',
  B: 'bg-destructive/10 text-destructive border-destructive/20',
  CCC: 'bg-destructive text-destructive-foreground border-destructive',
};

export function RiskBadge({ severity, className }: { severity: string; className?: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.moderate;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize',
        style,
        className
      )}
    >
      {severity}
    </span>
  );
}

export function RatingChip({ rating, className }: { rating: string; className?: string }) {
  const style = RATING_STYLES[rating] ?? RATING_STYLES.BBB;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide',
        style,
        className
      )}
    >
      {rating}
    </span>
  );
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const map: Record<string, string> = {
    active: 'bg-success/10 text-success border-success/20',
    inactive: 'bg-muted text-muted-foreground border-border',
    under_review: 'bg-warning/10 text-warning border-warning/20',
    blacklisted: 'bg-destructive/10 text-destructive border-destructive/20',
    draft: 'bg-muted text-muted-foreground border-border',
    in_review: 'bg-warning/10 text-warning border-warning/20',
    approved: 'bg-success/10 text-success border-success/20',
    published: 'bg-primary/10 text-primary border-primary/20',
    expired: 'bg-destructive/10 text-destructive border-destructive/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-success/10 text-success border-success/20',
    flagged: 'bg-destructive/10 text-destructive border-destructive/20',
    compliant: 'bg-success/10 text-success border-success/20',
    non_compliant: 'bg-destructive/10 text-destructive border-destructive/20',
    open: 'bg-warning/10 text-warning border-warning/20',
    closed: 'bg-muted text-muted-foreground border-border',
    dismissed: 'bg-muted text-muted-foreground border-border',
  };
  const style = map[status] ?? 'bg-muted text-muted-foreground border-border';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        style,
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
