interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  const isExceeded = current > total;
  
  const getColor = () => {
    if (isExceeded) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {label || `₹${current.toLocaleString()} / ₹${total.toLocaleString()}`}
        </span>
        <span className={`font-semibold ${isExceeded ? 'text-red-600' : percentage > 80 ? 'text-yellow-600' : 'text-emerald-600'}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
