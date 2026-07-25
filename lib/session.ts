import { cookies } from "next/headers";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  const cookie = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(cookie);
  if (!session) return null;

  try {
    return await prisma.user.findUnique({ where: { id: session.userId } });
  } catch (error) {
    console.error("Database connection failed during session check:", error);
    return null;
  }
});

export async function requireCoordinator() {
  const user = await getCurrentUser();
  if (!user || user.role !== "coordinator") {
    throw new Error("Apenas o coordenador pode realizar esta ação.");
  }
  return user;
}
