// server.js
import 'dotenv/config';
import express from 'express';
import { pool } from './src/db.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL =
  (process.env.BASE_URL || '').replace(/\/+$/, '') || `http://localhost:${PORT}`;

app.get('/api/health', async (_req, res) => {
  try {
    const [r] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: r?.[0]?.ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/debug/lookup/:code', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM urls WHERE code = ?', [
      req.params.code,
    ]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/shorten', async (req, res) => {
  try {
    const { url, code } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url required' });
    if (!code || !/^[A-Za-z0-9_-]{3,64}$/.test(code))
      return res.status(400).json({ error: 'invalid code' });

    await pool.query(
      'INSERT INTO urls (code, url) VALUES (?, ?) ON DUPLICATE KEY UPDATE url = VALUES(url)',
      [code, url]
    );

    res.json({ code, short_url: `${BASE_URL}/${code}`, url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/:code', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT url FROM urls WHERE code = ?', [
      req.params.code,
    ]);
    const target = rows?.[0]?.url;
    if (!target) return res.status(404).send('Not Found');
    res.redirect(target);
  } catch (e) {
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
