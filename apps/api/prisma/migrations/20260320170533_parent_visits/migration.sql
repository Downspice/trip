-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('STUDENT_TRIP', 'PARENT_VISIT');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_studentId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "parentVisitId" TEXT,
ADD COLUMN     "type" "BookingType" NOT NULL DEFAULT 'STUDENT_TRIP',
ALTER COLUMN "studentId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentVisit" (
    "id" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentContact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "School"("name");

-- AddForeignKey
ALTER TABLE "ParentVisit" ADD CONSTRAINT "ParentVisit_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_parentVisitId_fkey" FOREIGN KEY ("parentVisitId") REFERENCES "ParentVisit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
