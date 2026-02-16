import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { SummaryCard } from '../components/SummaryCard';
import { ProgressBar } from '../components/ProgressBar';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { LoadingSkeleton, ErrorState, EmptyState } from '../components/States';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function PremiumDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [transactionsRes, budgetRes] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user?.id).order('date', { ascending: false }),
        supabase.from('budgets').select('*').eq('user_id', user?.id).eq('month', new Date().toISOString().slice(0, 7)).maybeSingle()
      ]);

      const transactions = transactionsRes.data || [];
      const budget = budgetRes.data;

      const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      const remainingBalance = totalIncome - totalExpense;

      const categoryData = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});

      const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

      const monthlyData = transactions.reduce((acc: any, t) => {
        const month = t.date.slice(0, 7);
        if (!acc[month]) acc[month] = { income: 0, expense: 0 };
        acc[month][t.type] += Number(t.amount);
        return acc;
      }, {});

      const barData = Object.entries(monthlyData)
        .map(([month, data]: any) => ({ month, income: data.income, expense: data.expense }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
      const budgetAdherence = budget ? Math.max(0, 100 - ((totalExpense / Number(budget.amount)) * 100)) : 50;
      const healthScore = Math.round((savingsRate * 0.4) + (budgetAdherence * 0.6));

      setData({
        totalIncome,
        totalExpense,
        remainingBalance,
        budget,
        pieData,
        barData,
        healthScore: Math.min(100, Math.max(0, healthScore)),
        savingsRate,
        budgetAdherence
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <DashboardLayout title="Dashboard"><LoadingSkeleton /></DashboardLayout>;
  if (error) return <DashboardLayout title="Dashboard"><ErrorState message={error} /></DashboardLayout>;
  if (!data) return <DashboardLayout title="Dashboard"><EmptyState title="No Data" description="Start adding transactions to see your dashboard" /></DashboardLayout>;

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Income"
            value={`₹${data.totalIncome.toLocaleString()}`}
            icon={<TrendingUp size={24} />}
            trend="up"
            color="emerald"
          />
          <SummaryCard
            title="Total Expense"
            value={`₹${data.totalExpense.toLocaleString()}`}
            icon={<TrendingDown size={24} />}
            trend="down"
            color="red"
          />
          <SummaryCard
            title="Remaining Balance"
            value={`₹${data.remainingBalance.toLocaleString()}`}
            icon={<Wallet size={24} />}
            color="blue"
          />
        </div>

        {/* Budget Progress */}
        {data.budget && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Budget Progress</h3>
            <ProgressBar current={data.totalExpense} total={Number(data.budget.amount)} />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category-wise Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Category-wise Expenses</h3>
            {data.pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.pieData} cx="50%" cy="50%" labelLine={false} label={(e) => `${e.name}: ₹${e.value}`} outerRadius={80} dataKey="value">
                    {data.pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-20">No data</p>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Trend</h3>
            {data.barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-20">No data</p>
            )}
          </div>

          {/* Financial Health Score */}
          <HealthScoreCard
            score={data.healthScore}
            savingsRate={data.savingsRate}
            budgetAdherence={data.budgetAdherence}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
