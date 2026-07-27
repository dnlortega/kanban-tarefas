"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getClientIp } from "@/lib/request-ip";

export interface LoginState {
  error?: string;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function login(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState | undefined> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const from = String(formData.get("from") ?? "/");

  if (!username || !password) {
    return { error: "Informe usuário e senha." };
  }

  try {
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

    const user = await prisma.user.findUnique({ where: { username } });
    const valid = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !valid) {
      await prisma.loginAttempt.create({ data: { ip, success: false } });
      return { error: "Usuário ou senha incorretos" };
    }

    await prisma.loginAttempt.create({ data: { ip, success: true } });

    const token = await createSessionToken({ userId: user.id });
    (await cookies()).set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.VERCEL === "1",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  } catch (err) {
    console.error("Erro no login:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return {
      error: `Não foi possível entrar agora. Detalhe: ${detail}`,
    };
  }

  redirect(from);
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE_NAME);
  redirect("/login");
}

export async function register(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState | undefined> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !username || !password) {
    return { error: "Informe nome, usuário e senha." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return { error: "Este nome de usuário já está em uso." };
    }

    const passwordHash = await hashPassword(password);
    
    // Create new user (defaulting to member role)
    const user = await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        role: "member",
      },
    });

    // Auto-login after registration
    const token = await createSessionToken({ userId: user.id });
    (await cookies()).set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.VERCEL === "1",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    const detail = err instanceof Error ? err.message : String(err);
    return {
      error: `Não foi possível cadastrar agora. Detalhe: ${detail}`,
    };
  }

  redirect("/");
}
