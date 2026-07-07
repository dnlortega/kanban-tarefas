const encoder = new TextEncoder();

export const AUTH_COOKIE_NAME = "kanban_auth";

export async function hashSecret(secret: string): Promise<string> {
  const data = encoder.encode(secret);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
