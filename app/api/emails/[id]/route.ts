import { updateEmailStatus } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const { status } = await request.json();
    const emailId = parseInt(id, 10);

    console.log(' PATCH Request Debug:');
    console.log('  id (raw):', id);
    console.log('  emailId (parsed):', emailId);
    console.log('  status:', status);
    console.log('  emailId is valid?', !isNaN(emailId) && emailId > 0);
    console.log('  status is valid?', status && typeof status === 'string');

    if (isNaN(emailId) || emailId <= 0) {
      console.error(' Invalid emailId:', emailId);
      return NextResponse.json(
        { error: 'Invalid emailId' },
        { status: 400 }
      );
    }

    if (!status) {
      console.error(' Missing status');
      return NextResponse.json(
        { error: 'Missing status' },
        { status: 400 }
      );
    }

    // Validate status against new Kanban columns
    const validStatuses = ['to_do', 'in_progress', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const success = updateEmailStatus(emailId, status);

    if (!success) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Updated email ${emailId} status to: ${status}`);

    return NextResponse.json({ success: true, emailId, status });
  } catch (error) {
    console.error('PATCH API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update email status', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
