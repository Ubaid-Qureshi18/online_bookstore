/* ═══════════════════════════════════════════════
   ARCANUM — Express Server
   ═══════════════════════════════════════════════ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for dev/testing
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes (MUST come before static files) ─
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/my-library', require('./routes/library'));
app.use('/api/admin', require('./routes/admin'));

// ─── Health Check ───────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'Arcanum API', timestamp: new Date().toISOString() });
});

// ─── Static Files ───────────────────────────
// Serve uploaded covers and book assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ─── Frontend Routes (SPA Fallback) ─────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
});

// ─── Error Handler ──────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ───────────────────────────
app.listen(PORT, () => {
  console.log(`\n═══════════════════════════════════════`);
  console.log(`  ARCANUM — Rare Books API Server`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  Frontend: http://localhost:${PORT}/index.html`);
  console.log(`═══════════════════════════════════════\n`);
});
