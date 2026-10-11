const {
  parseJsonBody,
  sendJson,
  verifyPasscode,
  validateParentFolder,
  getAccessToken,
  checkRateLimit,
  sanitizeFileName
} = require('./_drive-client');

// Maximum supported single file size (200 GB limit per requirement)
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024 * 1024;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
  }

  // 1. Abuse & rate-limiting check
  if (!checkRateLimit(req)) {
    return sendJson(res, 429, {
      error: 'Upload request rate limit exceeded. Please wait a moment before initiating more uploads.'
    });
  }

  try {
    const body = await parseJsonBody(req);

    // 2. Optional access passcode gate
    if (!verifyPasscode(req, body)) {
      return sendJson(res, 401, {
        error: 'Unauthorized. Upload authorization passcode required.'
      });
    }

    const rawFileName = String(body.fileName || '').trim();
    const fileSize = Number(body.fileSize);
    const fileType = String(body.fileType || 'application/octet-stream').trim();

    if (!rawFileName) {
      return sendJson(res, 400, { error: 'fileName is required.' });
    }
    if (isNaN(fileSize) || fileSize < 0) {
      return sendJson(res, 400, { error: 'Valid fileSize in bytes is required.' });
    }
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return sendJson(res, 400, {
        error: 'File exceeds maximum upload size limit of 200 GB.'
      });
    }

    // Sanitize filename to avoid path traversal or malformed characters
    const fileName = sanitizeFileName(rawFileName);

    // 3. Strictly validate parent folder: destination root or a verified subfolder inside destination
    const targetParentFolderId = await validateParentFolder(body.parentFolderId);

    // 4. Retrieve valid Google OAuth access token
    const accessToken = await getAccessToken();

    // 5. Initiate Google Drive Resumable Upload Session
    // Google Drive API v3: POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable
    const metadata = {
      name: fileName,
      parents: [targetParentFolderId]
    };

    let clientOrigin = req.headers['origin'];
    if (!clientOrigin && req.headers['referer']) {
      try {
        clientOrigin = new URL(req.headers['referer']).origin;
      } catch (_) {}
    }
    if (!clientOrigin) {
      const host = req.headers.host || 'localhost:3001';
      const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
      clientOrigin = `${proto}://${host}`;
    }

    const initHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': fileType || 'application/octet-stream',
      'X-Upload-Content-Length': String(fileSize),
      'Origin': clientOrigin
    };

    const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink', {
      method: 'POST',
      headers: initHeaders,
      body: JSON.stringify(metadata)
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      let errJson;
      try { errJson = JSON.parse(errText); } catch (_) {}
      const errMsg = (errJson && errJson.error && errJson.error.message) || errText;
      return sendJson(res, initRes.status, {
        error: `Google Drive upload session creation failed: ${errMsg}`
      });
    }

    // Google returns the unique upload session URL in the Location header
    const sessionUrl = initRes.headers.get('location');
    if (!sessionUrl) {
      return sendJson(res, 502, {
        error: 'Google Drive did not return a resumable session Location URL.'
      });
    }

    return sendJson(res, 200, {
      success: true,
      sessionUrl,
      fileName,
      fileSize,
      fileType,
      parentFolderId: targetParentFolderId
    });

  } catch (err) {
    return sendJson(res, 500, {
      error: err.message || 'Internal error initiating resumable upload session'
    });
  }
};
