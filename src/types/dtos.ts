import type { ChatType, GroupRole } from '@prisma/client';

// ===================================
//          USER DTOS
// ===================================

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  passwordHash?: string;
  imageUrl?: string;
  is2faEnabled?: boolean;
  twoFactorSecret?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

// ===================================
//          CHAT DTOS
// ===================================

export interface CreateChatDto {
  type: ChatType;
  creatorId?: string;
  name?: string;
  description?: string;
  // When is a individual chat, this array will have two users
  participants: string[];
}

export interface UpdateChatDto {
  enigmaMasterKey?: string;
}

export interface UpdateGroupChatDto {
  name?: string;
  description?: string;
}

export interface AddGroupMemberDto {
  groupId: string;
  userId: string;
  role: GroupRole;
}

// ===================================
//          MESSAGE DTOS
// ===================================

export interface CreateMessageDto {
  chatId: string;
  senderId: string;
  ciphertext: string;
}
