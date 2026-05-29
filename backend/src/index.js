require('dotenv').config();

const app = require('./app');
const { pool } = require('./config/database');
const { runMigrations } = require('./migrations/run');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');

    await runMigrations(pool);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
