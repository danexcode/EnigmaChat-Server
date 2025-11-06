import jwt from "jsonwebtoken";
import { compare } from "bcryptjs";
import { toDataURL } from "qrcode";
import { GeneratedSecret, generateSecret, totp } from "speakeasy";
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

  async generate2fa(userId: string) {
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
  };

  async confirm2fa(userId: string, token: string, secret: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw notFound('User not found');
    }

    // Verificamos el token con el secreto proporcionado
    const isVerified = totp.verify({
      secret: secret,
      encoding: 'base32',
      token,
    });

    if (!isVerified) {
      throw unauthorized('Invalid 2FA token');
    }

    // Si la verificación es exitosa, guardamos el secreto en la base de datos
    // y activamos 2FA para el usuario
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret,
        is2faEnabled: true
      },
    });

    return { message: '2FA verified and activated successfully' };
  }

  async disable2fa(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw notFound('User not found');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        is2faEnabled: false
      },
    });

    return { message: '2FA disabled successfully' };
  }
}
