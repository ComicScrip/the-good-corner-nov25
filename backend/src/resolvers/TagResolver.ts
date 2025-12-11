import { GraphQLError } from "graphql";
import { Tag, NewTagInput } from "../entities/Tag";
import { Query, Arg, Mutation, Resolver, Int } from "type-graphql";

@Resolver()
export default class TagResolver {
  @Query(() => [Tag])
  async tags() {
    return Tag.find();
  }

  @Mutation(() => Tag) async createTag(
    @Arg("data", () => NewTagInput, { validate: true })
    data: NewTagInput,
  ) {
    const newTag = new Tag();
    Object.assign(newTag, data);
    return newTag.save();
  }

  @Mutation(() => Boolean)
  async deleteTag(@Arg("id", () => Int) id: number) {
    const tagToDelete = await Tag.findOne({
      where: { id },
    });

    if (!tagToDelete)
      throw new GraphQLError("tag not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    await tagToDelete.remove();
    return true;
  }
}
