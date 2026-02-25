import { expect, test } from "@playwright/test";
import { clearDB } from "../../backend/src/db";
import { UserRole } from "../../backend/src/entities/User";
import { connectDB, disconnectDB } from "./helpers/dbHelpers";
import { loginAs } from "./helpers/authHelpers";

test.beforeAll(connectDB);
test.beforeEach(clearDB);
test.afterAll(disconnectDB);

test("admin can create a category", async ({ page }) => {
  await loginAs(page, {
    email: "admin@app.com",
    role: UserRole.Admin,
  });

  await page.goto("/admin/categories");

  const categoryName = "Instruments";
  await page.getByTestId("category-name").fill(categoryName);
  await page.getByTestId("category-submit").click();

  await expect(
    page.getByRole("table").getByRole("button", { name: categoryName, exact: true }),
  ).toBeVisible();
});
