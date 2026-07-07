import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Autenticação", () => {
  test("bloqueia acesso sem login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("mostra erro com senha incorreta", async ({ page }) => {
    await page.goto("/login");
    await page.fill("#password", "senha-errada-de-teste");
    await page.click('button[aria-label="Entrar"]');
    await expect(page.locator("text=Senha incorreta")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("faz login e logout com sucesso", async ({ page }) => {
    await login(page);
    await expect(
      page.getByRole("heading", { name: "Quadro Kanban" })
    ).toBeVisible();

    await page.click('button[aria-label="Sair"]');
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });
});
