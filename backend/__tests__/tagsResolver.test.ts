import { execute } from "../jest.setup";
import { Tag } from "../src/entities/Tag";
import addTag from "./operations/addTag";
import getTags from "./operations/getTags";
import updateTag from "./operations/updateTag";
import deleteTag from "./operations/deleteTag";
import getAdminContext from "./helpers/getAdminContext";

describe("TagsResolver", () => {
  it("should read tags", async () => {
    await Tag.create({ name: "tag1" }).save();
    await Tag.create({ name: "tag2" }).save();


    const res = await execute(getTags);
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "tags": [
      {
        "id": 1,
        "name": "tag1",
      },
      {
        "id": 2,
        "name": "tag2",
      },
    ],
  },
}
`);

  });

  it("should create a tag with admin jwt", async () => {
    const res = await execute(
      addTag,
      {
        data: {
          name: "tag4",
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "createTag": {
      "id": 1,
      "name": "tag4",
    },
  },
}
`);
    const tagInDB = await Tag.findOneBy({ name: "tag4" });
    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "tag4",
}
`);
  });

  it("should not create a tag without admin jwt", async () => {
    const res = await execute(addTag, {
      data: {
        name: "tag4",
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
    const tagInDB = await Tag.findOneBy({ name: "tag4" });
    expect(tagInDB).toMatchInlineSnapshot(`null`);
  });

  it("should not create a tag with name too short", async () => {
    const res = await execute(
      addTag,
      {
        data: {
          name: "a", // 1 character, too short
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    const tagInDB = await Tag.findOneBy({ name: "a" });
    expect(tagInDB).toMatchInlineSnapshot(`null`);
  });

  it("should not create a tag with name too long", async () => {
    const res = await execute(
      addTag,
      {
        data: {
          name: "a".repeat(21), // 21 characters, too long
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    const tagInDB = await Tag.findOneBy({ name: "a".repeat(21) });
    expect(tagInDB).toMatchInlineSnapshot(`null`);
  });

  it("should create a tag with minimum valid name length", async () => {
    const res = await execute(
      addTag,
      {
        data: {
          name: "ab", // 2 characters, minimum valid length
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "createTag": {
      "id": 1,
      "name": "ab",
    },
  },
}
`);
    const tagInDB = await Tag.findOneBy({ name: "ab" });
    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "ab",
}
`);
  });

  it("should create a tag with maximum valid name length", async () => {
    const res = await execute(
      addTag,
      {
        data: {
          name: "a".repeat(20), // 20 characters, maximum valid length
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "createTag": {
      "id": 1,
      "name": "aaaaaaaaaaaaaaaaaaaa",
    },
  },
}
`);
    const tagInDB = await Tag.findOneBy({ name: "a".repeat(20) });
    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "aaaaaaaaaaaaaaaaaaaa",
}
`);
  });

  it("should update a tag with admin jwt", async () => {
    const tag = await Tag.create({ name: "tagToUpdate" }).save();

    const res = await execute(
      updateTag,
      {
        id: tag.id,
        data: {
          name: "updatedTag",
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "updateTag": {
      "id": 1,
      "name": "updatedTag",
    },
  },
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "updatedTag",
}
`);
  });

  it("should not update a tag without admin jwt", async () => {
    const tag = await Tag.create({ name: "tagToUpdate" }).save();

    const res = await execute(updateTag, {
      id: tag.id,
      data: {
        name: "updatedTag",
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
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB?.name).toBe("tagToUpdate");
  });

  it("should not update a non-existent tag", async () => {
    const res = await execute(
      updateTag,
      {
        id: 999,
        data: {
          name: "updatedTag",
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: tag not found],
  ],
}
`);
  });

  it("should not update a tag with name too short", async () => {
    const tag = await Tag.create({ name: "validName" }).save();

    const res = await execute(
      updateTag,
      {
        id: tag.id,
        data: {
          name: "a", // 1 character, too short
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB?.name).toBe("validName"); // Should remain unchanged
  });

  it("should not update a tag with name too long", async () => {
    const tag = await Tag.create({ name: "validName" }).save();

    const res = await execute(
      updateTag,
      {
        id: tag.id,
        data: {
          name: "a".repeat(21), // 21 characters, too long
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: Argument Validation Error],
  ],
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB?.name).toBe("validName"); // Should remain unchanged
  });

  it("should update a tag with minimum valid name length", async () => {
    const tag = await Tag.create({ name: "oldName" }).save();

    const res = await execute(
      updateTag,
      {
        id: tag.id,
        data: {
          name: "ab", // 2 characters, minimum valid length
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "updateTag": {
      "id": 1,
      "name": "ab",
    },
  },
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "ab",
}
`);
  });

  it("should update a tag with maximum valid name length", async () => {
    const tag = await Tag.create({ name: "oldName" }).save();

    const res = await execute(
      updateTag,
      {
        id: tag.id,
        data: {
          name: "a".repeat(20), // 20 characters, maximum valid length
        },
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "updateTag": {
      "id": 1,
      "name": "aaaaaaaaaaaaaaaaaaaa",
    },
  },
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "aaaaaaaaaaaaaaaaaaaa",
}
`);
  });

  it("should delete a tag with admin jwt", async () => {
    const tag = await Tag.create({ name: "tagToDelete" }).save();

    const res = await execute(
      deleteTag,
      {
        id: tag.id,
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": {
    "deleteTag": true,
  },
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB).toMatchInlineSnapshot(`null`);
  });

  it("should not delete a tag without admin jwt", async () => {
    const tag = await Tag.create({ name: "tagToDelete" }).save();

    const res = await execute(deleteTag, {
      id: tag.id,
    });
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: You need to be authenticated to perform this operation],
  ],
}
`);
    const tagInDB = await Tag.findOneBy({ id: tag.id });
    expect(tagInDB?.name).toBe("tagToDelete");
  });

  it("should not delete a non-existent tag", async () => {
    const res = await execute(
      deleteTag,
      {
        id: 999,
      },
      await getAdminContext()
    );
    expect(res).toMatchInlineSnapshot(`
{
  "data": null,
  "errors": [
    [GraphQLError: tag not found],
  ],
}
`);
  });
});
