import { hash } from "argon2";
import { randomUUID } from "crypto";
import { User, UserRole } from "../../src/entities/User";

export async function createVisitor() {
  return User.create({
    id: randomUUID(),
    email: "visitor@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Visitor,
  }).save();
}
