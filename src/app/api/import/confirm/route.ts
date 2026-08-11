import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/services/auth.service';
import { createImportJob, confirmImportInsert } from '@/lib/services/import.service';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth('admin');
    const { fileName, validRecords } = await request.json();

    if (!validRecords || !Array.isArray(validRecords)) {
      return NextResponse.json({ error: 'No valid records to confirm' }, { status: 400 });
    }

    const job = await createImportJob(fileName || 'import.csv', 'imports/key.csv', 'contact', user);
    const updatedJob = await confirmImportInsert(job.id, validRecords, user);

    return NextResponse.json({ success: true, inserted_count: validRecords.length, job: updatedJob });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error confirming import' }, { status: 400 });
  }
}
