import { prisma } from "@/lib/prisma";

export class RateLimitError extends Error {}

export async function checkRateLimit(
  scope: string,
  ip: string,
  max: number,
  windowMinutes: number
) {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const count = await prisma.requestAttempt.count({
    where: { scope, ip, createdAt: { gte: windowStart } },
  });

  if (count >= max) {
    throw new RateLimitError("Muitas solicitações. Tente novamente em alguns minutos.");
  }

  await prisma.requestAttempt.create({ data: { scope, ip } });
}
