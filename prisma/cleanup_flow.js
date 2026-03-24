const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Cleaning up test data...");
  try {
    // 1. Delete the ticket (this should cascade to replies)
    const ticket = await prisma.ticket.findFirst({
      where: { subject: 'Internet Connectivity Issue' }
    });
    if (ticket) {
      console.log(`Deleting ticket: ${ticket.id}`);
      await prisma.ticket.delete({ where: { id: ticket.id } });
    }

    // 2. Delete the created users
    const emails = ['support_admin@barcodegulf.net', 'test_user@barcodegulf.net'];
    for (const email of emails) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        console.log(`Deleting user: ${email}`);
        await prisma.user.delete({ where: { id: user.id } });
      }
    }
    console.log("Cleanup complete!");
  } catch (e) {
    console.error("Cleanup failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
