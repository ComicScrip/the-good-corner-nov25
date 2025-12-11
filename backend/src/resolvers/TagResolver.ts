import { Tag, NewTagInput } from "../entities/Tag";
import { Query, Arg, Mutation, Resolver } from "type-graphql";

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
}
