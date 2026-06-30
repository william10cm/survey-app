import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// RDS rejects non-SSL connections; trust the RDS-managed cert without bundling
// a CA. Disable for local dev via DB_SSL=false (matches db/client.ts).
const ssl = process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false };

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT) || 5433,
  database: process.env.DB_NAME     || 'survey_app',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'Panera10',
  ssl,
});

const run = async () => {
  const client = await pool.connect();
  try {
    // Track which migrations have run
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        run_at     TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      );
      if (rows.length > 0) {
        console.log(`⏭  Skipping ${file} (already run)`);
        continue;
      }

      console.log(`⚡ Running ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      console.log(`✅ ${file} complete`);
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();