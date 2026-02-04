import gql from "graphql-tag";
import { execute } from "../jest.setup";
import { Tag } from "../src/entities/Tag";
import { createAdmin } from "./helpers/createAdmin";
import { getUserContext } from "./helpers/getUserContext";

describe("Tags Resolver", () => {
  it("should read tags", async () => {
    await Tag.create({ name: "tag1" }).save();
    await Tag.create({ name: "tag1" }).save();

    const res = await execute(gql`
            query Tags {
                tags {
                    id
                    name
                }
            }
    `);

    expect(res.body).toMatchInlineSnapshot(`
{
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
          "name": "tag1",
        },
      ],
    },
    "errors": undefined,
  },
}
`);
  });

  it("should create Tag when logged in as admin", async () => {
    const admin = await createAdmin();

    const res = await execute(
      gql`
        mutation CreateTag($data: NewTagInput!) {
            createTag(data: $data) {
                id
                name
            }
        }
    `,
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
  });
});
