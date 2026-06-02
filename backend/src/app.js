const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const waypointRoutes = require('./routes/waypoints');
const recommendationRoutes = require('./routes/recommendations');
const tripRoutes = require('./routes/trips');
const placesRoutes = require('./routes/places');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

const { pool } = require('./config/database');
app.locals.pool = pool;

app.use('/api/trips', waypointRoutes);
app.use('/api/trips', recommendationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', placesRoutes);

module.exports = app;
