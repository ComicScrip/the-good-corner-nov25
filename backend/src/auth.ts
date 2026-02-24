import type { AuthChecker } from "type-graphql";
import { auth } from "./betterAuth";
import { User } from "./entities/User";
import { ForbiddenError, UnauthenticatedError } from "./errors";
import type { GraphQLContext } from "./types";

/**
 * Resolve the current user from the better-auth session cookie.
 * better-auth reads its own `better-auth.session_token` cookie from the
 * request headers, so we forward the raw cookie string as a Header object.
 */
export async function getCurrentUser(context: GraphQLContext): Promise<User> {
  const cookieHeader = context.req?.headers?.["cookie"] ?? "";
  const session = await auth.api.getSession({
    headers: new Headers({ cookie: cookieHeader }),
  });
  if (!session?.user?.id) throw new UnauthenticatedError();

  const user = await User.findOne({ where: { id: session.user.id } });
  if (!user) throw new UnauthenticatedError();

  return user;
}

export const authChecker: AuthChecker<GraphQLContext> = async (
  { context },
  roles,
) => {
  const currentUser = await getCurrentUser(context);
  if (roles.length !== 0 && !roles.includes(currentUser.role.toString()))
    throw new ForbiddenError();
  return true;
};
