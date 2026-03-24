require('dotenv').config();
const { Client } = require('pg');

const regions = [
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'ap-southeast-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1',
  'me-south-1',
  'me-central-1'
];

async function findRegion() {
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connString = `postgresql://postgres.srlczmmckwnyfpwpybab:7W8dy$CEhaiY@PS@${host}:6543/postgres`;
    const client = new Client({ connectionString: connString, connectionTimeoutMillis: 3000 });
    
    try {
      await client.connect();
      console.log('SUCCESS! Region is:', region);
      await client.end();
      return;
    } catch (err) {
      if (!err.message.includes('Tenant or user not found')) {
        console.log(`${region} failed with different error: ${err.message}`);
      }
    }
  }
  console.log('Region not found among the tested ones.');
}

findRegion();
