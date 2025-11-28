import { Router } from "express";
import passport from "passport";

import { GroupsService } from "@/services/groups.service";
import { validateMemberRole, authorizeMemberRemoval } from "@/middlewares/auth.handler";
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { addMemberToGroupSchema, openChatSchema, removeMemberFromGroupSchema } from '@/schemas/groups.schema';
import { AuditService } from "@/services/audit.service";
import { JwtPayload } from "@/types";
import { getIp } from "@/utils/audit";

export const groupsRouter = Router();
const groupsService = new GroupsService();

// Get group members
groupsRouter.get('/:id/members',
  passport.authenticate('jwt', { session: false }),
  validateMemberRole('ADMIN', 'MEMBER'),
  async (req, res, next) => {
    try {
      const groupId = req.params.id;
      const members = await groupsService.findMembersByGroupId(groupId);
      res.json(members);
    } catch (error) {
      next(error);
    }
  }
);

// Add member to group
// Solo los administradores pueden agregar miembros
groupsRouter.post('/:id/members',
  passport.authenticate('jwt', { session: false }),
  validateMemberRole('ADMIN'),
  validateDataHandler(addMemberToGroupSchema, 'body'),
  async (req, res, next) => {
    try {
      const groupId = req.params.id;
      const { userId, role } = req.body;
      const member = await groupsService.addMemberToGroup({ groupId, userId, role });
      res.json(member);
    } catch (error) {
      next(error);
    }
  }
);

// Quitar miembro del grupo
// Solo los administradores pueden remover miembros
groupsRouter.delete('/:id/members/:userId',
  passport.authenticate('jwt', { session: false }),
  validateDataHandler(removeMemberFromGroupSchema, 'params'),
  authorizeMemberRemoval('ADMIN'),
  async (req, res, next) => {
    try {
      const groupId = req.params.id;
      const userId = req.params.userId;
      const member = await groupsService.removeMemberFromGroup(groupId, userId);
      res.status(204).json(member);
    } catch (error) {
      next(error);
    }
  }
);

// Cambiar estado del chat
// Solo los administradores pueden abrir o cerrar el chat
groupsRouter.put('/:id',
  passport.authenticate('jwt', { session: false }),
  validateMemberRole('ADMIN'),
  validateDataHandler(openChatSchema, 'body'),
  async (req, res, next) => {
    try {
      const user = req.user as JwtPayload
      const groupId = req.params.id;
      const { isOpenChat } = req.body;
      const group = await groupsService.updateGroup(groupId, { isOpenChat });
      // Registra el log de auditoría
      AuditService.log({
        userId: user.sub,
        action: 'CHANGE_OPEN_CHAT',
        entity: 'group',
        entityId: groupId,
        details: { isOpenChat },
        ipAddress: getIp(req),
      });
      res.json(group);
    } catch (error) {
      next(error);
    }
  }
);
