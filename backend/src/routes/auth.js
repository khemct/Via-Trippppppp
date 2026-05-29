const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { validate, required, minLength, maxLength, isEmail, isIn } = require('../middleware/validate');

const router = express.Router();
const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;

function generateToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post(
  '/register',
  validate({
    name: [required, minLength(1), maxLength(100)],
    email: [required, isEmail, maxLength(255)],
    password: [required, minLength(8)],
    role: [required, isIn(['traveler', 'place_owner'])],
  }),
  async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();

      const existing = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const result = await query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [trimmedName, trimmedEmail, passwordHash, role]
      );

      const user = result.rows[0];
      const token = generateToken(user);

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
