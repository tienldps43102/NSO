import { prisma } from "@/lib/db";
// {
//     "id": 291,
//     "name": "Iphone 20",
//     "slug": "-1763275807483",
//     "description": "<h1>Iphone 20Iphone 20Iphone 20Iphone 20Iphone 20Iphone 20Iphone 20Iphone 20Iphone 20</h1><p>Iphone 20</p><p>d</p><p>sfdasff</p><p><strong>dsfa</strong></p>",
//     "brand_id": 2,
//     "category_id": 1,
//     "thumbnail": "/api/file/1763275807028-Screenshot 2025-11-08 121854.png",
//     "status": "active",
//     "created_at": "2025-11-16 06:50:07.483",
//     "price": 41000000.00,
//     "metadata": null,
//     "is_featured": false,
//     "discount": null,
//     "brand_name": "Apple",
//     "category_name": "Điện thoại"
//   }
// import productData from "../data/product.json";
type ProductJson = {
  id: number;
  name: string;
  slug: string;
  description: string;
  brand_id: number;
  category_id: number;
  thumbnail: string;
  status: string;
  created_at: string;
  price: number;
  metadata: any;
  is_featured: boolean;
  discount: number | null;
  brand_name: string;
  category_name: string;
};
const productData = JSON.parse(await Bun.file("data/product.json").text());

async function createBrandIfNotExists(brandName: string) {
  let brand = await prisma.brand.findFirst({
    where: { name: brandName },
  });
  if (!brand) {
    brand = await prisma.brand.create({
      data: { name: brandName },
    });
  }
  return brand;
}

async function createCategoryIfNotExists(categoryName: string) {
  let category = await prisma.category.findFirst({
    where: { name: categoryName },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { name: categoryName },
    });
  }
  return category;
}
for (let i = 0; i < productData.length; i++) {
  const product = productData[i] as ProductJson;
  if (!product.brand_name || !product.category_name) continue;
  const brand = await createBrandIfNotExists(product.brand_name);
  const category = await createCategoryIfNotExists(product.category_name);
  await prisma.product.create({
    data: {
      title: product.name,
      displayPrice: product.price,
      brandId: brand!.id!,
      categoryId: category!.id!,
      createdAt: new Date(product.created_at),
      description: product.description,
      thumbnailUrl: product.thumbnail,
      isActive: true,
      id: product.id + "",
    },
  });
}
