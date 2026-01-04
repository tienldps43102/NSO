import { load } from "cheerio";
import { Database } from "bun:sqlite";
import PQueue from 'p-queue';
import briefBooks from '../../data/fahasa-list.json';

async function getHtml(url: string) {
  const response = await fetch(url);
  return response.text();
}



async function parseHtml(html: string) {
  const $ = load(html);
  const result: Record<string, string> = {};
  const $rows = $("table.data-table.table-additional tbody tr");

  $rows.each((_, tr) => {
    const key = $(tr).find("th.table-label").text().trim();
    if (!key) return;

    // Lấy text của td (bao gồm text trong div/a)
    let value = $(tr).find("td").text();

    // Normalize whitespace: xuống dòng/tab -> space, gộp nhiều space
    value = value.replace(/\s+/g, " ").trim();

    if (value) result[key] = value;
  });
  const images = $(".include-in-gallery").map((_, img) => $(img).attr("href")).get();
  const description = $("#product_tabs_description_contents").html();
  const seriesEL= $("#product_view_kasitoo > div > div.product-essential-detail-parent > div.product-essential-detail > div.block-content-product-detail.block-product-view-mobile > h1 > div.fhs_name_product_label > a ")
  const seriesUrl = seriesEL?.attr("href")
  const seriesId = seriesUrl?.split("/").pop() || "";
  const categoryName = $("#ves-breadcrumbs > div").text().trim();
  return {
    attributes: result,
    images: images,
    description: description,
    seriesUrl: seriesUrl,
    seriesId: seriesId,
    categoryName: categoryName,
  }
}

// Initialize SQLite database
const db = new Database("fahasa-detail.sqlite", { create: true });

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    product_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Prepare statements
const insertStmt = db.query(`
  INSERT OR REPLACE INTO products (product_id, data) 
  VALUES ($product_id, $data)
`);

const checkStmt = db.query(`
  SELECT product_id FROM products WHERE product_id = $product_id
`);

// Initialize queue
const queue = new PQueue({ concurrency: 10 });
let processed = 0;
let skipped = 0;
let errors = 0;

console.log(`Total books to process: ${briefBooks.length}`);

for (const book of briefBooks) {
  queue.add(async () => {
    try {
      // Check if already crawled
      const exists = checkStmt.get({ $product_id: book.product_id });
      if (exists) {
        skipped++;
        console.log(`[SKIP] ${book.product_name} (${processed + skipped + errors}/${briefBooks.length})`);
        return;
      }

      console.log(`[CRAWL] ${book.product_name} (${processed + skipped + errors + 1}/${briefBooks.length})`);
      const html = await getHtml(book.product_url);
      const detail = await parseHtml(html);
      
      const combinedData = {
        ...book,
        ...detail,
      };

      // Save to SQLite
      insertStmt.run({
        $product_id: book.product_id,
        $data: JSON.stringify(combinedData),
      });

      processed++;
      console.log(`[✓] Saved ${book.product_name} (${processed + skipped + errors}/${briefBooks.length})`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      errors++;
      console.error(`[ERROR] Failed to crawl ${book.product_name}:`, error);
    }
  });
}

await queue.onIdle();

console.log(`\n=== Crawl Complete ===`);
console.log(`Total: ${briefBooks.length}`);
console.log(`Processed: ${processed}`);
console.log(`Skipped (already exists): ${skipped}`);
console.log(`Errors: ${errors}`);
console.log(`Database: ../../data/fahasa-detail.sqlite`);

db.close();