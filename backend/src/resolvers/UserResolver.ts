import { hash, verify } from "argon2";
import { GraphQLError } from "graphql";
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { endSession, getCurrentUser, startSession } from "../auth";
import { LoginInput, SignupInput, User } from "../entities/User";
import type { GraphQLContext } from "../types";

@Resolver()
export default class UserResolver {
  @Query(() => [User])
  async users() {
    return await User.find();
  }

  @Mutation(() => User)
  async signup(
    @Arg("data", () => SignupInput, { validate: true }) data: SignupInput,
  ) {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new GraphQLError("Un utilisateur avec cet email existe déjà", {
        extensions: { code: "EMAIL_ALREADY_TAKEN", http: { status: 400 } },
      });
    }
    const hashedPassword = await hash(data.password);
    const newUser = User.create({ ...data, hashedPassword });
    return await newUser.save();
  }

  @Mutation(() => String)
  async login(
    @Arg("data", () => LoginInput, { validate: true }) data: LoginInput,
    @Ctx() context: GraphQLContext,
  ) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new GraphQLError("Email ou mot de passe incorrect", {
        extensions: { code: "INVALID_CREDENTIALS", http: { status: 401 } },
      });
    }

    const isPasswordValid = await verify(user.hashedPassword, data.password);
    if (!isPasswordValid) {
      throw new GraphQLError("Email ou mot de passe incorrect", {
        extensions: { code: "INVALID_CREDENTIALS", http: { status: 401 } },
      });
    }

    return startSession(context, user);
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() context: GraphQLContext) {
    endSession(context);
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() context: GraphQLContext) {
    return getCurrentUser(context);
  }
}
