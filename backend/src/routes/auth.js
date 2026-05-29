const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { query } = require('../config/database');
const { validate, required, minLength, maxLength, isEmail, isIn } = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/requireAuth');
const { sendPasswordResetEmail } = require('../services/emailService');

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

// POST /api/auth/login
router.post(
  '/login',
  validate({
    email: [required, isEmail],
    password: [required],
  }),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const trimmedEmail = email.trim().toLowerCase();

      const result = await query(
        'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
        [trimmedEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);

      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('/me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/admin/test — admin-only test endpoint
router.get('/admin/test', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted', user: req.user });
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { error: 'Too many requests. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate({
    email: [required, isEmail],
  }),
  async (req, res) => {
    try {
      const { email } = req.body;
      const trimmedEmail = email.trim().toLowerCase();

      const result = await query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);

      if (result.rows.length > 0) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await query(
          `UPDATE users
           SET reset_token_hash = $1, reset_token_expires_at = NOW() + INTERVAL '1 hour'
           WHERE id = $2`,
          [tokenHash, result.rows[0].id]
        );

        await sendPasswordResetEmail(trimmedEmail, rawToken);
      }

      res.json({ message: 'If this email is registered, a reset link has been sent' });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  validate({
    token: [required],
    password: [required, minLength(8)],
  }),
  async (req, res) => {
    try {
      const { token, password } = req.body;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const result = await query(
        'SELECT id FROM users WHERE reset_token_hash = $1 AND reset_token_expires_at > NOW()',
        [tokenHash]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      await query(
        'UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = $2',
        [passwordHash, result.rows[0].id]
      );

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
