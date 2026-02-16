import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export function SpendingPrediction() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadPredictions();
  }, [user]);

  async function loadPredictions() {
    try {
      const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user?.id);
      const { data } = await axios.post('http://localhost:8080/api/predict/spending', { transactions });
      
      setPredictions(data.predictions || []);
      
      for (const pred of data.predictions || []) {
        await supabase.from('spending_predictions').insert({
          user_id: user?.id,
          month: new Date().toISOString().slice(0, 7),
          predicted_amount: pred.amount,
          category: pred.category,
          confidence: pred.confidence
        });
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
            <span className="text-sm">{pred.category}</span>
            <span className="font-semibold">₹{pred.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
