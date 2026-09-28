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

export async function getIssues(params: IssueFilterParams = {}): Promise<IssueItem[]> {
  try {
    const { category, status, block, search, sort = 'upvotes', userIdentifier } = params;

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

    return issues.map((issue) => ({
      ...issue,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      hasUpvoted: Boolean(issue.upvotes && issue.upvotes.length > 0),
    }));
  } catch (error) {
    console.error('Failed to get issues:', error);
    throw new Error('Could not fetch issues from database.');
  }
}

export async function createIssue(data: CreateIssueInput): Promise<IssueItem> {
  try {
    if (!data.title?.trim() || !data.description?.trim()) {
      throw new Error('Title and description are required.');
    }
    if (!data.block?.trim() || !data.floor?.trim() || !data.room?.trim()) {
      throw new Error('Block, floor, and room location are required.');
    }

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
  } catch (error: any) {
    console.error('Failed to create issue:', error);
    throw new Error(error.message || 'Could not report issue.');
  }
}

export async function toggleUpvote(
  issueId: string,
  userIdentifier: string
): Promise<{ hasUpvoted: boolean; upvotesCount: number }> {
  try {
    if (!issueId || !userIdentifier) {
      throw new Error('Missing issueId or userIdentifier.');
    }

    // Check if upvote already exists
    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        issueId_userIdentifier: {
          issueId,
          userIdentifier,
        },
      },
    });

    if (existingUpvote) {
      // Remove upvote & decrement
      await prisma.$transaction([
        prisma.upvote.delete({
          where: {
            id: existingUpvote.id,
          },
        }),
        prisma.issue.update({
          where: { id: issueId },
          data: {
            upvotesCount: {
              decrement: 1,
            },
          },
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
      // Add upvote & increment
      await prisma.$transaction([
        prisma.upvote.create({
          data: {
            issueId,
            userIdentifier,
          },
        }),
        prisma.issue.update({
          where: { id: issueId },
          data: {
            upvotesCount: {
              increment: 1,
            },
          },
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
  } catch (error: any) {
    console.error('Failed to toggle upvote:', error);
    throw new Error(error.message || 'Failed to update upvote.');
  }
}

export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus | string,
  adminNote?: string | null
): Promise<IssueItem> {
  try {
    const validStatuses = ['REPORTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
    const normalizedStatus = status.toUpperCase();

    if (!validStatuses.includes(normalizedStatus)) {
      throw new Error(`Invalid status: ${status}`);
    }

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
  } catch (error: any) {
    console.error('Failed to update issue status:', error);
    throw new Error(error.message || 'Failed to update issue status.');
  }
}

export async function deleteIssue(issueId: string): Promise<{ success: boolean }> {
  try {
    await prisma.issue.delete({
      where: { id: issueId },
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete issue:', error);
    throw new Error('Failed to delete issue.');
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const issues = await prisma.issue.findMany({
      select: {
        status: true,
        upvotesCount: true,
      },
    });

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
  } catch (error) {
    console.error('Failed to get stats:', error);
    return {
      totalIssues: 0,
      reported: 0,
      inReview: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      totalUpvotes: 0,
    };
  }
}
