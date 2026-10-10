const https = require('https');
const fs = require('fs');
const path = require('path');

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID || '';
const DRIVE_API_KEY = process.env.DRIVE_API_KEY || '';
const outDir = path.join(__dirname, '..', 'public', 'videos', 'drive');

if (!DRIVE_API_KEY) {
  console.log('DRIVE_API_KEY environment variable is not set. Skipping live sync.');
  process.exit(0);
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('HTTP status ' + res.statusCode));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(fs.statSync(dest).size);
      });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function syncVideos() {
  console.log('Synchronizing Atelier video works from Drive folder...');
  const listUrl = `https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER_ID}'+in+parents+and+trashed=false&key=${DRIVE_API_KEY}&fields=files(id,name,mimeType,size,thumbnailLink,videoMediaMetadata)&orderBy=createdTime+desc`;
  const data = await getJson(listUrl);
  const vids = (data.files || []).filter(f => (f.mimeType && f.mimeType.startsWith('video/')) || f.name.endsWith('.mp4'));
  console.log(`Found ${vids.length} videos in Atelier folder.`);

  const manifest = [];
  for (let i = 0; i < vids.length; i++) {
    const v = vids[i];
    const filePath = path.join(outDir, v.id + '.mp4');
    let size = 0;
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 100000) {
      size = fs.statSync(filePath).size;
      console.log(`[${i+1}/${vids.length}] Ready: ${v.name} (${(size / (1024*1024)).toFixed(2)} MB)`);
    } else {
      console.log(`[${i+1}/${vids.length}] Downloading: ${v.name}`);
      try {
        const streamUrl = `https://drive.google.com/uc?id=${v.id}&export=download`;
        size = await downloadFile(streamUrl, filePath);
        console.log(`  -> Downloaded: ${(size / (1024*1024)).toFixed(2)} MB`);
      } catch (err) {
        console.error(`  -> Failed: ${err.message}`);
      }
    }
    manifest.push({
      id: v.id,
      name: v.name,
      width: v.videoMediaMetadata ? v.videoMediaMetadata.width : null,
      height: v.videoMediaMetadata ? v.videoMediaMetadata.height : null,
      size: size,
      localUrl: `/public/videos/drive/${v.id}.mp4`
    });
  }

  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`Synchronization complete! All ${manifest.length} videos stored locally in public/videos/drive/`);
}

syncVideos().catch(console.error);
