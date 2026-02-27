import { GraphQLError } from "graphql";
import { Arg, Authorized, Int, Mutation, Query, Resolver } from "type-graphql";
import { invalidateAdsCache, invalidateCache } from "../db";
import { NewTagInput, Tag, UpdateTagInput } from "../entities/Tag";
import { UserRole } from "../entities/User";

const CACHE_TTL = 60_000; // 1 minute

@Resolver()
export default class TagResolver {
  @Query(() => [Tag])
  async tags() {
    return Tag.find({
      cache: { id: "tags", milliseconds: CACHE_TTL },
    });
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Tag)
  async createTag(
    @Arg("data", () => NewTagInput, { validate: true })
    data: NewTagInput,
  ) {
    const newTag = new Tag();
    Object.assign(newTag, data);
    const saved = await newTag.save();
    // Tags appear in ad queries — bust every cached ads variant too.
    await invalidateCache(["tags"]);
    await invalidateAdsCache();
    return saved;
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Tag)
  async updateTag(
    @Arg("id", () => Int) id: number,
    @Arg("data", () => UpdateTagInput, { validate: true })
    data: UpdateTagInput,
  ) {
    const tagToUpdate = await Tag.findOne({ where: { id } });
    if (!tagToUpdate)
      throw new GraphQLError("tag not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });

    Object.assign(tagToUpdate, data);
    const saved = await tagToUpdate.save();
    await invalidateCache(["tags"]);
    await invalidateAdsCache();
    return saved;
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Boolean)
  async deleteTag(@Arg("id", () => Int) id: number) {
    const tagToDelete = await Tag.findOne({ where: { id } });
    if (!tagToDelete)
      throw new GraphQLError("tag not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    await tagToDelete.remove();
    await invalidateCache(["tags"]);
    await invalidateAdsCache();
    return true;
  }
}
