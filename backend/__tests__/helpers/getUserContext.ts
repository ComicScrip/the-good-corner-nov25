import jwt from "jsonwebtoken";
import { User, UserRole } from "../../src/entities/User";
import env from "../../src/env";

export default async function () {
  const user = new User();
  Object.assign(user, {
    email: "user@app.com",
    hashedPassword: "userPass123!",
    role: UserRole.Visitor,
  });
  await user.save();
  const JWT = jwt.sign({ userId: user.id }, env.JWT_SECRET);

  return { req: { headers: { authorization: `Bearer ${JWT}` } } };
}
