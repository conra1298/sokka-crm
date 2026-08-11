import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import * as schema from './db/schema';

async function test() {
  try {
    const pglite = new PGlite();
    await pglite.waitReady;
    const db = drizzle(pglite, { schema });
    console.log('PGlite in-memory initialized successfully!');
  } catch (err) {
    console.error('PGlite error:', err);
  }
}

test();
