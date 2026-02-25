
import { expect, test } from "@playwright/test";
import { connectDB, disconnectDB } from "./helpers/dbHelpers";
import { User } from "../../backend/src/entities/User";
import { clearDB } from "../../backend/src/db";

test.beforeAll(connectDB);
test.beforeEach(clearDB);
test.afterAll(disconnectDB);

const BACKEND_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:4000";

/**
 * Create a user via the running better-auth HTTP endpoint so the hashed
 * password is written to the `account` table — exactly as a real sign-up.
 * Then bypass the email-verification gate by flipping the flag directly in DB.
 */
async function createUser(email: string, password: string) {
  const res = await fetch(`${BACKEND_URL}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: email.split("@")[0] }),
  });
  if (!res.ok) {
    throw new Error(`sign-up failed: ${res.status} ${await res.text()}`);
  }
  // better-auth requires email verification before sign-in; bypass in tests.
  await User.update({ email }, { emailVerified: true });
}

test("should be able to connect with correct credentials", async ({ page }) => {
  const email = "dave.lopper@app.com";
  const password = "SuperP@ssW0rd!";

  await createUser(email, password);

  await page.goto("/login");

  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);

  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByTestId("logout-btn")).toBeVisible();
});

test("should not be able to connect with incorrect password", async ({
  page,
}) => {
  const email = "dave.lopper@app.com";
  const password = "SuperP@ssW0rd!";

  await createUser(email, password);

  await page.goto("/login");

  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password + "g");

  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByTestId("login-errors")).toContainText(
    "Email ou mot de passe incorrect",
  );
});

test("should not be able to connect with incorrect email", async ({ page }) => {
  const email = "dave.lopper@app.com";
  const password = "SuperP@ssW0rd!";

  await createUser(email, password);

  await page.goto("/login");

  await page.getByTestId("login-email").fill(email + "m");
  await page.getByTestId("login-password").fill(password);

  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByTestId("login-errors")).toContainText(
    "Email ou mot de passe incorrect",
  );
});
