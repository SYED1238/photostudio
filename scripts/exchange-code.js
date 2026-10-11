const fs = require('fs');
const path = require('path');

// Usage: node scripts/exchange-code.js "<code or full redirect url>"
const input = process.argv[2];
if (!input) {
  console.error('Please provide the OAuth code or full redirect URL as an argument:');
  console.error('node scripts/exchange-code.js "<code_or_url>"');
  process.exit(1);
}

// Simple native .env loader
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}

loadEnv();

let code = input.trim();
let redirectUri = 'https://photostudio.auralisstudio.xyz/api/auth/google/callback';

if (code.includes('code=')) {
  try {
    const url = new URL(code.startsWith('http') ? code : `https://${code}`);
    code = url.searchParams.get('code') || code;
    if (url.searchParams.get('redirect_uri')) {
      redirectUri = url.searchParams.get('redirect_uri');
    }
  } catch (_) {
    const m = code.match(/code=([^&]+)/);
    if (m && m[1]) code = decodeURIComponent(m[1]);
  }
}

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Error: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not found in .env');
  process.exit(1);
}

console.log('Exchanging code for Google Refresh Token...');
console.log('Client ID:', clientId);
console.log('Redirect URI:', redirectUri);

const params = new URLSearchParams({
  code,
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  grant_type: 'authorization_code'
});

fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: params.toString()
})
  .then(async res => {
    const data = await res.json();
    if (!res.ok) {
      console.error(`Error (${res.status}):`, data.error_description || data.error || data);
      process.exit(1);
    }

    console.log('\n======================================================');
    console.log('✓ SUCCESS! Google OAuth Token Exchange Successful');
    console.log('======================================================');
    if (data.refresh_token) {
      console.log('GOOGLE_REFRESH_TOKEN=' + data.refresh_token);

      // Save to .env
      const envPath = path.resolve(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
          envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*(\r?\n|$)/, `GOOGLE_REFRESH_TOKEN=${data.refresh_token}$1`);
        } else {
          envContent += `\nGOOGLE_REFRESH_TOKEN=${data.refresh_token}\n`;
        }
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('-> Saved GOOGLE_REFRESH_TOKEN directly to .env file!');
      }
    } else {
      console.log('Notice: Refresh token was not returned. This usually happens if the account was previously authorized.');
      console.log('Active access token received:', Boolean(data.access_token));
      console.log('If you need a new refresh token, make sure prompt=consent is in the authorization URL.');
    }
  })
  .catch(err => {
    console.error('Network Error:', err.message);
    process.exit(1);
  });
