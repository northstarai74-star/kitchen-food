// robots.txt and sitemap.xml are built from the request's host, so they are correct on any domain.
// Used by the local server and by api/seo.js on Vercel (vercel.json rewrites both paths there).

export function serveSeoFile(req, res, file) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const origin = `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
  if (file === 'robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`);
  }
  res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}/</loc></url>\n</urlset>\n`);
}
