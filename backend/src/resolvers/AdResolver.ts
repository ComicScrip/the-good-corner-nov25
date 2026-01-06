import { GraphQLError } from "graphql";
import {
  Arg,
  Args,
  ArgsType,
  Authorized,
  Ctx,
  Field,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { Like } from "typeorm";
import { getCurrentUser } from "../auth";
import { Ad, NewAdInput, UpdateAdInput } from "../entities/Ad";
import { ForbiddenError } from "../entities/errors";
import { UserRole } from "../entities/User";
import type { GraphQLContext } from "../types";

@ArgsType()
class GetAdsArgs {
  @Field({ nullable: true })
  titleContains?: string;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field(() => Int, { nullable: true, defaultValue: 5 })
  limit?: number;

  @Field({ defaultValue: "createdAt", nullable: true })
  sortBy?: string;

  @Field({ defaultValue: "desc", nullable: true })
  order?: string;
}

@Resolver()
export default class AdResolver {
  @Query(() => [Ad])
  async ads(
    @Args() { titleContains, limit, categoryId, order, sortBy }: GetAdsArgs,
  ) {
    return Ad.find({
      where: {
        category: { id: categoryId },
        title: titleContains ? Like(`%${titleContains}%`) : undefined,
      },
      order: {
        [`${sortBy}`]: order,
      },
      take: limit,
      relations: ["category", "tags"],
    });
  }

  @Query(() => Ad)
  async ad(@Arg("id", () => Int) id: number) {
    const ad = await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true, author: true },
    });
    if (!ad)
      throw new GraphQLError("ad not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });
    return ad;
  }

  @Authorized()
  @Mutation(() => Ad)
  async createAd(
    @Arg("data", () => NewAdInput, { validate: true }) data: NewAdInput,
    @Ctx() context: GraphQLContext,
  ) {
    const currentUser = await getCurrentUser(context);
    const newAd = new Ad();
    newAd.author = currentUser;
    Object.assign(newAd, data);
    const { id } = await newAd.save();
    return Ad.findOne({
      where: { id },
      relations: { tags: true, category: true, author: true },
    });
  }

  @Authorized()
  @Mutation(() => Ad)
  async updateAd(
    @Arg("id", () => Int) id: number,
    @Arg("data", () => UpdateAdInput, { validate: true }) data: UpdateAdInput,
    @Ctx() context: GraphQLContext,
  ) {
    const currentUser = await getCurrentUser(context);

    const adToUpdate = await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true, author: true },
    });
    if (!adToUpdate)
      throw new GraphQLError("ad not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });

    if (currentUser.role !== UserRole.Admin && currentUser.id !== adToUpdate.author.id)
      throw new ForbiddenError();

    Object.assign(adToUpdate, data);
    await adToUpdate.save();
    return await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true },
    });
  }

  @Authorized()
  @Mutation(() => String)
  async deleteAd(@Arg("id", () => Int) id: number, @Ctx() context: GraphQLContext) {
    const ad = await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true, author: true },
    });
    if (!ad)
      throw new GraphQLError("ad not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });

    const currentUser = await getCurrentUser(context);
    if (currentUser.role !== UserRole.Admin && currentUser.id !== ad.author.id)
      throw new ForbiddenError();

    await ad.remove();
    return "ad deleted !";
  }
}


