import type { Page } from "@playwright/test";

export async function login(
  page: Page,
  { username = "coordenador", password = "coord12345" }: { username?: string; password?: string } = {}
) {
  await page.goto("/login", { waitUntil: "load", timeout: 45000 });
  await page.fill("#username", username);
  await page.fill("#password", password);
  await page.click('button[aria-label="Entrar"]');
  // Turbopack compiles routes on first visit, which can be slow under the
  // dev server — give the post-login redirect plenty of room.
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 60000,
  });
}

export async function loginAsMember(page: Page) {
  return login(page, { username: "membro", password: "membro12345" });
}
