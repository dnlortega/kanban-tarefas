import { test, expect } from "@playwright/test";
import { login, loginAsMember } from "./helpers";

test.describe("Calendário", () => {
  test("coordenador vê o mês atual e navega entre meses", async ({ page }) => {
    await login(page);
    await page.goto("/calendario", { waitUntil: "load" });

    await expect(page.locator('button[aria-label="Próximo mês"]')).toBeVisible();
    const initialHeading = await page.locator("h2").first().textContent();

    await page.click('button[aria-label="Próximo mês"]');
    await expect(page.locator("h2").first()).not.toHaveText(initialHeading ?? "");

    await page.click('button[aria-label="Hoje"]');
    await expect(page.locator("h2").first()).toHaveText(initialHeading ?? "");
  });

  test("responsável consegue visualizar o calendário", async ({ page }) => {
    await loginAsMember(page);
    await page.goto("/calendario", { waitUntil: "load" });

    await expect(page.locator('button[aria-label="Próximo mês"]')).toBeVisible();
    await expect(page).toHaveURL("/calendario");
  });
});
