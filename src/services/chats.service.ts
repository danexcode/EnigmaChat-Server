import { PrismaClient, ChatType } from '@prisma/client';
import { generateShortId } from '@/utils/idGenerator';
import type { CreateChatDto } from '@/types/dtos';

const prisma = new PrismaClient();

export class ChatsService {
  constructor() {}

  async create(data: CreateChatDto) {
    const chatId = generateShortId();
    const { type, creatorId, name, description, participants } = data;

    return prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          id: chatId,
          chatType: type,
          enigmaMasterKey: 'some-key', // Placeholder
        },
      });

      if (type === 'GROUP' && creatorId && name && participants) {
        await tx.groupChat.create({
          data: {
            chatId: chatId,
            creatorId: creatorId,
            groupName: name,
            groupDescription: description,
          },
        });

        // Add members to the group
        for (const userId of participants) {
          await tx.groupMember.create({
            data: {
              groupId: chatId,
              userId: userId,
              role: userId === creatorId ? 'ADMIN' : 'MEMBER',
            },
          });
        }
      } else if (type === 'INDIVIDUAL' && participants && participants.length === 2) {
        await tx.individualChat.create({
          data: {
            chatId: chatId,
            userAId: participants[0],
            userBId: participants[1],
          },
        });
      }

      return chat;
    });
  }

  async findById() {}

  async update() {}

  async delete() {}
}
