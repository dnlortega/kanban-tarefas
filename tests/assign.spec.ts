import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Atribuir tarefas", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("coordenador vê a tela e o filtro de sem responsável", async ({ page }) => {
    await page.goto("/atribuir", { waitUntil: "load", timeout: 45000 });

    await expect(page.locator("text=Responsáveis")).toBeVisible();
    const filter = page.getByText("Somente sem responsável");
    await expect(filter).toBeVisible();

    await filter.click();
    await filter.click();
  });
});
