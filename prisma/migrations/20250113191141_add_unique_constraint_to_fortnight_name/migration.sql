/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Fortnigh` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Fortnigh_name_key" ON "Fortnigh"("name");
