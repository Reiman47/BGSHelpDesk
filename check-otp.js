require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'shafeek@barcodegulf.net' },
    });
    console.log('OTP:', user?.resetOtp);
    console.log('Expiry:', user?.resetOtpExpiry);
  } catch (e) {
    console.error('ERROR MESSAGE:', e.message);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
