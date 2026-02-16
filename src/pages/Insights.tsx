import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSkeleton } from '../components/States';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Insights() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user?.id);
      
      const monthlyTrend = transactions?.reduce((acc: any, t) => {
        const month = t.date.slice(0, 7);
        if (!acc[month]) acc[month] = { income: 0, expense: 0 };
        acc[month][t.type] += Number(t.amount);
        return acc;
      }, {});

      const trendData = Object.entries(monthlyTrend || {}).map(([month, data]: any) => ({
        month,
        income: data.income,
        expense: data.expense,
        savings: data.income - data.expense
      })).sort((a, b) => a.month.localeCompare(b.month));

      const avgIncome = trendData.reduce((s, d) => s + d.income, 0) / trendData.length || 0;
      const avgExpense = trendData.reduce((s, d) => s + d.expense, 0) / trendData.length || 0;
      const avgSavings = avgIncome - avgExpense;

      const topCategories = transactions?.filter(t => t.type === 'expense').reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});

      const categoryList = Object.entries(topCategories || {})
        .map(([name, amount]) => ({ name, amount }))
        .sort((a: any, b: any) => b.amount - a.amount)
        .slice(0, 5);

      setData({ trendData, avgIncome, avgExpense, avgSavings, categoryList });
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardLayout title="Insights"><LoadingSkeleton /></DashboardLayout>;

  return (
    <DashboardLayout title="Insights">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Income</span>
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{data?.avgIncome.toLocaleString()}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Expense</span>
              <TrendingDown className="text-red-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{data?.avgExpense.toLocaleString()}</h3>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Savings</span>
              <DollarSign className="text-emerald-500" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{data?.avgSavings.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Savings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top 5 Expense Categories</h3>
          <div className="space-y-4">
            {data?.categoryList.map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300 capitalize">{cat.name}</span>
                <span className="font-semibold text-gray-900 dark:text-white">₹{cat.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
