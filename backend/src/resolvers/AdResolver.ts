import {
  Query,
  Resolver,
} from "type-graphql";

@Resolver()
export default class AdResolver {
  @Query(() => String)
  async hello() {
    return "hello from graphql !"
  }
}
