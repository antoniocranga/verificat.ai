import { test, expect } from "@playwright/test";

test.describe("Authentication and Route Guarding", () => {
  test("should redirect unauthenticated users from /dashboard to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /update-password to /login", async ({
    page,
  }) => {
    await page.goto("/update-password");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should display login forms on /login", async ({ page }) => {
    await page.goto("/login");
    const title = page.locator("h1");
    await expect(title).toHaveText("verificat.xyz");

    const loginButton = page.locator("button", { hasText: "Autentificare" });
    const registerButton = page.locator("button", { hasText: "Înregistrare" });
    await expect(loginButton).toBeVisible();
    await expect(registerButton).toBeVisible();
  });

  test("should display Google OAuth button on /login", async ({ page }) => {
    await page.goto("/login");
    const googleButton = page.locator("#btn-oauth-google");
    await expect(googleButton).toBeVisible();
    await expect(googleButton).toHaveText(/Google/);
  });

  test("should display GitHub OAuth button on /login", async ({ page }) => {
    await page.goto("/login");
    const githubButton = page.locator("#btn-oauth-github");
    await expect(githubButton).toBeVisible();
    await expect(githubButton).toHaveText(/GitHub/);
  });
});
