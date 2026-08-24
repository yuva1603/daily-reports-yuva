const http = require('http');

// Test POST /api/recipient
const body = JSON.stringify({ userId: 'demo-user-id', name: 'Yuva Test', phone_number: '+919876543210' });
const options = {
  hostname: 'localhost', port: 3000, path: '/api/recipient',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
};
const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('POST /api/recipient STATUS:', res.statusCode);
    console.log('RESPONSE:', data);
  });
});
req.on('error', e => console.log('ERROR:', e.message));
req.write(body);
req.end();
