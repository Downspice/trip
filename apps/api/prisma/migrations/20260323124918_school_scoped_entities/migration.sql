/*
  Warnings:

  - A unique constraint covering the columns `[name,schoolId]` on the table `House` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,schoolId]` on the table `Pickup` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,schoolId]` on the table `Programme` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolId` to the `House` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Pickup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Programme` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "House_name_key";

-- DropIndex
DROP INDEX "Pickup_name_key";

-- DropIndex
DROP INDEX "Programme_name_key";

-- AlterTable
ALTER TABLE "House" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pickup" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Programme" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "House_name_schoolId_key" ON "House"("name", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Pickup_name_schoolId_key" ON "Pickup"("name", "schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_name_schoolId_key" ON "Programme"("name", "schoolId");

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pickup" ADD CONSTRAINT "Pickup_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
