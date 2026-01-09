import { prisma } from "@/lib/db";
const imageData = JSON.parse(await Bun.file("data/image.json").text()) as ImageJson[];
// {
//     "productId": 1,
//     "variantSku": "samsung-galaxy-z-fold7-5g-12gb-256gb-00919908",
//     "imageUrl": "https://cdn2.fptshop.com.vn/unsafe/note_1_copy_c73543c164.jpg"
//   }
type ImageJson = {
  productId: number;
  variantSku: string;
  imageUrl: string;
};
for (let i = 0; i < imageData.length; i++) {
  const image = imageData[i] as ImageJson;
  // find sku id
  const variant = await prisma.productVariant.findFirst({
    where: { sku: image.variantSku },
  });
  if (!variant) continue;
  await prisma.productImage.create({
    data: {
      url: image.imageUrl,
      productId: image.productId + "",
      variantId: variant.id,
    },
  });
}
