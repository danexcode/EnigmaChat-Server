-- DropForeignKey
ALTER TABLE "public"."group_chats" DROP CONSTRAINT "group_chats_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."individual_chats" DROP CONSTRAINT "individual_chats_chat_id_fkey";

-- AddForeignKey
ALTER TABLE "individual_chats" ADD CONSTRAINT "individual_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_chats" ADD CONSTRAINT "group_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;
