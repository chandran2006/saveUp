import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  TrendingUp, 
  Bell, 
  Heart, 
  Camera, 
  MessageSquare, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../utils/translations';

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const { language } = useLanguage();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/transactions', icon: ArrowLeftRight, label: 'transactions' },
    { path: '/budget', icon: Wallet, label: 'budget' },
    { path: '/insights', icon: TrendingUp, label: 'insights' },
    { path: '/notifications', icon: Bell, label: 'notifications' },
    { path: '/health-score', icon: Heart, label: 'healthScore' },
    { path: '/receipt-scanner', icon: Camera, label: 'receiptScanner' },
    { path: '/ai-chat', icon: MessageSquare, label: 'aiAssistant' },
    { path: '/profile', icon: User, label: 'profile' },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
          SaveUp
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span>{translate(item.label, language)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={20} />
          <span>{translate('logout', language)}</span>
        </button>
      </div>
    </div>
  );
}
