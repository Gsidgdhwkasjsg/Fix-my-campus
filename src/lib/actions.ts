'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';
import {
  CreateIssueInput,
  DashboardStats,
  IssueFilterParams,
  IssueItem,
  IssueStatus,
} from './types';

// Initial realistic campus dataset for zero-configuration / serverless fallback
const SEED_FALLBACK_ISSUES: IssueItem[] = [
  {
    id: 'seed-1',
    title: 'AC Unit Condensation Leak Above Server Rack',
    description:
      'The ceiling split AC unit is dripping condensation directly over the auxiliary server rack. Potential hazard for network switches and power distribution units.',
    category: 'ELECTRICAL',
    block: 'Academic Block A',
    floor: '3rd Floor',
    room: 'Computer Lab 304',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    status: 'IN_PROGRESS',
    upvotesCount: 28,
    adminNote:
      'HVAC technician Ramesh inspected at 10:15 AM. Drain line unclogged, secondary pan fitted, and safety tarp installed.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'seed-2',
    title: 'High-Pressure Water Pipe Burst in Restroom',
    description:
      'Major water leakage from the main inlet angle valve under the handwash counter. Water is spilling out into the corridor.',
    category: 'PLUMBING',
    block: 'Student Centre',
    floor: '2nd Floor',
    room: 'Washroom 2B',
    imageUrl:
      'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    status: 'ASSIGNED',
    upvotesCount: 45,
    adminNote:
      'Sub-valve isolated by security. Assigned to plumbing team lead David for immediate gasket replacement.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'seed-3',
    title: '4K Ceiling Projector Lamp Blown Before Midterms',
    description:
      'The overhead Optoma projector in LH-102 flickers and turns off after 30 seconds with an overheat error. Crucial for tomorrow morning fluid dynamics presentation.',
    category: 'LAB_EQUIPMENT',
    block: 'Science & Tech Block',
    floor: '1st Floor',
    room: 'Lecture Hall 102',
    imageUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    status: 'IN_REVIEW',
    upvotesCount: 34,
    adminNote:
      'AV Department verified ticket. Replacement 240W bulb module checked out from IT stores.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
  },
  {
    id: 'seed-4',
    title: 'Loose Emergency Electrical Breaker Switchboard',
    description:
      'Front acrylic cover of the main 415V 3-phase distribution box is cracked and hanging open near the CNC milling station.',
    category: 'ELECTRICAL',
    block: 'Mechanical Workshop',
    floor: 'Ground Floor',
    room: 'Mechatronics Bay 1',
    imageUrl:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    status: 'REPORTED',
    upvotesCount: 19,
    adminNote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: 'seed-5',
    title: 'Fume Hood Exhaust Blower System Failure',
    description:
      'Audible grinding noise and zero negative pressure in fume hood hood #4 during chemical extraction practicals.',
    category: 'LAB_EQUIPMENT',
    block: 'Chemistry Research Annex',
    floor: '2nd Floor',
    room: 'Organic Chem Lab 210',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    status: 'RESOLVED',
    upvotesCount: 52,
    adminNote:
      'V-belt replaced on rooftop centrifugal extractor and face velocity verified at 105 FPM. Certified safe for student usage.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: 'seed-6',
    title: 'Broken Auditorium Seats with Splintered Armrests',
    description:
      'Seats 14-18 in Row G have loosened floor bolts and splintered plywood armrests snagging student clothes.',
    category: 'FURNITURE',
    block: 'Arts & Humanities Block',
    floor: 'Ground Floor',
    room: 'Main Auditorium',
    imageUrl:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
    status: 'RESOLVED',
    upvotesCount: 15,
    adminNote:
      'Carpentry crew re-anchored metal pedestals with heavy duty M10 anchor studs and sanded armrests.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: 'seed-7',
    title: 'Overflowing Recycling & Compost Bins at North Gate',
    description:
      'Post-hackathon lunch waste has accumulated around exterior sorting bins; attracting birds and bees near study benches.',
    category: 'SANITATION',
    block: 'Central Library',
    floor: 'Ground Floor',
    room: 'North Porch Entrance',
    imageUrl:
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    status: 'REPORTED',
    upvotesCount: 21,
    adminNote: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

// Persistent global fallback storage (across serverless invocations within container)
const globalStore = globalThis as unknown as {
  inMemoryIssues?: IssueItem[];
  inMemoryUpvotes?: Set<string>; // "issueId_userIdentifier"
};

function getInMemoryStore(): IssueItem[] {
  if (!globalStore.inMemoryIssues) {
    globalStore.inMemoryIssues = [...SEED_FALLBACK_ISSUES];
  }
  return globalStore.inMemoryIssues;
}

function getInMemoryUpvotes(): Set<string> {
  if (!globalStore.inMemoryUpvotes) {
    globalStore.inMemoryUpvotes = new Set<string>();
  }
  return globalStore.inMemoryUpvotes;
}

export async function getIssues(params: IssueFilterParams = {}): Promise<IssueItem[]> {
  const { category, status, block, search, sort = 'upvotes', userIdentifier } = params;

  // 1. Attempt Prisma query
  try {
    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category.toUpperCase();
    }

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (block && block !== 'ALL') {
      where.block = block;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { room: { contains: q } },
        { block: { contains: q } },
      ];
    }

    let orderBy: any = [{ upvotesCount: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'upvotes') {
      orderBy = [{ upvotesCount: 'desc' }, { createdAt: 'desc' }];
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy,
      include: {
        upvotes: userIdentifier
          ? {
              where: {
                userIdentifier,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    if (issues && issues.length > 0) {
      return issues.map((issue) => ({
        ...issue,
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        hasUpvoted: Boolean(issue.upvotes && issue.upvotes.length > 0),
      }));
    }
  } catch (error) {
    console.warn('Prisma database query failed or uninitialized on serverless. Using resilient fallback store:', error);
  }

  // 2. Resilient In-Memory Fallback (Guarantees zero 500 crashes on Vercel)
  const memoryIssues = getInMemoryStore();
  const upvotesSet = getInMemoryUpvotes();

  return memoryIssues
    .filter((issue) => {
      if (category && category !== 'ALL' && issue.category.toUpperCase() !== category.toUpperCase()) {
        return false;
      }
      if (status && status !== 'ALL' && issue.status.toUpperCase() !== status.toUpperCase()) {
        return false;
      }
      if (block && block !== 'ALL' && issue.block !== block) {
        return false;
      }
      if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        const mTitle = issue.title.toLowerCase().includes(q);
        const mDesc = issue.description.toLowerCase().includes(q);
        const mRoom = issue.room.toLowerCase().includes(q);
        const mBlock = issue.block.toLowerCase().includes(q);
        if (!mTitle && !mDesc && !mRoom && !mBlock) return false;
      }
      return true;
    })
    .map((issue) => ({
      ...issue,
      hasUpvoted: userIdentifier ? upvotesSet.has(`${issue.id}_${userIdentifier}`) : false,
    }))
    .sort((a, b) => {
      if (sort === 'upvotes') {
        if (b.upvotesCount !== a.upvotesCount) return b.upvotesCount - a.upvotesCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return 0;
    });
}

export async function createIssue(data: CreateIssueInput): Promise<IssueItem> {
  if (!data.title?.trim() || !data.description?.trim()) {
    throw new Error('Title and description are required.');
  }
  if (!data.block?.trim() || !data.floor?.trim() || !data.room?.trim()) {
    throw new Error('Block, floor, and room location are required.');
  }

  // 1. Try Prisma
  try {
    const issue = await prisma.issue.create({
      data: {
        title: data.title.trim(),
        description: data.description.trim(),
        category: (data.category || 'OTHER').toUpperCase(),
        block: data.block.trim(),
        floor: data.floor.trim(),
        room: data.room.trim(),
        imageUrl: data.imageUrl || null,
        status: 'REPORTED',
        upvotesCount: 0,
        adminNote: null,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      ...issue,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      hasUpvoted: false,
    };
  } catch (error) {
    console.warn('Prisma create failed, using memory store fallback:', error);
  }

  // 2. Fallback
  const memoryStore = getInMemoryStore();
  const newIssue: IssueItem = {
    id: 'issue_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    title: data.title.trim(),
    description: data.description.trim(),
    category: (data.category || 'OTHER').toUpperCase(),
    block: data.block.trim(),
    floor: data.floor.trim(),
    room: data.room.trim(),
    imageUrl: data.imageUrl || null,
    status: 'REPORTED',
    upvotesCount: 0,
    adminNote: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasUpvoted: false,
  };

  memoryStore.unshift(newIssue);
  revalidatePath('/');
  revalidatePath('/admin');
  return newIssue;
}

export async function toggleUpvote(
  issueId: string,
  userIdentifier: string
): Promise<{ hasUpvoted: boolean; upvotesCount: number }> {
  if (!issueId || !userIdentifier) {
    throw new Error('Missing issueId or userIdentifier.');
  }

  // 1. Try Prisma
  try {
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        issueId_userIdentifier: {
          issueId,
          userIdentifier,
        },
      },
    });

    if (existingUpvote) {
      await prisma.$transaction([
        prisma.upvote.delete({
          where: { id: existingUpvote.id },
        }),
        prisma.issue.update({
          where: { id: issueId },
          data: { upvotesCount: { decrement: 1 } },
        }),
      ]);

      const updated = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { upvotesCount: true },
      });

      revalidatePath('/');
      return {
        hasUpvoted: false,
        upvotesCount: Math.max(0, updated?.upvotesCount ?? 0),
      };
    } else {
      await prisma.$transaction([
        prisma.upvote.create({
          data: { issueId, userIdentifier },
        }),
        prisma.issue.update({
          where: { id: issueId },
          data: { upvotesCount: { increment: 1 } },
        }),
      ]);

      const updated = await prisma.issue.findUnique({
        where: { id: issueId },
        select: { upvotesCount: true },
      });

      revalidatePath('/');
      return {
        hasUpvoted: true,
        upvotesCount: updated?.upvotesCount ?? 1,
      };
    }
  } catch (error) {
    console.warn('Prisma upvote failed, using memory store fallback:', error);
  }

  // 2. Fallback
  const memoryStore = getInMemoryStore();
  const upvotesSet = getInMemoryUpvotes();
  const key = `${issueId}_${userIdentifier}`;
  const target = memoryStore.find((i) => i.id === issueId);

  if (upvotesSet.has(key)) {
    upvotesSet.delete(key);
    if (target) {
      target.upvotesCount = Math.max(0, target.upvotesCount - 1);
    }
    revalidatePath('/');
    return {
      hasUpvoted: false,
      upvotesCount: target ? target.upvotesCount : 0,
    };
  } else {
    upvotesSet.add(key);
    if (target) {
      target.upvotesCount += 1;
    }
    revalidatePath('/');
    return {
      hasUpvoted: true,
      upvotesCount: target ? target.upvotesCount : 1,
    };
  }
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus | string,
  adminNote?: string | null
): Promise<IssueItem> {
  const validStatuses = ['REPORTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  const normalizedStatus = status.toUpperCase();

  if (!validStatuses.includes(normalizedStatus)) {
    throw new Error(`Invalid status: ${status}`);
  }

  // 1. Try Prisma
  try {
    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        status: normalizedStatus,
        ...(adminNote !== undefined ? { adminNote: adminNote?.trim() || null } : {}),
      },
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.warn('Prisma update status failed, using memory store fallback:', error);
  }

  // 2. Fallback
  const memoryStore = getInMemoryStore();
  const target = memoryStore.find((i) => i.id === issueId);
  if (!target) {
    throw new Error(`Issue not found: ${issueId}`);
  }

  target.status = normalizedStatus;
  if (adminNote !== undefined) {
    target.adminNote = adminNote?.trim() || null;
  }
  target.updatedAt = new Date().toISOString();

  revalidatePath('/');
  revalidatePath('/admin');
  return target;
}

export async function deleteIssue(issueId: string): Promise<{ success: boolean }> {
  // 1. Try Prisma
  try {
    await prisma.issue.delete({
      where: { id: issueId },
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.warn('Prisma delete failed, using memory store fallback:', error);
  }

  // 2. Fallback
  const memoryStore = getInMemoryStore();
  const idx = memoryStore.findIndex((i) => i.id === issueId);
  if (idx !== -1) {
    memoryStore.splice(idx, 1);
  }
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // 1. Try Prisma
  try {
    const issues = await prisma.issue.findMany({
      select: {
        status: true,
        upvotesCount: true,
      },
    });

    if (issues && issues.length > 0) {
      const stats: DashboardStats = {
        totalIssues: issues.length,
        reported: 0,
        inReview: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0,
        totalUpvotes: 0,
      };

      issues.forEach((i) => {
        stats.totalUpvotes += i.upvotesCount;
        switch (i.status) {
          case 'REPORTED':
            stats.reported++;
            break;
          case 'IN_REVIEW':
            stats.inReview++;
            break;
          case 'ASSIGNED':
            stats.assigned++;
            break;
          case 'IN_PROGRESS':
            stats.inProgress++;
            break;
          case 'RESOLVED':
            stats.resolved++;
            break;
        }
      });

      return stats;
    }
  } catch (error) {
    console.warn('Prisma stats query failed, calculating from memory store:', error);
  }

  // 2. Fallback
  const memoryStore = getInMemoryStore();
  const stats: DashboardStats = {
    totalIssues: memoryStore.length,
    reported: 0,
    inReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    totalUpvotes: 0,
  };

  memoryStore.forEach((i) => {
    stats.totalUpvotes += i.upvotesCount;
    switch (i.status) {
      case 'REPORTED':
        stats.reported++;
        break;
      case 'IN_REVIEW':
        stats.inReview++;
        break;
      case 'ASSIGNED':
        stats.assigned++;
        break;
      case 'IN_PROGRESS':
        stats.inProgress++;
        break;
      case 'RESOLVED':
        stats.resolved++;
        break;
    }
  });

  return stats;
}
