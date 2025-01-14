/*
  Warnings:

  - A unique constraint covering the columns `[userId,dayId,turn]` on the table `Shift` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Shift_userId_dayId_turn_key" ON "Shift"("userId", "dayId", "turn");
