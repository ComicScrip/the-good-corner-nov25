import { hash } from "argon2";
import type { Page } from "@playwright/test";
import { createJWT, cookieName } from "../../backend/src/auth";
import { User, Role, UserRole } from "../../backend/src/entities/User";

type LoginUserInput = {
  email: string;
  password: string;
  role?: Role;
};

export async function loginAs(page: Page, { email, password, role }: LoginUserInput) {
  const user = await User.create({
    email,
    role: role ?? UserRole.Visitor,
    hashedPassword: await hash(password),
  }).save();

  const token = await createJWT(user);
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const cookieDomain = new URL(baseUrl).hostname;

  await page.context().addCookies([
    {
      name: cookieName,
      value: token,
      domain: cookieDomain,
      path: "/",
    },
  ]);

  return user;
}
