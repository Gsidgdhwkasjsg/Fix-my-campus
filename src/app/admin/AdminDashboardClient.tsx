'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  ExternalLink,
  MapPin,
  Save,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  ArrowLeft,
} from 'lucide-react';
import {
  IssueItem,
  IssueStatus,
  DashboardStats,
  STATUS_LIST,
  CATEGORIES,
} from '@/lib/types';
import {
  formatRelativeTime,
  getCategoryMeta,
  getStatusMeta,
  cn,
} from '@/lib/utils';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { updateIssueStatus, deleteIssue, getIssues } from '@/lib/actions';

interface AdminDashboardClientProps {
  initialIssues: IssueItem[];
  initialStats: DashboardStats;
}

export function AdminDashboardClient({
  initialIssues,
  initialStats,
}: AdminDashboardClientProps) {
  const { toast } = useToast();
  const [issues, setIssues] = useState<IssueItem[]>(initialIssues);
  const [tabFilter, setTabFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Live filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((item) => {
      // Tab filter
      if (tabFilter === 'PENDING') {
        if (item.status !== 'REPORTED' && item.status !== 'IN_REVIEW') return false;
      } else if (tabFilter === 'ACTIVE') {
        if (item.status !== 'ASSIGNED' && item.status !== 'IN_PROGRESS') return false;
      } else if (tabFilter === 'RESOLVED') {
        if (item.status !== 'RESOLVED') return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && item.category.toUpperCase() !== selectedCategory) {
        return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.room.toLowerCase().includes(q) ||
          item.block.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [issues, tabFilter, selectedCategory, search]);

  // Handle status update
  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    const prev = issues.find((i) => i.id === issueId);
    if (!prev || prev.status === newStatus) return;

    // Optimistic update
    setIssues((current) =>
      current.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    try {
      await updateIssueStatus(issueId, newStatus, prev.adminNote);
      toast(`Ticket status updated to "${newStatus.replace('_', ' ')}".`, 'success');
    } catch {
      toast('Failed to update status.', 'error');
      handleRefresh();
    }
  };

  // Save technician note
  const handleSaveNote = async (issueId: string) => {
    setIsSaving(true);
    const target = issues.find((i) => i.id === issueId);
    if (!target) return;

    try {
      await updateIssueStatus(issueId, target.status as IssueStatus, noteDraft);
      setIssues((current) =>
        current.map((i) => (i.id === issueId ? { ...i, adminNote: noteDraft } : i))
      );
      setActiveEditingId(null);
      toast('Technician remark saved successfully.', 'success');
    } catch {
      toast('Failed to save technician note.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fresh = await getIssues({ sort: 'newest' });
      setIssues(fresh);
      toast('Console refreshed with latest ticket state.', 'info');
    } catch {
      toast('Failed to refresh tickets.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Delete
  const handleDelete = async (issueId: string) => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      setIssues((prev) => prev.filter((i) => i.id !== issueId));
      await deleteIssue(issueId);
      toast('Ticket deleted.', 'info');
    } catch {
      toast('Failed to delete ticket.', 'error');
      handleRefresh();
    }
  };

  // Quick stats
  const pendingCount = issues.filter(
    (i) => i.status === 'REPORTED' || i.status === 'IN_REVIEW'
  ).length;
  const activeCount = issues.filter(
    (i) => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length;

  return (
    <>
      <Navbar
        isAdmin={true}
        onToggleAdmin={() => {}}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/"
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Public Feed
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                <Wrench className="w-6 h-6" />
              </span>
              Facility Staff Dispatch Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage work orders, assign specialized campus technicians, and log repair remarks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin text-sky-600')} />
              <span>Refresh</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-500/20 transition-all"
            >
              <span>View Public Feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div
            onClick={() => setTabFilter('PENDING')}
            className={cn(
              'p-4 rounded-2xl border transition-all cursor-pointer',
              tabFilter === 'PENDING'
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-400 ring-2 ring-amber-500/20 shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
              <span>Pending Triage</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Reported or Under Review</p>
          </div>

          <div
            onClick={() => setTabFilter('ACTIVE')}
            className={cn(
              'p-4 rounded-2xl border transition-all cursor-pointer',
              tabFilter === 'ACTIVE'
                ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-400 ring-2 ring-blue-500/20 shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
              <span>Active Work Orders</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {activeCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Assigned or In Progress</p>
          </div>

          <div
            onClick={() => setTabFilter('RESOLVED')}
            className={cn(
              'p-4 rounded-2xl border transition-all cursor-pointer',
              tabFilter === 'RESOLVED'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              <span>Resolved Issues</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {resolvedCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Verified & Closed</p>
          </div>

          <div
            onClick={() => setTabFilter('ALL')}
            className={cn(
              'p-4 rounded-2xl border transition-all cursor-pointer',
              tabFilter === 'ALL'
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-500/20 shadow-md'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            )}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Total Work Orders</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {issues.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">All campus tickets</p>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
            {(
              [
                { id: 'ALL', label: 'All Tickets', count: issues.length },
                { id: 'PENDING', label: 'Needs Triage', count: pendingCount },
                { id: 'ACTIVE', label: 'Active Repairs', count: activeCount },
                { id: 'RESOLVED', label: 'Resolved', count: resolvedCount },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabFilter(tab.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
                  tabFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200/50 dark:bg-slate-700/50">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket title, room..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredIssues.map((issue) => {
            const catMeta = getCategoryMeta(issue.category);
            const statMeta = getStatusMeta(issue.status);
            const isEditing = activeEditingId === issue.id;

            return (
              <div
                key={issue.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left Column: Category, Title, Location */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                          catMeta.bgColor,
                          catMeta.borderColor,
                          catMeta.textColor
                        )}
                      >
                        <CategoryIcon category={issue.category} className="w-3 h-3" />
                        {catMeta.label}
                      </span>

                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {issue.block}
                        </span>
                        <span>•</span>
                        <span>{issue.floor}</span>
                        <span>•</span>
                        <span className="font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 font-bold">
                          {issue.room}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400 ml-auto lg:ml-2">
                        {formatRelativeTime(issue.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {issue.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {issue.description}
                    </p>

                    {/* Existing technician remark if any */}
                    {issue.adminNote && !isEditing && (
                      <div className="mt-2 text-xs p-2.5 rounded-xl bg-amber-500/10 border border-amber-300/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
                        <span className="font-bold">Staff Remark:</span> {issue.adminNote}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Status Dropdown & Action Buttons */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    {/* Status Changer Dropdown */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Workflow Status:
                      </label>
                      <select
                        value={issue.status}
                        onChange={(e) =>
                          handleStatusChange(issue.id, e.target.value as IssueStatus)
                        }
                        className={cn(
                          'text-xs font-semibold py-2 px-3 rounded-xl border focus:ring-2 focus:ring-amber-500 focus:outline-none transition-colors shadow-2xs',
                          statMeta.badgeClass
                        )}
                      >
                        {STATUS_LIST.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.step}. {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-4 sm:pt-0 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          if (isEditing) {
                            setActiveEditingId(null);
                          } else {
                            setActiveEditingId(issue.id);
                            setNoteDraft(issue.adminNote || '');
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        {issue.adminNote ? 'Edit Remark' : '+ Note'}
                      </button>

                      <button
                        onClick={() => handleDelete(issue.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-colors"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Note Editor if opened */}
                {isEditing && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="e.g. Capacitor replaced, scheduled HVAC technician Ramesh for 3:00 PM..."
                      className="flex-1 w-full text-xs px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setActiveEditingId(null)}
                        className="px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isSaving}
                        onClick={() => handleSaveNote(issue.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Remark'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredIssues.length === 0 && (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Queue Clear
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                No tickets found for current tab or search criteria.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
