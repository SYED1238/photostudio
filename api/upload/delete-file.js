const {
  parseJsonBody,
  sendJson,
  verifyPasscode,
  getDestinationFolderId,
  getAccessToken,
  checkRateLimit
} = require('./_drive-client');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
  }

  if (!checkRateLimit(req, 80)) {
    return sendJson(res, 429, { error: 'Rate limit exceeded. Please wait a moment.' });
  }

  try {
    const body = await parseJsonBody(req);

    if (!verifyPasscode(req, body)) {
      return sendJson(res, 401, { error: 'Unauthorized.' });
    }

    const fileId = String(body.fileId || '').trim();
    if (!fileId || !/^[a-zA-Z0-9_-]{10,}$/.test(fileId)) {
      return sendJson(res, 400, { error: 'Valid fileId is required.' });
    }

    const destinationRootId = getDestinationFolderId();
    if (fileId === destinationRootId) {
      return sendJson(res, 403, { error: 'Cannot delete studio vault root folder.' });
    }
    const accessToken = await getAccessToken();

    // 1. Verify that this file belongs to a folder inside the configured studio destination
    const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,parents,trashed`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!checkRes.ok) {
      return sendJson(res, 404, { error: 'File not found in Google Drive.' });
    }

    const fileInfo = await checkRes.json();
    if (!fileInfo.parents || fileInfo.parents.length === 0) {
      return sendJson(res, 403, { error: 'Cannot delete root-level files.' });
    }

    // 2. Delete the file in Google Drive
    const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!delRes.ok && delRes.status !== 204) {
      const errText = await delRes.text();
      return sendJson(res, delRes.status, {
        error: `Failed to remove file from Google Drive: ${errText}`
      });
    }

    return sendJson(res, 200, {
      success: true,
      fileId,
      fileName: fileInfo.name,
      message: `File "${fileInfo.name}" removed from Google Drive.`
    });

  } catch (err) {
    return sendJson(res, 500, {
      error: err.message || 'Internal error deleting file from Google Drive'
    });
  }
};
