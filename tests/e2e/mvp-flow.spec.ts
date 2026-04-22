import { test, expect, type Page } from "@playwright/test";

const TEST_EMAIL = "demo@stratum.live";
const TEST_PASSWORD = "demopassword123";
const TEST_NAME = "Demo User";

test.describe("Stratum Live UI Verification", () => {
  test("landing page is accessible and shows correct content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Collaborative" })).toBeVisible();
    await expect(page.getByText("Prompt Engineering")).toBeVisible();
    await expect(page.getByRole("link", { name: "Get started" }).first()).toBeVisible();
    await expect(page.getByText("BYOK • Bring your own keys")).toBeVisible();
  });

  test("auth page loads with login and signup tabs", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByRole("tab", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sign up" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  });

  test("signup tab reveals form fields", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("tab", { name: "Sign up" }).click();
    await page.waitForSelector("#signup-name", { state: "visible", timeout: 5000 });
    await expect(page.locator("#signup-name")).toBeVisible();
    await expect(page.locator("#signup-email")).toBeVisible();
    await expect(page.locator("#signup-password")).toBeVisible();
  });

  test("signup form validates on input", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("tab", { name: "Sign up" }).click();
    await page.waitForTimeout(500);
    await page.locator("#signup-name").fill(TEST_NAME);
    await page.locator("#signup-email").fill(TEST_EMAIL);
    await page.locator("#signup-password").fill(TEST_PASSWORD);
    const btn = page.getByRole("button", { name: "Sign up" });
    await expect(btn).toBeEnabled();
  });

  test("login form shows forgot password link", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByText("Forgot password?")).toBeVisible();
  });

  test("brand section is visible on auth page", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByText("Real-time collaboration")).toBeVisible();
    await expect(page.getByText("Parallel testing")).toBeVisible();
    await expect(page.getByText("Version control + voting")).toBeVisible();
  });

  test("terms and privacy links are present", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByText("Terms")).toBeVisible();
    await expect(page.getByText("Privacy Policy")).toBeVisible();
  });
});

test.describe("UI Components", () => {
  test("footer shows BYOK tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("BYOK • Bring your own keys")).toBeVisible();
  });

  test("Stratum Live logo appears in header", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toHaveText("Stratum Live");
  });
});