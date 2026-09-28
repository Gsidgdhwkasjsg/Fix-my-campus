import { NextRequest, NextResponse } from 'next/server';
import { toggleUpvote } from '@/lib/actions';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { userIdentifier } = body;

    if (!userIdentifier) {
      return NextResponse.json(
        { success: false, error: 'User identifier is required' },
        { status: 400 }
      );
    }

    const result = await toggleUpvote(id, userIdentifier);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}
