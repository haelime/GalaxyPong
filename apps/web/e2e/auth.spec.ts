import { test, expect } from "@playwright/test";

test("renders login screen", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("GalaxyPong")).toBeVisible();
});
