import fs from 'fs';
import path from 'path';
import fileUrl from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool, Client } = pg;
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/leafiq_db';

async function ensureDatabaseExists() {
  const urlObj = new URL(dbUrl);
  const targetDbName = urlObj.pathname.replace(/^\//, '') || 'leafiq_db';

  // Connect to default 'postgres' database to check/create target database
  urlObj.pathname = '/postgres';
  const defaultClient = new Client({ connectionString: urlObj.toString() });

  try {
    await defaultClient.connect();
    const res = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (res.rowCount === 0) {
      console.log(`Database '${targetDbName}' does not exist. Creating...`);
      await defaultClient.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database '${targetDbName}' created successfully.`);
    } else {
      console.log(`Database '${targetDbName}' already exists.`);
    }
  } catch (err) {
    console.warn(`[Warning] Database existence check: ${err.message}. Assuming target DB is available.`);
  } finally {
    await defaultClient.end().catch(() => {});
  }
}

export async function runMigrations() {
  await ensureDatabaseExists();

  const pool = new Pool({ connectionString: dbUrl });

  try {
    const currentDir = path.dirname(fileUrl.fileURLToPath(import.meta.url));
    const sqlPath = path.join(currentDir, '../../migrations/001_initial_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running PostgreSQL migration: 001_initial_schema.sql...');
    await pool.query(sqlContent);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith('run_migrations.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
