import axios from "axios";
import * as cheerio from "cheerio";

const visited = new Set();

async function crawl(url, from) {
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
          href &&
          !href.startsWith("#") &&
          !href.startsWith("mailto:") &&
          !href.startsWith("tel:") &&
          !href.startsWith("javascript:")
      )
      .map((href) => new URL(href, "https://www.compteco2.com/").href);

    for (const link of links) {
      if (link.includes("compteco2.com")) {
        await crawl(link, url);
      }
    }
  } catch (error) {
    if (error.response) {
      console.log(
        `Dans cette page : ${from} → Ce lien pose probleme : ${url} → ${error.response.status}`
      );
    } else {
      console.log(
        `Dans cette page : ${from} → Ce lien pose probleme : ${url} → ${error.message}`
      );
    }
  }
}

crawl("https://www.compteco2.com/", "https://www.compteco2.com/");
