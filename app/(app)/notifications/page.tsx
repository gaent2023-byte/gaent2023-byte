'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/lib/database.types';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Notification = Database['public']['Tables']['notifications']['Row'];

export default function NotificationsPage() {
  const supabase = createBrowserClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50).then(({ data }) => {
      setNotifications((data ?? []) as Notification[]);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    load();
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length === 0) return;
    await supabase.from('notifications').update({ read: true }).in('id', unread);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${notifications.filter((n) => !n.read).length} unread`}
        actions={
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="divide-y rounded-lg border">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn('flex items-start gap-3 p-4 transition-colors hover:bg-muted/30', !n.read && 'bg-primary/5')}
            >
              <div className={cn(
                'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
                n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
              )}>
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('text-sm', n.read ? 'font-normal text-foreground' : 'font-semibold text-foreground')}>{n.title}</p>
                {n.message && <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read && (
                <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>Mark read</Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
