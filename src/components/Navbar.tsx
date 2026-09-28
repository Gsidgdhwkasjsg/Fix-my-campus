'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  PlusCircle,
  Building2,
  UserCheck,
  GraduationCap,
  LayoutDashboard,
  Search,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onOpenReportModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Navbar({
  isAdmin,
  onToggleAdmin,
  onOpenReportModal,
  searchQuery = '',
  onSearchChange,
}: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-sky-900 to-indigo-950 dark:from-white dark:via-sky-200 dark:to-indigo-200 bg-clip-text text-transparent">
                    FixMyCampus
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60">
                    Campus Facility Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  University Facility & Maintenance Hub
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Search bar (if provided in current context) */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search issues, rooms (e.g. Lab 302, AC leak)..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nav links */}
            <div className="hidden lg:flex items-center gap-1 mr-2 text-sm font-medium">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === '/'
                    ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Feed
              </Link>
              <Link
                href="/admin"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === '/admin'
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Staff Console
              </Link>
            </div>

            {/* Role Switcher Toggle */}
            <button
              onClick={onToggleAdmin}
              aria-label="Toggle role mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm ${
                isAdmin
                  ? 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-750'
              }`}
              title="Switch between Student view and Staff/Admin view"
            >
              {isAdmin ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">Staff Mode</span>
                  <span className="sm:hidden">Staff</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span className="hidden sm:inline">Student View</span>
                  <span className="sm:hidden">Student</span>
                </>
              )}
            </button>

            {/* Primary Action Button: Report Issue */}
            {onOpenReportModal ? (
              <button
                onClick={onOpenReportModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-500/25 hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Report Issue</span>
              </button>
            ) : (
              <Link
                href="/report"
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md shadow-sky-500/25 hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span>Report Issue</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
