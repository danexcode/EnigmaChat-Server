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
