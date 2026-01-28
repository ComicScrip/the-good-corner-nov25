import { User, UserRole } from "../../src/entities/User";

export async function createAdmin() {
  return User.create({
    email: "admin@app.com",
    hashedPassword: "userPass123!",
    role: UserRole.Admin,
  }).save();
}