import { NextRequest, NextResponse } from 'next/server';
import { updateIssueStatus, deleteIssue } from '@/lib/actions';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status, adminNote } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const updated = await updateIssueStatus(id, status, adminNote);
    return NextResponse.json({ success: true, issue: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update issue' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await deleteIssue(id);
    return NextResponse.json({ success: true, message: 'Issue deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete issue' },
      { status: 500 }
    );
  }
}
