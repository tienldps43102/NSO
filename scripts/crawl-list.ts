import PQueue from 'p-queue';
import { load } from 'cheerio';

const url = (page: number) =>
  `https://nxbkimdong.com.vn/search?q=filter%3D(product_type%3Aproduct%3DManga%20-%20comic)&page=${page}`;

async function getHtml(page: number) {
  const u = url(page);
  const res = await fetch(u);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${u}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export interface BriefBook {
  id: string;
  title: string;
  price: string;
  oldPrice?: string;
  coverUrl: string;
  detailUrl?: string;
}

function parseList(html: string): BriefBook[] {
  const CARD_SELECTOR =
    '.grid__item.product--loop.product--grid-item.large--one-quarter.medium--one-third.small--one-half.pd-left0.search-item';
  const IMAGE_SELECTOR = 'img';
  const TITLE_SELECTOR = '.product-title';
  const DETAIL_URL_SELECTOR = '.product-title a';
  const PRICE_SELECTOR = '.current-price';
  const OLD_PRICE_SELECTOR = '.original-price';

  const $ = load(html);
  const cards = $(CARD_SELECTOR);
  const books: BriefBook[] = [];

  cards.each((_, el) => {
    const coverUrl = $(el).find(IMAGE_SELECTOR).attr('data-src') || '';
    const title = $(el).find(TITLE_SELECTOR).text().trim();
    const detailUrl = $(el).find(DETAIL_URL_SELECTOR).attr('href') || '';
    const id = $(el).find(IMAGE_SELECTOR).attr('data-id') || '';
    const price = $(el)
      .find(PRICE_SELECTOR)
      .text()
      .trim()
      .replace(/[,đ₫]/g, '');
    const oldPriceRaw = $(el).find(OLD_PRICE_SELECTOR).text().trim();
    const oldPrice = oldPriceRaw ? oldPriceRaw.replace(/[,đ₫]/g, '') : undefined;

    books.push({ id, title, price, oldPrice, coverUrl, detailUrl });
  });

  return books;
}

const TOTAL_PAGES = 10;
const JSON_OUTPUT_PATH = './data/brief-books.json';

async function crawlPage(page: number): Promise<BriefBook[]> {
  console.log(`Crawling page ${page}...`);
  const html = await getHtml(page);
  const books = parseList(html);
  console.log(`Found ${books.length} books on page ${page}.`);
  return books;
}

async function crawlList() {
  const queue = new PQueue({ concurrency: 3 });

  // Tạo task cho từng page, nhưng KHÔNG ghi chung vào allBooks trong task (tránh race)
  const tasks: Array<Promise<BriefBook[]>> = [];
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    tasks.push(queue.add(() => crawlPage(page)));
  }

  const pagesResult = await Promise.all(tasks); // an toàn
  const allBooks = pagesResult.flat();

  console.log(`Crawled total ${allBooks.length} books.`);
  await Bun.write(JSON_OUTPUT_PATH, JSON.stringify(allBooks, null, 2));
  return allBooks;
}

crawlList().catch((err) => {
  console.error('Error during crawling:', err);
});
