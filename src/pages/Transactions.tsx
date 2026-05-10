import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { Modal } from '../components/Modal';
import { LoadingSpinner } from '../components/Loading';
import { ReceiptScanner } from '../components/ReceiptScanner';
import { Plus, Pencil, Trash2, ArrowLeftRight, Filter, Download } from 'lucide-react';
import { t } from '../utils/translations';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
}

const INCOME_CATEGORIES = ['salary', 'businessIncome', 'freelanceIncome', 'rentalIncome', 'interestIncome', 'investmentIncome', 'bonus', 'commission', 'pension', 'giftReceived', 'refund', 'otherIncome'];
const EXPENSE_CATEGORIES = ['rent', 'bill', 'groceries', 'food', 'transport', 'education', 'medical', 'shopping', 'entertainment', 'loanEmi', 'insurance', 'tax', 'donation', 'maintenance', 'snacks', 'stationery', 'otherExpense'];

export function Transactions() {
  const { user } = useAuth();
  const { language } = useLanguage();
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
    transaction_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) loadTransactions();
  }, [user]);

  async function loadTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error?.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) { alert('Not logged in'); return; }
    try {
      const amountValue = Math.round(parseFloat(formData.amount));
      if (editingTransaction) {
        const { error } = await supabase.from('transactions').update({
          type: formData.type,
          amount: amountValue,
          category: formData.category,
          description: formData.description,
          transaction_date: formData.transaction_date,
        }).eq('id', editingTransaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([{
          user_id: user.id,
          type: formData.type,
          amount: amountValue,
          category: formData.category,
          description: formData.description,
          transaction_date: formData.transaction_date,
        }]);
        if (error) throw error;
      }
      setModalOpen(false);
      setEditingTransaction(null);
      resetForm();
      loadTransactions();
    } catch (error: any) {
      alert(error?.message ?? 'Error saving transaction');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t('deleteConfirm', language))) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      loadTransactions();
    } catch (error: any) {
      alert(error?.message ?? 'Error deleting transaction');
    }
  }

  function handleEdit(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      transaction_date: transaction.transaction_date,
    });
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0],
    });
  }

  function handleClose() {
    setModalOpen(false);
    setEditingTransaction(null);
    resetForm();
  }

  function exportToCSV() {
    const sanitize = (val: string | number) => {
      const str = String(val);
      const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = filteredTransactions.map((tx) => [
      sanitize(tx.transaction_date),
      sanitize(tx.type),
      sanitize(tx.category),
      sanitize(tx.description || ''),
      sanitize(tx.amount),
    ]);
    const csv = [headers.map(sanitize), ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredTransactions = transactions.filter((trans) => {
    if (filterCategory && trans.category !== filterCategory) return false;
    if (filterMonth && !trans.transaction_date.startsWith(filterMonth)) return false;
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout title={t('transactions', language)}>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t('transactions', language)}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Plus size={20} />
            {t('addTransaction', language)}
          </button>
          {filteredTransactions.length > 0 && (
            <button onClick={exportToCSV} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Download size={20} />
              Export CSV
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={16} className="inline mr-1" />
              {t('filterByCategory', language)}
            </label>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
              <option value="">{t('allCategories', language)}</option>
              {[...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((cat) => (
                <option key={cat} value={cat}>{t(cat, language)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Filter size={16} className="inline mr-1" />
              {t('filterByMonth', language)}
            </label>
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <ArrowLeftRight size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noData', language)}</h3>
            <button onClick={() => setModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors">{t('addTransaction', language)}</button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('date', language)}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('type', language)}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('category', language)}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('description', language)}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('amount', language)}</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                          {t(transaction.type, language)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t(transaction.category, language)}</td>
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

        <Modal isOpen={modalOpen} onClose={handleClose} title={editingTransaction ? t('editTransaction', language) : t('addTransaction', language)}>
          {!editingTransaction && (
            <div className="mb-6">
              <ReceiptScanner onScan={(data) => {
                if (data.amount) setFormData({ ...formData, amount: data.amount });
                if (data.category) setFormData({ ...formData, category: data.category });
                if (data.description) setFormData({ ...formData, description: data.description });
                if (data.date) setFormData({ ...formData, transaction_date: data.date });
              }} />
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('type', language)}</label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'income' })} className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.type === 'income' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-300 dark:border-gray-600'}`}>{t('income', language)}</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'expense' })} className={`py-2 px-4 rounded-lg border-2 transition-all ${formData.type === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-gray-300 dark:border-gray-600'}`}>{t('expense', language)}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('amount', language)}</label>
              <input type="number" required min="0" step="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('category', language)}</label>
              <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500">
                <option value="">Select category</option>
                {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>{t(cat, language)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('description', language)}</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" rows={3} placeholder="Optional description" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('date', language)}</label>
              <input type="date" required value={formData.transaction_date} onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{t('cancel', language)}</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">{t('save', language)}</button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
