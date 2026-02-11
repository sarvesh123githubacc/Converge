/*
  Warnings:

  - You are about to drop the column `userId` on the `PrivateAreas` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `PrivateAreas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PrivateAreas" DROP CONSTRAINT "PrivateAreas_userId_fkey";

-- AlterTable
ALTER TABLE "public"."PrivateAreas" DROP COLUMN "userId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PrivateAreas" ADD CONSTRAINT "PrivateAreas_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
