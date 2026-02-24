import { randomUUID } from "crypto";
import { User, UserRole } from "../../src/entities/User";

export async function createAdmin() {
  return User.create({
    id: randomUUID(),
    email: "admin@app.com",
    emailVerified: true,
    role: UserRole.Admin,
  }).save();
}
