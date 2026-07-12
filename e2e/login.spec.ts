import { test, expect } from "@playwright/test";
import { E2E_USERNAME, E2E_PASSWORD } from "./testDb";

test.describe("login", () => {
  test("logs in with valid credentials and reaches the dashboard", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("ชื่อผู้ใช้").fill(E2E_USERNAME);
    await page.getByLabel("รหัสผ่าน").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(`${E2E_USERNAME} (Editor)`)).toBeVisible();

    await page.getByRole("link", { name: "ไปที่แดชบอร์ด" }).click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("shows a Thai error message for invalid credentials and stays on /login", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("ชื่อผู้ใช้").fill(E2E_USERNAME);
    await page.getByLabel("รหัสผ่าน").fill("wrong-password");
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")).toBeVisible();
  });

  test("logging out returns to the logged-out landing page", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("ชื่อผู้ใช้").fill(E2E_USERNAME);
    await page.getByLabel("รหัสผ่าน").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await expect(page.getByText(`${E2E_USERNAME} (Editor)`)).toBeVisible();

    await page.getByRole("button", { name: "ออกจากระบบ" }).click();

    await expect(page.getByRole("link", { name: "เข้าสู่ระบบ" }).first()).toBeVisible();
  });
});
