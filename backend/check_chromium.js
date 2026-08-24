const p = require('./node_modules/puppeteer');
const fs = require('fs');
try {
  const path = p.executablePath();
  console.log('Chromium path:', path);
  console.log('Exists:', fs.existsSync(path));
} catch(e) {
  console.log('Error:', e.message);
}
