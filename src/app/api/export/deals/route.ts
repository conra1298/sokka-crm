import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { exportDealsCSV } from '@/lib/services/export.service';

export async function GET() {
  try {
    const user = await requireAuth('admin');
    const csvContent = await exportDealsCSV(user);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sokka_crm_deals_${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Forbidden' }, { status: 403 });
  }
}
