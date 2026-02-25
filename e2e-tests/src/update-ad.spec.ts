import { expect, test } from "@playwright/test";
import { clearDB } from "../../backend/src/db";
import { Ad } from "../../backend/src/entities/Ad";
import { Category } from "../../backend/src/entities/Category";
import { Tag } from "../../backend/src/entities/Tag";
import { connectDB, disconnectDB } from "./helpers/dbHelpers";
import { loginAs } from "./helpers/authHelpers";

test.beforeAll(connectDB);
test.beforeEach(clearDB);
test.afterAll(disconnectDB);

test("can update an existing ad", async ({ page }) => {
  const email = "martin.dupont@app.com";
  const user = await loginAs(page, { email });

  const category = await Category.create({ name: "Informatique" }).save();
  const updatedCategory = await Category.create({ name: "Telephonie" }).save();
  const tagOld = await Tag.create({ name: "Vintage" }).save();
  const tagNew = await Tag.create({ name: "Repare" }).save();

  const ad = await Ad.create({
    title: "iPhone 8",
    description: "Telephone en bon etat",
    price: 160,
    pictureUrl: "https://example.com/iphone.png",
    location: "Paris",
    category,
    tags: [tagOld],
    author: user,
  }).save();

  await page.goto(`/ads/${ad.id}/edit`);

  const updatedTitle = "iPhone 8 - revise";
  const updatedLocation = "Nantes";
  const updatedPrice = "140";
  const updatedPictureUrl = "https://example.com/iphone-8.png";
  const updatedDescription = "Telephone revise, batterie neuve.";

  await page.getByTestId("ad-title").fill(updatedTitle);
  await page.getByTestId("ad-location").fill(updatedLocation);
  await page.getByTestId("ad-price").fill(updatedPrice);
  await page.getByTestId("ad-picture-url").fill(updatedPictureUrl);
  await page.getByTestId("ad-category").selectOption(updatedCategory.id.toString());

  const tagsSelect = page.getByTestId("ad-tags");
  await tagsSelect.locator("input[role=combobox]").fill(tagNew.name);
  await page.getByText(tagNew.name, { exact: true }).click();

  await page.getByTestId("ad-description").fill(updatedDescription);
  await page.getByTestId("ad-submit").click();

  await expect(page).toHaveURL(`/ads/${ad.id}`);
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  await expect(page.getByText(`${updatedPrice} €`, { exact: true })).toBeVisible();
  await expect(page.getByText(updatedLocation, { exact: true })).toBeVisible();
  await expect(page.getByText(updatedDescription, { exact: true })).toBeVisible();
  await expect(page.getByText(tagNew.name, { exact: true })).toBeVisible();
});
