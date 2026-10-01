import { serveSeoFile } from '../lib/seo.js';

// vercel.json rewrites /robots.txt and /sitemap.xml here.
export default function handler(req, res) {
  const file = new URL(req.url, 'http://x').searchParams.get('file') === 'robots' ? 'robots.txt' : 'sitemap.xml';
  serveSeoFile(req, res, file);
}
