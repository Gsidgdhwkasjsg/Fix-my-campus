'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { IssueFeed } from '@/components/IssueFeed';
import { IssueItem, DashboardStats } from '@/lib/types';
import { Building2, Heart, Shield, Sparkles } from 'lucide-react';

interface HomePageClientProps {
  initialIssues: IssueItem[];
  initialStats: DashboardStats;
}

export function HomePageClient({
  initialIssues,
  initialStats,
}: HomePageClientProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1a] selection:bg-sky-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <Navbar
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-850 bg-white dark:bg-slate-900/60 transition-colors">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 mb-3 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                <span>Next-Gen Campus Maintenance & Facility Dispatch</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Fix campus issues.{' '}
                <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                  Faster together.
                </span>
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Report broken equipment, electrical faults, plumbing leaks, or furniture damage in your
                lecture halls and labs. Upvote issues to boost facility priority and track resolution in real time.
              </p>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <span>Report an Issue</span>
              </button>

              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border transition-all ${
                  isAdmin
                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span>{isAdmin ? 'Staff Mode Active' : 'Switch to Staff View'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Issue Feed */}
      <main className="flex-1">
        <IssueFeed
          initialIssues={initialIssues}
          initialStats={initialStats}
          isAdmin={isAdmin}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isReportModalOpen={isReportModalOpen}
          setIsReportModalOpen={setIsReportModalOpen}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              FixMyCampus Portal
            </span>
            <span>•</span>
            <span>University Facility Maintenance & Work Order System</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built for college campuses with Next.js, Prisma, Tailwind CSS & SQLite
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
