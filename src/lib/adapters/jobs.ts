import PgBoss from 'pg-boss';

const connectionString = process.env.DATABASE_URL || 'postgresql://sokka:sokka@localhost:5432/sokka_crm';

let bossInstance: PgBoss | null = null;

export async function getBossInstance(): Promise<PgBoss> {
  if (!bossInstance) {
    bossInstance = new PgBoss({
      connectionString,
      schema: 'pgboss',
    });

    bossInstance.on('error', (error) => console.error('pg-boss error:', error));

    await bossInstance.start();
    console.log('pg-boss queue manager started.');
  }

  return bossInstance;
}

export async function enqueueJob(jobName: string, data: object, options?: PgBoss.SendOptions) {
  try {
    const boss = await getBossInstance();
    return await boss.send(jobName, data, options || {});
  } catch (err) {
    console.warn('Queue warning (executing synchronously):', err);
    return null;
  }
}
