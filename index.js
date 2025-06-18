import axios from "axios";
import * as cheerio from "cheerio";

const visited = new Set();
const h1Map = new Map();
const mapALT = new Map();
const styleMap = new Map();

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
      .map((href) => new URL(href, "https://www.compteco2.com/").href)
      .filter((link) => link.includes("compteco2.com"));

    const h1s = $("h1").toArray();
    if (h1s.length > 1) {
      const extras = h1s.slice(1).map((el) => $(el).text().trim());

      h1Map.set(url, extras);
    }

    const imgNoALT = $("img")
      .toArray()
      .filter((el) => !$(el).attr("alt"))
      .map((el) => $.html(el));
    if (imgNoALT.length > 0){
      mapALT.set(url, imgNoALT);
    }

    const style = $("[style]")
      .toArray()
      .map((el) => $.html(el));
    if (style.length > 0){
      styleMap.set(url, style);
    }

    for (const link of links) {
      if (link.includes("compteco2.com")) {
        await crawl(link, url);
      }
    }
  } catch (error) {
    if (error.response) {
      /*console.log(
        `Dans cette page : ${from} → Ce lien pose probleme : ${url} → ${error.response.status}`
      );
      */
    } else {
      /*
      console.log(
        `Dans cette page : ${from} → Ce lien pose probleme : ${url} → ${error.message}`
      );
      */
    }
  }
}

function showH1Double() {
  console.log("\nH1 supplémentaires trouvés par page :");
  if (h1Map.size === 0) {
    console.log("Aucun doublon de H1 détecté !");
    return;
  }

  for (const [url, h1s] of h1Map.entries()) {
    console.log(`\n→ Page : ${url}`);
    for (const h1 of h1s) {
      console.log(`   ${h1}`);
    }
  }
}
function showMap(map, titre, noFind) {
  console.log(titre);
  if (map.size === 0) {
    console.log(noFind);
    return;
  }

  for (const [url, arg] of map.entries()) {
    console.log(`\n→ Page : ${url}`);
    for (const index of arg) {
      console.log(`   ${index}`);
    }
  }
}

async function main() {
  await crawl("https://www.compteco2.com/", "https://www.compteco2.com/");
  showH1Double()
  showMap(mapALT, "\nImage sans atributs ALT supplémentaires trouvés par page :", "Tous les images ont un atribut ALT !")
  showMap(
    styleMap,
    "\nStyle inlines trouvés par page :",
    "Aucun style inlines trouvé !"
  );
}

main();
