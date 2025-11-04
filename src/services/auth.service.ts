import { prisma } from "@/server";
import { notFound, unauthorized } from "@hapi/boom";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "@/config";
import { UsersService } from '@/services/users.service'
import { CreateUserDto } from "@/types/dtos";

const userService = new UsersService();

export class AuthService {
  constructor() {}

  async register(data: CreateUserDto) {
    const newUser = await userService.create(data);
    return newUser;
  }

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

    const token = this.generateToken(user.id);
    return token;
  }

  async generateToken(userId: string) {
    const payload = {
      sub: userId,
      iat: Date.now(),
      exp: Date.now() + 60 * 60 * 1000,
    }
    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: '24h'
    });
  }

  async logout() {}

  async refresh() {}
}
