import { getDashboardStats, getIssues } from '@/lib/actions';
import { HomePageClient } from './HomePageClient';
import { ToastProvider } from '@/components/Toast';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const issues = await getIssues({ sort: 'upvotes' });
  const stats = await getDashboardStats();

  return (
    <ToastProvider>
      <HomePageClient initialIssues={issues} initialStats={stats} />
    </ToastProvider>
  );
}
