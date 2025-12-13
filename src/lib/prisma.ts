import { PrismaClient } from '@prisma/client';

// ============================================================================
// PRISMA CLIENT SINGLETON
// Ensures single instance across Hot Module Reload in development
// ============================================================================

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn', 'query']
        : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
