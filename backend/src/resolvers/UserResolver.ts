import { hash, verify } from "argon2";
import { randomUUID } from "crypto";
import { GraphQLError } from "graphql";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { endSession, getCurrentUser, startSession } from "../auth";
import { auth } from "../betterAuth";
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
    const newUser = User.create({ id: randomUUID(), ...data, hashedPassword });
    const savedUser = await newUser.save();

    // Trigger verification email — must be done manually because signup goes through
    // a custom GraphQL resolver (not better-auth's built-in endpoint), so sendOnSignUp won't fire.
    try {
      await auth.api.sendVerificationEmail({
        body: { email: savedUser.email },
        headers: new Headers(),
      });
    } catch (e) {
      console.warn("[signup] Failed to send verification email:", e);
    }

    return savedUser;
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

    if (!user.emailVerified) {
      throw new GraphQLError(
        "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte mail.",
        { extensions: { code: "EMAIL_NOT_VERIFIED", http: { status: 403 } } },
      );
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
    try {
      return await getCurrentUser(context);
    } catch (_e) {
      return null;
    }
  }
}
