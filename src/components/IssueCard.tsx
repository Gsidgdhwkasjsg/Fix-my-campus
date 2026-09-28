'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MapPin,
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Wrench,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Trash2,
  Save,
  Building,
  Layers,
  Sparkles,
} from 'lucide-react';
import { IssueItem, IssueStatus, STATUS_LIST } from '@/lib/types';
import {
  formatRelativeTime,
  getCategoryMeta,
  getStatusMeta,
  cn,
} from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';

interface IssueCardProps {
  issue: IssueItem;
  isAdmin: boolean;
  onUpvote: (issueId: string) => Promise<void>;
  onUpdateStatus?: (
    issueId: string,
    status: IssueStatus,
    adminNote?: string | null
  ) => Promise<void>;
  onDelete?: (issueId: string) => Promise<void>;
  onImageClick?: (url: string, title: string) => void;
}

export function IssueCard({
  issue,
  isAdmin,
  onUpvote,
  onUpdateStatus,
  onDelete,
  onImageClick,
}: IssueCardProps) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState(issue.adminNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const categoryMeta = getCategoryMeta(issue.category);
  const statusMeta = getStatusMeta(issue.status);

  const handleUpvoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpvoting) return;
    setIsUpvoting(true);
    try {
      await onUpvote(issue.id);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleStatusChange = async (newStatus: IssueStatus) => {
    if (!onUpdateStatus || newStatus === issue.status) return;
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(issue.id, newStatus, issue.adminNote);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNote = async () => {
    if (!onUpdateStatus) return;
    setIsSavingNote(true);
    try {
      await onUpdateStatus(issue.id, issue.status as IssueStatus, adminNoteInput);
      setIsEditingNote(false);
    } finally {
      setIsSavingNote(false);
    }
  };

  const currentStep = statusMeta.step;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden">
      
      {/* Top Banner & Status Tracker Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-850 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        {/* Category Pill */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
              categoryMeta.bgColor,
              categoryMeta.borderColor,
              categoryMeta.textColor
            )}
          >
            <CategoryIcon category={issue.category} className="w-3.5 h-3.5 shrink-0" />
            {categoryMeta.label}
          </span>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs',
              statusMeta.badgeClass
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', statusMeta.dotClass)} />
            {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Location Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex-wrap">
          <MapPin className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {issue.block}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span>{issue.floor}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] font-semibold">
            {issue.room}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight mb-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed flex-1">
          {issue.description}
        </p>

        {/* Media Thumbnail (if provided) */}
        {issue.imageUrl && (
          <div
            onClick={() => onImageClick && onImageClick(issue.imageUrl!, issue.title)}
            className="relative w-full h-44 rounded-xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 cursor-pointer group/img border border-slate-200 dark:border-slate-750"
          >
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-xs font-medium">
                <ExternalLink className="w-3.5 h-3.5" /> Enlarge Photo
              </span>
            </div>
          </div>
        )}

        {/* 5-Step Visual Progress Bar */}
        <div className="mb-4 pt-1">
          <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 font-medium mb-1.5">
            <span>Progress Tracker</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Stage {currentStep} of 5 ({statusMeta.label})
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {STATUS_LIST.map((step) => {
              const isFilled = step.step <= currentStep;
              const isCurrent = step.step === currentStep;
              return (
                <div
                  key={step.id}
                  title={step.label}
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isFilled
                      ? currentStep === 5
                        ? 'bg-emerald-500'
                        : isCurrent
                        ? 'bg-sky-500'
                        : 'bg-sky-400/70 dark:bg-sky-600/70'
                      : 'bg-slate-200 dark:bg-slate-800'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Admin Resolution Note / Technician Remark (if present) */}
        {issue.adminNote && (
          <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-semibold mb-1">
              <Wrench className="w-3.5 h-3.5 text-sky-500" />
              <span>Technician Remark / Resolution Note:</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 italic pl-5 leading-relaxed">
              "{issue.adminNote}"
            </p>
          </div>
        )}

        {/* Staff/Admin Quick Inline Controls */}
        {isAdmin && (
          <div className="mt-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 bg-amber-500/5 -mx-4 -mb-4 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Wrench className="w-3 h-3 text-amber-600" /> Staff Action Panel
              </span>

              {onDelete && (
                <button
                  onClick={() => onDelete(issue.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete issue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="mb-2">
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">
                Update Status:
              </label>
              <select
                value={issue.status}
                disabled={isUpdatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as IssueStatus)}
                className="w-full text-xs py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} ({s.description})
                  </option>
                ))}
              </select>
            </div>

            {/* Inline Technician Note Editor */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Resolution / Dispatch Note:
                </label>
                {!isEditingNote && (
                  <button
                    onClick={() => setIsEditingNote(true)}
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    {issue.adminNote ? 'Edit note' : '+ Add remark'}
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="flex flex-col gap-1.5">
                  <textarea
                    rows={2}
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="e.g. Capacitor replaced for fan, parts ordered..."
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setAdminNoteInput(issue.adminNote || '');
                        setIsEditingNote(false);
                      }}
                      className="px-2 py-1 text-[11px] text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSavingNote}
                      onClick={handleSaveNote}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-xs transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      {isSavingNote ? 'Saving...' : 'Save Remark'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Footer: Upvote Button & Relative Timestamp */}
        <div className="pt-3 mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatRelativeTime(issue.createdAt)}</span>
          </div>

          {/* Upvote Button with optimistic active state */}
          <button
            onClick={handleUpvoteClick}
            disabled={isUpvoting}
            aria-label="Upvote this issue"
            className={cn(
              'group/btn inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 active:scale-95',
              issue.hasUpvoted
                ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-500/25'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300 hover:bg-sky-50/80 dark:hover:bg-sky-950/40 hover:text-sky-600 dark:hover:text-sky-400'
            )}
            title={issue.hasUpvoted ? 'Remove upvote' : 'Upvote to raise facility priority'}
          >
            <ThumbsUp
              className={cn(
                'w-3.5 h-3.5 transition-transform group-hover/btn:-translate-y-0.5',
                issue.hasUpvoted ? 'fill-white stroke-white' : ''
              )}
            />
            <span className="tabular-nums font-bold">
              {issue.upvotesCount}
            </span>
            <span className="hidden sm:inline font-normal opacity-85 text-[11px]">
              {issue.upvotesCount === 1 ? 'upvote' : 'upvotes'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
