import { conflict, notFound } from '@hapi/boom';
import { prisma } from '@/server';
import { hash } from 'bcryptjs';

import type { CreateUserDto, UpdateUserDto } from '@/types/dtos';
import { generateShortId } from '@/utils/idGenerator';

export class UsersService {
  constructor() {}

  async create(data: CreateUserDto) {
    const existsUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
    if (existsUser) {
      throw conflict('User already exists');
    }

    const hashedPassword = await hash(data.passwordHash, 10);

    const newUser = await prisma.user.create({
      data: {
        id: generateShortId(),
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
      },
    });
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findById(id: string) {
    const user = prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
      },
    });
    if (!user) {
      throw notFound('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
      },
    });
    if (!user) {
      throw notFound('User not found');
    }
    return user;
  }

  async findByUsername(username: string) {
    const user = prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
      },
    });
    if (!user) {
      throw notFound('User not found');
    }
    return user;
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string) {
    const userDeleted = await prisma.user.delete({
      where: { id },
    });
    const { passwordHash, ...userWithoutPassword } = userDeleted;
    return userWithoutPassword;
  }
}
