import { getDashboardStats, getIssues } from '@/lib/actions';
import { AdminDashboardClient } from './AdminDashboardClient';
import { Navbar } from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const issues = await getIssues({ sort: 'newest' });
  const stats = await getDashboardStats();

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1a]">
        <AdminDashboardClient initialIssues={issues} initialStats={stats} />
      </div>
    </ToastProvider>
  );
}
