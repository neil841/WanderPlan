/**
 * Prisma Client Instance
 *
 * This module provides a singleton Prisma Client instance for database operations.
 * It implements connection pooling and proper cleanup to prevent connection leaks
 * in serverless environments.
 *
 * @see https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */

import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client configuration with logging
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

/**
 * Global type declaration for Prisma Client singleton
 */
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Prisma Client singleton instance
 *
 * In development, we use a global variable to preserve the instance across hot reloads.
 * In production, we create a new instance.
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Export the Prisma client instance
export default prisma;

// Preserve the instance in development to avoid creating new clients on hot reload
if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

/**
 * Graceful shutdown handler
 * Ensures database connections are properly closed when the process exits
 */
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}
