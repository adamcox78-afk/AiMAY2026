// Text Radar — Express server. Serves the API and, in production, the built client.

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import api from './routes.js';
import { MEDIA_DIR } from './media.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4870;

const app = express();
// generous limit: photo scans and MMS attachments arrive as base64 JSON
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', api);
app.use('/media', express.static(MEDIA_DIR, { maxAge: '1y', immutable: true }));

const dist = path.join(__dirname, '../../dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Text Radar server listening on http://localhost:${PORT}`);
});
