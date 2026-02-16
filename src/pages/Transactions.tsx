import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/Loading';
import { ReceiptScanner } from '../components/ReceiptScanner';
import { Plus, Pencil, Trash2, ArrowLeftRight, Filter } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const CATEGORIES = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'healthcare', 'education', 'salary', 'freelance', 'investment', 'other'];

export function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  async function loadTransactions() {
    try {
      const { data } = await supabase.from('transactions').select('*').eq('user_id', user?.id).order('date', { ascending: false });
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await supabase.from('transactions').update({
          type: formData.type,
          amount: Number(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
        }).eq('id', editingTransaction.id);
      } else {
        await supabase.from('transactions').insert([{
          user_id: user?.id,
          type: formData.type,
          amount: Number(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
        }]);
      }
      setModalOpen(false);
      setEditingTransaction(null);
      resetForm();
      loadTransactions();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await supabase.from('transactions').delete().eq('id', id);
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
    });
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  }

  function handleClose() {
    setModalOpen(false);
    setEditingTransaction(null);
    resetForm();
  }

  const filteredTransactions = transactions.filter((t) => {
    if (filterCategory && t.category !== filterCategory) return false;
    if (filterMonth && !t.date.startsWith(filterMonth)) return false;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout title="Transactions">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transactions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={20} />
            Add Transaction
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={16} className="inline mr-1" />
              Filter by Category
            </label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={16} className="inline mr-1" />
              Filter by Month
            </label>
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ArrowLeftRight size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Transactions</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your finances</p>
            <button onClick={() => setModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors">Add Transaction</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{transaction.description || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">₹{Number(transaction.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEdit(transaction)} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 mr-4">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => handleDelete(transaction.id)} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={handleClose} title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}>
          {!editingTransaction && (
            <div className="mb-6">
              <ReceiptScanner onScan={(data) => {
                if (data.amount) setFormData({ ...formData, amount: data.amount });
                if (data.category) setFormData({ ...formData, category: data.category });
                if (data.description) setFormData({ ...formData, description: data.description });
                if (data.date) setFormData({ ...formData, date: data.date });
              }} />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-300 dark:border-gray-600'}`}>Income</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-300 dark:border-gray-600'}`}>Expense</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <input type="number" required min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" rows={3} placeholder="Optional description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Save</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
