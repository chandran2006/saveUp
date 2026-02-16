import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/Loading';
import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';
import { t } from '../utils/translations';

interface Budget {
  id: string;
  month: string;
  amount: number;
}

export function Budget() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currentSpending, setCurrentSpending] = useState(0);
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const { data: budgetData } = await supabase.from('budgets').select('*').eq('user_id', user?.id).eq('month', currentMonth).maybeSingle();
      
      const startDate = `${currentMonth}-01`;
      const endDate = getNextMonth(currentMonth);
      
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lt('date', endDate);
      
      const spending = transactionsData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      setBudget(budgetData);
      setBudgetAmount(budgetData?.amount.toString() || '');
      setCurrentSpending(spending);

      if (budgetData && spending > Number(budgetData.amount)) {
        const exceeded = spending - Number(budgetData.amount);
        const { data: existingNotif } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user?.id)
          .eq('type', 'budget_exceeded')
          .eq('read', false)
          .single();
        
        if (!existingNotif) {
          await supabase.from('notifications').insert({
            user_id: user?.id,
            type: 'budget_exceeded',
            title: 'Budget Exceeded',
            message: `You have exceeded your monthly budget by ₹${exceeded.toLocaleString()}. Consider reviewing your expenses.`,
            read: false
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getNextMonth(month: string) {
    const date = new Date(month + '-01');
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().slice(0, 7) + '-01';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const amount = Number(budgetAmount);
      if (amount <= 0) return;
      if (budget) {
        await supabase.from('budgets').update({ amount }).eq('id', budget.id);
      } else {
        await supabase.from('budgets').insert([{ user_id: user?.id, month: currentMonth, amount }]);
      }
      loadData();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  }

  const budgetValue = budget?.amount || 0;
  const remaining = budgetValue - currentSpending;
  const percentage = budgetValue > 0 ? (currentSpending / budgetValue) * 100 : 0;
  const isExceeded = currentSpending > budgetValue;
  const isWarning = percentage > 70 && !isExceeded;

  if (loading) {
    return (
      <DashboardLayout title={t('budget', language)}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('budget', language)}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('monthlyBudget', language)}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{budgetValue.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <Wallet size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('currentSpending', language)}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{currentSpending.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <TrendingDown size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('remaining', language)}</p>
                <h3 className={`text-2xl font-bold ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>₹{remaining.toLocaleString()}</h3>
              </div>
              <div className={`p-3 rounded-xl ${isExceeded ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'}`}>
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        {isExceeded && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100">{t('budgetExceeded', language)}</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">You have exceeded your monthly budget by ₹{Math.abs(remaining).toLocaleString()}. Consider reviewing your expenses.</p>
              </div>
            </div>
          </div>
        )}

        {isWarning && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={24} />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">{t('budgetWarning', language)}</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">You have used {percentage.toFixed(0)}% of your monthly budget. Be mindful of your spending.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">{t('setBudget', language)}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget Amount for {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</label>
              <input type="number" required min="0" step="0.01" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" placeholder="Enter budget amount" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors">{budget ? t('update', language) : t('setBudget', language)}</button>
          </form>
        </div>

        {budgetValue > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Budget Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">₹{currentSpending.toLocaleString()} / ₹{budgetValue.toLocaleString()}</span>
                <span className={`font-semibold ${isExceeded ? 'text-red-600 dark:text-red-400' : percentage > 70 ? 'text-yellow-600 dark:text-yellow-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{Math.min(percentage, 100).toFixed(0)}%</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${isExceeded ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('budgetUsed', language)}</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">₹{currentSpending.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('budgetLeft', language)}</p>
                  <p className={`text-lg font-bold ${isExceeded ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>₹{Math.max(remaining, 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
