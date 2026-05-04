import { Bell, Check, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function NotificationCenter({
  items,
  unreadCount: unread,
  onMarkRead,
  onMarkAll,
  onDelete,
}) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-800">
          <Bell className="h-5 w-5" />
          <span className="font-semibold">{t('notifications')}</span>
          {unread > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
              {unread}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onMarkAll}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          Mark all read
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((n) => (
          <li
            key={n._id}
            className={`flex gap-3 rounded-xl border p-4 shadow-sm ${
              n.isRead ? 'border-slate-200 bg-white' : 'border-emerald-200 bg-emerald-50/40'
            }`}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{n.title}</p>
              <p className="text-sm text-slate-600">{n.message}</p>
              <p className="mt-1 text-xs text-slate-400">
                {n.type} · {n.priority} · {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => onMarkRead(n._id)}
                  className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-100"
                  title="Mark read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(n._id)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
