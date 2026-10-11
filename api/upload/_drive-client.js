/**
 * Shared Google Drive API v3 & OAuth 2.0 Client Helper
 * Pure Node.js (v18+) using native fetch — zero external dependencies.
 */

const fs = require('fs');
const path = require('path');

// Memory cache for active access token
let cachedAccessToken = null;
let tokenExpiresAt = 0;

// Rate limiting tracking map: IP -> { count, resetAt }
const rateLimitMap = new Map();

/**
 * Auto-loads environment variables from .env and .env.local if not already in environment.
 * In accordance with standard conventions, .env.local values override .env values.
 */
function ensureEnvLoaded() {
  const root = path.resolve(__dirname, '../..');
  const envFiles = ['.env', '.env.local'];
  for (const file of envFiles) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) {
      try {
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
            process.env[key] = val;
          }
        });
      } catch (_) {}
    }
  }
}

ensureEnvLoaded();

/**
 * Parses JSON body from incoming request (supports both Vercel Serverless and Node http)
 */
async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (_) {
      return {};
    }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (_) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

/**
 * Sends standard JSON response (supports both Vercel Serverless res.status().json() and Node http)
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Passcode, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

/**
 * Checks lightweight access gate passcode
 */
function verifyPasscode(req, body = {}) {
  ensureEnvLoaded();
  const expectedPasscode = process.env.UPLOAD_PASSCODE ? String(process.env.UPLOAD_PASSCODE).trim() : '';
  if (!expectedPasscode) return true; // Gate is open if no passcode configured

  const headerPasscode = req.headers && (req.headers['x-upload-passcode'] || req.headers['x-passcode']);
  const queryPasscode = req.url && new URL(req.url, 'http://localhost').searchParams.get('passcode');
  const bodyPasscode = body && body.passcode;

  const provided = String(headerPasscode || queryPasscode || bodyPasscode || '').trim();
  return provided === expectedPasscode;
}

/**
 * Extracts and cleans the Google Drive folder ID
 * Accepts either raw folder ID or full Google Drive URL
 */
function getDestinationFolderId() {
  ensureEnvLoaded();
  const raw = process.env.GOOGLE_DRIVE_FOLDER_ID ? String(process.env.GOOGLE_DRIVE_FOLDER_ID).trim() : '';
  if (!raw) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID is not configured in server environment variables.');
  }

  // If a full Drive URL was provided (e.g., https://drive.google.com/drive/folders/1abc123...)
  if (raw.includes('drive.google.com')) {
    const match = raw.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    const idParamMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return idParamMatch[1];
    }
  }

  // Validate clean ID characters
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(raw)) {
    throw new Error('Invalid GOOGLE_DRIVE_FOLDER_ID format. Please provide a valid Google Drive folder ID.');
  }

  return raw;
}

/**
 * Validates that an upload destination is either the root destination folder
 * or a verified subfolder created inside the destination folder.
 * NEVER allows visitors to choose arbitrary external Google Drive folder IDs.
 */
async function validateParentFolder(requestedFolderId) {
  const rootDestinationId = getDestinationFolderId();
  if (!requestedFolderId || requestedFolderId === rootDestinationId) {
    return rootDestinationId;
  }

  if (!/^[a-zA-Z0-9_-]{10,}$/.test(requestedFolderId)) {
    return rootDestinationId;
  }

  try {
    const token = await getAccessToken();
    let currentId = requestedFolderId;
    for (let depth = 0; depth < 4; depth++) {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${currentId}?fields=id,parents,trashed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) break;
      const data = await res.json();
      if (data.trashed) break;
      if (data.parents && data.parents.includes(rootDestinationId)) {
        return requestedFolderId;
      }
      if (data.parents && data.parents[0]) {
        currentId = data.parents[0];
      } else {
        break;
      }
    }
  } catch (err) {
    console.warn(`[Folder Validation] Fallback to destination root: ${err.message}`);
  }

  return rootDestinationId;
}

/**
 * Retrieves a valid Google OAuth access token.
 * 1. Uses refresh token via Google OAuth2 token endpoint.
 * 2. Caches token in memory until 60 seconds before expiration.
 * 3. Supports direct GOOGLE_ACCESS_TOKEN as local development fallback.
 */
async function getAccessToken() {
  ensureEnvLoaded();

  const clientId = process.env.GOOGLE_CLIENT_ID ? String(process.env.GOOGLE_CLIENT_ID).trim() : '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? String(process.env.GOOGLE_CLIENT_SECRET).trim() : '';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN ? String(process.env.GOOGLE_REFRESH_TOKEN).trim() : '';
  const directAccessToken = process.env.GOOGLE_ACCESS_TOKEN ? String(process.env.GOOGLE_ACCESS_TOKEN).trim() : '';

  const now = Date.now();
  if (cachedAccessToken && tokenExpiresAt > now + 60000) {
    return cachedAccessToken;
  }

  // Refresh token flow
  if (clientId && clientSecret && refreshToken) {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      cachedAccessToken = tokenData.access_token;
      tokenExpiresAt = now + (Number(tokenData.expires_in) || 3600) * 1000;
      return cachedAccessToken;
    } else {
      const errText = await tokenRes.text();
      let errJson;
      try { errJson = JSON.parse(errText); } catch (_) {}
      const description = (errJson && errJson.error_description) || errText;

      if (directAccessToken) {
        console.warn(`[OAuth] Refresh warning (${description}). Using active GOOGLE_ACCESS_TOKEN.`);
        cachedAccessToken = directAccessToken;
        tokenExpiresAt = now + 1800000; // 30 mins
        return cachedAccessToken;
      }

      throw new Error(`Google OAuth token refresh failed (${tokenRes.status}): ${description}`);
    }
  }

  // Direct active access token fallback
  if (directAccessToken) {
    cachedAccessToken = directAccessToken;
    tokenExpiresAt = now + 1800000;
    return cachedAccessToken;
  }

  const missing = [];
  if (!clientId) missing.push('GOOGLE_CLIENT_ID');
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN');
  throw new Error(`Google OAuth credentials not fully configured. Missing: ${missing.join(', ')}`);
}

/**
 * Lightweight rate-limiting and abuse guard
 */
function checkRateLimit(req, maxPerWindow = 120, windowMs = 600000) {
  const ip = (req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count++;
  }

  rateLimitMap.set(ip, entry);
  return entry.count <= maxPerWindow;
}

/**
 * Sanitizes uploaded filename to prevent directory traversal or control characters
 */
function sanitizeFileName(name) {
  if (!name || typeof name !== 'string') return 'upload.bin';
  return name.replace(/[\x00-\x1f\x80-\x9f]/g, '').replace(/[\\/]/g, '_').trim().slice(0, 255) || 'upload.bin';
}

module.exports = {
  ensureEnvLoaded,
  parseJsonBody,
  sendJson,
  verifyPasscode,
  getDestinationFolderId,
  validateParentFolder,
  getAccessToken,
  checkRateLimit,
  sanitizeFileName
};
