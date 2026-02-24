import { Ctx, Query, Resolver } from "type-graphql";
import { getCurrentUser } from "../auth";
import { User } from "../entities/User";
import type { GraphQLContext } from "../types";

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return await User.find();
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() context: GraphQLContext) {
    try {
      return await getCurrentUser(context);
    } catch (_e) {
      return null;
    }
  }
}
