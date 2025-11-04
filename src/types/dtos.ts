import type { ChatType } from '@prisma/client';

// ===================================
//          USER DTOS
// ===================================

export interface CreateUserDto {
  username: string;
  email: string;
  passwordHash: string;
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
  participants: string[];
}

// ===================================
//          MESSAGE DTOS
// ===================================

export interface CreateMessageDto {
  chatId: string;
  senderId: string;
  ciphertext: string;
}
