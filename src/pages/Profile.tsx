import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { LoadingSpinner } from '../components/Loading';
import { User, Moon, Sun, Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function Profile() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await updateUser({ name: formData.name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <DashboardLayout title="Profile">
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <User size={24} />
            Personal Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully!</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" disabled value={formData.email} className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Updating...</span>
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preferences</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Globe size={18} />
                Language
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`py-3 px-4 rounded-lg border-2 transition-all font-medium flex items-center gap-2 justify-center ${
                      language === lang.code
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-emerald-400 dark:hover:border-emerald-500'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
              <button onClick={toggleTheme} className="w-full flex items-center justify-between px-6 py-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all">
                <span className="flex items-center gap-3 text-gray-900 dark:text-white font-medium">
                  {theme === 'dark' ? (
                    <>
                      <Moon size={20} />
                      Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun size={20} />
                      Light Mode
                    </>
                  )}
                </span>
                <div className={`relative w-14 h-7 rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-md border-2 border-emerald-200 dark:border-emerald-800 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Welcome to SaveUp</h3>
            <p className="text-gray-600 dark:text-gray-400">Your smart finance management companion</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              {selectedLang.flag} {selectedLang.name} • {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
