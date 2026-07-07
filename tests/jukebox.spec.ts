import { test, expect } from "@playwright/test";
import { login } from "./helpers";

test.describe("Jukebox", () => {
  test.skip(
    !process.env.YOUTUBE_API_KEY,
    "YOUTUBE_API_KEY não configurada — pulando testes que dependem de busca"
  );

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("bloqueia pedido duplicado da mesma música", async ({ page }) => {
    await page.goto("/jukebox/pedir", { waitUntil: "networkidle" });
    const searchInput = page.locator(
      'input[placeholder="Buscar música ou artista"]'
    );
    await searchInput.waitFor({ state: "visible" });
    await searchInput.fill("lofi hip hop radio");
    await page.click('button[aria-label="Buscar"]');

    const firstResult = page
      .locator('button[aria-label="Pedir esta música"]')
      .first();
    await expect(firstResult).toBeVisible({ timeout: 20000 });

    // First request should land in the queue.
    await firstResult.click();
    await expect(page.getByText("Próximas na fila (1)")).toBeVisible({
      timeout: 10000,
    });

    // Requesting the exact same track again must be rejected, not duplicated.
    await firstResult.click();
    await expect(page.locator("text=já está na fila")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Próximas na fila (1)")).toBeVisible();

    // Clean up: remove the track this test queued.
    await page.click('button[aria-label="Remover da fila"]');
    await expect(page.getByText("Próximas na fila (0)")).toBeVisible();
  });
});
