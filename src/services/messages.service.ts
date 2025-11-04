import { PrismaClient } from '@prisma/client';
import { generateShortId } from '@/utils/idGenerator';
import type { CreateMessageDto } from '@/types/dtos';

const prisma = new PrismaClient();

export class MessagesService {
  constructor() {}

  async create(data: CreateMessageDto) {
    const newMessage = await prisma.message.create({
      data: {
        id: generateShortId(),
        ...data,
      },
    });
    return newMessage;
  }

  async findByChatId(chatId: string) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: {
        sentAt: 'asc',
      },
    });
  }
}
