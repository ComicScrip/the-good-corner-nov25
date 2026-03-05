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
import { invalidateAdsCache, invalidateCache } from "../db";
import { Ad, NewAdInput, UpdateAdInput } from "../entities/Ad";
import { Purchase } from "../entities/Purchase";
import { UserRole } from "../entities/User";
import env from "../env";
import { ForbiddenError } from "../errors";
import { stripe } from "../stripe";
import type { GraphQLContext } from "../types";

const CACHE_TTL = 60_000; // 1 minute

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
    // Cache key encodes all query parameters so different filter/sort
    // combinations are stored independently.
    const cacheId = `ads:${categoryId ?? ""}:${titleContains ?? ""}:${limit}:${sortBy}:${order}`;
    return Ad.find({
      where: {
        category: { id: categoryId },
        title: titleContains ? Like(`%${titleContains}%`) : undefined,
      },
      order: { [`${sortBy}`]: order },
      take: limit,
      relations: ["category", "tags"],
      cache: { id: cacheId, milliseconds: CACHE_TTL },
    });
  }

  @Query(() => Ad)
  async ad(@Arg("id", () => Int) id: number) {
    const ad = await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true, author: true },
      cache: { id: `ad:${id}`, milliseconds: CACHE_TTL },
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
    await invalidateAdsCache();
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

    if (
      currentUser.role !== UserRole.Admin &&
      currentUser.id !== adToUpdate.author.id
    )
      throw new ForbiddenError();

    Object.assign(adToUpdate, data);
    await adToUpdate.save();
    await invalidateCache([`ad:${id}`]);
    await invalidateAdsCache();
    return await Ad.findOne({
      where: { id },
      relations: { tags: true, category: true },
    });
  }

  @Authorized()
  @Mutation(() => String)
  async deleteAd(
    @Arg("id", () => Int) id: number,
    @Ctx() context: GraphQLContext,
  ) {
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
    await invalidateCache([`ad:${id}`]);
    await invalidateAdsCache();
    return "ad deleted !";
  }

  @Authorized()
  @Mutation(() => String)
  async createCheckoutSession(
    @Arg("adId", () => Int) adId: number,
    @Ctx() context: GraphQLContext,
  ) {
    if (!stripe) {
      throw new GraphQLError("Stripe is not configured on this server.", {
        extensions: { code: "STRIPE_NOT_CONFIGURED", http: { status: 503 } },
      });
    }

    const currentUser = await getCurrentUser(context);

    const ad = await Ad.findOne({
      where: { id: adId },
      relations: { author: true },
    });
    if (!ad)
      throw new GraphQLError("ad not found", {
        extensions: { code: "NOT_FOUND", http: { status: 404 } },
      });

    if (ad.sold)
      throw new GraphQLError("This ad has already been sold.", {
        extensions: { code: "AD_ALREADY_SOLD", http: { status: 400 } },
      });

    if (ad.author.id === currentUser.id)
      throw new GraphQLError("You cannot buy your own ad.", {
        extensions: { code: "FORBIDDEN", http: { status: 403 } },
      });

    const frontendUrl = env.FRONTEND_URL;
    const currency = env.STRIPE_CURRENCY || "eur";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Math.round(ad.price * 100),
            product_data: {
              name: ad.title,
              description: ad.description ?? undefined,
              images: ad.pictureUrl ? [ad.pictureUrl] : [],
            },
          },
        },
      ],
      success_url: `${frontendUrl}/ads/${adId}?purchase=success`,
      cancel_url: `${frontendUrl}/ads/${adId}?purchase=cancelled`,
      metadata: { adId: String(adId), buyerId: currentUser.id },
    });

    // Persist the pending purchase
    const purchase = Purchase.create({
      ad,
      buyer: currentUser,
      stripeSessionId: session.id,
    });
    await purchase.save();

    return session.url as string;
  }
}
