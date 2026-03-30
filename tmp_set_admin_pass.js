const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  // Ensure support admin has a known password
  const hash = await bcrypt.hash('SupportAdmin2026!', 10);
  await p.user.update({
    where: { email: 'support_admin@barcodegulf.net' },
    data: { password: hash }
  });
  console.log('Support admin password set to: SupportAdmin2026!');
}

main().finally(() => p.$disconnect());
