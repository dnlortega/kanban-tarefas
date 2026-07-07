"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, hashSecret } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function login(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState | undefined> {
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    redirect(from);
  }

  const ip = await getClientIp();
  const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

  const recentFailures = await prisma.loginAttempt.count({
    where: { ip, success: false, createdAt: { gte: windowStart } },
  });

  if (recentFailures >= MAX_ATTEMPTS) {
    return {
      error: `Muitas tentativas. Tente novamente em ${WINDOW_MINUTES} minutos.`,
    };
  }

  if (password !== expected) {
    await prisma.loginAttempt.create({ data: { ip, success: false } });
    return { error: "Senha incorreta" };
  }

  await prisma.loginAttempt.create({ data: { ip, success: true } });

  const token = await hashSecret(expected);
  (await cookies()).set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  redirect(from);
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  redirect("/login");
}
