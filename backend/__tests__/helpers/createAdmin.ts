import { hash } from "argon2";
import { User, UserRole } from "../../src/entities/User";

export async function createAdmin() {
  return User.create({
    email: "admin@app.com",
    hashedPassword: await hash("SuperP@ssW0rd!"),
    role: UserRole.Admin,
  }).save();
}
