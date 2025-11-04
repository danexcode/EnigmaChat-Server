import { forbidden } from "@hapi/boom";
import { NextFunction, Request, Response } from "express";

import { User } from "@/types";
import { prisma } from "@/server";

// Validate member role
export const validateMemberRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const userId = user.id;
    const chatId = req.params.id;

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: chatId,
          userId: userId,
        },
      },
    });

    if (!member || !roles.includes(member.role)) {
      next(forbidden('You are not authorized to perform this action'))
    }

    next();
  }
}

export const validateMessageOwner = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const userId = user.id;
    const messageId = req.params.messageId;

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message || message.senderId !== userId) {
      next(forbidden('You are not authorized to perform this action'))
    }

    next();
  }
}

export const validateUserRoleOrMessageOwner = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const userId = user.id;
    const chatId = req.params.id;
    const messageId = req.params.messageId;

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
      next(forbidden('You are not authorized to perform this action'))
    }

    // If the user is not an admin member and the message does not belong to the user
    if ((member && !roles.includes(member.role)) && (message && message.senderId !== userId)) {
      next(forbidden('You are not authorized to perform this action'))
    }

    next();
  }
}
