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
    await page.goto("/admin");
    await expect(page).toHaveURL("/");

    await page.goto("/admin/usuarios");
    await expect(page).toHaveURL("/");
  });
});
