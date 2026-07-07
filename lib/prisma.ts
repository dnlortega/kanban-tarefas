import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Sempre reaproveita a mesma instância dentro do processo/lambda, inclusive em
// produção: no runtime serverless da Vercel, não cachear aqui faz cada nova
// instância "fria" abrir seu próprio pool de conexões contra o Postgres,
// esgotando o limite do pooler do Neon sob uso concorrente.
globalForPrisma.prisma = prisma;
