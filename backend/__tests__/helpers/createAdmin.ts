import { hash } from "argon2";
import { randomUUID } from "crypto";
import { User, UserRole } from "../../src/entities/User";

export async function createAdmin() {
  return User.create({
    id: randomUUID(),
    email: "admin@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Admin,
  }).save();
}
