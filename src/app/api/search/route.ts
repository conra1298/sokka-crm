import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { globalSearch } from '@/lib/services/search.service';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    const results = await globalSearch(q, user);
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al buscar' }, { status: 500 });
  }
}
