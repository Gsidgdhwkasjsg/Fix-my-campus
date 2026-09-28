import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CATEGORIES, STATUS_LIST, IssueCategory, IssueStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateInput: string | Date | number): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() === date.getFullYear() ? undefined : 'numeric',
  });
}

export function getCategoryMeta(category: string | IssueCategory) {
  const found = CATEGORIES.find(
    (c) => c.id.toUpperCase() === category.toUpperCase()
  );
  return (
    found ?? {
      id: 'OTHER' as IssueCategory,
      label: category,
      description: 'Campus facility issue',
      color: '#64748b',
      bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
      borderColor: 'border-slate-500/30',
      textColor: 'text-slate-700 dark:text-slate-300',
      iconName: 'HelpCircle',
    }
  );
}

export function getStatusMeta(status: string | IssueStatus) {
  const found = STATUS_LIST.find(
    (s) => s.id.toUpperCase() === status.toUpperCase()
  );
  return (
    found ?? {
      id: 'REPORTED' as IssueStatus,
      label: status,
      step: 1,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      pillClass: 'bg-slate-500/15 text-slate-700 border-slate-300',
      dotClass: 'bg-slate-400',
      description: 'Status unknown',
    }
  );
}

export function getClientUserIdentifier(): string {
  if (typeof window === 'undefined') return 'server-temp-user';
  
  const STORAGE_KEY = 'fixmycampus_client_uuid';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    // Generate persistent pseudonymous client identifier
    id = 'user_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export const SAMPLE_CAMPUS_PRESETS = [
  {
    title: 'AC unit dripping water over lab workstations',
    description: 'Split air conditioning indoor blower is leaking condensation onto desk row 3.',
    category: 'ELECTRICAL',
    block: 'Academic Block A',
    floor: '2nd Floor',
    room: 'Computer Lab 202',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Broken flush handle in 2nd Floor restroom',
    description: 'Flush valve mechanism disconnected; continuous trickle wasting water.',
    category: 'PLUMBING',
    block: 'Student Centre',
    floor: '2nd Floor',
    room: 'Washroom 2B',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Projector HDMI port disconnected and faulty lamp',
    description: 'HDMI input cable is bent and screen flickers magenta during class presentations.',
    category: 'LAB_EQUIPMENT',
    block: 'Science & Tech Block',
    floor: '1st Floor',
    room: 'Seminar Hall B',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Loose wooden desktop board with splinter danger',
    description: 'Bench wooden top is unfastened and shifts when students lean on it.',
    category: 'FURNITURE',
    block: 'Arts & Humanities Block',
    floor: 'Ground Floor',
    room: 'Room 105',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Sanitation dustbin damaged and overflowing in corridor',
    description: 'Recycling station bin pedal is broken and garbage is accumulating.',
    category: 'SANITATION',
    block: 'Central Library',
    floor: 'Ground Floor',
    room: 'Study Commons Hallway',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
  },
];
