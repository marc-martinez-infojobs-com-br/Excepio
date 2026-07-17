import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/excepio';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: 'npx ts-node prisma/seed.ts',
  },
});
