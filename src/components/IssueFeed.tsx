'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  RefreshCw,
  PlusCircle,
  Inbox,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  CATEGORIES,
  STATUS_LIST,
  CAMPUS_BLOCKS,
  IssueCategory,
  IssueItem,
  IssueStatus,
  DashboardStats,
  CreateIssueInput,
} from '@/lib/types';
import {
  getClientUserIdentifier,
  cn,
} from '@/lib/utils';
import { IssueCard } from './IssueCard';
import { StatsBanner } from './StatsBanner';
import { CategoryIcon } from './CategoryIcon';
import { ReportIssueModal } from './ReportIssueModal';
import { ImageLightboxModal } from './ImageLightboxModal';
import { useToast } from './Toast';
import {
  toggleUpvote,
  updateIssueStatus,
  deleteIssue,
  createIssue,
  getIssues,
} from '@/lib/actions';

interface IssueFeedProps {
  initialIssues: IssueItem[];
  initialStats: DashboardStats;
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (val: boolean) => void;
}

export function IssueFeed({
  initialIssues,
  initialStats,
  isAdmin,
  searchQuery,
  onSearchChange,
  isReportModalOpen,
  setIsReportModalOpen,
}: IssueFeedProps) {
  const { toast } = useToast();
  const [issues, setIssues] = useState<IssueItem[]>(initialIssues);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<'upvotes' | 'newest' | 'oldest'>('upvotes');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lightbox state
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    url: string | null;
    title: string;
  }>({
    isOpen: false,
    url: null,
    title: '',
  });

  // Client userIdentifier for guest upvote tracking
  const [userIdentifier, setUserIdentifier] = useState<string>('');

  useEffect(() => {
    const uid = getClientUserIdentifier();
    setUserIdentifier(uid);
    // Mark issues upvoted by this user if stored in local storage
    try {
      const upvotedMap = JSON.parse(
        localStorage.getItem('fixmycampus_upvoted_issues') || '{}'
      );
      setIssues((prev) =>
        prev.map((i) => ({
          ...i,
          hasUpvoted: Boolean(upvotedMap[i.id]),
        }))
      );
    } catch {
      // ignore
    }
  }, []);

  // Compute live stats based on current issue items
  const stats = useMemo(() => {
    const s: DashboardStats = {
      totalIssues: issues.length,
      reported: 0,
      inReview: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      totalUpvotes: 0,
    };
    issues.forEach((i) => {
      s.totalUpvotes += i.upvotesCount;
      if (i.status === 'REPORTED') s.reported++;
      if (i.status === 'IN_REVIEW') s.inReview++;
      if (i.status === 'ASSIGNED') s.assigned++;
      if (i.status === 'IN_PROGRESS') s.inProgress++;
      if (i.status === 'RESOLVED') s.resolved++;
    });
    return s;
  }, [issues]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: issues.length };
    CATEGORIES.forEach((c) => {
      counts[c.id] = 0;
    });
    issues.forEach((i) => {
      const cat = i.category.toUpperCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [issues]);

  // Filtered and sorted issues
  const filteredIssues = useMemo(() => {
    return issues
      .filter((issue) => {
        // Category filter
        if (
          selectedCategory !== 'ALL' &&
          issue.category.toUpperCase() !== selectedCategory.toUpperCase()
        ) {
          return false;
        }

        // Status filter
        if (
          selectedStatus !== 'ALL' &&
          issue.status.toUpperCase() !== selectedStatus.toUpperCase()
        ) {
          return false;
        }

        // Block filter
        if (selectedBlock !== 'ALL' && issue.block !== selectedBlock) {
          return false;
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = issue.title.toLowerCase().includes(q);
          const matchDesc = issue.description.toLowerCase().includes(q);
          const matchRoom = issue.room.toLowerCase().includes(q);
          const matchBlock = issue.block.toLowerCase().includes(q);
          const matchCategory = issue.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchRoom && !matchBlock && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'upvotes') {
          if (b.upvotesCount !== a.upvotesCount) {
            return b.upvotesCount - a.upvotesCount;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
  }, [issues, selectedCategory, selectedStatus, selectedBlock, searchQuery, sortOption]);

  // Refresh issues from DB
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getIssues({
        userIdentifier,
      });
      setIssues(fresh);
      toast('Facility feed updated with live database items.', 'info');
    } catch {
      toast('Failed to refresh tickets.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Optimistic upvote handler
  const handleUpvote = async (issueId: string) => {
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    const previousHasUpvoted = target.hasUpvoted ?? false;
    const nextHasUpvoted = !previousHasUpvoted;
    const nextCount = Math.max(0, target.upvotesCount + (nextHasUpvoted ? 1 : -1));

    // 1. Optimistic UI update
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              hasUpvoted: nextHasUpvoted,
              upvotesCount: nextCount,
            }
          : i
      )
    );

    // Save in localStorage for persistence
    try {
      const upvotedMap = JSON.parse(
        localStorage.getItem('fixmycampus_upvoted_issues') || '{}'
      );
      if (nextHasUpvoted) {
        upvotedMap[issueId] = true;
      } else {
        delete upvotedMap[issueId];
      }
      localStorage.setItem('fixmycampus_upvoted_issues', JSON.stringify(upvotedMap));
    } catch {
      // ignore
    }

    // 2. Dispatch to server
    try {
      const uid = userIdentifier || getClientUserIdentifier();
      const res = await toggleUpvote(issueId, uid);
      // Sync with real server count
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? {
                ...i,
                hasUpvoted: res.hasUpvoted,
                upvotesCount: res.upvotesCount,
              }
            : i
        )
      );

      toast(
        nextHasUpvoted
          ? 'Upvoted! Facility priority boosted.'
          : 'Upvote removed.',
        'success'
      );
    } catch (err: any) {
      // Rollback
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? {
                ...i,
                hasUpvoted: previousHasUpvoted,
                upvotesCount: target.upvotesCount,
              }
            : i
        )
      );
      toast('Failed to register upvote. Try again.', 'error');
    }
  };

  // Admin status update handler
  const handleUpdateStatus = async (
    issueId: string,
    status: IssueStatus,
    adminNote?: string | null
  ) => {
    try {
      // Optimistic update
      setIssues((prev) =>
        prev.map((i) =>
          i.id === issueId
            ? {
                ...i,
                status,
                adminNote: adminNote !== undefined ? adminNote : i.adminNote,
              }
            : i
        )
      );

      await updateIssueStatus(issueId, status, adminNote);
      toast(`Status updated to "${status.replace('_', ' ')}".`, 'success');
    } catch (err: any) {
      toast('Failed to update status.', 'error');
      handleRefresh();
    }
  };

  // Admin delete issue
  const handleDeleteIssue = async (issueId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this issue ticket?')) {
      return;
    }

    try {
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      await deleteIssue(issueId);
      toast('Issue ticket successfully deleted.', 'info');
    } catch {
      toast('Failed to delete issue.', 'error');
      handleRefresh();
    }
  };

  // Create issue handler
  const handleCreateIssue = async (data: CreateIssueInput) => {
    try {
      const created = await createIssue(data);
      setIssues((prev) => [created, ...prev]);
      toast('Issue reported successfully! Maintenance crew notified.', 'success');
    } catch (err: any) {
      toast(err.message || 'Failed to submit report', 'error');
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Campus Facility Stats Banner */}
      <StatsBanner
        stats={stats}
        activeStatus={selectedStatus}
        onFilterStatus={(s) => setSelectedStatus(s)}
      />

      {/* Staff Mode Indicator Banner if Admin is toggled */}
      {isAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                Facility Staff & Admin Inspection Mode
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  Active
                </span>
              </div>
              <p className="text-xs opacity-90">
                You can now change issue status stages, assign technicians, and record resolution remarks inline on each card.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStatus('REPORTED')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 shadow-2xs hover:bg-amber-50"
          >
            Review Pending Triage ({stats.reported})
          </button>
        </div>
      )}

      {/* Sticky Filter Header & Tabs */}
      <div className="sticky top-16 z-30 bg-slate-50/95 dark:bg-[#080d1a]/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-colors">
        
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shrink-0',
              selectedCategory === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            )}
          >
            <span>All Categories</span>
            <span
              className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px] font-mono',
                selectedCategory === 'ALL'
                  ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              )}
            >
              {categoryCounts.ALL}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all shrink-0',
                  isSelected
                    ? cn(cat.bgColor, cat.borderColor, cat.textColor, 'ring-2 ring-sky-500/20 shadow-xs')
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <CategoryIcon category={cat.id} className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Row: Status Pills, Block Dropdown, Sort, Search, and Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline mr-1">
              Status:
            </span>
            <button
              onClick={() => setSelectedStatus('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors shrink-0',
                selectedStatus === 'ALL'
                  ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              )}
            >
              All Statuses
            </button>
            {STATUS_LIST.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors shrink-0',
                  selectedStatus === s.id
                    ? 'bg-sky-500 text-white border-sky-500 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', s.dotClass)} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Controls: Block Dropdown, Sort Dropdown & Refresh */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Campus Block filter dropdown */}
            <div className="relative">
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="text-xs py-1.5 pl-2.5 pr-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="ALL">All Campus Blocks</option>
                {CAMPUS_BLOCKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Sorting dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="text-xs py-1.5 pl-2.5 pr-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="upvotes">🔥 Most Upvoted</option>
                <option value="newest">🕒 Newest First</option>
                <option value="oldest">⏳ Oldest First</option>
              </select>
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Refresh tickets"
            >
              <RefreshCw
                className={cn('w-4 h-4', isRefreshing && 'animate-spin text-sky-600')}
              />
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search issues, room numbers..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Issue Cards Grid */}
      {filteredIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {filteredIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              isAdmin={isAdmin}
              onUpvote={handleUpvote}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteIssue}
              onImageClick={(url, title) =>
                setLightboxData({ isOpen: true, url, title })
              }
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 mt-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3 shadow-inner">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Maintenance Issues Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
            There are currently no tickets matching your category, status, or search query.
            Try clearing active filters or report a new facility issue.
          </p>
          <div className="flex items-center justify-center gap-2">
            {(selectedCategory !== 'ALL' ||
              selectedStatus !== 'ALL' ||
              selectedBlock !== 'ALL' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedBlock('ALL');
                  onSearchChange('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Clear All Filters
              </button>
            )}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Report Issue Now
            </button>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateIssue}
      />

      {/* Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.url}
        title={lightboxData.title}
        onClose={() => setLightboxData({ isOpen: false, url: null, title: '' })}
      />
    </div>
  );
}
