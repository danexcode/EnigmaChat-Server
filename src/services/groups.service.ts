import { prisma } from "@/server";
import { AddGroupMemberDto } from "@/types/dtos";
import { ChatsService } from "@/services/chats.service";

export class GroupsService {
  constructor() {}

  async findMembersByGroupId(groupId: string) {
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
      },
    });
    return members;
  };

  async addMemberToGroup(data: AddGroupMemberDto) {
    const member = await prisma.groupMember.create({
      data: {
        groupId: data.groupId,
        userId: data.userId,
        role: data.role,
      },
    });
    return member;
  };

  async removeMemberFromGroup(groupId: string, userId: string) {
    const member = await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    //await ChatsService.rotateEnigmaMasterKey(groupId);

    return member;
  };
}
