import { expect, test } from "@playwright/test";
import { clearDB } from "../../backend/src/db";
import { Category } from "../../backend/src/entities/Category";
import { Tag } from "../../backend/src/entities/Tag";
import { connectDB, disconnectDB } from "./helpers/dbHelpers";
import { loginAs } from "./helpers/authHelpers";

test.beforeAll(connectDB);
test.beforeEach(clearDB);
test.afterAll(disconnectDB);

test("can create a new ad", async ({ page }) => {
  const email = "zoe.smith@app.com";

  await loginAs(page, { email });

  const category = await Category.create({ name: "Jeux video" }).save();
  const tagRetro = await Tag.create({ name: "Retro" }).save();
  const tagConsole = await Tag.create({ name: "Console" }).save();

  await page.goto("/newAd");

  const title = "Nintendo 64 en bon etat";
  const location = "Lyon";
  const price = "120";
  const pictureUrl = "https://example.com/n64.png";
  const description = "Console N64 avec deux manettes et un jeu.";

  await page.getByTestId("ad-title").fill(title);
  await page.getByTestId("ad-location").fill(location);
  await page.getByTestId("ad-price").fill(price);
  await page.getByTestId("ad-picture-url").fill(pictureUrl);
  await page.getByTestId("ad-category").selectOption(category.id.toString());

  const tagsSelect = page.getByTestId("ad-tags");
  await tagsSelect.locator("input[role=combobox]").fill("Retro");
  await page.getByText(tagRetro.name, { exact: true }).click();
  await tagsSelect.locator("input[role=combobox]").fill("Console");
  await page.getByText(tagConsole.name, { exact: true }).click();

  await page.getByTestId("ad-description").fill(description);

  await page.getByTestId("ad-submit").click();

  await expect(page).toHaveURL(/\/ads\/\d+$/);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(`${price} €`, { exact: true })).toBeVisible();
  await expect(page.getByText(location, { exact: true })).toBeVisible();
  await expect(page.getByText(description, { exact: true })).toBeVisible();
  await expect(page.getByText(tagRetro.name, { exact: true })).toBeVisible();
  await expect(page.getByText(tagConsole.name, { exact: true })).toBeVisible();
});
