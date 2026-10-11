const {
  sendJson,
  getDestinationFolderId,
  getAccessToken,
  ensureEnvLoaded
} = require('./_drive-client');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  ensureEnvLoaded();

  const clientId = process.env.GOOGLE_CLIENT_ID ? String(process.env.GOOGLE_CLIENT_ID).trim() : '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ? String(process.env.GOOGLE_CLIENT_SECRET).trim() : '';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN ? String(process.env.GOOGLE_REFRESH_TOKEN).trim() : '';
  const destinationName = process.env.STUDIO_DESTINATION_NAME || 'AURALIS Cloud Vault';
  const hasPasscode = Boolean(process.env.UPLOAD_PASSCODE && String(process.env.UPLOAD_PASSCODE).trim());

  let cleanFolderId = '';
  try {
    cleanFolderId = getDestinationFolderId();
  } catch (_) {}

  let verifiedFolderName = null;
  let tokenWorking = false;

  // Try verifying folder via Google Drive API
  try {
    const token = await getAccessToken();
    tokenWorking = Boolean(token);
    if (cleanFolderId && token) {
      const folderRes = await fetch(`https://www.googleapis.com/drive/v3/files/${cleanFolderId}?fields=id,name`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (folderRes.ok) {
        const folderData = await folderRes.json();
        verifiedFolderName = folderData.name;
      }
    }
  } catch (_) {
    // If OAuth token isn't available yet, try verifying metadata using API key if configured
    const apiKey = process.env.GOOGLE_API_KEY ? String(process.env.GOOGLE_API_KEY).trim() : '';
    if (cleanFolderId && apiKey) {
      try {
        const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files/${cleanFolderId}?key=${apiKey}&fields=id,name`);
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          verifiedFolderName = checkData.name;
        }
      } catch (_) {}
    }
  }

  const missing = [];
  if (!clientId) missing.push('GOOGLE_CLIENT_ID');
  if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
  if (!refreshToken && !process.env.GOOGLE_ACCESS_TOKEN) missing.push('GOOGLE_REFRESH_TOKEN');
  if (!cleanFolderId) missing.push('GOOGLE_DRIVE_FOLDER_ID');

  const isConfigured = tokenWorking && Boolean(cleanFolderId);

  return sendJson(res, 200, {
    configured: isConfigured,
    destinationFolderId: cleanFolderId,
    destinationName: verifiedFolderName ? `${destinationName} (${verifiedFolderName})` : destinationName,
    verifiedFolderName,
    folderIdConfigured: Boolean(cleanFolderId),
    hasPasscode,
    missingVars: isConfigured ? [] : missing,
    oauthSetupAvailable: Boolean(clientId && clientSecret)
  });
};
