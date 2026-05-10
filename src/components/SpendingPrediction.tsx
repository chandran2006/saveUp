import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://localhost:8080/api';

interface Prediction {
  category: string;
  amount: number;
  confidence?: number;
}

function buildLocalPredictions(transactions: any[]): Prediction[] {
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const monthStr = lastMonth.toISOString().slice(0, 7);

  const byCategory: Record<string, number[]> = {};
  for (const t of transactions ?? []) {
    if (t.type !== 'expense') continue;
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(Number(t.amount));
  }

  return Object.entries(byCategory)
    .map(([category, amounts]) => ({
      category,
      amount: Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length),
      confidence: 0.7,
    }))
    .filter((p) => p.amount > 0)
    .slice(0, 5);
}

export function SpendingPrediction() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    if (user) loadPredictions();
  }, [user]);

  async function loadPredictions() {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id, type, amount, category, transaction_date')
        .eq('user_id', user?.id);

      let preds: Prediction[] = [];

      try {
        const res = await fetch(`${API_URL}/predict/spending`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions }),
        });
        if (res.ok) {
          const data = await res.json();
          preds = data.predictions ?? [];
        } else {
          preds = buildLocalPredictions(transactions);
        }
      } catch {
        preds = buildLocalPredictions(transactions);
      }

      setPredictions(preds);

      const month = new Date().toISOString().slice(0, 7);
      for (const pred of preds) {
        await supabase.from('spending_predictions').upsert(
          {
            user_id: user?.id,
            month,
            predicted_amount: pred.amount,
            category: pred.category,
            confidence: pred.confidence,
          },
          { onConflict: 'user_id,month' }
        );
      }
    } catch (error) {
      console.error('Prediction error:', error);
    }
  }

  if (predictions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="text-purple-500" />
        <h3 className="text-lg font-semibold">Next Month Predictions</h3>
      </div>
      <div className="space-y-3">
        {predictions.map((pred, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-sm capitalize">{pred.category}</span>
            <span className="font-semibold">₹{pred.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
