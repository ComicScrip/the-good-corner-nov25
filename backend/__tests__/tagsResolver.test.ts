import { execute } from "../jest.setup";
import { Tag } from "../src/entities/Tag";
import getTags from "./operations/getTags";

describe("TagsResolver", () => {
  test("reads tags", async () => {
    await Tag.create({ name: "tag1" }).save()
    await Tag.create({ name: "tag2" }).save()
    const res = await execute(getTags);
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
});
