
import { prisma } from '@/server';
import type { CreateMessageDto } from '@/types/dtos';
import { generateShortId } from '@/utils/idGenerator';

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

  async findMessagesByChatId(chatId: string) {
    const messages = prisma.message.findMany({
      where: { chatId },
      orderBy: {
        sentAt: 'asc',
      },
    });
    return messages;
  }
}
