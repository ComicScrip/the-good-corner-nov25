import { expect, test } from "@playwright/test";
import { connectDB, disconnectDB } from "./dbHelpers";
import { hash } from "argon2";
import { User } from "../../backend/src/entities/User";
import { clearDB } from "../../backend/src/db";

test.beforeAll(connectDB);
test.beforeEach(clearDB);
test.afterAll(disconnectDB);

test("can log in with correct credentials", async ({ page }) => {
    const email = "dave.lopper@website.com";
    const password = "1T!ESTINng";
    await User.create({ email, hashedPassword: await hash(password) }).save()

    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByTestId("logout-btn")).toBeVisible();
});

test("cannot log in with incorrect password", async ({ page }) => {
    const email = "dave.lopper@website.com";
    const password = "1T!ESTINng";
    await User.create({ email, hashedPassword: await hash(password) }).save()

    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill("1T!ESTINg");
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByTestId("login-errors")).toContainText("Email ou mot de passe incorrect");
});

test("cannot log in with incorrect email", async ({ page }) => {
    const email = "dave.lopper@website.com";
    const password = "1T!ESTINng";
    await User.create({ email, hashedPassword: await hash(password) }).save()

    await page.goto("/login");
    await page.getByTestId("login-email").fill("john.doe@mail.com");
    await page.getByTestId("login-password").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await expect(page.getByTestId("login-errors")).toContainText("Email ou mot de passe incorrect");
});