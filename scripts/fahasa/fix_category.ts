import { Database } from "bun:sqlite";
import { ulid } from "ulid";
// Initialize databases
const targetDb = new Database("fahasa-processed.sqlite", { create: true });

// Enable WAL mode for better performance
targetDb.run("PRAGMA journal_mode = WAL;");

// Create tables
targetDb.run(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  )
`);
// targetDb.run(`
//     ALTER TABLE products ADD COLUMN categoryId TEXT;
//     ALTER TABLE products ADD COLUMN categoryRaw TEXT;
// `);
const updateCategoryRaw = targetDb.query(`
    UPDATE products SET categoryRaw = $categoryRaw WHERE product_id = $product_id
`);

const allProducts = targetDb.query("SELECT * FROM products").all() as { product_id: string, data: string }[];
for (const product of allProducts) {
    const data = JSON.parse(product.data);
    const rawCategory = data.categoryName?.replace("Sách tiếng Việt", "")?.trim() || null;
    updateCategoryRaw.run({ $product_id: product.product_id, $categoryRaw: getFinalCategory(rawCategory) });
    console.log(`[✓] Updated category for ${product.product_id}`);
}
console.log(`[✓] Updated ${allProducts.length} products`);

function getFinalCategory(rawCategory: string) {
    if(rawCategory.includes("Việt Nam")) {
        return "Truyện Việt";
    }
    if(rawCategory.includes("Nước Ngoài")) {
        return "Comic";
    }
    if(rawCategory.includes("Series Manga")) {
        return "Manga";
    }
    if(rawCategory.includes("Manga Khác")) {
        return "Manga";
    }
    console.log("unknown category: ", rawCategory);
    return "Manga";
}
const insertCategory = targetDb.query(`
    INSERT INTO categories (id, name) VALUES ($id, $name)
`);
// delete all categories
targetDb.run(`DELETE FROM categories`);
console.log(`[✓] Deleted all categories`);
// get Distinct categories
const distinctCategories = targetDb.query("SELECT DISTINCT categoryRaw FROM products").all() as { categoryRaw: string }[];
for (const category of distinctCategories) {
    const categoryId = ulid();
    insertCategory.run({ $id: categoryId, $name: category.categoryRaw });
    console.log(`[✓] Added category ${category.categoryRaw}`);
}
console.log(`[✓] Added ${distinctCategories.length} categories`);