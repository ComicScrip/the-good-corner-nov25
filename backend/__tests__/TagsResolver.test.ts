import gql from "graphql-tag";
import { execute } from "../jest.setup";
import { Tag } from "../src/entities/Tag";
import { createAdmin } from "./helpers/createAdmin";
import { createVisitor } from "./helpers/createVisitor";
import { getUserContext } from "./helpers/getUserContext";
import { createTag } from "./ops/createTag";

describe("Tags Resolver", () => {
  it("should read tags from DB", async () => {
    await Tag.create({ name: "tag1" }).save();
    await Tag.create({ name: "tag2" }).save();
    await Tag.create({ name: "tag3" }).save();
    const res = await execute(gql`
        query Tags {
            tags {
                id
                name
            }
        }
    `);
    expect(res).toMatchInlineSnapshot(`
{
  "body": {
    "kind": "single",
    "singleResult": {
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
          {
            "id": 3,
            "name": "tag3",
          },
        ],
      },
      "errors": undefined,
    },
  },
  "http": {
    "headers": Map {
      "cache-control" => "no-store",
    },
    "status": undefined,
  },
}
`);
  });

  it("should not create tag without being logged in", async () => {
    const res = await execute(
      createTag,
      {
        data: {
          name: "tag1",
        },
      },
      { req: { cookies: {} } },
    );

    expect(res).toMatchInlineSnapshot(`
{
  "body": {
    "kind": "single",
    "singleResult": {
      "data": null,
      "errors": [
        {
          "extensions": {
            "code": "UNAUTHENTICATED",
          },
          "locations": [
            {
              "column": 3,
              "line": 2,
            },
          ],
          "message": "You need to be authenticated to perform this operation",
          "path": [
            "createTag",
          ],
        },
      ],
    },
  },
  "http": {
    "headers": Map {
      "cache-control" => "no-store",
    },
    "status": 401,
  },
}
`);
  });

  it("should create tag when logged in with admin user", async () => {
    const admin = await createAdmin();
    const res = await execute(
      createTag,
      {
        data: {
          name: "tag1",
        },
      },
      await getUserContext(admin),
    );

    expect(res).toMatchInlineSnapshot(`
{
  "body": {
    "kind": "single",
    "singleResult": {
      "data": {
        "createTag": {
          "id": 1,
          "name": "tag1",
        },
      },
      "errors": undefined,
    },
  },
  "http": {
    "headers": Map {
      "cache-control" => "no-store",
    },
    "status": undefined,
  },
}
`);

    const tagInDB = await Tag.findOneBy({ name: "tag1" });

    expect(tagInDB).toMatchInlineSnapshot(`
Tag {
  "ads": undefined,
  "id": 1,
  "name": "tag1",
}
`);
  });

  it("should not create tag when logged in with visitor user", async () => {
    const visitor = await createVisitor();
    const res = await execute(
      createTag,
      {
        data: {
          name: "tag1",
        },
      },
      await getUserContext(visitor),
    );

    expect(res).toMatchInlineSnapshot(`
{
  "body": {
    "kind": "single",
    "singleResult": {
      "data": null,
      "errors": [
        {
          "extensions": {
            "code": "FORBIDDEN",
          },
          "locations": [
            {
              "column": 3,
              "line": 2,
            },
          ],
          "message": "You are not allowed to perform this operation",
          "path": [
            "createTag",
          ],
        },
      ],
    },
  },
  "http": {
    "headers": Map {
      "cache-control" => "no-store",
    },
    "status": 403,
  },
}
`);

    const tagInDB = await Tag.findOneBy({ name: "tag1" });

    expect(tagInDB).toMatchInlineSnapshot(`null`);
  });

  it("should not create tag with invalid data", async () => {
    const admin = await createAdmin();
    const res = await execute(
      createTag,
      {
        data: {
          name: "",
        },
      },
      await getUserContext(admin),
    );

    expect(res).toMatchInlineSnapshot(`
{
  "body": {
    "kind": "single",
    "singleResult": {
      "data": null,
      "errors": [
        {
          "extensions": {
            "code": "BAD_USER_INPUT",
            "validationErrors": [
              ValidationError {
                "children": [],
                "constraints": {
                  "isLength": "Le nom doit contenir entre 2 et 20 caractères",
                },
                "property": "name",
                "target": NewTagInput {
                  "name": "",
                },
                "value": "",
              },
            ],
          },
          "locations": [
            {
              "column": 3,
              "line": 2,
            },
          ],
          "message": "Argument Validation Error",
          "path": [
            "createTag",
          ],
        },
      ],
    },
  },
  "http": {
    "headers": Map {
      "cache-control" => "no-store",
    },
    "status": undefined,
  },
}
`);

    const tagsInDB = await Tag.find();
    expect(tagsInDB).toMatchInlineSnapshot(`[]`);
  });
});
