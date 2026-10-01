// Minimal zero-dependency static file server for local preview.
// Usage: node server.js [port]
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.argv[2]) || 4311;
const ROOT = __dirname;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  // frame writer: POST /_write?name=frame_0001.webp  (raw body = image bytes)
  if (req.method === 'POST' && req.url.startsWith('/_write')) {
    const name = new URL(req.url, 'http://x').searchParams.get('name') || '';
    if (!/^[A-Za-z0-9_.-]+.(webp|jpg|png|json)$/.test(name)) { res.writeHead(400); return res.end('bad name'); }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      fs.mkdirSync(path.join(ROOT, 'frames'), { recursive: true });
      fs.writeFileSync(path.join(ROOT, 'frames', name), Buffer.concat(chunks));
      res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('ok');
    });
    return;
  }

  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(ROOT, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found: " + urlPath);
    }
    const ext = path.extname(filePath).toLowerCase();
    // Mirror the production CSP (deploy/nginx-shrinil.conf) on the real page
    // so a policy that breaks the site fails here, not on the VPS.
    // tools/extract.html is exempt — it uses an inline script by design.
    const CSP_PROD = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'";
    const isPage = urlPath === "/" || urlPath === "/index.html";
    const headers = { "Content-Type": TYPES[ext] || "application/octet-stream" };
    if (isPage) headers["Content-Security-Policy"] = CSP_PROD;
    // range support (helps <video> scrubbing)
    const range = req.headers.range;
    if (range && /^bytes=/.test(range)) {
      const [s, e] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(s, 10);
      const end = e ? parseInt(e, 10) : stat.size - 1;
      res.writeHead(206, {
        ...headers,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": end - start + 1,
      });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }
    res.writeHead(200, { ...headers, "Content-Length": stat.size, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => console.log(`preview server: http://localhost:${PORT}`));
