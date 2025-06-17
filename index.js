import axios from "axios";
import * as cheerio from "cheerio";

const visited = new Set();

async function crawl(url) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const links = $("a")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter(
        (href) =>
          href && !href.startsWith("mailto:") && !href.startsWith("tel:")
      )
      .map((href) => new URL(href, "https://www.compteco2.com/").href);

    for (const link of links) {
      await crawl(link);
    }
  } catch (error) {
    if (error.response) {
      console.log(`X ${url} → ${error.response.status}`);
    } else {
      console.log(`? ${url} → ${error.message}`);
    }
  }
}

crawl("https://www.compteco2.com/");
