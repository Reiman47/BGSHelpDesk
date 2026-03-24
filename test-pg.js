require('dotenv').config();
const { Client } = require('pg');

async function test(host) {
  console.log('Testing', host);
  const connString = `postgresql://postgres.srlczmmckwnyfpwpybab:7W8dy$CEhaiY@PS@${host}:6543/postgres`;
  const client = new Client({ connectionString: connString });
  
  try {
    await client.connect();
    console.log('Connected successfully to', host);
    await client.end();
  } catch (err) {
    console.error('Failed to connect to', host, err.message);
  }
}

test('aws-0-me-central-1.pooler.supabase.com');
