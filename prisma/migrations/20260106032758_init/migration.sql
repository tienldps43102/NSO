-- AlterTable
ALTER TABLE "attributes" ALTER COLUMN "value" SET DATA TYPE VARCHAR(400);

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "description" TEXT;
