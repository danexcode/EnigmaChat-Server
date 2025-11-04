import { notFound } from '@hapi/boom';

import { prisma } from '@/server';
import { generateShortId } from '@/utils/idGenerator';
import type { CreateChatDto, UpdateChatDto, UpdateGroupChatDto } from '@/types/dtos';

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

  async findById(id: string) {
    const chat = await prisma.chat.findUnique({
      where: { id },
    });
    if (!chat) {
      throw notFound('Chat not found');
    }
    return chat;
  }

  async updateChat(id: string, data: UpdateChatDto) {
    const chat = await prisma.chat.update({
      where: { id },
      data: {
        enigmaMasterKey: data.enigmaMasterKey,
        updatedAt: new Date(),
      }
    });
    return chat;
  }

  async updateGroupChat(id: string, data: UpdateGroupChatDto) {
    const chat = await prisma.groupChat.update({
      where: { chatId: id },
      data: {
        groupName: data.name,
        groupDescription: data.description,
      }
    });
    await prisma.chat.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      }
    });
    return chat;
  }

  async delete(id: string) {
    const deletedChat = await prisma.chat.delete({
      where: { id },
    });
    return deletedChat;
  }
}
