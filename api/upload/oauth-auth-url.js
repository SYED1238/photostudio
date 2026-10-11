const { sendJson } = require('./_drive-client');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  const clientId = process.env.GOOGLE_CLIENT_ID ? String(process.env.GOOGLE_CLIENT_ID).trim() : '';
  if (!clientId) {
    return sendJson(res, 400, {
      error: 'GOOGLE_CLIENT_ID is not configured in server environment variables.'
    });
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const defaultRedirect = 'https://photostudio.auralisstudio.xyz/api/auth/google/callback';
  const redirectUri = urlObj.searchParams.get('redirect_uri') || defaultRedirect;

  // Required Drive scope for uploading and managing files created by this app
  const scope = 'https://www.googleapis.com/auth/drive.file';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    prompt: 'consent'
  }).toString();

  return sendJson(res, 200, {
    success: true,
    authUrl,
    redirectUri
  });
};
