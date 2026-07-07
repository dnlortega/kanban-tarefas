import { test, expect } from "@playwright/test";
import { loginAsMember } from "./helpers";

test.describe("Permissões de responsável", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMember(page);
  });

  test("não vê botões de criar tarefa nem administração", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Quadro Kanban" })
    ).toBeVisible();
    await expect(page.locator('button[aria-label="Nova tarefa"]')).toHaveCount(0);
    await expect(
      page.locator('button[aria-label="Administrar colunas"]')
    ).toHaveCount(0);
  });

  test("não consegue acessar /admin nem /admin/usuarios diretamente", async ({
    page,
  }) => {
    test.setTimeout(60000);
    // Primeira visita compila as rotas /admin sob demanda (Turbopack), o que
    // pode ser lento — usa timeout maior e "load" em vez do padrão.
    await page.goto("/admin", { waitUntil: "load", timeout: 45000 });
    await expect(page).toHaveURL("/", { timeout: 15000 });

    await page.goto("/admin/usuarios", { waitUntil: "load", timeout: 45000 });
    await expect(page).toHaveURL("/", { timeout: 15000 });
  });
});
