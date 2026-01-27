

import { execute } from "../jest.setup";
import addTag from "./operations/addTag";
import getTags from "./operations/getTags";
import updateTag from "./operations/updateTag";
import deleteTag from "./operations/deleteTag";
import { createAdmin } from "./helpers/createAdmin";
import getUserContext from "./helpers/getUserContext";
import { User } from "../src/entities/User";

describe("TagsResolver", () => {
  it("createTag (admin) creates a tag", async () => {
    const admin = await createAdmin();
    const adminCtx = await getUserContext(admin as any);

    const createRes: any = await execute(addTag, { data: { name: "foo" } }, adminCtx);
    const createBody = createRes?.body?.singleResult ?? createRes;
    expect(createBody).toMatchInlineSnapshot({
      data: { createTag: { id: expect.any(Number), name: "foo" } },
    }, `
{
  "data": {
    "createTag": {
      "id": Any<Number>,
      "name": "foo",
    },
  },
  "errors": undefined,
}
`);
  });

  it("tags query returns created tags", async () => {
    const admin = await createAdmin();
    const adminCtx = await getUserContext(admin as any);
    await execute(addTag, { data: { name: "foo" } }, adminCtx);

    const listRes: any = await execute(getTags);
    const listBody = listRes?.body?.singleResult ?? listRes;
    expect(listBody).toMatchInlineSnapshot({
      data: { tags: [{ id: expect.any(Number), name: "foo" }] },
    }, `
{
  "data": {
    "tags": [
      {
        "id": Any<Number>,
        "name": "foo",
      },
    ],
  },
  "errors": undefined,
}
`);
  });

  it("updateTag updates a tag", async () => {
    const admin = await createAdmin();
    const adminCtx = await getUserContext(admin as any);
    const createRes: any = await execute(addTag, { data: { name: "foo" } }, adminCtx);
    const createBody = createRes?.body?.singleResult ?? createRes;
    const tagId = createBody.data.createTag.id;

    const updateRes: any = await execute(updateTag, { id: tagId, data: { name: "bar" } }, adminCtx);
    const updateBody = updateRes?.body?.singleResult ?? updateRes;
    expect(updateBody).toMatchInlineSnapshot({
      data: { updateTag: { id: expect.any(Number), name: "bar" } },
    }, `
{
  "data": {
    "updateTag": {
      "id": Any<Number>,
      "name": "bar",
    },
  },
  "errors": undefined,
}
`);
  });

  it("deleteTag removes the tag", async () => {
    const admin = await createAdmin();
    const adminCtx = await getUserContext(admin as any);
    const createRes: any = await execute(addTag, { data: { name: "foo" } }, adminCtx);
    const createBody = createRes?.body?.singleResult ?? createRes;
    const tagId = createBody.data.createTag.id;

    const deleteRes: any = await execute(deleteTag, { id: tagId }, adminCtx);
    const deleteBody = deleteRes?.body?.singleResult ?? deleteRes;
    expect(deleteBody).toMatchInlineSnapshot({ data: { deleteTag: true } }, `
{
  "data": {
    "deleteTag": true,
  },
  "errors": undefined,
}
`);

    const afterDeleteList: any = await execute(getTags);
    const afterDeleteBody = afterDeleteList?.body?.singleResult ?? afterDeleteList;
    expect(afterDeleteBody).toMatchInlineSnapshot({ data: { tags: [] } }, `
{
  "data": {
    "tags": [],
  },
  "errors": undefined,
}
`);
  });

  it("prevents non-admin users from creating tags", async () => {
    const user = await User.create({ email: "user@app.com", hashedPassword: "userPass123!" }).save();
    const ctx = await getUserContext(user as any);

    const res: any = await execute(addTag, { data: { name: "nope" } }, ctx);
    const body = res?.body?.singleResult ?? res;
    expect(body.data).toBeNull();
    expect(body.errors).toBeDefined();
    expect(body.errors[0].extensions).toMatchInlineSnapshot({ code: "FORBIDDEN" }, `
{
  "code": "FORBIDDEN",
}
`);
  });

  it("validates tag name length when creating", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);

    const res: any = await execute(addTag, { data: { name: "a" } }, ctx);
    const body = res?.body?.singleResult ?? res;
    expect(body.data).toBeNull();
    expect(body.errors).toBeDefined();
    // message currently comes back as GraphQL's validation wrapper
    expect(body.errors[0].message).toMatchInlineSnapshot(`"Argument Validation Error"`);
  });

  it("rejects createTag with empty or too long names", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);

    // empty
    const emptyRes: any = await execute(addTag, { data: { name: "" } }, ctx);
    const emptyBody = emptyRes?.body?.singleResult ?? emptyRes;
    expect(emptyBody.data).toBeNull();
    expect(emptyBody.errors[0].message).toMatchInlineSnapshot(`"Argument Validation Error"`);

    // too long
    const longName = "a".repeat(21);
    const longRes: any = await execute(addTag, { data: { name: longName } }, ctx);
    const longBody = longRes?.body?.singleResult ?? longRes;
    expect(longBody.data).toBeNull();
    expect(longBody.errors[0].message).toMatchInlineSnapshot(`"Argument Validation Error"`);
  });

  it("allows duplicate tag names", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);
    await execute(addTag, { data: { name: "dupe" } }, ctx);
    await execute(addTag, { data: { name: "dupe" } }, ctx);

    const listRes: any = await execute(getTags);
    const listBody = listRes?.body?.singleResult ?? listRes;
    expect(listBody.data.tags.filter((t: any) => t.name === "dupe").length).toBe(2);
  });

  it("updateTag validation rejects invalid names and returns NOT_FOUND for missing tag", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);

    const createRes: any = await execute(addTag, { data: { name: "orig" } }, ctx);
    const createBody = createRes?.body?.singleResult ?? createRes;
    const tagId = createBody.data.createTag.id;

    // invalid update
    const invalidRes: any = await execute(updateTag, { id: tagId, data: { name: "" } }, ctx);
    const invalidBody = invalidRes?.body?.singleResult ?? invalidRes;
    expect(invalidBody.data).toBeNull();
    expect(invalidBody.errors[0].message).toMatchInlineSnapshot(`"Argument Validation Error"`);

    // not found update
    const notFoundRes: any = await execute(updateTag, { id: 9999, data: { name: "new" } }, ctx);
    const notFoundBody = notFoundRes?.body?.singleResult ?? notFoundRes;
    expect(notFoundBody.data).toBeNull();
    expect(notFoundBody.errors[0].extensions).toMatchInlineSnapshot({ code: "NOT_FOUND" }, `
{
  "code": "NOT_FOUND",
}
`);
  });

  it("deleteTag returns NOT_FOUND when tag missing", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);

    const res: any = await execute(deleteTag, { id: 9999 }, ctx);
    const body = res?.body?.singleResult ?? res;
    expect(body.data).toBeNull();
    expect(body.errors[0].extensions).toMatchInlineSnapshot({ code: "NOT_FOUND" }, `
{
  "code": "NOT_FOUND",
}
`);
  });

  it("preserves whitespace in tag names", async () => {
    const admin = await createAdmin();
    const ctx = await getUserContext(admin as any);
    await execute(addTag, { data: { name: "  spaced  " } }, ctx);

    const res: any = await execute(getTags);
    const body = res?.body?.singleResult ?? res;
    expect(body.data.tags[0].name).toBe("  spaced  ");
  });
});
