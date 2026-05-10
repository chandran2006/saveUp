import { useTranslation } from 'react-i18next';

export function Loading() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: { box: 'w-4 h-4', border: 'border-2' },
    md: { box: 'w-8 h-8', border: 'border-2' },
    lg: { box: 'w-12 h-12', border: 'border-4' },
  };
  const { box, border } = sizeClasses[size];

  return (
    <div className={`relative ${box}`}>
      <div className={`absolute inset-0 ${border} border-blue-200 dark:border-blue-900 rounded-full`}></div>
      <div className={`absolute inset-0 ${border} border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin`}></div>
    </div>
  );
}
