import { test, expect } from "@playwright/test";

test.describe("Admin Route Guarding & RBAC", () => {
  test("should redirect unauthenticated users from /admin to /login", async ({
    page,
  }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /admin/sources to /login", async ({
    page,
  }) => {
    await page.goto("/admin/sources");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /admin/reports to /login", async ({
    page,
  }) => {
    await page.goto("/admin/reports");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /admin/usage to /login", async ({
    page,
  }) => {
    await page.goto("/admin/usage");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should redirect unauthenticated users from /admin/audit-log to /login", async ({
    page,
  }) => {
    await page.goto("/admin/audit-log");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Admin Dashboard Smoke Tests (authenticated)", () => {
  test("dashboard page renders stats cards", () => {
    // Requires authenticated admin session via test helper
    // This test verifies page structure is loadable
    test.skip(
      true,
      "Requires authenticated admin session — run with seeded admin user",
    );
  });
});
