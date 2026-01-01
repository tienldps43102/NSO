import { prisma } from "@/lib/db";
import { type DetailBook } from "./crawl-detail";
import { Mutex } from 'async-mutex';
import { nowVN } from "@/lib/day";

const books: DetailBook[] = JSON.parse(
  await Bun.file("./data/detailed-books.json").text()
).reverse();

const CATEGORY_NAME = "Manga";
const PUBLISHER_NAME = "Nhà Xuất Bản Kim Đồng";

// Initialize category
const existingCategory = await prisma.category.findFirst({
  where: { name: CATEGORY_NAME },
});

const categoryId = existingCategory 
  ? existingCategory.id 
  : (await prisma.category.create({ data: { name: CATEGORY_NAME } })).id;

// Initialize publisher
let publisher = await prisma.publisher.findFirst({
  where: { name: PUBLISHER_NAME },
});

if (!publisher) {
  publisher = await prisma.publisher.create({
    data: { name: PUBLISHER_NAME },
  });
}

// Helper functions
function getIsbnFromAttribute(attributes: Record<string, string>): { 
  isbn10?: string; 
  isbn13?: string 
} {
  let isbn10: string | undefined;
  let isbn13: string | undefined;

  for (const [key, value] of Object.entries(attributes)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("isbn-10")) {
      isbn10 = value;
    } else if (lowerKey.includes("isbn-13")) {
      isbn13 = value;
    } else if (lowerKey.includes("isbn")) {
      const cleanValue = value.replace(/-/g, '');
      if (cleanValue.length === 10) {
        isbn10 = value;
      } else if (cleanValue.length === 13) {
        isbn13 = value;
      }
    }
  }
  return { isbn10, isbn13 };
}

function findTotalPages(attributes: Record<string, string>): number {
  for (const [key, value] of Object.entries(attributes)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("số trang") || lowerKey.includes("total pages")) {
      const num = parseInt(value);
      if (!isNaN(num)) {
        return num;
      }
    }
  }
  return 0;
}

function findAuthorFromAttributes(attributes: Record<string, string>): string | undefined {
  for (const [key, value] of Object.entries(attributes)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("tác giả") || lowerKey.includes("author")) {
      return value;
    }
  }
  return undefined;
}

// Mutex-protected functions
const seriesMutex = new Mutex();
async function getOrCreateSeries(seriesName: string): Promise<string> {
  return seriesMutex.runExclusive(async () => {
    let series = await prisma.series.findFirst({
      where: { name: seriesName },
    });
    if (!series) {
      series = await prisma.series.create({
        data: { name: seriesName },
      });
    }
    return series.id;
  });
}

const authorMutex = new Mutex();
async function getOrCreateAuthor(authorNames: string): Promise<string[]> {
  return authorMutex.runExclusive(async () => {
    const authorNameArray = authorNames.split("             ")
        .map(name => name.trim())
        .filter(name => name.length > 0);

    const authorIds: string[] = [];
    for (const name of authorNameArray) {
      let author = await prisma.author.findFirst({
        where: { name },
      });
      if (!author) {
        author = await prisma.author.create({
          data: { name },
        });
      }
      authorIds.push(author.id);
    }
    return authorIds;
  });
}

// Main insertion loop
for await (const book of books) {
  try {
    const { isbn10, isbn13 } = getIsbnFromAttribute(book.attributes);
    const seriesId = book.series ? await getOrCreateSeries(book.series) : undefined;
    const authorNames = findAuthorFromAttributes(book.attributes);
    const authorIds = authorNames ? await getOrCreateAuthor(authorNames) : undefined;

    // Create product with all related data in a single transaction
    const product = await prisma.product.create({
      data: {
        title: book.title,
        description: book.description,
        isbn10,
        isbn13,
        category: {
          connect: { id: categoryId },
        },
        isActive: true,
        pageCount: findTotalPages(book.attributes),
        thumbnailUrl: book.coverUrl,
        createdAt: nowVN().toDate(),
        updatedAt: nowVN().toDate(),
        displayPrice: book.price || 0,
        series: seriesId ? { connect: { id: seriesId } } : undefined,
        authors: authorIds ? { connect: authorIds.map(id => ({ id })) } : undefined,
        publisher: { connect: { id: publisher.id } },
        // Create attributes inline
        attributes: {
          create: Object.entries(book.attributes).map(([name, value]) => ({
            name,
            value,
          })),
        },
        // Create images inline
        images: {
          create: book.images.map(url => ({
            url,
          })),
        },
      },
    });
    for await (const version of book.versions || []) {
        if(!version.title.toLocaleLowerCase().includes("bản")){
            continue;
        }
        const vrant =  await prisma.productVariant.create({
            data: {
                product: { connect: { id: product.id } },
                variantName: version.title,
                sku: version.id || Bun.randomUUIDv7(),
                price: parseFloat(version.price) || 0,
                isActive: true,
                createdAt: nowVN().toDate(),
                updatedAt: nowVN().toDate(),
            },
        });
        const coverUrl = version.coverUrl;
        if (coverUrl) {
            // find like operation
            const existingImage = await prisma.productImage.findFirst({
                where: {
                    productId: product.id,
                    url: {
                        contains: coverUrl,
                    },
                },
            });
            if (!existingImage) {
                await prisma.productImage.create({
                    data: {
                        product: { connect: { id: product.id } },
                        url: coverUrl,
                        variantId: vrant.id,
                    },
                });
            }else{
                await prisma.productImage.update({
                    where: { id: existingImage.id },
                    data: { variantId: vrant.id },
                });
            }
        }
    }

    console.log(`✓ Inserted book: ${book.title} (ID: ${product.id})`);
  } catch (error) {
    console.error(`✗ Failed to insert book: ${book.title}`, error);
  }
}

console.log(`\n✓ Completed! Inserted ${books.length} books.`);