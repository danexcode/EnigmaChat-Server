import type { ChatType, GroupRole } from '@prisma/client';

// ===================================
//          MODEL TYPES
// ===================================

export interface User {
  id: string;
  username: string;
  email: string;
  imageUrl?: string;
  passwordHash?: string;
  twoFactorSecret?: string | null;
  is2faEnabled: boolean;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

export interface Chat {
  id: string;
  chatType: ChatType;
  enigmaMasterKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualChat {
  chatId: string;
  userAId: string;
  userBId: string;
}

export interface GroupChat {
  chatId: string;
  creatorId: string;
  groupName: string;
  groupDescription?: string | null;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  role: GroupRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  ciphertext: string;
  sentAt: Date;
  updatedAt: Date;
}

// ===================================
//          UTILS TYPES
// ===================================

export interface JwtPayload {
  sub: string;
  purpose: 'auth' | '2fa' | 'reset-password';
  iat: number;
  exp: number;
};
