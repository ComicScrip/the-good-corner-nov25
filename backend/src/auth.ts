import { sign, verify } from "jsonwebtoken";
import { User } from "./entities/User";
import env from "./env";
import type { GraphQLContext } from "./types";

export interface JWTPayload {
  userId: number;
}

export const createJWT = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
  };

  return sign(payload, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    const payload = verify(token, env.JWT_SECRET) as JWTPayload;
    return payload;
  } catch (_error: any) {
    return null;
  }
};

export const startSession = async (context: GraphQLContext, user: User) => {
  const token = createJWT(user);

  context.res.cookie("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export const getUserFromToken = async (token: string): Promise<User | null> => {
  const payload = verifyJWT(token);
  if (!payload) return null;

  const user = await User.findOne({ where: { id: payload.userId } });
  return user || null;
};
