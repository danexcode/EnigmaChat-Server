import jwt from "jsonwebtoken";
import { compare } from "bcryptjs";
import { toDataURL } from "qrcode";
import { GeneratedSecret, generateSecret, totp } from "speakeasy";
import { badImplementation, notFound, unauthorized } from "@hapi/boom";

import { config } from "@/config";
import { prisma } from "@/server";
import { CreateUserDto } from "@/types/dtos";
import { UsersService } from '@/services/users.service';

type JwtPayload = {
  sub: string;
  purpose: 'auth' | '2fa' | 'reset-password'; // Tipos de propósito permitidos
  iat: number;
  exp: number;
};

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

  async signAuthToken(userId: string) {
    const payload: JwtPayload = {
      sub: userId,
      purpose: 'auth',
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000,
    }
    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: '24h'
    });
  }

  async sign2faToken(userId: string) {
    const payload: JwtPayload = {
      sub: userId,
      purpose: '2fa',
      iat: Date.now(),
      exp: Date.now() + 5 * 60 * 1000,
    }
    return jwt.sign(payload, config.auth.jwt2faSecret, {
      expiresIn: '5m'
    });
  }

  async generate2fa() {
    const secret: GeneratedSecret = generateSecret({
      name: "EnigmaChat",
    });

    if (!secret.otpauth_url) {
      throw badImplementation('Error generating authentication code');
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
      throw unauthorized('Invalid authentication token');
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

  async verify2fa(userId: string, token: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw notFound('User not found');
    }

    if (!user.twoFactorSecret) {
      throw unauthorized('2FA not enabled');
    }

    const isVerified = totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!isVerified) {
      throw unauthorized('Invalid 2FA token');
    }

    return { message: '2FA verified successfully' };
  }
}
