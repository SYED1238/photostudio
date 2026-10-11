const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple native .env loader without external packages
function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const full = path.join(__dirname, '..', file);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          let val = trimmed.slice(idx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          // .env.local overrides .env
          process.env[key] = val;
        }
      });
    }
  }
}

loadEnv();

const PORT = process.env.PORT || 3001;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

const routePaths = {
  '/api/upload/config': '../api/upload/config',
  '/api/upload/initiate': '../api/upload/initiate',
  '/api/upload/create-folder': '../api/upload/create-folder',
  '/api/upload/oauth-auth-url': '../api/upload/oauth-auth-url',
  '/api/upload/oauth-callback': '../api/upload/oauth-callback',
  '/api/auth/google/callback': '../api/auth/google/callback'
};

const server = http.createServer(async (req, res) => {
  // Always ensure fresh env on incoming API calls
  loadEnv();

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Passcode, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURI(parsedUrl.pathname);

  // Check API routes
  if (routePaths[pathname]) {
    try {
      const driveClientPath = path.resolve(__dirname, '../api/upload/_drive-client');
      if (require.cache[require.resolve(driveClientPath)]) {
        delete require.cache[require.resolve(driveClientPath)];
      }
      const resolved = path.resolve(__dirname, routePaths[pathname]);
      delete require.cache[require.resolve(resolved)];
      const handler = require(resolved);
      await handler(req, res);
    } catch (err) {
      console.error(`API Error on ${pathname}:`, err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
    }
    return;
  }

  // Static routing
  let reqPath = pathname;
  if (reqPath === '/') reqPath = '/index.html';
  if (reqPath === '/upload' || reqPath === '/upload/') reqPath = '/upload.html';
  if (reqPath === '/studio-gallery' || reqPath === '/studio-gallery/') reqPath = '/studio-gallery/index.html';

  let filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);
  const range = req.headers.range;

  if (range && ext === '.mp4') {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mime,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': mime,
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Framehaus Studio Server listening on http://localhost:${PORT}`);
  console.log(`  -> Home: http://localhost:${PORT}/`);
  console.log(`  -> Upload Portal: http://localhost:${PORT}/upload`);
  console.log(`  -> Gallery: http://localhost:${PORT}/studio-gallery`);
});
