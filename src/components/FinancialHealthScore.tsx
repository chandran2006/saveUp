import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export function FinancialHealthScore() {
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [factors, setFactors] = useState<any>({});

  useEffect(() => {
    if (user) calculateScore();
  }, [user]);

  async function calculateScore() {
    const month = new Date().toISOString().slice(0, 7);
    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user?.id);
    const { data: budget } = await supabase.from('budgets').select('*').eq('user_id', user?.id).eq('month', month).maybeSingle();

    const income = transactions?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const expense = transactions?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    const budgetAdherence = budget ? Math.max(0, 100 - ((expense / Number(budget.amount)) * 100)) : 50;
    
    const calculatedScore = Math.round((savingsRate * 0.4) + (budgetAdherence * 0.6));
    const finalScore = Math.min(100, Math.max(0, calculatedScore));

    setScore(finalScore);
    setFactors({ savingsRate: savingsRate.toFixed(1), budgetAdherence: budgetAdherence.toFixed(1) });

    await supabase.from('financial_scores').upsert({
      user_id: user?.id,
      month,
      score: finalScore,
      factors: { savingsRate, budgetAdherence }
    });
  }

  const getColor = () => score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
  const color = getColor();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Financial Health Score</h3>
        <TrendingUp className={`text-${color}-500`} />
      </div>
      <div className="flex items-center gap-4">
        <div className={`text-5xl font-bold text-${color}-500`}>{score}</div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full bg-${color}-500`} style={{ width: `${score}%` }} />
          </div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {factors.savingsRate >= 20 ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
              <span>Savings Rate: {factors.savingsRate}%</span>
            </div>
            <div className="flex items-center gap-2">
              {factors.budgetAdherence >= 50 ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
              <span>Budget Adherence: {factors.budgetAdherence}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
