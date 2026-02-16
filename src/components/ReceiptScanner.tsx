import { useState } from 'react';
import { Upload, Camera } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export function ReceiptScanner({ onScan }: { onScan: (data: any) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setLoading(true);
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

      onScan(extractedData);
    } catch (error) {
      console.error('Receipt scan error:', error);
      alert('Failed to scan receipt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
      <Camera className="mx-auto mb-4 text-gray-400" size={48} />
      <p className="text-gray-600 dark:text-gray-400 mb-4">Upload receipt to auto-fill transaction</p>
      <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
        <Upload size={20} />
        {loading ? 'Scanning...' : 'Upload Receipt'}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} disabled={loading} />
      </label>
    </div>
  );
}
