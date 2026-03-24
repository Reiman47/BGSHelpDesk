const net = require('net');

function testPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);
    socket.on('connect', () => {
      console.log(`Connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      console.log(`Timeout on ${host}:${port}`);
      socket.destroy();
      resolve(false);
    });
    socket.on('error', (err) => {
      console.log(`Error on ${host}:${port}: ${err.message}`);
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function run() {
  const host = 'db.srlczmmckwnyfpwpybab.supabase.co';
  await testPort(host, 5432);
  await testPort(host, 6543);
  
  const poolerHost = 'aws-0-eu-central-1.pooler.supabase.com';
  await testPort(poolerHost, 6543);
  await testPort(poolerHost, 5432);
}

run();
