const http = require('http');

async function testFetch() {
  const postData = JSON.stringify({ email: 'shafeek@barcodegulf.net' });
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/forgot-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.write(postData);
  req.end();
}

testFetch();
