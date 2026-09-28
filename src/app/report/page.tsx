import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';
import { ReportPageClient } from './ReportPageClient';

export default function ReportPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1a]">
        <ReportPageClient />
      </div>
    </ToastProvider>
  );
}
