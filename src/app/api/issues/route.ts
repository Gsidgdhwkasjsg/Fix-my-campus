import { NextRequest, NextResponse } from 'next/server';
import { createIssue, getIssues } from '@/lib/actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const block = searchParams.get('block') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = (searchParams.get('sort') as any) || 'upvotes';
    const userIdentifier = searchParams.get('userIdentifier') || undefined;

    const issues = await getIssues({
      category,
      status,
      block,
      search,
      sort,
      userIdentifier,
    });

    return NextResponse.json({ success: true, issues });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const issue = await createIssue(body);
    return NextResponse.json({ success: true, issue }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create issue' },
      { status: 400 }
    );
  }
}
