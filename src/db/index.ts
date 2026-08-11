import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import path from 'path';
import * as schema from './schema';

const globalForDb = globalThis as unknown as { db?: any; client?: any };

function createDatabaseInstance() {
  if (typeof window !== 'undefined') {
    return null as any;
  }

  if (globalForDb.db) return globalForDb.db;

  const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'sokka_crm.db')}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log(`⚡ Conectando a base de datos (${url.startsWith('file:') ? 'SQLite Local' : 'Turso Cloud'})...`);

  // Bypass local Windows certificate store issues if running locally
  if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  let client = globalForDb.client;
  if (!client) {
    client = createClient({
      url,
      authToken,
    });
    globalForDb.client = client;
  }

  const instance = drizzle(client, { schema });
  globalForDb.db = instance;
  return instance;
}

export const db = createDatabaseInstance();

