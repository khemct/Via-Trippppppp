const fs = require('fs');
const path = require('path');

async function runMigrations(pool) {
  await pool.query('CREATE EXTENSION IF NOT EXISTS postgis');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = path.join(__dirname, '..', '..', 'sql');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query(
      'SELECT name FROM _migrations WHERE name = $1',
      [file]
    );
    if (rows.length > 0) {
      console.log(`Skipping already applied: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Applying migration: ${file}`);
    await pool.query(sql);
    await pool.query(
      'INSERT INTO _migrations (name) VALUES ($1)',
      [file]
    );
    console.log(`  ✓ ${file} applied`);
  }

  console.log('All migrations complete.');
}

module.exports = { runMigrations };
