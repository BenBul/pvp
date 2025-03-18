/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `created_at` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "created_at" TIMESTAMP NOT NULL,
ADD COLUMN     "role" VARCHAR NOT NULL,
ADD COLUMN     "username" VARCHAR NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR;

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "title" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" VARCHAR NOT NULL,
    "qr_code" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT,
    "answer_text" TEXT NOT NULL,
    "rating" INTEGER,
    "created_at" TIMESTAMP NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follows" (
    "following_user_id" TEXT NOT NULL,
    "followed_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("following_user_id","followed_user_id")
);

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_following_user_id_fkey" FOREIGN KEY ("following_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followed_user_id_fkey" FOREIGN KEY ("followed_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
