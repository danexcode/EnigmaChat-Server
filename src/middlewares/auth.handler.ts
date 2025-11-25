import { forbidden } from "@hapi/boom";
import { NextFunction, Request, Response } from "express";

import { JwtPayload } from "@/types";
import { prisma } from "@/server";

//TODO: Refactor this middleware to extract logic

// Validate member role
export const validateMemberRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user?.sub;
    const chatId = req.params.id;

    if (!userId) {
      return next(forbidden('User not authenticated'));
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: chatId,
          userId: userId,
        },
      },
    });

    if (!member || !roles.includes(member.role)) {
      return next(forbidden('You are not authorized to perform this action'));
    }

    next();
  }
}

// Validate message owner
export const validateMessageOwner = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user?.sub;
    const messageId = req.params.messageId;

    if (!userId) {
      return next(forbidden('User not authenticated'));
    }

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message || message.senderId !== userId) {
      return next(forbidden('You are not authorized to perform this action'));
    }

    next();
  }
}

// Validate user role or message owner
export const authorizeMessageDeletion = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const userId = user?.sub;
    const chatId = req.params.id;
    const messageId = req.params.messageId;

    if (!userId) {
      return next(forbidden('User not authenticated'));
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: chatId,
          userId: userId,
        },
      },
    });

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    // If the user is not a member or the message does not exist
    if (!member || !message) {
      return next(forbidden('You are not authorized to perform this action'));
    }

    const isAdmin = member && roles.includes(member.role);
    const isSelf = message && message.senderId === userId;

    // If the user is not an admin member and the message does not belong to the user
    if (!isAdmin && !isSelf) {
      return next(forbidden('You are not authorized to perform this action'));
    }

    next();
  }
}

// Validate member role or group participant
export const authorizeMemberRemoval = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userAuthenticated = req.user as JwtPayload;
    const userAuthenticatedId = userAuthenticated?.sub;
    const chatId = req.params.id;
    const userToDeleteId = req.params.userId;

    if (!userAuthenticatedId) {
      return next(forbidden('User not authenticated'));
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: chatId,
          userId: userAuthenticatedId,
        },
      },
    });

    const isAdmin = member && roles.includes(member.role);
    const isSelf = userAuthenticatedId === userToDeleteId;

    // If the user is not an admin member and the user is not the user to delete
    if (!isAdmin && !isSelf) {
      return next(forbidden('You are not authorized to perform this action'));
    }

    next();
  }
}
