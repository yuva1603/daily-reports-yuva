const http = require('http');
const req = http.get('http://localhost:5678/healthz', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => console.log('n8n STATUS:', res.statusCode, data.substring(0, 200)));
});
req.on('error', e => console.log('n8n NOT READY YET:', e.message));
req.end();
