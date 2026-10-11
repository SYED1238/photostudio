const { parseJsonBody, sendJson, verifyPasscode } = require('./_drive-client');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  const clientId = process.env.GOOGLE_CLIENT_ID ? String(process.env.GOOGLE_CLIENT_ID).trim() : '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? String(process.env.GOOGLE_CLIENT_SECRET).trim() : '';

  if (!clientId || !clientSecret) {
    return sendJson(res, 400, {
      error: 'GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.'
    });
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const code = urlObj.searchParams.get('code') || (await parseJsonBody(req)).code;
  const redirectUri = urlObj.searchParams.get('redirect_uri') || (await parseJsonBody(req)).redirect_uri;

  if (!code) {
    return sendJson(res, 400, { error: 'OAuth authorization code is required.' });
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

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      let errJson;
      try { errJson = JSON.parse(errText); } catch (_) {}
      const errMsg = (errJson && errJson.error_description) || errText;
      return sendJson(res, tokenRes.status, {
        error: `Token exchange failed: ${errMsg}`
      });
    }

    const data = await tokenRes.json();

    if (!data.refresh_token) {
      return sendJson(res, 200, {
        success: true,
        warning: 'Google did not return a new refresh token. Make sure prompt=consent is used, or the account is already authorized.',
        access_token: data.access_token ? 'Received active access token' : null
      });
    }

    return sendJson(res, 200, {
      success: true,
      refreshToken: data.refresh_token,
      message: 'Successfully generated GOOGLE_REFRESH_TOKEN! Copy this token to your deployment platform environment variables.'
    });

  } catch (err) {
    return sendJson(res, 500, { error: err.message || 'Error exchanging OAuth code' });
  }
};
