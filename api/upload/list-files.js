const {
  sendJson,
  verifyPasscode,
  validateParentFolder,
  getDestinationFolderId,
  getAccessToken,
  checkRateLimit
} = require('./_drive-client');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Use GET.' });
  }

  if (!checkRateLimit(req, 150)) {
    return sendJson(res, 429, { error: 'Too many requests. Please wait a moment.' });
  }

  try {
    const urlObj = new URL(req.url, 'http://localhost');
    let folderId = urlObj.searchParams.get('folderId');

    if (!verifyPasscode(req)) {
      return sendJson(res, 401, { error: 'Unauthorized.' });
    }

    if (!folderId) {
      folderId = getDestinationFolderId();
    }

    // Ensure the folder is inside the configured studio destination
    const validatedFolderId = await validateParentFolder(folderId);
    if (!validatedFolderId) {
      return sendJson(res, 403, { error: 'Access to this folder is not authorized.' });
    }

    const accessToken = await getAccessToken();

    // Query files inside this folder (excluding trashed files)
    const q = `'${validatedFolderId}' in parents and trashed = false`;
    const driveUrl = `https://www.googleapis.com/drive/v3/files?` + new URLSearchParams({
      q: q,
      fields: 'files(id,name,mimeType,size,webViewLink,thumbnailLink,iconLink,createdTime)',
      orderBy: 'folder,createdTime desc',
      pageSize: '100'
    }).toString();

    const driveRes = await fetch(driveUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!driveRes.ok) {
      const errText = await driveRes.text();
      let errJson;
      try { errJson = JSON.parse(errText); } catch (_) {}
      const errMsg = (errJson && errJson.error && errJson.error.message) || errText;
      return sendJson(res, driveRes.status, {
        error: `Failed to list files from Google Drive: ${errMsg}`
      });
    }

    const data = await driveRes.json();

    return sendJson(res, 200, {
      success: true,
      folderId: validatedFolderId,
      files: data.files || []
    });

  } catch (err) {
    return sendJson(res, 500, {
      error: err.message || 'Internal error listing media from Google Drive'
    });
  }
};
