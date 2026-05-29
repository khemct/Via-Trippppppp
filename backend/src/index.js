require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { pool } = require('./config/database');
const { runMigrations } = require('./migrations/run');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
