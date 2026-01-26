import { cookieName, createJWT } from "../../src/auth";
import type { User } from "../../src/entities/User";

export default async function getUserContext(user: User) {
  const JWT = await createJWT(user);
  return { req: { cookies: { [cookieName]: JWT } } };
}
