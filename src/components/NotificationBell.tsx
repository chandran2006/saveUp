import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications(data || []);
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    loadNotifications();
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)} className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">No notifications</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <h4 className="font-semibold text-sm">{n.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
