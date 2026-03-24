
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log('Users and Roles:');
  console.log(JSON.stringify(users, null, 2));

  const ticketCount = await prisma.ticket.count();
  console.log(`\nTotal Tickets: ${ticketCount}`);

  await prisma.$disconnect();
}

check().catch(console.error);
