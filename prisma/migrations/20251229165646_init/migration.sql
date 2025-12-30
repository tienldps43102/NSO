/*
  Warnings:

  - Added the required column `display_price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "display_price" DECIMAL(12,2) NOT NULL;
