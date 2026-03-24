const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const oldEmail = 'admin@barcodegulf.com';
  const newEmail = 'shafeek@barcodegulf.net';

  console.log(`Updating ${oldEmail} to ${newEmail} in Supabase...`);

  const updatedUser = await prisma.user.update({
    where: { email: oldEmail },
    data: { email: newEmail }
  });

  console.log('Update successful:', updatedUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
