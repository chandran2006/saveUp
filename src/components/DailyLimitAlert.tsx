import { useEffect, useState } from 'react';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function DailyLimitAlert() {
  const { user } = useAuth();
  const [limit, setLimit] = useState<number>(0);
  const [spent, setSpent] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (user) checkLimit();
  }, [user]);

  async function checkLimit() {
    const { data: limitData } = await supabase.from('daily_limits').select('*').eq('user_id', user?.id).eq('active', true).maybeSingle();
    
    const today = new Date().toISOString().split('T')[0];
    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user?.id).eq('date', today).eq('type', 'expense');
    
    const todaySpent = transactions?.reduce((s, t) => s + Number(t.amount), 0) || 0;
    
    if (limitData) {
      setLimit(Number(limitData.limit_amount));
      setSpent(todaySpent);
      if (todaySpent >= Number(limitData.limit_amount) * 0.8) {
        setShowAlert(true);
        await supabase.from('notifications').insert({
          user_id: user?.id,
          type: 'daily_limit',
          title: 'Daily Limit Alert',
          message: `You've spent ₹${todaySpent} of your ₹${limitData.limit_amount} daily limit`
        });
      }
    }
  }

  if (!showAlert) return null;

  const percentage = (spent / limit) * 100;

  return (
    <div className={`p-4 rounded-lg border ${percentage >= 100 ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'}`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={percentage >= 100 ? 'text-red-500' : 'text-yellow-500'} />
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Daily Spending Alert</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">₹{spent} / ₹{limit} ({percentage.toFixed(0)}%)</p>
        </div>
      </div>
    </div>
  );
}
