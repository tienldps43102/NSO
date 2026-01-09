import { prisma } from "@/lib/db";
const attributeData = JSON.parse(await Bun.file("data/attribute.json").text()) as AttributeJson[];

type AttributeJson = {
  productId: number;
  specName: string;
  specValue: string;
};
for (let i = 0; i < attributeData.length; i++) {
  const attribute = attributeData[i] as AttributeJson;
  console.log(`Inserting attribute ${attribute.specName} for product ${attribute.productId}`);
  if (!attribute.specName || !attribute.specValue) continue;
  try {
    await prisma.attribute.create({
      data: {
        name: attribute.specName,
        value: attribute.specValue,
        productId: attribute.productId + "",
      },
    });
  } catch (error) {
    console.error(error);
  }
}
