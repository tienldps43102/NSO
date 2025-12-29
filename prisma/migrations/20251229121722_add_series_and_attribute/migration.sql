-- CreateTable
CREATE TABLE "attributes" (
    "id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "value" VARCHAR(200) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
