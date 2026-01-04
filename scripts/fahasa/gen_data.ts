import { Database } from "bun:sqlite";
import { genPrompt, model, outputSchema } from "../prompts/llm";
import { generateText,Output } from "ai";
// Initialize databases
const sourceDb = new Database("fahasa-detail.sqlite", { readonly: true });
const targetDb = new Database("fahasa-processed.sqlite", { create: true });

// Enable WAL mode for better performance
targetDb.run("PRAGMA journal_mode = WAL;");

// Create tables
targetDb.run(`
  CREATE TABLE IF NOT EXISTS authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  )
`);

targetDb.run(`
  CREATE TABLE IF NOT EXISTS publishers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  )
`);

targetDb.run(`
  CREATE TABLE IF NOT EXISTS products (
    product_id TEXT PRIMARY KEY,
    title TEXT,
    series_title TEXT,
    volume INTEGER,
    variant TEXT,
    isbn TEXT,
    publisherId TEXT,
    authorIds TEXT,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publisherId) REFERENCES publishers(id)
  )
`);

// Prepare statements
const insertAuthor = targetDb.query(`
  INSERT OR IGNORE INTO authors (id, name) 
  VALUES ($id, $name)
`);

const insertPublisher = targetDb.query(`
  INSERT OR IGNORE INTO publishers (id, name) 
  VALUES ($id, $name)
`);

const insertProduct = targetDb.query(`
  INSERT OR REPLACE INTO products (product_id, title, series_title, volume, variant, isbn, publisherId, authorIds, data) 
  VALUES ($product_id, $title, $series_title, $volume, $variant, $isbn, $publisherId, $authorIds, $data)
`);

const getAuthorByName = targetDb.query(`
  SELECT id FROM authors WHERE name = $name
`);

const getPublisherByName = targetDb.query(`
  SELECT id FROM publishers WHERE name = $name
`);

const checkProductExists = targetDb.query(`
  SELECT product_id FROM products WHERE product_id = $product_id
`);

// Helper function to generate random ID
function generateId(prefix: string): string {
  return `${prefix}_${Math.random()
    .toString(36)
    .substring(2, 9)}_${Date.now()}`;
}

// Helper function to parse authors from string
function parseAuthors(authorString: string | null | undefined): string[] {
  if (!authorString) return [];
  return authorString
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author.length > 0);
}

// Process all products
console.log("Starting data processing...");

const allProducts = sourceDb
  .query("SELECT product_id, data FROM products")
  .all() as Array<{
  product_id: string;
  data: string;
}>;

console.log(`Found ${allProducts.length} products to process`);

let processed = 0;
let skipped = 0;
let errors = 0;

// Process each product one by one (no transaction for resume support)
for (const row of allProducts) {
  try {
    // Check if already processed
    const exists = checkProductExists.get({ $product_id: row.product_id });
    if (exists) {
      skipped++;
      console.log(`[SKIP] Already processed (${processed + skipped + errors}/${allProducts.length})`);
      continue;
    }

    const data = JSON.parse(row.data);

    // Extract basic fields
    const title = data.product_name || null;
    const isbn = data.attributes?.["Mã hàng"] || null;

    console.log(`[PROCESS] ${title} (${processed + skipped + errors + 1}/${allProducts.length})`);

    // Process authors
    const authorNames = parseAuthors(data.attributes?.["Tác giả"]);
    const authorIds: string[] = [];

    for (const authorName of authorNames) {
      const author = getAuthorByName.get({ $name: authorName }) as {
        id: string;
      } | null;

      if (!author) {
        const authorId = generateId("author");
        insertAuthor.run({ $id: authorId, $name: authorName });
        authorIds.push(authorId);
      } else {
        authorIds.push(author.id);
      }
    }

    // Process publisher
    const publisherName = data.attributes?.["NXB"];
    let publisherId: string | null = null;

    if (publisherName) {
      const publisher = getPublisherByName.get({
        $name: publisherName,
      }) as { id: string } | null;

      if (!publisher) {
        publisherId = generateId("publisher");
        insertPublisher.run({ $id: publisherId, $name: publisherName });
      } else {
        publisherId = publisher.id;
      }
    }

    // Generate AI data
    const prompt = genPrompt(title);
    let series_title = null;
    let volume = null;
    let variant = null;
    
    try {
      console.log(`  [AI] Generating series info...`);
      const result = await generateText({
        model: model,
        prompt: prompt,
        output: Output.object({
            schema: outputSchema
          }),
        temperature: 0.2,
      });
      console.log(result?.output);
      series_title = result?.output?.series_title || null;
      volume = result?.output?.volume || null;
      variant = result?.output?.variant || null;
      console.log(`  [AI] ✓ Series: ${series_title}, Volume: ${volume}, Variant: ${variant}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      console.error(`  [AI ERROR] Failed to generate AI data:`, error instanceof Error ? error.message : error);
    }

    // Insert product with processed data
    insertProduct.run({
      $product_id: row.product_id,
      $title: title,
      $series_title: series_title,
      $volume: volume,
      $variant: variant,
      $isbn: isbn,
      $publisherId: publisherId,
      $authorIds: authorIds.length > 0 ? JSON.stringify(authorIds) : null,
      $data: row.data, // Keep original data
    });

    processed++;
    console.log(`[✓] Saved ${title}`);
  } catch (error) {
    errors++;
    console.error(`[ERROR] Failed to process product ${row.product_id}:`, error);
  }
}

// Print statistics
const authorCount = targetDb
  .query("SELECT COUNT(*) as count FROM authors")
  .get() as { count: number };
const publisherCount = targetDb
  .query("SELECT COUNT(*) as count FROM publishers")
  .get() as { count: number };
const productCount = targetDb
  .query("SELECT COUNT(*) as count FROM products")
  .get() as { count: number };

console.log("\n=== Processing Complete ===");
console.log(`Total books in source: ${allProducts.length}`);
console.log(`Processed (new): ${processed}`);
console.log(`Skipped (already exists): ${skipped}`);
console.log(`Errors: ${errors}`);
console.log(`Total authors in DB: ${authorCount.count}`);
console.log(`Total publishers in DB: ${publisherCount.count}`);
console.log(`Total products in DB: ${productCount.count}`);
console.log(`Output database: fahasa-processed.sqlite`);

// Show some sample data
console.log("\n=== Sample Authors ===");
const sampleAuthors = targetDb.query("SELECT * FROM authors LIMIT 5").all();
console.log(sampleAuthors);

console.log("\n=== Sample Publishers ===");
const samplePublishers = targetDb
  .query("SELECT * FROM publishers LIMIT 5")
  .all();
console.log(samplePublishers);

console.log("\n=== Sample Product ===");
const sampleProduct = targetDb
  .query(
    "SELECT product_id, title, isbn, publisherId, authorIds FROM products LIMIT 1"
  )
  .get();
console.log(sampleProduct);

// Close databases
sourceDb.close();
targetDb.close();
