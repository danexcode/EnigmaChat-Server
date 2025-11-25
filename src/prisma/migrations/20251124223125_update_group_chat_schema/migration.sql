-- AlterTable
ALTER TABLE "group_chats" ADD COLUMN     "can_invite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_editable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_open_chat" BOOLEAN NOT NULL DEFAULT true;
