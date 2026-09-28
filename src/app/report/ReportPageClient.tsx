'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wrench,
  Upload,
  X,
  Check,
  AlertCircle,
  Sparkles,
  MapPin,
  Loader2,
  Building2,
} from 'lucide-react';
import {
  CATEGORIES,
  CAMPUS_BLOCKS,
  CAMPUS_FLOORS,
  IssueCategory,
  CreateIssueInput,
} from '@/lib/types';
import { SAMPLE_CAMPUS_PRESETS, cn } from '@/lib/utils';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Navbar } from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { createIssue } from '@/lib/actions';

export function ReportPageClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('ELECTRICAL');
  const [block, setBlock] = useState(CAMPUS_BLOCKS[0]);
  const [floor, setFloor] = useState(CAMPUS_FLOORS[1]);
  const [room, setRoom] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyPreset = (preset: (typeof SAMPLE_CAMPUS_PRESETS)[0]) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setCategory(preset.category as IssueCategory);
    setBlock(preset.block);
    setFloor(preset.floor);
    setRoom(preset.room);
    setImageUrl(preset.imageUrl);
    setImagePreview(preset.imageUrl);
    setErrorMessage('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        setImageUrl(reader.result as string);
      }
    } catch {
      setImageUrl(reader.result as string);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !description.trim() || !room.trim()) {
      setErrorMessage('Please fill in all required fields (title, room, and description).');
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue({
        title: title.trim(),
        description: description.trim(),
        category,
        block,
        floor,
        room: room.trim(),
        imageUrl: imageUrl || imagePreview || null,
      });

      toast('Maintenance ticket dispatched successfully!', 'success');
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit report. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar isAdmin={false} onToggleAdmin={() => {}} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Campus Issues Feed
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-sky-600 to-indigo-700 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Report Campus Maintenance Issue
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 max-w-xl">
              Log defective facilities, broken equipment, plumbing or electrical hazards.
              Facility teams respond and resolve tickets based on community priority.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Quick Demo Presets */}
            <div className="mb-6 p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-300 mb-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Quick Campus Presets (1-Click Fill for Demo):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_CAMPUS_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-sky-300/80 dark:border-sky-800/80 text-sky-950 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors shadow-2xs"
                  >
                    {preset.category === 'ELECTRICAL' && '⚡ '}
                    {preset.category === 'PLUMBING' && '💧 '}
                    {preset.category === 'LAB_EQUIPMENT' && '🔬 '}
                    {preset.category === 'FURNITURE' && '🪑 '}
                    {preset.category === 'SANITATION' && '✨ '}
                    {preset.title.split(' ').slice(0, 3).join(' ')}...
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issue Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AC condensation leakage above computer workstations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          'flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all',
                          isSelected
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 ring-2 ring-sky-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                            cat.bgColor,
                            cat.textColor
                          )}
                        >
                          <CategoryIcon category={cat.id} className="w-4 h-4" />
                        </div>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>Campus Location Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Campus Block <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {CAMPUS_BLOCKS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Floor <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      {CAMPUS_FLOORS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Room / Lab / Bay <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab 304, Restroom 2B"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details about the issue, affected fixtures, hazard severity..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all leading-relaxed"
                />
              </div>

              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attach Photo (Optional)
                </label>

                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-52 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-rose-600 text-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-medium gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading image...
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-850/50 hover:bg-sky-50/30 transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Click to upload photo or drag & drop
                      </div>
                      <p className="text-[11px] text-slate-400">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Report...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Dispatch Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
