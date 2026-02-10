import { test, expect } from "@playwright/test";
import { Ad } from "../../backend/src/entities/Ad";
import { clearDB } from "../../backend/src/db";
import { Category } from "../../backend/src/entities/Category";
import { User } from "../../backend/src/entities/User";
import { connectDB, disconnectDB } from "./dbHelpers";
import { hash } from "argon2";

test.beforeAll(connectDB);
test.beforeEach(clearDB);
test.afterAll(disconnectDB);

test("can view ads in db", async ({ page }) => {
    const computerCat = await Category.create({ name: "informatique" }).save();
    const carCat = await Category.create({ name: "automobile" }).save();
    const visitor = await User.create({ email: "visitor@app.com", hashedPassword: await hash("SuperP@ssW0rd!") }).save();
    const keyboard = await Ad.create({
        title: "Clavier logitech",
        description: "Clavier Bluetooth® fin et minimaliste avec des touches personnalisables.",
        price: 30,
        pictureUrl: "https://resource.logitech.com/w_800,c_lpad,ar_16:9,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/pebble-keys-2-k380s/gallery/pebble-keys-2-k380s-top-tonal-graphite-gallery-ch.png?v=1",
        location: "Paris",
        category: computerCat,
        author: visitor,
    }).save();
    const peugeot = await Ad.create({
        title: "Peugeot 206",
        description: "Diesel, 150000km, etat correct. CT effectué il y a 3 mois",
        price: 4000,
        pictureUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Peugeot_206_Quicksilver_90.jpg",
        location: "Paris",
        category: carCat,
        author: visitor,
    }).save();

    await page.goto('/')
    await page.getByRole('link', { name: 'The good corner' })
    await page.getByRole("heading", { name: "Annonces récentes" })

    await expect(page.getByTestId("ads-list")).toContainText(keyboard.title)
    await expect(page.getByTestId("ads-list")).toContainText("30,00 €")
    await expect(page.getByTestId("ads-list")).toContainText(peugeot.title)
    await expect(page.getByTestId("ads-list")).toContainText("4 000,00 €")
});