// Script para verificar si hay usuarios en la base de datos
const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.user.count();
    console.log(count);
  } catch (error) {
    console.log('0');
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
