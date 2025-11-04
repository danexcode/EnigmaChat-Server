import { prisma } from "@/server";
import { notFound, unauthorized } from "@hapi/boom";
import { compare } from "bcryptjs";

export class AuthService {
  constructor() {}

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw notFound('User not found');
    }
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw unauthorized('Invalid password');
    }
    return user;
  }

  async logout() {}

  async refresh() {}
}
