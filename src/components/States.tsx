export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-32 border border-gray-200 dark:border-gray-700"></div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl h-24 border border-gray-200 dark:border-gray-700"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl h-96 border border-gray-200 dark:border-gray-700"></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl h-96 border border-gray-200 dark:border-gray-700"></div>
        <div className="bg-white dark:bg-gray-800 rounded-xl h-96 border border-gray-200 dark:border-gray-700"></div>
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
