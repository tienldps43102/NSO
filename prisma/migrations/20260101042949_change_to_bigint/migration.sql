/*
  Warnings:

  - You are about to alter the column `unit_price` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `line_total` on the `order_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `subtotal_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `shipping_fee` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `discount_total` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `total_amount` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `price` on the `product_variants` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.
  - You are about to alter the column `display_price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "order_items" ALTER COLUMN "unit_price" SET DATA TYPE BIGINT,
ALTER COLUMN "line_total" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "subtotal_amount" SET DATA TYPE BIGINT,
ALTER COLUMN "shipping_fee" SET DEFAULT 0,
ALTER COLUMN "shipping_fee" SET DATA TYPE BIGINT,
ALTER COLUMN "discount_total" SET DEFAULT 0,
ALTER COLUMN "discount_total" SET DATA TYPE BIGINT,
ALTER COLUMN "total_amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "product_variants" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "display_price" SET DATA TYPE BIGINT;
