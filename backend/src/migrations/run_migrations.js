import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pg;
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

export async function runMigrations() {
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables.');
  }

  const useSsl = dbUrl.includes('sslmode=') || dbUrl.includes('neon.tech') || process.env.NODE_ENV === 'production';
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  try {
    const rootDir = path.resolve(process.cwd(), '..');
    const migrationsDirs = [
      path.join(rootDir, 'database/migrations'),
      path.join(process.cwd(), 'migrations'),
      path.join(process.cwd(), '../database/migrations'),
    ];

    let migrationsDir = migrationsDirs.find((d) => fs.existsSync(d));
    if (migrationsDir) {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
      for (const file of files) {
        const fullPath = path.join(migrationsDir, file);
        console.log(`Running PostgreSQL migration: ${file}...`);
        const sql = fs.readFileSync(fullPath, 'utf8');
        await pool.query(sql);
      }
      console.log('All migrations completed successfully on Neon PostgreSQL!');
    } else {
      const fallbackPaths = [
        path.join(rootDir, 'database/schema.sql'),
        path.join(process.cwd(), '../database/schema.sql'),
      ];
      const sqlPath = fallbackPaths.find((p) => fs.existsSync(p));
      if (sqlPath) {
        console.log(`Running PostgreSQL migration from: ${sqlPath}...`);
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        await pool.query(sqlContent);
        console.log('Migration completed successfully on Neon PostgreSQL!');
      }
    }
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && (process.argv[1].endsWith('run_migrations.js') || process.argv[1].includes('run_migrations'))) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
