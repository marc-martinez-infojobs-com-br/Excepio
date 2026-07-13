import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log('Seeding database...');

  // Status (IDs fijos según DATABASE.md)
  const statuses = [
    { id: 1, name: 'PENDING' },
    { id: 2, name: 'ACTIVE' },
    { id: 3, name: 'EXPIRED' },
    { id: 4, name: 'DELETED' },
  ];

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { id: status.id },
      update: {},
      create: status,
    });
  }
  console.log(`✓ ${statuses.length} Status records`);

  // Level (IDs fijos, todos con statusId = 2 (ACTIVE))
  const levels = [
    { id: 1, name: 'DEBUG', order: 1, statusId: 2 },
    { id: 2, name: 'INFO', order: 2, statusId: 2 },
    { id: 3, name: 'WARNING', order: 3, statusId: 2 },
    { id: 4, name: 'ERROR', order: 4, statusId: 2 },
    { id: 5, name: 'FATAL', order: 5, statusId: 2 },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { id: level.id },
      update: {},
      create: level,
    });
  }
  console.log(`✓ ${levels.length} Level records`);

  // Projects de ejemplo (para desarrollo)
  const projects = [
    { name: 'Web', statusId: 2 },
    { name: 'WM', statusId: 2 },
    { name: 'Android', statusId: 2 },
    { name: 'iOS', statusId: 2 },
    { name: 'API', statusId: 2 },
  ];

  for (const project of projects) {
    const existing = await prisma.project.findFirst({
      where: { name: project.name },
    });

    if (!existing) {
      await prisma.project.create({
        data: {
          name: project.name,
          apiKey: generateApiKey(),
          statusId: project.statusId,
        },
      });
    }
  }
  console.log(`✓ ${projects.length} Project records`);

  // Usuario administrador inicial
  const adminEmail = 'admin@excepio.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin Excepio',
        role: UserRole.ADMINISTRADOR,
        statusId: 2, // ACTIVE
      },
    });
    console.log('✓ Admin user created (admin@excepio.com / Admin123!)');
  } else {
    console.log('✓ Admin user already exists');
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
