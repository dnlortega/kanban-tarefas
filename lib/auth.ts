export const AUTH_COOKIE_NAME = "kanban_session";

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), "="));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurada");
  }
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface SessionPayload {
  userId: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const key = await getHmacKey();
  const body = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${body}.${signatureB64}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signatureB64] = token.split(".");
  if (!body || !signatureB64) return null;

  try {
    const key = await getHmacKey();
    const signature = base64UrlDecode(signatureB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(body)
    );
    if (!valid) return null;

    const json = new TextDecoder().decode(base64UrlDecode(body));
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.userId !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}
