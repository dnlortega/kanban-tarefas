import { test, expect } from "@playwright/test";
import { login, loginAsMember } from "./helpers";

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

  test("não consegue acessar /admin, /admin/usuarios nem /atribuir diretamente", async ({
    page,
  }) => {
    test.setTimeout(90000);
    // Primeira visita compila as rotas sob demanda (Turbopack), o que pode
    // ser lento — usa timeout maior e "load" em vez do padrão.
    await page.goto("/admin", { waitUntil: "load", timeout: 45000 });
    await expect(page).toHaveURL("/", { timeout: 15000 });

    await page.goto("/admin/usuarios", { waitUntil: "load", timeout: 45000 });
    await expect(page).toHaveURL("/", { timeout: 15000 });

    await page.goto("/atribuir", { waitUntil: "load", timeout: 45000 });
    await expect(page).toHaveURL("/", { timeout: 15000 });
  });
});

test.describe("Situação da tarefa só muda por quem está atribuído", () => {
  test("diálogo de edição do coordenador não tem campo de status", async ({
    page,
  }) => {
    await login(page);

    const title = `Tarefa status ${Date.now()}`;
    await page.click('button[aria-label="Nova tarefa"]');
    await expect(page.locator("#task-status")).toBeVisible();
    await page.fill("#task-title", title);
    await page.click('button[aria-label="Criar tarefa"]');
    await expect(page.locator(`text=${title}`)).toBeVisible();

    const card = page.locator("p", { hasText: title }).locator("../..");
    await card.hover();
    await card.locator('button[aria-label="Editar tarefa"]').click();
    await expect(page.locator("#task-status")).toHaveCount(0);
    await page.click('button[aria-label="Cancelar"]');

    await card.hover();
    await card.locator('button[aria-label="Excluir tarefa"]').click();
    await page.click('button[aria-label="Excluir"]');
  });
});
