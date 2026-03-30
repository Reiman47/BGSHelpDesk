const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const oldEmail = 'admin@barcodegulf.com';
  const newEmail = 'shafeek@barcodegulf.net';

  const user = await p.user.update({
    where: { email: oldEmail },
    data: { email: newEmail },
  });

  console.log('SuperAdmin email updated successfully:');
  console.log('  Old:', oldEmail);
  console.log('  New:', user.email);
  console.log('  Role:', user.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => p.$disconnect());
