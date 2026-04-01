-- CreateTable
CREATE TABLE "VisitPrice" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "pickupId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "VisitPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisitPrice_schoolId_pickupId_key" ON "VisitPrice"("schoolId", "pickupId");

-- AddForeignKey
ALTER TABLE "VisitPrice" ADD CONSTRAINT "VisitPrice_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitPrice" ADD CONSTRAINT "VisitPrice_pickupId_fkey" FOREIGN KEY ("pickupId") REFERENCES "Pickup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
