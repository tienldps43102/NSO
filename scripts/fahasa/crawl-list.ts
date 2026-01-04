// fetch("https://www.fahasa.com/fahasa_catalog/product/loadproducts?category_id=6718&currentPage=1&limit=24&order=created_at&series_type=0", {
//     "headers": {
//       "accept": "application/json, text/javascript, */*; q=0.01",
//       "accept-language": "vi,en-US;q=0.9,en;q=0.8",
//       "cache-control": "no-cache",
//       "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//       "pragma": "no-cache",
//       "priority": "u=1, i",
//       "sec-ch-ua": "\"Brave\";v=\"143\", \"Chromium\";v=\"143\", \"Not A(Brand\";v=\"24\"",
//       "sec-ch-ua-mobile": "?0",
//       "sec-ch-ua-platform": "\"Linux\"",
//       "sec-fetch-dest": "empty",
//       "sec-fetch-mode": "cors",
//       "sec-fetch-site": "same-origin",
//       "sec-gpc": "1",
//       "traceparent": "00-26f65e0450d67f65d493524fc4d9af6f-ef3742fd0655ee17-01",
//       "x-requested-with": "XMLHttpRequest",
//       "cookie": "frontend=3bc9aa59963e463e8d7b07cf1ba06269; frontend_cid=OjKqLa4AlBjZSkZ7; external_no_cache=1",
//       "Referer": "https://www.fahasa.com/sach-trong-nuoc/manga-comic.html?order=created_at&limit=24&p=1"
//     },
//     "body": null,
//     "method": "GET"
//   });
import {appendFile} from 'fs/promises';

import { FahasaListResponse,ProductList } from "./type";
import PQueue from 'p-queue';

async function getJson(page: number) {
    const url = `https://www.fahasa.com/fahasa_catalog/product/loadproducts?category_id=6718&currentPage=${page}&limit=24&order=created_at&series_type=0`;
    const response = await fetch(url);
    const data: FahasaListResponse = await response.json();
    return data;
}
const JSON_OUTPUT_PATH = './data/fahasa-list.jsonl';
const END_PAGE = 100;
const queue = new PQueue({ concurrency: 10 });
const data:ProductList[] = [];
for (let page = 1; page <= END_PAGE; page++) {
    queue.add(async () => {
        console.log(`Crawling page ${page}`);
        const res = await getJson(page);
        console.log(`Found ${res.product_list.length} products`);
        res.product_list.forEach(product => {
            if(product.type_id=="simple"){
                data.push(product);
            }
        });
    });
}
await queue.onIdle();
await Bun.write(JSON_OUTPUT_PATH, JSON.stringify(data, null, 2));