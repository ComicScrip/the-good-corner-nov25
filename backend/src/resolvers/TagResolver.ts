import { GraphQLError } from "graphql";
import { Tag, NewTagInput, UpdateTagInput } from "../entities/Tag";
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

  @Mutation(() => Tag) async updateTag(
    @Arg("id", () => Int) id: number,
    @Arg("data", () => UpdateTagInput, { validate: true })
    data: UpdateTagInput,
  ) {
    const tagToUpdate = await Tag.findOne({
      where: { id },
    });

    if (!tagToUpdate)
      throw new GraphQLError("tag not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });

    Object.assign(tagToUpdate, data);
    return tagToUpdate.save();
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
