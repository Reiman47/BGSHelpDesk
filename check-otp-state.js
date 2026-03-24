require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkUserOtp() {
  const prisma = new PrismaClient();
  const email = 'shafeek@barcodegulf.net';
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { email: true, resetOtp: true, resetOtpExpiry: true }
    });
    console.log('User OTP state:', JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserOtp();
