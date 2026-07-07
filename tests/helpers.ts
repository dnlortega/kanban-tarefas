import type { Page } from "@playwright/test";

export async function login(
  page: Page,
  { username = "coordenador", password = "coord12345" }: { username?: string; password?: string } = {}
) {
  await page.goto("/login");
  await page.fill("#username", username);
  await page.fill("#password", password);
  await page.click('button[aria-label="Entrar"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"));
}

export async function loginAsMember(page: Page) {
  return login(page, { username: "membro", password: "membro12345" });
}
