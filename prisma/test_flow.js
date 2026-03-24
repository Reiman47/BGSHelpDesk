const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassAdmin = await bcrypt.hash('Support123!', 10);
  const hashedPassUser = await bcrypt.hash('Test123!', 10);

  // 1. Create Support Admin
  console.log("Creating/Updating Support Admin...");
  const supportAdmin = await prisma.user.upsert({
    where: { email: 'support_admin@barcodegulf.net' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Support Admin',
      email: 'support_admin@barcodegulf.net',
      password: hashedPassAdmin,
      plainPassword: 'Support123!',
      role: 'ADMIN',
      companyName: 'Barcode Gulf'
    }
  });

  // 2. Create Regular User
  console.log("Creating/Updating Test User...");
  const testUser = await prisma.user.upsert({
    where: { email: 'test_user@barcodegulf.net' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test_user@barcodegulf.net',
      password: hashedPassUser,
      plainPassword: 'Test123!',
      role: 'USER',
      companyName: 'Test Corp'
    }
  });

  // 3. Create a case from user
  console.log("Creating Support Case...");
  const ticket = await prisma.ticket.create({
    data: {
      subject: 'Internet Connectivity Issue',
      description: 'I am having issues with my internet connection since morning.',
      category: 'Network',
      priority: 'HIGH',
      status: 'OPEN',
      creatorId: testUser.id
    }
  });

  // 4. Assign the case to the support admin
  console.log("Assigning Case to Support Admin...");
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      assignedId: supportAdmin.id,
      status: 'PENDING'
    }
  });

  // 5. Send a comment from the support admin
  console.log("Adding Comment from Support Admin...");
  await prisma.reply.create({
    data: {
      content: 'I have checked your connection. Please restart your router and try again.',
      ticketId: ticket.id,
      authorId: supportAdmin.id
    }
  });

  // 6. Send a reply comment from the user
  console.log("Adding Reply from User...");
  await prisma.reply.create({
    data: {
      content: 'I have restarted the router, but it is still not working.',
      ticketId: ticket.id,
      authorId: testUser.id
    }
  });

  console.log("------------------------------------------");
  console.log("Setup complete!");
  console.log(`Support Admin: ${supportAdmin.email} / Support123!`);
  console.log(`Test User: ${testUser.email} / Test123!`);
  console.log(`Ticket ID: ${ticket.id}`);
  console.log("------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
