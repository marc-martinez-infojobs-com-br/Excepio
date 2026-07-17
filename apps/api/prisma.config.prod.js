const path = require('path');
const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: path.join(process.cwd(), 'prisma', 'schema.prisma'),
  datasource: { 
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/excepio'
  },
  migrations: { 
    seed: 'ts-node prisma/seed.ts' 
  },
});
