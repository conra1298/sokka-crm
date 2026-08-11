import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';

async function runMigrations() {
  console.log('Running database migrations...');
  try {
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('Database migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
