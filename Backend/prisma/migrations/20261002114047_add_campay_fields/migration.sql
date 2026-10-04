/*
  Warnings:

  - You are about to drop the column `stripePaymentIntentId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripeTransferId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `stripeAccountId` on the `NannyProfile` table. All the data in the column will be lost.
  - You are about to drop the column `stripeOnboarded` on the `NannyProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentReference]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Booking_stripePaymentIntentId_key";

-- DropIndex
DROP INDEX "NannyProfile_stripeAccountId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "stripeTransferId",
ADD COLUMN     "paymentPhone" TEXT,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'PENDING',
ADD COLUMN     "paymentUrl" TEXT;

-- AlterTable
ALTER TABLE "NannyProfile" DROP COLUMN "stripeAccountId",
DROP COLUMN "stripeOnboarded";

-- CreateIndex
CREATE UNIQUE INDEX "Booking_paymentReference_key" ON "Booking"("paymentReference");
