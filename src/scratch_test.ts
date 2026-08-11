import { PGlite } from '@electric-sql/pglite';
import path from 'path';

async function test() {
  try {
    const dbPath = path.resolve(process.cwd(), 'sokka_crm_pgdata');
    console.log('Testing PGlite init with path:', dbPath);
    const db = new PGlite(dbPath);
    await db.waitReady;
    const res = await db.query('SELECT 1 as num');
    console.log('PGlite query result:', res);
  } catch (err) {
    console.error('PGlite init error:', err);
  }
}

test();
