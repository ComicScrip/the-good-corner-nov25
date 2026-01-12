import { GraphQLError } from "graphql";
import { Arg, Authorized, Int, Mutation, Query, Resolver } from "type-graphql";
import { NewTagInput, Tag, UpdateTagInput } from "../entities/Tag";
import { UserRole } from "../entities/User";

@Resolver()
export default class TagResolver {
  @Query(() => [Tag])
  async tags() {
    return Tag.find();
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Tag)
  async createTag(
    @Arg("data", () => NewTagInput, { validate: true })
    data: NewTagInput,
  ) {
    const newTag = new Tag();
    Object.assign(newTag, data);
    return newTag.save();
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Tag)
  async updateTag(
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

  @Authorized([UserRole.Admin])
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
