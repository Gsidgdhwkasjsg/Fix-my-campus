'use client';

import React from 'react';
import {
  Zap,
  Droplets,
  FlaskConical,
  Armchair,
  Sparkles,
  HelpCircle,
  LucideProps,
} from 'lucide-react';
import { IssueCategory } from '@/lib/types';

interface CategoryIconProps extends LucideProps {
  category: IssueCategory | string;
}

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  const norm = category?.toUpperCase();

  switch (norm) {
    case 'ELECTRICAL':
      return <Zap {...props} />;
    case 'PLUMBING':
      return <Droplets {...props} />;
    case 'LAB_EQUIPMENT':
      return <FlaskConical {...props} />;
    case 'FURNITURE':
      return <Armchair {...props} />;
    case 'SANITATION':
      return <Sparkles {...props} />;
    case 'OTHER':
    default:
      return <HelpCircle {...props} />;
  }
}
