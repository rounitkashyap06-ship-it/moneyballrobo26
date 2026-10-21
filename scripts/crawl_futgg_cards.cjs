const fs = require('fs');
const path = require('path');

// Helper to sanitize player name into slug
function toSlug(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchPage(page) {
  try {
    const res = await fetch(`https://www.fut.gg/players/?quality_id=%5B1%5D&page=${page}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    if (!res.ok) return [];
    const html = await res.text();
    const regex = /href="\/players\/\d+-([^"\/]+)\/[^"]*"[^>]*>[\s\S]*?<img[^>]*src="(https:\/\/game-assets\.fut\.gg\/cdn-cgi\/image\/[^"]*futgg-player-item-card\/[^"]+)"/g;
    const list = [];
    let m;
    while ((m = regex.exec(html)) !== null) {
      list.push({
        slug: m[1],
        cardUrl: m[2].replace("width=300", "width=600")
      });
    }
    return list;
  } catch (e) {
    console.error(`Page ${page} err:`, e.message);
    return [];
  }
}

async function searchPlayerCard(name) {
  try {
    // Try full name first, then last name
    const terms = [name];
    const parts = name.split(" ");
    if (parts.length > 1) {
      terms.push(parts[parts.length - 1]);
    }

    for (const term of terms) {
      const cleanTerm = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const res = await fetch(`https://www.fut.gg/players/?name=${encodeURIComponent(cleanTerm)}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      if (!res.ok) continue;
      const html = await res.text();
      const match = html.match(/https:\/\/game-assets\.fut\.gg\/cdn-cgi\/image\/[^"]*futgg-player-item-card\/[^"]+/);
      if (match) {
        return match[0].replace("width=300", "width=600");
      }
    }
  } catch (e) {
    console.error(`Search err for ${name}:`, e.message);
  }
  return null;
}

async function main() {
  console.log("Crawling fut.gg player listings for FC 26 cards...");
  const slugCardMap = new Map();

  for (let p = 1; p <= 12; p++) {
    const items = await fetchPage(p);
    console.log(`Page ${p}: found ${items.length} cards`);
    for (const item of items) {
      if (!slugCardMap.has(item.slug)) {
        slugCardMap.set(item.slug, item.cardUrl);
      }
    }
  }

  console.log(`Total indexed slugs from pages 1-12: ${slugCardMap.size}`);

  // Load our 200 players
  const playersPath = "src/data/initialPlayers.ts";
  const content = fs.readFileSync(playersPath, "utf-8");
  const equalIdx = content.indexOf("=");
  const jsonStart = content.indexOf("[", equalIdx);
  const jsonEnd = content.lastIndexOf("]") + 1;
  const players = JSON.parse(content.slice(jsonStart, jsonEnd));

  let matchedCount = 0;
  let downloadedCount = 0;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const slug = toSlug(player.name);

    let cardUrl = slugCardMap.get(slug);
    if (!cardUrl) {
      // Try finding by partial slug match
      for (const [s, url] of slugCardMap.entries()) {
        const pLastName = toSlug(player.name.split(" ").slice(-1)[0]);
        if (s.includes(pLastName) && pLastName.length >= 4) {
          cardUrl = url;
          break;
        }
      }
    }

    if (!cardUrl) {
      // Direct query to fut.gg
      cardUrl = await searchPlayerCard(player.name);
    }

    if (cardUrl) {
      matchedCount++;
      const cleanFileName = `${toSlug(player.name)}_card.png`;
      const localFilePath = path.join("public/images", cleanFileName);

      // Download if not already saved
      if (!fs.existsSync(localFilePath) || fs.statSync(localFilePath).size < 1000) {
        try {
          const dlRes = await fetch(cardUrl);
          if (dlRes.ok) {
            const buf = await dlRes.arrayBuffer();
            fs.writeFileSync(localFilePath, Buffer.from(buf));
            downloadedCount++;
          }
        } catch (e) {
          console.error(`Download failed for ${player.name}:`, e.message);
        }
      }

      player.photo = `/images/${cleanFileName}`;
    } else {
      console.log(`[Card Missing] No direct fut.gg card for: Set ${player.setId} #${player.orderInSet} ${player.name}`);
    }
  }

  console.log(`Matched cards: ${matchedCount}/${players.length}. Newly downloaded: ${downloadedCount}`);

  // Write updated initialPlayers.ts
  const out = `import type { Player } from "../types/auction.ts";

// 200 Top-flight World Football Players for Moneyball Auction
// Formatted directly according to Moneyball 200 Player Auction Pool document
export const INITIAL_PLAYERS: Player[] = ${JSON.stringify(players, null, 2)};
`;

  fs.writeFileSync(playersPath, out);
  console.log("Updated src/data/initialPlayers.ts with all discovered cards!");
}

main().catch(console.error);
