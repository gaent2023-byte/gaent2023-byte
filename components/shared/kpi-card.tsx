import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type KpiCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; direction: 'up' | 'down' | 'flat' };
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
};

const toneStyles: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
  info: 'text-info',
};

const toneBg: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'bg-primary/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  danger: 'bg-destructive/10',
  info: 'bg-info/10',
};

export function KpiCard({ label, value, icon, trend, tone = 'default', className }: KpiCardProps) {
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend?.direction === 'up'
      ? 'text-success'
      : trend?.direction === 'down'
      ? 'text-destructive'
      : 'text-muted-foreground';

  return (
    <Card className={cn('relative overflow-hidden transition-shadow hover:shadow-md', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {value}
            </p>
            {trend && (
              <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trendColor)}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-lg', toneBg[tone], toneStyles[tone])}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
