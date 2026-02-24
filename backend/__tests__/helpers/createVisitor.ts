import { randomUUID } from "crypto";
import { User, UserRole } from "../../src/entities/User";

export async function createVisitor() {
  return User.create({
    id: randomUUID(),
    email: "visitor@app.com",
    emailVerified: true,
    role: UserRole.Visitor,
  }).save();
}
