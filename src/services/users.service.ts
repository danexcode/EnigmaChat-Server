import { conflict, notFound } from '@hapi/boom';
import { prisma } from '@/server';
import { hash } from 'bcryptjs';

import type { CreateUserDto, UpdateUserDto, UserResponseDto } from '@/types/dtos';
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

    const hashedPassword = await hash(data.password, 10);

    const newUser: UserResponseDto = await prisma.user.create({
      data: {
        id: generateShortId(),
        username: data.username,
        email: data.email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return newUser;
  }

  async findById(id: string) {
    const user: UserResponseDto | null = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw notFound('User not found');
    }
    return user;
  }

  async findByEmail(email: string) {
    const user: UserResponseDto | null = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw notFound('User not found');
    }
    return user;
  }

  async findByUsername(username: string) {
    const user: UserResponseDto | null = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw notFound('User not found');
    }
    return user;
  }

  async findSomeUsersByUsername(username: string) {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        imageUrl: true,
      },
      take: 5,
    });
    return users;
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findById(id);
    if (data.passwordHash) {
      data.passwordHash = await hash(data.passwordHash, 10);
    }
    const user: UserResponseDto = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        is2faEnabled: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async delete(id: string) {
    await this.findById(id);
    const userDeleted = await prisma.user.delete({
      where: { id },
      select: {
        id: true,
      }
    });
    return userDeleted;
  }
}
