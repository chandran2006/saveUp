import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/Loading';
import { Bell, Check, Trash2, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    loadNotifications();
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user?.id).eq('read', false);
    loadNotifications();
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    loadNotifications();
  }

  async function clearAll() {
    if (!confirm('Delete all notifications?')) return;
    await supabase.from('notifications').delete().eq('user_id', user?.id);
    loadNotifications();
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <DashboardLayout title="Notifications">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-emerald-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Notifications</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{unreadCount} unread</p>
            </div>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Clear All
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notifications</h3>
            <p className="text-gray-600 dark:text-gray-400">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border ${notif.read ? 'border-gray-100 dark:border-gray-700' : 'border-emerald-200 dark:border-emerald-800'} p-4 transition-all`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${notif.type === 'daily_limit' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    {notif.type === 'daily_limit' ? <AlertCircle className="text-red-600" size={20} /> : <Info className="text-blue-600" size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{notif.title}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(notif.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                  </div>
                  <div className="flex gap-2">
                    {!notif.read && (
                      <button onClick={() => markAsRead(notif.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Mark as read">
                        <Check size={18} className="text-emerald-600" />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(notif.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
