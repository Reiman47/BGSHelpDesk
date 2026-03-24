const { execSync } = require('child_process');

try {
  const result = execSync('npx prisma db push', { encoding: 'utf-8', stdio: 'pipe' });
  console.log('Success:', result);
} catch (error) {
  console.error('Error stdout:', error.stdout);
  console.error('Error stderr:', error.stderr);
}
