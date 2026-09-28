'use client';

import React from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ThumbsUp,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface StatsBannerProps {
  stats: DashboardStats;
  onFilterStatus?: (status: string) => void;
  activeStatus?: string;
}

export function StatsBanner({
  stats,
  onFilterStatus,
  activeStatus,
}: StatsBannerProps) {
  const unresolved = stats.totalIssues - stats.resolved;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Active / Unresolved */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('ALL')}
        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
          !activeStatus || activeStatus === 'ALL'
            ? 'bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 border-sky-400/50 shadow-md ring-2 ring-sky-500/10'
            : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Issues
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalIssues}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            campus tickets
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
          <span>{unresolved} pending resolution</span>
        </div>
      </div>

      {/* In Progress & Assigned */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('IN_PROGRESS')}
        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
          activeStatus === 'IN_PROGRESS'
            ? 'bg-gradient-to-br from-white to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20 border-amber-400/50 shadow-md ring-2 ring-amber-500/10'
            : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Active Repairs
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {stats.inProgress + stats.assigned}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            dispatched
          </span>
        </div>
        <div className="mt-2 text-[11px] text-amber-600/90 dark:text-amber-400/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          <span>{stats.inProgress} work in progress</span>
        </div>
      </div>

      {/* Resolved Today / Fixed */}
      <div
        onClick={() => onFilterStatus && onFilterStatus('RESOLVED')}
        className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
          activeStatus === 'RESOLVED'
            ? 'bg-gradient-to-br from-white to-emerald-50/40 dark:from-slate-900 dark:to-emerald-950/20 border-emerald-400/50 shadow-md ring-2 ring-emerald-500/10'
            : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Resolved
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {stats.resolved}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            completed
          </span>
        </div>
        <div className="mt-2 text-[11px] text-emerald-600/90 dark:text-emerald-400/90 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>
            {stats.totalIssues > 0
              ? `${Math.round((stats.resolved / stats.totalIssues) * 100)}% resolution rate`
              : '0%'}
          </span>
        </div>
      </div>

      {/* Campus Community Voice / Upvotes */}
      <div className="p-4 rounded-2xl border bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Student Upvotes
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ThumbsUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.totalUpvotes}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            priority votes
          </span>
        </div>
        <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Priority-ranked dispatch</span>
        </div>
      </div>
    </div>
  );
}
