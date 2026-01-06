import { nowVN } from "@/lib/day";
import { prisma } from "@/lib/db";

type VariantJson = {
  sku: string;
  productId: number;
  variantName: string;
  price: number;
};
const variantData = JSON.parse(await Bun.file("data/variant.json").text()) as VariantJson[];

await prisma.productVariant.deleteMany({});
for (let i = 0; i < variantData.length; i++) {
  const variant = variantData[i] as VariantJson;
  console.log(`Inserting variant ${variant.variantName} for product ${variant.productId}`);
  try {
    await prisma.productVariant.create({
      data: {
        sku: variant.sku,
        productId: variant.productId + "",
        variantName: variant.variantName,
        price: variant.price,
        stockQuantity: 10,
        isActive: true,
        createdAt: nowVN().toDate(),
      },
    });
  } catch (error) {
    console.error(error);
  }
}
