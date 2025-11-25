import { notFound } from '@hapi/boom';

import { prisma } from '@/server';
import { generateShortId } from '@/utils/idGenerator';
import type { CreateGroupChatDto, CreateIndividualChatDto, CreateMessageDto, UpdateChatDto, UpdateGroupChatDto } from '@/types/dtos';

export class ChatsService {
  constructor() {}

  // Create chat
  async createGroupChat(data: CreateGroupChatDto, creatorId: string) {
    const chatId = generateShortId();

    return prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          id: chatId,
          chatType: 'GROUP',
          enigmaMasterKey: data.enigmaMasterKey,
        },
      });

      await tx.groupChat.create({
        data: {
          chatId: chatId,
          creatorId: creatorId,
          groupName: data.name,
          groupDescription: data.description,
          isOpenChat: data.isOpenChat,
          isEditable: data.isEditable,
          canInvite: data.canInvite,
        },
      });

      // Add members to the group
      for (const username of data.participants) {
        const user = await tx.user.findUnique({
          where: { username },
        });
        if (!user) {
          throw notFound('User not found');
        }
        await tx.groupMember.create({
          data: {
            groupId: chatId,
            userId: user.id,
            role: user.id === creatorId ? 'ADMIN' : 'MEMBER',
          },
        });
      }

      return chat;
    });
  };

  async createIndividualChat(data: CreateIndividualChatDto, creatorId: string) {
    const chatId = generateShortId();

    return prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          id: chatId,
          chatType: 'INDIVIDUAL',
          enigmaMasterKey: data.enigmaMasterKey,
        },
      });

      await tx.individualChat.create({
        data: {
          chatId: chatId,
          userAId: creatorId,
          userBId: data.participants[0],
        },
      });

      return chat;
    });
  };

  // Send message
  async sendMessage(chatId: string, ciphertext: string, senderId: string) {
    const message = await prisma.message.create({
      data: {
        id: generateShortId(),
        chatId: chatId,
        senderId: senderId,
        ciphertext: ciphertext,
      },
    });
    return message;
  }

  // Find chats by user id
  async findByUserId(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { individualChat: { userAId: userId } },
          { individualChat: { userBId: userId } },
          {
            groupChat: {
              members: {
                some: {
                  userId: userId,
                }
              }
            }
          }
        ]
      },
      include: {
        individualChat: true,
        groupChat: {
          include: {
            creator: false,
            /* members: {
              include: {
                user: true,
              },
            }, */
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return chats;
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

  // Find chat by id
  async findById(id: string) {
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        individualChat: {
          include: {
            userA: true,
            userB: true,
          },
        },
        groupChat: {
          include: {
            creator: true,
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
    if (!chat) {
      throw notFound('Chat not found');
    }
    return chat;
  }

  // Find messages by chat id
  async findMessagesByChatId(chatId: string) {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: {
        sentAt: 'asc',
      },
      include: {
        sender: true,
      }
    });
    return messages;
  }

  // Update chat
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

  // Update group chat
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

  // Delete chat
  async delete(id: string) {
    const deletedChat = await prisma.chat.delete({
      where: { id },
    });
    return deletedChat;
  }

  // Delete message
  async deleteMessage(messageId: string) {
    const deletedMessage = await prisma.message.delete({
      where: { id: messageId },
    });
    return deletedMessage;
  }

  async rotateEnigmaMasterKey(chatId: string, key: string) {
    //TODO
  }
}
