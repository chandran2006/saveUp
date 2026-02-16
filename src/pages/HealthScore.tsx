import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSkeleton } from '../components/States';
import { Heart, TrendingUp, CheckCircle, AlertCircle, Target } from 'lucide-react';

export function HealthScore() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) calculateScore();
  }, [user]);

  async function calculateScore() {
    try {
      const month = new Date().toISOString().slice(0, 7);
      const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user?.id);
      const { data: budget } = await supabase.from('budgets').select('*').eq('user_id', user?.id).eq('month', month).maybeSingle();

      const income = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const expense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
      const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
      const budgetAdherence = budget ? Math.max(0, 100 - ((expense / Number(budget.amount)) * 100)) : 50;
      const score = Math.round((savingsRate * 0.4) + (budgetAdherence * 0.6));
      const finalScore = Math.min(100, Math.max(0, score));

      const factors = [
        { name: 'Savings Rate', value: savingsRate, target: 20, icon: TrendingUp },
        { name: 'Budget Adherence', value: budgetAdherence, target: 50, icon: Target },
        { name: 'Income Stability', value: income > 0 ? 100 : 0, target: 100, icon: CheckCircle },
      ];

      await supabase.from('financial_scores').upsert({
        user_id: user?.id,
        month,
        score: finalScore,
        factors: { savingsRate, budgetAdherence }
      });

      setData({ score: finalScore, savingsRate, budgetAdherence, income, expense, factors });
    } catch (error) {
      console.error('Error calculating score:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardLayout title="Health Score"><LoadingSkeleton /></DashboardLayout>;

  const getColor = () => {
    if (data.score >= 80) return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600', bar: 'bg-green-500', label: 'Excellent' };
    if (data.score >= 60) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600', bar: 'bg-yellow-500', label: 'Good' };
    return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', bar: 'bg-red-500', label: 'Needs Improvement' };
  };

  const colors = getColor();

  return (
    <DashboardLayout title="Health Score">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-full ${colors.bg}`}>
              <Heart className={colors.text} size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Health Score</h2>
              <p className="text-gray-600 dark:text-gray-400">Your overall financial wellness rating</p>
            </div>
          </div>

          <div className="flex items-center gap-8 mb-6">
            <div className={`w-32 h-32 rounded-full ${colors.bg} flex items-center justify-center`}>
              <span className={`text-5xl font-bold ${colors.text}`}>{data.score}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{colors.label}</span>
                <span className={`text-sm font-medium ${colors.text}`}>{data.score}/100</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${colors.bar} transition-all duration-500`} style={{ width: `${data.score}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Income</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₹{data.income.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Expense</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">₹{data.expense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Score Breakdown</h3>
          <div className="space-y-6">
            {data.factors.map((factor: any, i: number) => {
              const Icon = factor.icon;
              const isGood = factor.value >= factor.target;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={18} className={isGood ? 'text-green-500' : 'text-yellow-500'} />
                      <span className="font-medium text-gray-900 dark:text-white">{factor.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{factor.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${isGood ? 'bg-green-500' : 'bg-yellow-500'} transition-all`} style={{ width: `${Math.min(factor.value, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Target: {factor.target}%</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-md border-2 border-emerald-200 dark:border-emerald-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {data.savingsRate < 20 && <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><AlertCircle size={16} className="text-yellow-500 mt-0.5" /> Increase your savings rate to at least 20%</li>}
            {data.budgetAdherence < 50 && <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><AlertCircle size={16} className="text-yellow-500 mt-0.5" /> Review your budget and reduce unnecessary expenses</li>}
            {data.score >= 80 && <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"><CheckCircle size={16} className="text-green-500 mt-0.5" /> Great job! Keep maintaining your financial discipline</li>}
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
