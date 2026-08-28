import fs from 'node:fs';
import path from 'node:path';

// Parse CLI arguments & environment variables
const args = process.argv.slice(2);
let filePath = process.env.EXCEL_SOURCE_PATH || null;
let targetUrl = process.env.HOSTED_URL || process.env.VERCEL_URL || 'http://localhost:3000';
let syncSecret = process.env.SYNC_SECRET || '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    targetUrl = args[i + 1];
    i++;
  } else if (args[i] === '--secret' && args[i + 1]) {
    syncSecret = args[i + 1];
    i++;
  } else if (!args[i].startsWith('--') && !filePath) {
    filePath = args[i];
  }
}

// Default fallback file path
if (!filePath) {
  filePath = path.join(process.cwd(), 'data', 'workforce.xlsx');
}

// Normalize URL (ensure http/https and strip trailing slash)
if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
  targetUrl = `https://${targetUrl}`;
}
targetUrl = targetUrl.replace(/\/+$/, '');

const resolvedPath = path.resolve(filePath);
const uploadEndpoint = `${targetUrl}/api/upload`;

console.log(`\n\x1b[36m=========================================================\x1b[0m`);
console.log(`\x1b[36m   Apex HR • Excel to Hosted Dashboard Auto-Sync Engine\x1b[0m`);
console.log(`\x1b[36m=========================================================\x1b[0m`);
console.log(`\x1b[33m[Target Spreadsheet]:\x1b[0m ${resolvedPath}`);
console.log(`\x1b[33m[Hosted Dashboard]:\x1b[0m   ${uploadEndpoint}\n`);

// Function to upload Excel file to hosted dashboard
async function syncToHostedDashboard(fileToSync) {
  if (!fs.existsSync(fileToSync)) {
    console.error(`\x1b[31m[Sync Error]\x1b[0m File not found: ${fileToSync}`);
    return;
  }

  const fileName = path.basename(fileToSync);
  const startTime = Date.now();

  try {
    const fileBuffer = fs.readFileSync(fileToSync);
    const fileBlob = new Blob([fileBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const formData = new FormData();
    formData.append('file', fileBlob, fileName);

    const headers = {};
    if (syncSecret) {
      headers['x-sync-secret'] = syncSecret;
      headers['Authorization'] = `Bearer ${syncSecret}`;
    }

    console.log(`\x1b[34m[Syncing]\x1b[0m 🚀 Sending "${fileName}" (${(fileBuffer.length / 1024).toFixed(1)} KB) to ${uploadEndpoint}...`);

    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
      headers,
    });

    const result = await response.json();
    const duration = Date.now() - startTime;

    if (!response.ok || !result.success) {
      console.error(`\x1b[31m[Sync Failed]\x1b[0m Server responded with status ${response.status}: ${result.error || 'Unknown error'}`);
      return;
    }

    console.log(
      `\x1b[32m[Sync Success]\x1b[0m ✅ Synced \x1b[1m${result.totalCount || 0} records\x1b[0m to hosted dashboard in ${duration}ms (${new Date().toLocaleTimeString()})\n`
    );
  } catch (error) {
    console.error(`\x1b[31m[Sync Error]\x1b[0m Could not connect to hosted dashboard:`, error.message);
  }
}

// Initial sync on script start if file exists
if (fs.existsSync(resolvedPath)) {
  syncToHostedDashboard(resolvedPath);
} else {
  console.log(`\x1b[33m[Notice]\x1b[0m Target file does not exist yet. Waiting for you to save it at:\n  -> ${resolvedPath}`);
}

console.log(`\x1b[32m[Watching Active]\x1b[0m Whenever you press [Ctrl + S] in Excel, changes will sync to your hosted dashboard automatically.\n`);

let debounceTimer = null;

// Watch target spreadsheet for save events
fs.watchFile(resolvedPath, { interval: 600 }, (curr, prev) => {
  // Only trigger on actual modification with valid file size
  if (curr.mtimeMs !== prev.mtimeMs && curr.size > 0) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      syncToHostedDashboard(resolvedPath);
    }, 400);
  }
});
