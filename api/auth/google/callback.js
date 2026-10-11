const { sendJson } = require('../../upload/_drive-client');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  const clientId = process.env.GOOGLE_CLIENT_ID ? String(process.env.GOOGLE_CLIENT_ID).trim() : '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? String(process.env.GOOGLE_CLIENT_SECRET).trim() : '';

  if (!clientId || !clientSecret) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <html>
        <body style="background:#070b08;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#ff4757;">Configuration Missing</h2>
          <p>GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in environment variables.</p>
        </body>
      </html>
    `);
  }

  const host = req.headers.host || 'localhost';
  const proto = (req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https'));
  const currentUrl = new URL(req.url, `${proto}://${host}`);

  const code = currentUrl.searchParams.get('code');
  const errorParam = currentUrl.searchParams.get('error');

  if (errorParam) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <html>
        <body style="background:#070b08;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#ff4757;">Google OAuth Error</h2>
          <p>${escapeHtml(errorParam)}</p>
          <a href="/upload" style="color:#d8be97;text-decoration:none;">← Return to Upload</a>
        </body>
      </html>
    `);
  }

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <html>
        <body style="background:#070b08;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#ffab00;">No Code Provided</h2>
          <p>Please initiate authorization from the Upload Portal.</p>
          <a href="/upload" style="color:#d8be97;text-decoration:none;">← Go to Upload Portal</a>
        </body>
      </html>
    `);
  }

  // Determine redirect_uri: match the origin of the current request or default to production
  let redirectUri = `${proto}://${host}/api/auth/google/callback`;
  if (!host.includes('localhost') && !redirectUri.includes('photostudio.auralisstudio.xyz')) {
    redirectUri = 'https://photostudio.auralisstudio.xyz/api/auth/google/callback';
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      const errMsg = tokenData.error_description || tokenData.error || JSON.stringify(tokenData);
      res.writeHead(tokenRes.status, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <html>
          <body style="background:#070b08;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
            <h2 style="color:#ff4757;">OAuth Token Exchange Failed</h2>
            <p style="background:rgba(255,255,255,0.06);padding:14px;border-radius:8px;font-family:monospace;display:inline-block;text-align:left;">
              ${escapeHtml(errMsg)}
            </p>
            <div style="margin-top:20px;">
              <a href="/upload" style="color:#d8be97;text-decoration:none;">← Return to Upload Portal</a>
            </div>
          </body>
        </html>
      `);
    }

    const refreshToken = tokenData.refresh_token;

    // If running in local node environment and .env exists, we can automatically persist GOOGLE_REFRESH_TOKEN
    if (refreshToken) {
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          let envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
            envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*(\r?\n|$)/, `GOOGLE_REFRESH_TOKEN=${refreshToken}$1`);
          } else {
            envContent += `\nGOOGLE_REFRESH_TOKEN=${refreshToken}\n`;
          }
          fs.writeFileSync(envPath, envContent, 'utf8');
          process.env.GOOGLE_REFRESH_TOKEN = refreshToken;
        }
      } catch (_) {}
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Google Drive Vault Authorized — FRAMEHAUS</title>
        <style>
          body {
            background-color: #070b08;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 24px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(16, 22, 18, 0.95);
            border: 1px solid rgba(216, 190, 151, 0.25);
            border-radius: 16px;
            padding: 40px;
            max-width: 580px;
            width: 100%;
            text-align: center;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
          }
          .icon-badge {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: rgba(46, 213, 115, 0.15);
            color: #2ed573;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 20px;
          }
          h1 {
            font-size: 22px;
            margin: 0 0 10px 0;
            color: #ffffff;
          }
          p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .token-box {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 10px;
            padding: 16px;
            text-align: left;
            margin-bottom: 24px;
            word-break: break-all;
            font-family: monospace;
            font-size: 13px;
            color: #d8be97;
            user-select: all;
          }
          .token-label {
            font-size: 11px;
            color: rgba(255, 255, 255, 0.5);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 8px;
          }
          .btn {
            display: inline-block;
            background: #d8be97;
            color: #070b08;
            padding: 12px 28px;
            border-radius: 9999px;
            font-weight: 600;
            text-decoration: none;
            font-size: 14px;
            transition: opacity 0.2s;
          }
          .btn:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-badge">✓</div>
          <h1>Google Drive Vault Connected!</h1>
          <p>Your studio Google Drive authorization is successful. ${refreshToken ? 'Your refresh token has been received.' : 'Authorized session active.'}</p>
          
          ${refreshToken ? `
            <div class="token-label">Your Refresh Token (Add to Vercel Environment Variables):</div>
            <div class="token-box">GOOGLE_REFRESH_TOKEN=${escapeHtml(refreshToken)}</div>
          ` : `
            <p style="color:#d8be97;font-size:13px;">Google confirmed access. If you need a fresh refresh token, make sure prompt=consent is used on login.</p>
          `}

          <a href="/upload" class="btn">Open Upload Portal →</a>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`
      <html>
        <body style="background:#070b08;color:#fff;font-family:sans-serif;padding:40px;text-align:center;">
          <h2 style="color:#ff4757;">Server Error</h2>
          <p>${escapeHtml(err.message)}</p>
          <a href="/upload" style="color:#d8be97;text-decoration:none;">← Return to Upload Portal</a>
        </body>
      </html>
    `);
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
