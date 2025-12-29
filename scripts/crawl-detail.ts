import { load } from "cheerio";
import PQueue from "p-queue";
import { BriefBook } from "./crawl-list";
import { DetailCrawlData } from "./type";

const books: BriefBook[] = JSON.parse(
  await Bun.file("./data/brief-books.json").text()
);

function toAbsUrl(u: string): string {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `https://nxbkimdong.com.vn${u}`;
  return `https://nxbkimdong.com.vn/${u}`;
}

function generateDetailUrl(detailUrl: string): string {
  return toAbsUrl(detailUrl);
}

async function getDetailHtml(fullUrl: string) {
  const res = await fetch(fullUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${fullUrl}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

export interface DetailBook extends BriefBook {
  images: string[];
  description: string;
  series?: string;
  attributes: Record<string, string>;
  versions?: BriefBook[] | undefined;
}

type DetailPart = Pick<DetailBook, "images" | "description" | "series" | "attributes" | "versions">;

function parseDetail(html: string): DetailPart {
  const $ = load(html);
  const THUMB_SELECTOR = ".thumbnail-item img";
  const ATTR_SELECTOR =
    ".grid__item.large--one-half.medium--one-whole.small--one-whole ul li";
  const DESC_SELECTOR = "#protab0";
  const SERIES_ATTR_NAME = "Bộ sách";
  const VERSION_SELECTOR = "#variant-swatch-0";
  const VERSION_TYPE_SELECTOR = ".header";
  const REAL_TYPE = "Phiên bản";
  const ALL_VERSION_SELECTOR = `.select-swap>div`;

  const images: string[] = [];
  $(THUMB_SELECTOR).each((_, el) => {
    const imgUrl = $(el).attr("data-src") || $(el).attr("src") || "";
    const abs = toAbsUrl(imgUrl);
    if (abs) images.push(abs);
  });

  const attributes: Record<string, string> = {};
  let series: string | undefined;

  $(ATTR_SELECTOR).each((_, el) => {
    const fullText = $(el).text().trim();
    const [labelRaw, ...rest] = fullText.split(":");
    const label = (labelRaw ?? "").trim();
    const value = rest.join(":").trim();
    if (!label) return;

    attributes[label] = value;
    if (label.includes(SERIES_ATTR_NAME)) series = value;
  });

  const description = $(DESC_SELECTOR).html()?.trim() || "";

  const versionTypeText = $(VERSION_SELECTOR).find(VERSION_TYPE_SELECTOR).text().trim();
  let versions: BriefBook[] | undefined;
  if (versionTypeText === REAL_TYPE) {
    versions = [];
    $(ALL_VERSION_SELECTOR).each((_, el) => {
      const versionName = $(el).attr("data-value")?.trim();
      const versionImg = $(el).find("input").attr("data-img") || "";
      if (versionName) {
        versions!.push({
          id: "", // unknown
          title: `${versionName}`,
          price: "",
          coverUrl: toAbsUrl(versionImg),
          detailUrl: "",

        });
      }
    });
  }
  const match = html.match(/var meta = (\{[\s\S]*?\});/);
  if (!match) {
    throw new Error("Failed to find meta JSON in detail page");
  }

  const metaJson = match[1];
  const meta = JSON.parse(metaJson) as DetailCrawlData
  // tìm và bổ xung giá, id
  meta.product.variants.forEach(variant => {
    if (versions) {
      const v = versions.find(v => v.title.includes(variant.variant_title));
      if (v) {
        v.id = variant.sku?.toString()|| "";
        v.price = variant.price.toString();
      }
    }
  });
  return { images, description, series, attributes, versions };
}

async function crawlDetail(book: BriefBook): Promise<DetailBook> {
  if (!book.detailUrl) {
    throw new Error(`Missing detailUrl for book id=${book.id}`);
  }
  const fullUrl = generateDetailUrl(book.detailUrl);
  const html = await getDetailHtml(fullUrl);
  const detail = parseDetail(html);
  return { ...book, ...detail };
}

const queue = new PQueue({ concurrency: 5 });

const tasks = books.map((book, idx) =>
  queue.add(async () => {
    try {
      const detailed = await crawlDetail(book);
      console.log(`✅ [${idx + 1}/${books.length}] ${book.id} ${book.title}`);
      return detailed;
    } catch (e) {
      console.error(`❌ [${idx + 1}/${books.length}] ${book.id} ${book.title}`, e);
      return null;
    }
  })
);

const results = await Promise.all(tasks);
const detailedBooks = results.filter((x): x is DetailBook => x !== null);

await Bun.write("./data/detailed-books.json", JSON.stringify(detailedBooks, null, 2));
console.log(`Crawled details for ${detailedBooks.length}/${books.length} books.`);
