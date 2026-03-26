import { NextRequest, NextResponse } from 'next/server';
import { deleteEmail } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { emailId } = await request.json();

    if (!emailId || typeof emailId !== 'number') {
      return NextResponse.json(
        { error: 'Invalid emailId' },
        { status: 400 }
      );
    }

    const success = deleteEmail(emailId);

    if (!success) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, emailId });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json(
      { error: 'Failed to delete email' },
      { status: 500 }
    );
  }
}
