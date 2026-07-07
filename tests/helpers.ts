import type { Page } from "@playwright/test";

export async function login(page: Page) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    throw new Error(
      "APP_PASSWORD não está definido no ambiente. Configure .env antes de rodar os testes."
    );
  }
  await page.goto("/login");
  await page.fill("#password", password);
  await page.click('button[aria-label="Entrar"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"));
}
