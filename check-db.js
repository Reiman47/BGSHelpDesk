require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findFirst();
    console.log('Successfully connected! Found user:', user ? user.email : 'None');
  } catch (error) {
    console.error('Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
