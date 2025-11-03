/*
  Warnings:

  - The primary key for the `group_members` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `group_id` on the `group_members` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(8)`.
  - You are about to alter the column `user_id` on the `group_members` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Char(8)`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `user_id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Char(8)`.
  - You are about to drop the `direct_chats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `direct_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `group_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groups` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "chat_type" AS ENUM ('INDIVIDUAL', 'GROUP');

-- DropForeignKey
ALTER TABLE "public"."direct_chats" DROP CONSTRAINT "direct_chats_user_a_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."direct_chats" DROP CONSTRAINT "direct_chats_user_b_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."direct_messages" DROP CONSTRAINT "direct_messages_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."direct_messages" DROP CONSTRAINT "direct_messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_members" DROP CONSTRAINT "group_members_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_members" DROP CONSTRAINT "group_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_messages" DROP CONSTRAINT "group_messages_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."group_messages" DROP CONSTRAINT "group_messages_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."groups" DROP CONSTRAINT "groups_creator_id_fkey";

-- AlterTable
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "group_id" SET DATA TYPE CHAR(8),
ALTER COLUMN "user_id" SET DATA TYPE CHAR(8),
ALTER COLUMN "role" DROP DEFAULT,
ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "user_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "user_id" DROP DEFAULT,
ALTER COLUMN "user_id" SET DATA TYPE CHAR(8),
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");
DROP SEQUENCE "users_user_id_seq";

-- DropTable
DROP TABLE "public"."direct_chats";

-- DropTable
DROP TABLE "public"."direct_messages";

-- DropTable
DROP TABLE "public"."group_messages";

-- DropTable
DROP TABLE "public"."groups";

-- CreateTable
CREATE TABLE "chats" (
    "chat_id" CHAR(8) NOT NULL,
    "chat_type" "chat_type" NOT NULL,
    "enigma_master_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "individual_chats" (
    "chat_id" TEXT NOT NULL,
    "user_a_id" CHAR(8) NOT NULL,
    "user_b_id" CHAR(8) NOT NULL,

    CONSTRAINT "individual_chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "group_chats" (
    "chat_id" TEXT NOT NULL,
    "creator_id" CHAR(8) NOT NULL,
    "group_name" VARCHAR(100) NOT NULL,
    "group_description" TEXT,

    CONSTRAINT "group_chats_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "message_id" CHAR(8) NOT NULL,
    "chat_id" CHAR(8) NOT NULL,
    "sender_id" CHAR(8) NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chats_chat_id_key" ON "chats"("chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "individual_chats_user_a_id_user_b_id_key" ON "individual_chats"("user_a_id", "user_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_message_id_key" ON "messages"("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_key" ON "users"("user_id");

-- AddForeignKey
ALTER TABLE "individual_chats" ADD CONSTRAINT "individual_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_chats" ADD CONSTRAINT "individual_chats_user_a_id_fkey" FOREIGN KEY ("user_a_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "individual_chats" ADD CONSTRAINT "individual_chats_user_b_id_fkey" FOREIGN KEY ("user_b_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_chats" ADD CONSTRAINT "group_chats_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_chats" ADD CONSTRAINT "group_chats_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group_chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
