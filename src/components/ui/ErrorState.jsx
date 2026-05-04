import { AlertCircle } from 'lucide-react';

export default function ErrorState({ title, message, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-900">
      <AlertCircle className="mb-2 h-10 w-10" />
      {title && <p className="font-semibold">{title}</p>}
      {message && <p className="mt-1 text-sm">{message}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
