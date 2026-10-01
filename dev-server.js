// Kitchen Food local server: serves the site in public/ and the AI endpoint, like Vercel does in production.
// Recipes come from a local Ollama model by default (USE_LOCAL_MODEL=false switches to Anthropic).
// Any API key stays here on the server; the browser never sees it.
//
//   npm install
//   npm start            (reads settings from the environment or a .env file)
//
// Then open http://localhost:5500 (or the PORT you set).

import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { handleGenerate, send, warmUpLocalModel } from './lib/recipes.js';
import { serveSeoFile } from './lib/seo.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const PORT = Number(process.env.PORT) || Number(process.argv[2]) || 5500;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon'
};

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (urlPath === '/robots.txt' || urlPath === '/sitemap.xml') return serveSeoFile(req, res, urlPath.slice(1));
  const file = path.normalize(path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(ROOT + path.sep)) { res.writeHead(404); return res.end('Not found'); }
  try {
    const data = await readFile(file);
    const ext = path.extname(file).toLowerCase();
    const headers = {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      // Photos rarely change, so browsers keep them a week; code and pages are rechecked on every visit.
      'Cache-Control': /^\.(jpe?g|png|webp|svg|ico)$/.test(ext) ? 'public, max-age=604800' : 'no-cache'
    };
    if (/^\.(html|js|css|json|svg)$/.test(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      res.writeHead(200, headers);
      return res.end(gzipSync(data));
    }
    res.writeHead(200, headers);
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}

warmUpLocalModel();

http.createServer((req, res) => {
  if (req.url.startsWith('/api/generate-dish')) {
    if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' });
    return handleGenerate(req, res);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  serveStatic(req, res);
}).listen(PORT, () => console.log(`Kitchen Food running at http://localhost:${PORT}`));
