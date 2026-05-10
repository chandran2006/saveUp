import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/Loading';
import { Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Receipt {
  id: string;
  image_url: string;
  extracted_data: any;
  created_at: string;
}

export function ReceiptScanner() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

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
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const fileName = `${user?.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);

      // Simple extraction without backend
      const extractedData = {
        amount: 0,
        category: 'otherExpense',
        description: 'Receipt scan - ' + file.name.replace(/\.[^/.]+$/, ''),
        date: new Date().toISOString().split('T')[0]
      };

      await supabase.from('receipts').insert({
        user_id: user?.id,
        image_url: publicUrl,
        extracted_data: extractedData
      });

      loadReceipts();
      alert(t('receiptScanner.uploadSuccess'));
    } catch (error) {
      console.error('Receipt upload error:', error);
      alert(t('receiptScanner.uploadError'));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadPreview(null), 1000);
    }
  }

  async function deleteReceipt(id: string) {
    if (!confirm(t('receiptScanner.deleteConfirm'))) return;
    await supabase.from('receipts').delete().eq('id', id);
    loadReceipts();
  }

  return (
    <DashboardLayout title={t('receiptScanner.title')}>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-8">
          <div className="text-center">
            {uploadPreview ? (
              <div className="mb-6">
                <div className="relative inline-block">
                  <img src={uploadPreview} alt="Uploading" className="w-64 h-64 object-contain rounded-lg border-2 border-emerald-500" />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-2"></div>
                        <p className="font-semibold">{t('receiptScanner.uploading')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">
                  <Camera className="text-emerald-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('receiptScanner.scanTitle')}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('receiptScanner.scanSubtitle')}</p>
              </>
            )}
            
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors">
              <Upload size={20} />
              {uploading ? t('receiptScanner.uploading') : t('receiptScanner.uploadReceipt')}
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('receiptScanner.receiptHistory')}</h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('receiptScanner.noReceipts')}</h4>
              <p className="text-gray-600 dark:text-gray-400">{t('receiptScanner.noReceiptsSubtitle')}</p>
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
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{t('receiptScanner.howItWorks')}</h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>{t('receiptScanner.step1')}</li>
            <li>{t('receiptScanner.step2')}</li>
            <li>{t('receiptScanner.step3')}</li>
            <li>{t('receiptScanner.step4')}</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}
