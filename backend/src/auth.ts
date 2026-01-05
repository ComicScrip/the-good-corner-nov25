import jwt from "jsonwebtoken";
import { User } from "./entities/User";
import env from "./env";
import type { GraphQLContext } from "./types";


export interface JWTPayload {
  userId: number;
}

export async function createJWT(user: User): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
  };

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
}

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    return payload;
  } catch (_error) {
    console.log({ _error });

    return null;
  }
};

const cookieName = "authToken"

export async function startSession(context: GraphQLContext, user: User) {
  const token = await createJWT(user);

  context.res.cookie(cookieName, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export async function endSession(context: GraphQLContext) {
  context.res.clearCookie(cookieName);
}

export async function getJWT(context: GraphQLContext): Promise<JWTPayload | null> {
  const token = context.req.cookies?.[cookieName]

  if (!token) return null;
  const payload = verifyJWT(token);

  if (!payload) return null;
  return payload
}

export async function getCurrentUser(context: GraphQLContext): Promise<User | null> {
  const jwt = await getJWT(context)
  if (jwt === null) return null
  return User.findOne({ where: { id: jwt.userId } });
};
