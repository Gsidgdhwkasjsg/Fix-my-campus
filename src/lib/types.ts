export type IssueCategory =
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'FURNITURE'
  | 'LAB_EQUIPMENT'
  | 'SANITATION'
  | 'OTHER';

export type IssueStatus =
  | 'REPORTED'
  | 'IN_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED';

export interface IssueItem {
  id: string;
  title: string;
  description: string;
  category: IssueCategory | string;
  block: string;
  floor: string;
  room: string;
  imageUrl: string | null;
  status: IssueStatus | string;
  upvotesCount: number;
  adminNote: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  hasUpvoted?: boolean;
}

export interface IssueFilterParams {
  category?: string;
  status?: string;
  block?: string;
  search?: string;
  sort?: 'upvotes' | 'newest' | 'oldest';
  userIdentifier?: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: IssueCategory | string;
  block: string;
  floor: string;
  room: string;
  imageUrl?: string | null;
}

export interface UpdateIssueStatusInput {
  issueId: string;
  status: IssueStatus | string;
  adminNote?: string | null;
}

export interface DashboardStats {
  totalIssues: number;
  reported: number;
  inReview: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  totalUpvotes: number;
}

export const CATEGORIES: {
  id: IssueCategory;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconName: string;
}[] = [
  {
    id: 'ELECTRICAL',
    label: 'Electrical',
    description: 'Wiring, lighting, switchboards, AC, UPS & power units',
    color: '#eab308',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-700 dark:text-amber-300',
    iconName: 'Zap',
  },
  {
    id: 'PLUMBING',
    label: 'Plumbing',
    description: 'Leaks, washrooms, flush valves, faucets, drainage',
    color: '#0284c7',
    bgColor: 'bg-sky-500/10 dark:bg-sky-500/20',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-700 dark:text-sky-300',
    iconName: 'Droplets',
  },
  {
    id: 'LAB_EQUIPMENT',
    label: 'Lab Equipment',
    description: 'Projectors, oscilloscopes, fume hoods, microscopes, CNCs',
    color: '#6366f1',
    bgColor: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    iconName: 'FlaskConical',
  },
  {
    id: 'FURNITURE',
    label: 'Furniture',
    description: 'Desks, benches, auditorium chairs, whiteboards, doors',
    color: '#d97706',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-700 dark:text-orange-300',
    iconName: 'Armchair',
  },
  {
    id: 'SANITATION',
    label: 'Sanitation',
    description: 'Waste bins, hygiene, cleanliness, pest control',
    color: '#10b981',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    iconName: 'Sparkles',
  },
  {
    id: 'OTHER',
    label: 'Other',
    description: 'General campus repairs and miscellaneous facilities',
    color: '#64748b',
    bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-700 dark:text-slate-300',
    iconName: 'HelpCircle',
  },
];

export const STATUS_LIST: {
  id: IssueStatus;
  label: string;
  step: number;
  badgeClass: string;
  pillClass: string;
  dotClass: string;
  description: string;
}[] = [
  {
    id: 'REPORTED',
    label: 'Reported',
    step: 1,
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    pillClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    description: 'Submitted by student/staff, awaiting triage',
  },
  {
    id: 'IN_REVIEW',
    label: 'In Review',
    step: 2,
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    pillClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    dotClass: 'bg-blue-500 animate-pulse',
    description: 'Under inspection by facility administrators',
  },
  {
    id: 'ASSIGNED',
    label: 'Assigned to Staff',
    step: 3,
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    pillClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    dotClass: 'bg-purple-500',
    description: 'Dispatched to specialized campus technician',
  },
  {
    id: 'IN_PROGRESS',
    label: 'Work in Progress',
    step: 4,
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    pillClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    dotClass: 'bg-amber-500 animate-pulse',
    description: 'Active repair or parts procurement underway',
  },
  {
    id: 'RESOLVED',
    label: 'Resolved',
    step: 5,
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    pillClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    description: 'Work completed and verified by facility team',
  },
];

export const CAMPUS_BLOCKS = [
  'Academic Block A',
  'Academic Block B',
  'Science & Tech Block',
  'Mechanical Workshop',
  'Chemistry Research Annex',
  'Student Centre',
  'Central Library',
  'Hostel Block 1',
  'Hostel Block 2',
  'Arts & Humanities Block',
  'Sports Complex',
];

export const CAMPUS_FLOORS = [
  'Basement',
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  'Terrace / Roof',
];
