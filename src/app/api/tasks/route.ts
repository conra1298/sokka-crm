import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { createTask } from '@/lib/services/task.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const task = await createTask(
      {
        title: body.title,
        dueDate: body.dueDate,
        contactId: body.contactId,
        dealId: body.dealId,
        companyId: body.companyId,
        assignedTo: body.assignedTo,
      },
      user
    );

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
