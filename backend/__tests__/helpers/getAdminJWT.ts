import jwt from "jsonwebtoken";
import { User, UserRole } from "../../src/entities/User";
import env from "../../src/env";

export default async function () {
  const admin = new User();
  Object.assign(admin, {
    email: "admin@app.com",
    hashedPassword: "4dminAdmin@!",
    role: UserRole.Admin,
  });
  await admin.save();
  const JWT = jwt.sign({ userId: admin.id }, env.JWT_SECRET);

  return { JWT, admin };
}
