/*
  Warnings:

  - A unique constraint covering the columns `[isbn10]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isbn10" VARCHAR(20),
ALTER COLUMN "isbn13" SET DATA TYPE VARCHAR(20);

-- CreateIndex
CREATE UNIQUE INDEX "products_isbn10_key" ON "products"("isbn10");
