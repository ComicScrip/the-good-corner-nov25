import jwt from "jsonwebtoken";
import { execute } from "../jest.setup";
import { Ad } from "../src/entities/Ad";
import { Category } from "../src/entities/Category";
import { Tag } from "../src/entities/Tag";
import { User, UserRole } from "../src/entities/User";
import env from "../src/env";
import getAds from "./operations/getAds";
import getAd from "./operations/getAd";
import createAd from "./operations/createAd";
import updateAd from "./operations/updateAd";
import deleteAd from "./operations/deleteAd";
import getAdminContext from "./helpers/getAdminContext";
import getUserContext from "./helpers/getUserContext";

describe("AdResolver", () => {
  let user1: User;
  let user2: User;
  let category1: Category;
  let category2: Category;
  let tag1: Tag;
  let tag2: Tag;

  beforeEach(async () => {
    // Create test users
    user1 = new User();
    Object.assign(user1, {
      email: "user1@test.com",
      hashedPassword: "password123",
      role: UserRole.Visitor,
    });
    await user1.save();

    user2 = new User();
    Object.assign(user2, {
      email: "user2@test.com",
      hashedPassword: "password123",
      role: UserRole.Visitor,
    });
    await user2.save();

    // Create test categories
    category1 = await Category.create({ name: "Electronics" }).save();
    category2 = await Category.create({ name: "Clothing" }).save();

    // Create test tags
    tag1 = await Tag.create({ name: "New" }).save();
    tag2 = await Tag.create({ name: "Used" }).save();
  });

  describe("ads query", () => {
    it("should return all ads", async () => {
      const ad1 = new Ad();
      Object.assign(ad1, {
        title: "iPhone 15",
        price: 999,
        description: "Brand new iPhone",
        location: "Paris",
        pictureUrl: "https://example.com/iphone.jpg",
        category: category1,
        tags: [tag1],
        author: user1,
      });
      await ad1.save();

      const ad2 = new Ad();
      Object.assign(ad2, {
        title: "Samsung TV",
        price: 599,
        description: "4K TV",
        location: "Lyon",
        pictureUrl: "https://example.com/tv.jpg",
        category: category1,
        tags: [tag2],
        author: user2,
      });
      await ad2.save();

      const res = await execute(getAds);
      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "ads": [
      {
        "author": {
          "email": "user2@test.com",
          "id": 2,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "4K TV",
        "id": 2,
        "location": "Lyon",
        "pictureUrl": "https://example.com/tv.jpg",
        "price": 599,
        "tags": [
          {
            "id": 2,
            "name": "Used",
          },
        ],
        "title": "Samsung TV",
      },
      {
        "author": {
          "email": "user1@test.com",
          "id": 1,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "Brand new iPhone",
        "id": 1,
        "location": "Paris",
        "pictureUrl": "https://example.com/iphone.jpg",
        "price": 999,
        "tags": [
          {
            "id": 1,
            "name": "New",
          },
        ],
        "title": "iPhone 15",
      },
    ],
  },
}
`);
    });

    it("should filter ads by title", async () => {
      const ad1 = await Ad.create({
        title: "iPhone 15",
        price: 999,
        description: "Brand new iPhone",
        location: "Paris",
        pictureUrl: "https://example.com/iphone.jpg",
        category: category1,
        tags: [],
        author: user1,
      }).save();

      const ad2 = await Ad.create({
        title: "Samsung TV",
        price: 599,
        description: "4K TV",
        location: "Lyon",
        pictureUrl: "https://example.com/tv.jpg",
        category: category1,
        tags: [],
        author: user2,
      }).save();

      const res = await execute(getAds, {
        titleContains: "iPhone",
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "ads": [
      {
        "author": {
          "email": "user1@test.com",
          "id": 1,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "Brand new iPhone",
        "id": 1,
        "location": "Paris",
        "pictureUrl": "https://example.com/iphone.jpg",
        "price": 999,
        "tags": [],
        "title": "iPhone 15",
      },
    ],
  },
}
`);
    });

    it("should filter ads by category", async () => {
      const ad1 = await Ad.create({
        title: "iPhone 15",
        price: 999,
        description: "Brand new iPhone",
        location: "Paris",
        pictureUrl: "https://example.com/iphone.jpg",
        category: category1,
        tags: [],
        author: user1,
      }).save();

      const ad2 = await Ad.create({
        title: "T-Shirt",
        price: 25,
        description: "Cotton t-shirt",
        location: "Paris",
        pictureUrl: "https://example.com/tshirt.jpg",
        category: category2,
        tags: [],
        author: user2,
      }).save();

      const res = await execute(getAds, {
        categoryId: category1.id,
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "ads": [
      {
        "author": {
          "email": "user1@test.com",
          "id": 1,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "Brand new iPhone",
        "id": 1,
        "location": "Paris",
        "pictureUrl": "https://example.com/iphone.jpg",
        "price": 999,
        "tags": [],
        "title": "iPhone 15",
      },
    ],
  },
}
`);
    });

    it("should limit results", async () => {
      const ad1 = await Ad.create({
        title: "iPhone 15",
        price: 999,
        description: "Brand new iPhone",
        location: "Paris",
        pictureUrl: "https://example.com/iphone.jpg",
        category: category1,
        tags: [],
        author: user1,
      }).save();

      const ad2 = await Ad.create({
        title: "Samsung TV",
        price: 599,
        description: "4K TV",
        location: "Lyon",
        pictureUrl: "https://example.com/tv.jpg",
        category: category1,
        tags: [],
        author: user2,
      }).save();

      const res = await execute(getAds, {
        limit: 1,
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "ads": [
      {
        "author": {
          "email": "user2@test.com",
          "id": 2,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "4K TV",
        "id": 2,
        "location": "Lyon",
        "pictureUrl": "https://example.com/tv.jpg",
        "price": 599,
        "tags": [],
        "title": "Samsung TV",
      },
    ],
  },
}
`);
    });

    it("should sort by price ascending", async () => {
      const ad1 = await Ad.create({
        title: "Expensive item",
        price: 1000,
        description: "Very expensive",
        location: "Paris",
        pictureUrl: "https://example.com/expensive.jpg",
        category: category1,
        tags: [],
        author: user1,
      }).save();

      const ad2 = await Ad.create({
        title: "Cheap item",
        price: 100,
        description: "Very cheap",
        location: "Lyon",
        pictureUrl: "https://example.com/cheap.jpg",
        category: category1,
        tags: [],
        author: user2,
      }).save();

      const res = await execute(getAds, {
        sortBy: "price",
        order: "asc",
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "ads": [
      {
        "author": {
          "email": "user2@test.com",
          "id": 2,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "Very cheap",
        "id": 2,
        "location": "Lyon",
        "pictureUrl": "https://example.com/cheap.jpg",
        "price": 100,
        "tags": [],
        "title": "Cheap item",
      },
      {
        "author": {
          "email": "user1@test.com",
          "id": 1,
        },
        "category": {
          "id": 1,
          "name": "Electronics",
        },
        "description": "Very expensive",
        "id": 1,
        "location": "Paris",
        "pictureUrl": "https://example.com/expensive.jpg",
        "price": 1000,
        "tags": [],
        "title": "Expensive item",
      },
    ],
  },
}
`);
    });
  });

  describe("ad query", () => {
    it("should return a single ad", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "iPhone 15",
        price: 999,
        description: "Brand new iPhone",
        location: "Paris",
        pictureUrl: "https://example.com/iphone.jpg",
        category: category1,
        tags: [tag1],
        author: user1,
      });
      await ad.save();

      const res = await execute(getAd, {
        id: ad.id,
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "ad": {
      "author": {
        "email": "user1@test.com",
        "id": 1,
      },
      "category": {
        "id": 1,
        "name": "Electronics",
      },
      "description": "Brand new iPhone",
      "id": 1,
      "location": "Paris",
      "pictureUrl": "https://example.com/iphone.jpg",
      "price": 999,
      "tags": [
        {
          "id": 1,
          "name": "New",
        },
      ],
      "title": "iPhone 15",
    },
  },
}
`);
    });

    it("should return not found for non-existent ad", async () => {
      const res = await execute(getAd, {
        id: 999,
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: ad not found],
  ],
}
`);
    });
  });

  describe("createAd mutation", () => {
    it("should create an ad with authenticated user", async () => {
      const res = await execute(
        createAd,
        {
          data: {
            title: "New Laptop",
            description: "Powerful gaming laptop",
            price: 1500,
            location: "Paris",
            pictureUrl: "https://example.com/laptop.jpg",
            category: { id: category1.id },
            tags: [{ id: tag1.id }],
          },
        },
        await getUserContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "createAd": {
      "author": {
        "email": "user@app.com",
        "id": 3,
      },
      "category": {
        "id": 1,
        "name": "Electronics",
      },
      "description": "Powerful gaming laptop",
      "id": 1,
      "location": "Paris",
      "pictureUrl": "https://example.com/laptop.jpg",
      "price": 1500,
      "tags": [
        {
          "id": 1,
          "name": "New",
        },
      ],
      "title": "New Laptop",
    },
  },
}
`);

      const adInDB = await Ad.findOne({ where: { title: "New Laptop" } });
      expect(adInDB).not.toBeNull();
    });

    it("should not create an ad without authentication", async () => {
      const res = await execute(createAd, {
        data: {
          title: "New Laptop",
          description: "Powerful gaming laptop",
          price: 1500,
          location: "Paris",
          pictureUrl: "https://example.com/laptop.jpg",
          category: { id: category1.id },
          tags: [],
        },
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: You need to be authenticated to perform this operation],
  ],
}
`);
    });

    it("should not create an ad with invalid title (too short)", async () => {
      const res = await execute(
        createAd,
        {
          data: {
            title: "Hi", // Too short (min 5 chars)
            description: "Short title",
            price: 100,
            location: "Paris",
            pictureUrl: "https://example.com/test.jpg",
            category: { id: category1.id },
            tags: [],
          },
        },
        await getUserContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    });

    it("should not create an ad with negative price", async () => {
      const res = await execute(
        createAd,
        {
          data: {
            title: "Negative Price Item",
            description: "This should fail",
            price: -100,
            location: "Paris",
            pictureUrl: "https://example.com/test.jpg",
            category: { id: category1.id },
            tags: [],
          },
        },
        await getUserContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    });

    it("should not create an ad with invalid picture URL", async () => {
      const res = await execute(
        createAd,
        {
          data: {
            title: "Invalid URL Item",
            description: "This should fail",
            price: 100,
            location: "Paris",
            pictureUrl: "not-a-valid-url",
            category: { id: category1.id },
            tags: [],
          },
        },
        await getUserContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    });
  });

  describe("updateAd mutation", () => {
    it("should update an ad by its author", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "Old Title",
        price: 500,
        description: "Old description",
        location: "Paris",
        pictureUrl: "https://example.com/old.jpg",
        category: category1,
        tags: [tag1],
        author: user1,
      });
      await ad.save();

      const res = await execute(
        updateAd,
        {
          id: ad.id,
          data: {
            title: "Updated Title",
            price: 600,
          },
        },
        { req: { headers: { authorization: `Bearer ${await getJWTForUser(user1)}` } } }
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Cannot return null for non-nullable field Ad.author.],
  ],
}
`);
    });

    it("should update an ad by admin", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "User's Ad",
        price: 500,
        description: "User's ad",
        location: "Paris",
        pictureUrl: "https://example.com/user-ad.jpg",
        category: category1,
        tags: [],
        author: user1,
      });
      await ad.save();

      const res = await execute(
        updateAd,
        {
          id: ad.id,
          data: {
            title: "Admin Updated Title",
          },
        },
        await getAdminContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Cannot return null for non-nullable field Ad.author.],
  ],
}
`);
    });

    it("should not update an ad without authentication", async () => {
      const ad = await Ad.create({
        title: "Test Ad",
        price: 500,
        description: "Test",
        location: "Paris",
        pictureUrl: "https://example.com/test.jpg",
        category: category1,
        tags: [],
        author: user1,
      }).save();

      const res = await execute(updateAd, {
        id: ad.id,
        data: {
          title: "Should Not Update",
        },
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: You need to be authenticated to perform this operation],
  ],
}
`);
    });

    it("should not update another user's ad", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "User1's Ad",
        price: 500,
        description: "User1's ad",
        location: "Paris",
        pictureUrl: "https://example.com/user1-ad.jpg",
        category: category1,
        tags: [],
        author: user1,
      });
      await ad.save();

      const res = await execute(
        updateAd,
        {
          id: ad.id,
          data: {
            title: "User2 Trying to Update",
          },
        },
        { req: { headers: { authorization: `Bearer ${await getJWTForUser(user2)}` } } }
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: You are not allowed to perform this operation],
  ],
}
`);
    });

    it("should not update non-existent ad", async () => {
      const res = await execute(
        updateAd,
        {
          id: 999,
          data: {
            title: "Should Not Update",
          },
        },
        await getUserContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: ad not found],
  ],
}
`);
    });
  });

  describe("deleteAd mutation", () => {
    it("should delete an ad by its author", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "Ad to Delete",
        price: 500,
        description: "Will be deleted",
        location: "Paris",
        pictureUrl: "https://example.com/delete.jpg",
        category: category1,
        tags: [],
        author: user1,
      });
      await ad.save();

      const res = await execute(
        deleteAd,
        {
          id: ad.id,
        },
        { req: { headers: { authorization: `Bearer ${await getJWTForUser(user1)}` } } }
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "deleteAd": "ad deleted !",
  },
}
`);

      const deletedAd = await Ad.findOne({ where: { id: ad.id } });
      expect(deletedAd).toBeNull();
    });

    it("should delete an ad by admin", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "User's Ad to Delete",
        price: 500,
        description: "Will be deleted by admin",
        location: "Paris",
        pictureUrl: "https://example.com/admin-delete.jpg",
        category: category1,
        tags: [],
        author: user1,
      });
      await ad.save();

      const res = await execute(
        deleteAd,
        {
          id: ad.id,
        },
        await getAdminContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "deleteAd": "ad deleted !",
  },
}
`);
    });

    it("should not delete an ad without authentication", async () => {
      const ad = await Ad.create({
        title: "Protected Ad",
        price: 500,
        description: "Should not be deleted",
        location: "Paris",
        pictureUrl: "https://example.com/protected.jpg",
        category: category1,
        tags: [],
        author: user1,
      }).save();

      const res = await execute(deleteAd, {
        id: ad.id,
      });

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: You need to be authenticated to perform this operation],
  ],
}
`);
    });

    it("should not delete another user's ad", async () => {
      const ad = new Ad();
      Object.assign(ad, {
        title: "User1's Protected Ad",
        price: 500,
        description: "User2 cannot delete this",
        location: "Paris",
        pictureUrl: "https://example.com/protected-user1.jpg",
        category: category1,
        tags: [],
        author: user1,
      });
      await ad.save();

      const res = await execute(
        deleteAd,
        {
          id: ad.id,
        },
        { req: { headers: { authorization: `Bearer ${await getJWTForUser(user2)}` } } }
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: You are not allowed to perform this operation],
  ],
}
`);
    });

    it("should not delete non-existent ad", async () => {
      const res = await execute(
        deleteAd,
        {
          id: 999,
        },
        await getUserContext()
      );

      expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: ad not found],
  ],
}
`);
    });
  });
});

// Helper function to get JWT for a specific user
async function getJWTForUser(user: User): Promise<string> {
  return jwt.sign({ userId: user.id }, env.JWT_SECRET);
}
