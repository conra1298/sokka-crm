import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { createActivity } from '@/lib/services/activity.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const activity = await createActivity(
      {
        type: body.type,
        content: body.content,
        contactId: body.contactId,
        dealId: body.dealId,
        companyId: body.companyId,
      },
      user
    );

    return NextResponse.json({ success: true, activity });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 400 });
  }
}
