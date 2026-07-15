// Text Radar — photo-to-text OCR (tesseract.js, runs fully on this server).
// The English language model ships as an npm dependency (@tesseract.js-data/eng),
// so scanning works offline with no runtime downloads.

import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createWorker } from 'tesseract.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LANG_DIR = path.join(path.dirname(require.resolve('@tesseract.js-data/eng/package.json')), '4.0.0_best_int');
const CACHE_DIR = process.env.TEXT_RADAR_DATA_DIR
  ? path.join(process.env.TEXT_RADAR_DATA_DIR, 'ocr-cache')
  : path.join(__dirname, '../../data/ocr-cache');

let workerPromise = null;

function getWorker() {
  if (!workerPromise) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    // tesseract.js reports worker failures through an event that throws
    // uncaught (crashing the process) unless an errorHandler is supplied —
    // capture the first error and surface it as a normal rejection instead.
    let rejectError;
    const failed = new Promise((_, reject) => { rejectError = reject; });
    const created = createWorker('eng', 1, {
      langPath: LANG_DIR,
      gzip: true,
      cachePath: CACHE_DIR,
      errorHandler: (err) => rejectError(err instanceof Error ? err : new Error(String(err)))
    });
    workerPromise = Promise.race([created, failed]).catch((err) => {
      workerPromise = null; // allow retry on next request
      throw err;
    });
  }
  return workerPromise;
}

/** Recognize text in an image buffer (png/jpeg/webp/bmp). Returns plain text. */
export async function ocrImage(buffer) {
  const worker = await getWorker();
  const { data } = await worker.recognize(buffer);
  return data.text || '';
}
