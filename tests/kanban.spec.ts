import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Quadro Kanban", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("cria, edita e exclui uma tarefa", async ({ page }) => {
    const title = `Tarefa de teste ${Date.now()}`;
    const editedTitle = `${title} (editada)`;

    await page.click('button[aria-label="Nova tarefa"]');
    await page.fill("#task-title", title);
    await page.click('button[aria-label="Criar tarefa"]');
    await expect(page.locator(`text=${title}`)).toBeVisible();

    const card = page.locator("p", { hasText: title }).locator("../..");
    await card.hover();
    await card.locator('button[aria-label="Editar tarefa"]').click();
    await page.fill("#task-title", editedTitle);
    await page.click('button[aria-label="Salvar alterações"]');
    await expect(page.locator(`text=${editedTitle}`)).toBeVisible();

    const editedCard = page
      .locator("p", { hasText: editedTitle })
      .locator("../..");
    await editedCard.hover();
    await editedCard.locator('button[aria-label="Excluir tarefa"]').click();
    await page.click('button[aria-label="Excluir"]');
    await expect(page.locator(`text=${editedTitle}`)).not.toBeVisible();
  });

  test("busca filtra as tarefas visíveis", async ({ page }) => {
    const uniqueTitle = `Busca única ${Date.now()}`;
    await page.click('button[aria-label="Nova tarefa"]');
    await page.fill("#task-title", uniqueTitle);
    await page.click('button[aria-label="Criar tarefa"]');
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();

    await page.fill(
      'input[placeholder="Buscar por título ou descrição"]',
      "termo que não deveria bater com nada"
    );
    await expect(page.locator(`text=${uniqueTitle}`)).not.toBeVisible();

    await page.click('button[aria-label="Limpar filtros"]');
    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();

    const card = page.locator("p", { hasText: uniqueTitle }).locator("../..");
    await card.hover();
    await card.locator('button[aria-label="Excluir tarefa"]').click();
    await page.click('button[aria-label="Excluir"]');
  });
});
