import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';

// ============================================
// Datos para generación de excepciones
// ============================================

const EXCEPTION_MESSAGES = [
  // Errores de autenticación
  'NullReferenceException: Object reference not set to an instance of an object',
  'AuthenticationError: Invalid credentials provided',
  'TokenExpiredException: JWT token has expired',
  'UnauthorizedAccessException: User does not have permission',
  'SessionExpiredException: User session has expired',

  // Errores de conexión
  'TimeoutError: Connection failed to redis-cluster-01',
  'ConnectionRefusedException: Unable to connect to database',
  'NetworkError: Request failed with status code 503',
  'SocketException: Connection reset by peer',
  'DNSResolutionError: Could not resolve host api.external-service.com',

  // Errores de sintaxis/código
  'SyntaxError: Unexpected token < in JSON at position 0',
  'TypeError: Cannot read property "id" of undefined',
  'ReferenceError: variable is not defined',
  'RangeError: Maximum call stack size exceeded',
  'EvalError: Invalid regular expression',

  // Errores de base de datos
  'DatabaseMigrationError: column "user_role" does not exist',
  'UniqueConstraintViolation: Duplicate entry for key "email"',
  'ForeignKeyViolationError: Referenced record not found',
  'DeadlockError: Transaction was deadlocked on lock resources',
  'QueryTimeoutError: Query execution exceeded 30 seconds',

  // Errores de validación
  'ValidationError: Email format is invalid',
  'SchemaValidationError: Required field "name" is missing',
  'PayloadTooLargeError: Request body exceeds 10MB limit',
  'InvalidInputError: Date must be in ISO 8601 format',
  'OutOfRangeError: Value must be between 1 and 100',

  // Errores de archivos/recursos
  'FileNotFoundError: Could not locate resource at /uploads/image.png',
  'PermissionDeniedError: Access to file system denied',
  'DiskSpaceError: Insufficient storage space',
  'FileCorruptedError: Unable to parse uploaded file',
  'ResourceExhaustedError: Too many open file handles',

  // Errores de API externa
  'ExternalAPIError: Payment gateway returned error 402',
  'RateLimitExceeded: Too many requests to external API',
  'ServiceUnavailableError: Third-party service is down',
  'InvalidResponseError: Unexpected response format from API',
  'CertificateError: SSL certificate verification failed',
];

const STACK_TRACES = [
  `at AuthService.validateToken (auth_service.py:42)
    at Middleware.authenticate (middleware.py:128)
    at RequestHandler.handle (handler.py:56)`,

  `at CacheManager.connect (cache_manager.go:118)
    at Redis.ping (redis.go:45)
    at main.initializeServices (main.go:23)`,

  `at bundle.js:4530
    at Array.forEach (<anonymous>)
    at renderComponent (react-dom.js:1234)
    at updateFiber (react-dom.js:5678)`,

  `at SecurityMiddleware.sessionCheck (security.middleware.js:201)
    at Layer.handle (router.js:156)
    at next (route.js:142)`,

  `at MigrationRunner.execute (migrations/0024_add_role.sql:15)
    at Database.runMigrations (database.ts:89)
    at bootstrap (main.ts:34)`,

  `at UserRepository.findByEmail (user.repository.ts:67)
    at UserService.authenticate (user.service.ts:45)
    at AuthController.login (auth.controller.ts:23)`,

  `at PaymentGateway.charge (payment.gateway.ts:156)
    at OrderService.processPayment (order.service.ts:89)
    at CheckoutController.complete (checkout.controller.ts:34)`,

  `at ImageProcessor.resize (image.processor.ts:78)
    at UploadService.processFile (upload.service.ts:45)
    at FileController.upload (file.controller.ts:23)`,
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
  'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'PostmanRuntime/7.35.0',
  'axios/1.6.2',
  'okhttp/4.12.0',
];

const URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/users/profile',
  '/api/orders/checkout',
  '/api/payments/process',
  '/api/files/upload',
  '/api/products/search',
  '/api/notifications/send',
  '/dashboard',
  '/settings/account',
  '/reports/analytics',
  null,
];

const APP_VERSIONS = ['1.0.0', '1.0.1', '1.1.0', '1.2.0', '2.0.0-beta', '2.0.0', '2.1.0', null];

const USER_IDS = [
  'user_001', 'user_002', 'user_003', 'user_042', 'user_123',
  'user_456', 'user_789', 'user_849', 'admin_001', null,
];

// ============================================
// Funciones auxiliares
// ============================================

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
  return pastDate;
}

function generateMetadata(): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  const shouldHaveMetadata = Math.random() > 0.3;
  if (!shouldHaveMetadata) return Prisma.JsonNull;

  const metadata: Record<string, string | number | string[]> = {};

  if (Math.random() > 0.5) {
    metadata.requestId = crypto.randomUUID();
  }
  if (Math.random() > 0.5) {
    metadata.environment = randomElement(['production', 'staging', 'development']);
  }
  if (Math.random() > 0.6) {
    metadata.duration_ms = Math.floor(Math.random() * 5000);
  }
  if (Math.random() > 0.7) {
    metadata.retryCount = Math.floor(Math.random() * 3);
  }
  if (Math.random() > 0.8) {
    metadata.tags = randomElement([['critical'], ['payment'], ['auth', 'security'], ['performance']]);
  }

  return Object.keys(metadata).length > 0 ? metadata : Prisma.JsonNull;
}

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

  // Platforms de ejemplo (para desarrollo)
  const platforms = [
    { id: 1, name: 'Web', statusId: 2 },
    { id: 2, name: 'WM', statusId: 2 },
    { id: 3, name: 'Android', statusId: 2 },
    { id: 4, name: 'iOS', statusId: 2 },
    { id: 5, name: 'API', statusId: 2 },
  ];

  for (const platform of platforms) {
    const existing = await prisma.platform.findUnique({
      where: { id: platform.id },
    });

    if (!existing) {
      await prisma.platform.create({
        data: {
          id: platform.id,
          name: platform.name,
          apiKey: generateApiKey(),
          statusId: platform.statusId,
        },
      });
    }
  }
  console.log(`✓ ${platforms.length} Platform records`);

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

  // Excepciones de ejemplo (para desarrollo)
  await seedExceptions();

  console.log('Database seeded successfully!');
}

async function seedExceptions() {
  const existingCount = await prisma.exception.count();
  if (existingCount > 0) {
    console.log(`✓ Exceptions already exist (${existingCount} records)`);
    return;
  }

  const exceptions: Prisma.ExceptionCreateManyInput[] = [];

  // Generar 100 excepciones con distribución realista
  for (let i = 0; i < 100; i++) {
    // Distribución de levels: más errores y warnings que debug/info
    const levelWeights = [
      { id: 1, weight: 0.05 },  // DEBUG - 5%
      { id: 2, weight: 0.10 },  // INFO - 10%
      { id: 3, weight: 0.25 },  // WARNING - 25%
      { id: 4, weight: 0.45 },  // ERROR - 45%
      { id: 5, weight: 0.15 },  // FATAL - 15%
    ];

    const rand = Math.random();
    let cumulative = 0;
    let levelId = 4; // Default ERROR
    for (const level of levelWeights) {
      cumulative += level.weight;
      if (rand < cumulative) {
        levelId = level.id;
        break;
      }
    }

    // Distribución de platforms
    const platformId = randomElement([1, 1, 1, 2, 2, 3, 3, 4, 4, 5]); // Web más frecuente

    exceptions.push({
      platformId,
      levelId,
      message: randomElement(EXCEPTION_MESSAGES),
      stackTrace: Math.random() > 0.2 ? randomElement(STACK_TRACES) : null,
      userId: randomElement(USER_IDS),
      url: randomElement(URLS),
      userAgent: randomElement(USER_AGENTS),
      appVersion: randomElement(APP_VERSIONS),
      metadata: generateMetadata(),
      createdAt: randomDate(30), // Últimos 30 días
    });
  }

  // Insertar en lotes para mejor rendimiento
  await prisma.exception.createMany({
    data: exceptions,
  });

  console.log(`✓ ${exceptions.length} Exception records`);
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
