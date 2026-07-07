"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME, hashSecret } from "@/lib/auth";

export interface LoginState {
  error?: string;
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

  if (password !== expected) {
    return { error: "Senha incorreta" };
  }

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
