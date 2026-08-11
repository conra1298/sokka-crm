import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { mergeContacts } from '@/lib/services/contact.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    const { targetId, sourceId, fieldSelections } = await request.json();

    if (!targetId || !sourceId) {
      return NextResponse.json({ error: 'Target ID and Source ID are required' }, { status: 400 });
    }

    const merged = await mergeContacts(sourceId, targetId, fieldSelections || {}, user);
    return NextResponse.json({ success: true, contact: merged });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error merging contacts' }, { status: 400 });
  }
}
