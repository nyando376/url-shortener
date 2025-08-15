import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pool } from './src/db.js';
import { nanoid } from 'nanoid';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL?.replace(/\/+$/, '') || `http://localhost:${PORT}`;

app.get('/api/health', async (_req, res) => {
  try {
    const [r] = await pool.query('SELECT 1 AS ok');
    res.json({ ok: r[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/shorten', async (req, res) => {
  try {
    const { url, code } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });

    const finalCode = (code && /^[A-Za-z0-9_-]{3,64}$/.test(code)) ? code : nanoid(7);

    await pool.query(
      'INSERT INTO urls (code, url) VALUES (?, ?) ON DUPLICATE KEY UPDATE url = VALUES(url)',
      [finalCode, url]
    );

    res.json({ code: finalCode, short_url: `${BASE_URL}/${finalCode}`, url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const [rows] = await pool.query('SELECT url FROM urls WHERE code = ?', [code]);
    if (!rows.length) return res.status(404).send('Not Found');
    res.redirect(rows[0].url);
  } catch (e) {
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
