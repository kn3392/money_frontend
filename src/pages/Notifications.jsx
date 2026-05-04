import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import * as notificationService from '../services/notificationService.js';
import NotificationCenter from '../components/notifications/NotificationCenter.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function Notifications() {
  const [data, setData] = useState({ items: [], unreadCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationService.listNotifications({ limit: 50 });
      setData(res);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <Link to="/dashboard" className="rounded-lg p-2 hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Notifications</h1>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {error && (
          <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {loading ? (
          <Loader2 className="mx-auto block h-10 w-10 animate-spin text-slate-400" />
        ) : data.items?.length ? (
          <NotificationCenter
            items={data.items}
            unreadCount={data.unreadCount ?? 0}
            onMarkRead={async (id) => {
              await notificationService.markRead(id);
              await load();
            }}
            onMarkAll={async () => {
              await notificationService.markAllRead();
              await load();
            }}
            onDelete={async (id) => {
              await notificationService.deleteNotification(id);
              await load();
            }}
          />
        ) : (
          <EmptyState title="No notifications yet" />
        )}
      </main>
    </div>
  );
}
