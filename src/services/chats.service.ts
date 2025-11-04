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

  async findByUserId(userId: string) {
    const groupMembers = await prisma.groupMember.findMany({
      where: { userId },
    });
    const individualChats = await prisma.individualChat.findMany({
      where: {
        OR: [
          { userAId: userId },
          { userBId: userId },
        ],
      },
    })
    const chats = await prisma.chat.findMany({
      where: {
        id: {
          in: [
            ...groupMembers.map((member) => member.groupId),
            ...individualChats.map((chat) => chat.chatId)
          ],
        }
      }
    });

    const groupChats = await prisma.groupChat.findMany({
      where: {
        chatId: {
          in: groupMembers.map((member) => member.groupId),
        }
      }
    })

    let absoluteChats = [];
    for (const chat of chats) {
      if (chat.chatType === 'GROUP') {
        absoluteChats.push({
          ...chat,
          groupChat: groupChats.find((groupChat) => groupChat.chatId === chat.id),
          groupMembers: groupMembers.filter((member) => member.groupId === chat.id),
        });
      } else {
        absoluteChats.push({
          ...chat,
          individualChat: individualChats.find((individualChat) => individualChat.chatId === chat.id),
        });
      }
    }

    return absoluteChats;

    /* const allChats = await prisma.$queryRaw`
      SELECT
        chats.id,
        chats.chat_type,
        chats.created_at,
        chats.updated_at,
        chats.enigma_master_key,
        group_chat.group_name,
        group_chat.group_description,
        group_member.role,
        individual_chat.user_a_id,
        individual_chat.user_b_id,
      FROM chats
      JOIN group_chat ON chats.id = group_chat.chat_id
      JOIN group_member ON chats.id = group_member.group_id
      JOIN individual_chat ON chats.id = individual_chat.chat_id
      WHERE
        individual_chat.user_a_id = ${userId}
        OR individual_chat.user_b_id = ${userId}
        OR group_member.user_id = ${userId}
      ORDER BY chats.updated_at DESC;
    `; */
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
