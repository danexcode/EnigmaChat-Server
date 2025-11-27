import type { ChatType, GroupRole } from '@prisma/client';

// ===================================
//          USER DTOS
// ===================================

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  imageUrl: string | null;
  is2faEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface CreateGroupChatDto {
  name: string;
  description?: string;
  participants: string[];
  isOpenChat?: boolean;
  isEditable?: boolean;
  canInvite?: boolean;
  enigmaMasterKey: string;
}

export interface CreateIndividualChatDto {
  participants: string[];
  enigmaMasterKey: string;
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

// ===================================
//          AUDIT DTOS
// ===================================

export interface CreateAuditLogDto {
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details?: any;
  ipAddress?: string;
}
