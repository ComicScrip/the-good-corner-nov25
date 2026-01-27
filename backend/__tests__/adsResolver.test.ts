import { execute } from "../jest.setup";
import createAdOp from "./operations/createAd";
import getAdsOp from "./operations/getAds";
import updateAdOp from "./operations/updateAd";
import deleteAdOp from "./operations/deleteAd";
import getAdOp from "./operations/getAd";
import { createAdmin } from "./helpers/createAdmin";
import getUserContext from "./helpers/getUserContext";
import { User } from "../src/entities/User";
import { Category } from "../src/entities/Category";
import { Tag } from "../src/entities/Tag";

describe("AdsResolver", () => {
  function bodyOf(res: any) {
    if (!res) return { data: null, errors: [{ extensions: { code: "UNKNOWN" } }] };
    const single = res?.body?.singleResult ?? res;
    if (single && (single.data !== undefined || single.errors !== undefined)) return single;
    // fallback if Apollo returns result under 'result' shape
    if (res?.data || res?.errors) return res;
    return { data: null, errors: [{ extensions: { code: "UNKNOWN" } }] };
  }

  it("requires authentication to create an ad", async () => {
    const res: any = await execute(createAdOp, {
      data: {
        title: "Valid title",
        description: "desc",
        price: 10,
        location: "here",
        pictureUrl: "http://example.com/a.png",
        category: { id: 1 },
      },
    });
    // ensure shape is normalized
    const body = bodyOf(res);
    expect(body.data).toBeNull();
    expect(body.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  it("createAd with valid data returns the ad (and relations)", async () => {
    const user = await User.create({ email: "poster@app.com", hashedPassword: "pass123!" }).save();
    const ctx = await getUserContext(user as any);

    const category = await Category.create({ name: "For sale" }).save();
    const tag1 = await Tag.create({ name: "t1" }).save();
    const tag2 = await Tag.create({ name: "t2" }).save();

    const res: any = await execute(createAdOp, {
      data: {
        title: "Nice bike",
        description: "Good condition",
        price: 123.45,
        location: "Paris",
        pictureUrl: "http://example.com/bike.png",
        category: { id: category.id },
        tags: [{ id: tag1.id }, { id: tag2.id }],
      },
    }, ctx);

    const body = bodyOf(res);
    expect(body.data.createAd).toMatchObject({
      title: "Nice bike",
      price: 123.45,
      location: "Paris",
    });
    expect(body.data.createAd.category).toMatchObject({ id: category.id, name: category.name });
    expect(body.data.createAd.tags.map((t: any) => t.name).sort()).toEqual(["t1", "t2"]);
    expect(body.data.createAd.author).toMatchObject({ id: user.id, email: user.email });
  });

  it("validates ad input on create", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);

    const badRes: any = await execute(createAdOp, {
      data: {
        title: "sh",
        description: "d",
        price: -5,
        location: "l",
        pictureUrl: "not-a-url",
        category: { id: 9999 },
      },
    }, ctx);
    const body = bodyOf(badRes);
    expect(body.data).toBeNull();
    expect(body.errors[0].message).toMatch(/Argument Validation Error|Le titre doit contenir/);
  });

  it("allows only author or admin to update an ad", async () => {
    const author = await User.create({ email: "a1@app.com", hashedPassword: "pass!" }).save();
    const other = await User.create({ email: "a2@app.com", hashedPassword: "pass!" }).save();
    const admin = await createAdmin();

    const category = await Category.create({ name: "Cat" }).save();

    const authorCtx = await getUserContext(author as any);
    const otherCtx = await getUserContext(other as any);
    const adminCtx = await getUserContext(admin as any);

    const createRes: any = await execute(createAdOp, {
      data: {
        title: "Owned",
        description: "desc",
        price: 1,
        location: "L",
        pictureUrl: "http://example.com/x.png",
        category: { id: category.id },
      },
    }, authorCtx);
    const createBody = bodyOf(createRes);
    const adId = createBody.data.createAd.id;

    // other user cannot update (use valid payload so validation doesn't short-circuit permission check)
    const forbiddenRes: any = await execute(updateAdOp, { id: adId, data: { title: "Updated title" } }, otherCtx);
    const forbiddenBody = bodyOf(forbiddenRes);
    expect(forbiddenBody.data).toBeNull();
    expect(forbiddenBody.errors[0].extensions.code).toBe("FORBIDDEN");

    // admin can update
    const adminRes: any = await execute(updateAdOp, { id: adId, data: { title: "byAdmin" } }, adminCtx);
    // admin update response
    const adminBody = bodyOf(adminRes);
    expect(adminBody.data.updateAd.title).toBe("byAdmin");
  });

  it("deleteAd only by author or admin and returns NOT_FOUND when missing", async () => {
    const author = await User.create({ email: "del1@app.com", hashedPassword: "pass!" }).save();
    const other = await User.create({ email: "del2@app.com", hashedPassword: "pass!" }).save();
    const admin = await createAdmin();
    const category = await Category.create({ name: "DelCat" }).save();

    const authorCtx = await getUserContext(author as any);
    const otherCtx = await getUserContext(other as any);
    const adminCtx = await getUserContext(admin as any);

    const createRes: any = await execute(createAdOp, {
      data: {
        title: "ToDelete",
        description: "d",
        price: 5,
        location: "X",
        pictureUrl: "http://example.com/del.png",
        category: { id: category.id },
      },
    }, authorCtx);
    const createBody = bodyOf(createRes);
    const adId = createBody.data.createAd.id;

    // other cannot delete
    const forbiddenRes: any = await execute(deleteAdOp, { id: adId }, otherCtx);
    const forbiddenBody = bodyOf(forbiddenRes);
    expect(forbiddenBody.data).toBeNull();
    expect(forbiddenBody.errors[0].extensions.code).toBe("FORBIDDEN");

    // admin can delete
    const adminRes: any = await execute(deleteAdOp, { id: adId }, adminCtx);
    const adminBody = bodyOf(adminRes);
    expect(adminBody.data.deleteAd).toBe("ad deleted !");

    // deleting missing returns NOT_FOUND
    const notFoundRes: any = await execute(deleteAdOp, { id: 9999 }, adminCtx);
    const notFoundBody = bodyOf(notFoundRes);
    expect(notFoundBody.data).toBeNull();
    expect(notFoundBody.errors[0].extensions.code).toBe("NOT_FOUND");
  });

  it("ads query supports filters and relations", async () => {
    const user = await User.create({ email: "list@app.com", hashedPassword: "pass!" }).save();
    const ctx = await getUserContext(user as any);
    const cat1 = await Category.create({ name: "C1" }).save();
    const cat2 = await Category.create({ name: "C2" }).save();

    await execute(createAdOp, {
      data: {
        title: "FindMe",
        description: "d",
        price: 1,
        location: "L",
        pictureUrl: "http://example.com/1.png",
        category: { id: cat1.id },
      },
    }, ctx);
    await execute(createAdOp, {
      data: {
        title: "Other",
        description: "d",
        price: 2,
        location: "L",
        pictureUrl: "http://example.com/2.png",
        category: { id: cat2.id },
      },
    }, ctx);

    const allRes: any = await execute(getAdsOp, {});
    const allBody = bodyOf(allRes);
    expect(allBody.data.ads.length).toBeGreaterThanOrEqual(2);

    const filteredRes: any = await execute(getAdsOp, { titleContains: "Find" });
    const filteredBody = bodyOf(filteredRes);
    expect(filteredBody.data.ads.length).toBe(1);
    expect(filteredBody.data.ads[0].title).toBe("FindMe");

    const catRes: any = await execute(getAdsOp, { categoryId: cat2.id });
    const catBody = bodyOf(catRes);
    expect(catBody.data.ads.every((a: any) => a.category.id === cat2.id)).toBe(true);
  });
});
