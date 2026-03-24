
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'admin@barcodegulf.com';
  const hashedPassword = '$2b$10$gpxfFNGx3yWH6sNs/Yqk/OBdWmAHmVhf6jFV4WLTxyjTX/uCkhHaC';

  console.log(`Setting ${superAdminEmail} as SUPERADMIN...`);

  const user = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: 'SUPERADMIN' },
    create: {
      email: superAdminEmail,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  console.log('Super Admin updated successfully:', user.email, user.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
