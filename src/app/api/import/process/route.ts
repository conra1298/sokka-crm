import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { processCSVContent } from '@/lib/services/import.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    const { csvContent, columnMapping } = await request.json();

    if (!csvContent) {
      return NextResponse.json({ error: 'Missing CSV content' }, { status: 400 });
    }

    const reviewData = await processCSVContent(csvContent, columnMapping || {}, user);
    return NextResponse.json(reviewData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing CSV' }, { status: 400 });
  }
}
