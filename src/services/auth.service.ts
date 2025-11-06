import jwt from "jsonwebtoken";
import { compare } from "bcryptjs";
import { toDataURL } from "qrcode";
import { GeneratedSecret, generateSecret } from "speakeasy";
import { badImplementation, notFound, unauthorized } from "@hapi/boom";

import { config } from "@/config";
import { prisma } from "@/server";
import { CreateUserDto } from "@/types/dtos";
import { UsersService } from '@/services/users.service'

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
      throw notFound('Invalid email or password');
    }
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw unauthorized('Invalid email or password');
    }
    return user;
  }

  async signToken(userId: string) {
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

  async generate2fa() {
    const secret: GeneratedSecret = generateSecret({
      name: "EnigmaChat",
    });

    if (!secret.otpauth_url) {
      throw badImplementation('Error generating QR code');
    }
    const data = await toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: data,
    }
  }
}
