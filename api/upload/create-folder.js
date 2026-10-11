const {
  parseJsonBody,
  sendJson,
  verifyPasscode,
  getDestinationFolderId,
  validateParentFolder,
  getAccessToken,
  checkRateLimit,
  sanitizeFileName
} = require('./_drive-client');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method Not Allowed. Use POST.' });
  }

  if (!checkRateLimit(req)) {
    return sendJson(res, 429, {
      error: 'Folder creation rate limit exceeded. Please wait a moment.'
    });
  }

  try {
    const body = await parseJsonBody(req);

    if (!verifyPasscode(req, body)) {
      return sendJson(res, 401, {
        error: 'Unauthorized. An authorized upload passcode is required to create galleries.'
      });
    }

    const rawGalleryName = String(body.galleryName || '').trim();
    const galleryName = sanitizeFileName(rawGalleryName);
    const category = String(body.category || 'General').trim();
    const shootDate = String(body.shootDate || '').trim();
    const description = String(body.description || '').trim();

    if (!galleryName) {
      return sendJson(res, 400, { error: 'Gallery / shoot name is required.' });
    }

    // If creating a top-level shoot folder, include category if selected.
    // If creating a nested subfolder inside a shoot, keep the exact subfolder name.
    const isSubfolder = Boolean(body.parentFolderId);
    const folderTitle = (!isSubfolder && category && category !== 'Other' && category !== 'General')
      ? `${category} — ${galleryName}`
      : galleryName;

    const parentFolderId = body.parentFolderId
      ? await validateParentFolder(body.parentFolderId)
      : getDestinationFolderId();
    const accessToken = await getAccessToken();

    // 1. Check if folder already exists inside destination to prevent duplicates
    const searchQ = `'${parentFolderId}' in parents and name = '${folderTitle.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQ)}&fields=files(id,name,webViewLink)`;

    const searchRes = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const existing = searchData.files[0];
        return sendJson(res, 200, {
          success: true,
          folderId: existing.id,
          folderName: existing.name,
          webViewLink: existing.webViewLink || `https://drive.google.com/drive/folders/${existing.id}`,
          alreadyExisted: true,
          message: `Reusing existing gallery folder "${existing.name}"`
        });
      }
    }

    // 2. Create the folder in Google Drive
    const metaDescription = [
      `Category: ${category}`,
      shootDate ? `Shoot Date: ${shootDate}` : '',
      description ? `Notes: ${description}` : '',
      `Created via FRAMEHAUS Studio Upload Portal`
    ].filter(Boolean).join('\n');

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: folderTitle,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId],
        description: metaDescription
      })
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      let errJson;
      try { errJson = JSON.parse(errText); } catch (_) {}
      const errMsg = (errJson && errJson.error && errJson.error.message) || errText;
      return sendJson(res, createRes.status, {
        error: `Failed to create folder in Google Drive: ${errMsg}`
      });
    }

    const created = await createRes.json();
    return sendJson(res, 201, {
      success: true,
      folderId: created.id,
      folderName: created.name,
      webViewLink: created.webViewLink || `https://drive.google.com/drive/folders/${created.id}`,
      alreadyExisted: false,
      message: `Created gallery folder "${created.name}" in Google Drive`
    });

  } catch (err) {
    return sendJson(res, 500, {
      error: err.message || 'Internal error creating Google Drive gallery folder'
    });
  }
};
