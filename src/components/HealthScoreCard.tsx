import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
  savingsRate: number;
  budgetAdherence: number;
}

export function HealthScoreCard({ score, savingsRate, budgetAdherence }: HealthScoreCardProps) {
  const getColor = () => {
    if (score >= 80) return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600', bar: 'bg-green-500' };
    if (score >= 60) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-600', bar: 'bg-yellow-500' };
    return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600', bar: 'bg-red-500' };
  };

  const colors = getColor();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Health Score</h3>
        <TrendingUp className={colors.text} size={20} />
      </div>
      
      <div className="flex items-center gap-6 mb-6">
        <div className={`w-24 h-24 rounded-full ${colors.bg} flex items-center justify-center`}>
          <span className={`text-4xl font-bold ${colors.text}`}>{score}</span>
        </div>
        <div className="flex-1">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full ${colors.bar} transition-all duration-500`} style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {savingsRate >= 20 ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{savingsRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {budgetAdherence >= 50 ? <CheckCircle size={16} className="text-green-500" /> : <AlertCircle size={16} className="text-yellow-500" />}
            <span className="text-sm text-gray-600 dark:text-gray-400">Budget Adherence</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{budgetAdherence.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
