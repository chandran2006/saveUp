import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/Loading';
import { Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Receipt {
  id: string;
  image_url: string;
  extracted_data: any;
  created_at: string;
}

export function ReceiptScanner() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) loadReceipts();
  }, [user]);

  async function loadReceipts() {
    setLoading(true);
    try {
      const { data } = await supabase.from('receipts').select('*').eq('user_id', user?.id).order('created_at', { ascending: false });
      setReceipts(data || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setUploading(true);
    try {
      const fileName = `${user?.id}/${Date.now()}_${file.name}`;
      const { data: uploadData } = await supabase.storage.from('receipts').upload(fileName, file);
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);

      const formData = new FormData();
      formData.append('image', file);
      const { data: extractedData } = await axios.post('http://localhost:8080/api/receipt/scan', formData);

      await supabase.from('receipts').insert({
        user_id: user?.id,
        image_url: publicUrl,
        extracted_data: extractedData
      });

      if (extractedData.amount) {
        await supabase.from('transactions').insert({
          user_id: user?.id,
          type: 'expense',
          amount: extractedData.amount,
          category: extractedData.category || 'other',
          description: extractedData.description || 'Receipt scan',
          date: extractedData.date || new Date().toISOString().split('T')[0]
        });
      }

      loadReceipts();
      alert('Receipt scanned and transaction added!');
    } catch (error) {
      console.error('Receipt scan error:', error);
      alert('Failed to scan receipt. Make sure backend is running.');
    } finally {
      setUploading(false);
    }
  }

  async function deleteReceipt(id: string) {
    if (!confirm('Delete this receipt?')) return;
    await supabase.from('receipts').delete().eq('id', id);
    loadReceipts();
  }

  return (
    <DashboardLayout title="Receipt Scanner">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
              <Camera className="text-emerald-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Scan Your Receipts</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Upload receipt images to automatically extract transaction details</p>
            
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors">
              <Upload size={20} />
              {uploading ? 'Scanning...' : 'Upload Receipt'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={uploading} />
            </label>

            {uploading && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Processing receipt...</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Receipt History</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Receipts Yet</h4>
              <p className="text-gray-600 dark:text-gray-400">Upload your first receipt to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                    <img src={receipt.image_url} alt="Receipt" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₹{receipt.extracted_data?.amount || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                          {receipt.extracted_data?.category || 'Unknown'}
                        </p>
                      </div>
                      <button onClick={() => deleteReceipt(receipt.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(receipt.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works</h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Upload a clear photo of your receipt</li>
            <li>AI extracts amount, category, and date</li>
            <li>Transaction is automatically created</li>
            <li>Receipt is saved for your records</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}
