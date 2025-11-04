import { Router } from "express";
import { authenticate } from "passport";

import { GroupsService } from "@/services/groups.service";
import { validateMemberRole, authorizeMemberRemoval } from "@/middlewares/auth.handler";
import { validateDataHandler } from '@/middlewares/validateData.handler';
import { addMemberToGroupSchema, removeMemberFromGroupSchema } from '@/schemas/groups.schema';

const groupsRouter = Router();
const groupsService = new GroupsService();

groupsRouter.get('/:id/members',
  authenticate('jwt', { session: false }),
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

groupsRouter.post('/:id/members',
  authenticate('jwt', { session: false }),
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

groupsRouter.delete('/:id/members/:userId',
  authenticate('jwt', { session: false }),
  validateDataHandler(removeMemberFromGroupSchema, 'params'),
  authorizeMemberRemoval('ADMIN'),
  async (req, res, next) => {
    try {
      const groupId = req.params.id;
      const userId = req.params.userId;
      const member = await groupsService.removeMemberFromGroup(groupId, userId);
      res.json(member);
    } catch (error) {
      next(error);
    }
  }
);
