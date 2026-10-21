const fs = require('fs');
const path = require('path');

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/Ø/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const SPECIAL_MAPPINGS = {
  "Gabriel Magalhães": { query: "Magalhaes", exactSlug: "gabriel" },
  "Karim Benzema": { id: "165153" },
  "N'Golo Kanté": { exactSlug: "ngolo-kante" },
  "Willian Pacho": { exactSlug: "william-pacho" },
  "Dani Carvajal": { id: "204963" },
  "David de Gea": { exactSlug: "de-gea" },
  "Mikel Oyarzabal": { exactSlug: "oyarzabal" },
  "Alejandro Grimaldo": { exactSlug: "grimaldo" },
  "Fabián Ruiz": { exactSlug: "fabian" },
  "Riyad Mahrez": { id: "204485" },
  "Rodrigo De Paul": { exactSlug: "rodrigo-javier-de-paul" },
  "Marc Cucurella": { exactSlug: "cucurella" },
  "Alejandro Balde": { exactSlug: "balde" },
  "Ben White": { exactSlug: "benjamin-white" },
  "Nikola Milenković": { exactSlug: "nikola-milenkovic" },
  "John Stones": { exactSlug: "john-stones" },
  "Matthijs de Ligt": { exactSlug: "matthijs-de-ligt" },
  "Mikel Merino": { exactSlug: "merino" },
  "Savinho": { exactSlug: "savio" },
  "Destiny Udogie": { exactSlug: "destiny-iyenoma-udogie" },
  "Lucas Paquetá": { id: "241096" },
  "Martin Ødegaard": { exactSlug: "martin-odegaard" },
  "Warren Zaïre-Emery": { exactSlug: "warren-zaire-emery" },
  "Pau Cubarsí": { exactSlug: "pau-cubarsi-paredes-pau-cubarsi" },
  "João Neves": { query: "Joao Neves", exactSlug: "joao-neves" },
  "Rúben Neves": { query: "Ruben Neves", exactSlug: "ruben-neves" },
  "Dani Olmo": { query: "Dani Olmo", exactSlug: "dani-olmo" },
  "Iñigo Martínez": { query: "Inigo Martinez", exactSlug: "inigo-martinez" },
  "Emiliano Martínez": { query: "Emiliano Martinez", exactSlug: "emiliano-martinez" },
  "Lisandro Martínez": { query: "Lisandro Martinez", exactSlug: "lisandro-martinez" },
  "Jonathan David": { query: "Jonathan David", exactSlug: "jonathan-david" },
  "David Raya": { query: "David Raya", exactSlug: "david-raya" },
  "Luis Díaz": { query: "Luis Diaz", exactSlug: "luis-diaz" },
  "Enzo Fernández": { query: "Enzo Fernandez", exactSlug: "enzo-fernandez" },
  "Alexander Sørloth": { exactSlug: "alexander-sorloth" },
  "Dušan Vlahović": { exactSlug: "dusan-vlahovic" },
  "Lamine Yamal": { exactSlug: "lamine-yamal-lamine-yamal" },
  "Vinícius Jr.": { exactSlug: "vinicius-jr" },
  "Loïs Openda": { exactSlug: "lois-openda" },
  "Jérémy Doku": { exactSlug: "jeremy-doku" },
  "Lukáš Haraslín": { exactSlug: "lukas-haraslin" },
  "Benjamin Šeško": { exactSlug: "benjamin-sesko" },
};

async function fetchFromUrl(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    return null;
  }
}

async function fetchCardFromPlayerId(id) {
  const text = await fetchFromUrl(`https://www.fut.gg/players/${id}/`);
  if (!text) return null;
  const match = text.match(/https:\/\/game-assets\.fut\.gg\/cdn-cgi\/image\/[^\"*]+futgg-player-item-card\/[^\"*]+/);
  if (match) {
    return match[0].replace('width=300', 'width=600');
  }
  return null;
}

async function searchCardOnFutGG(query, preferredSlug) {
  const text = await fetchFromUrl(`https://www.fut.gg/players/?name=${encodeURIComponent(query)}`);
  if (!text) return null;
  const regex = /href=\"\/players\/(\d+)-([^\/]+)\/[^\"]*\"[\s\S]*?<img[^>]*src=\"([^\"]+)\"/g;
  let m;
  const list = [];
  while ((m = regex.exec(text)) !== null) {
    list.push({ id: m[1], slug: m[2], cardUrl: m[3].replace('width=300', 'width=600') });
  }

  if (preferredSlug) {
    const exact = list.find(x => x.slug === preferredSlug || x.slug.includes(preferredSlug));
    if (exact) return exact.cardUrl;
  }

  if (list.length > 0) {
    return list[0].cardUrl;
  }
  return null;
}

async function main() {
  console.log("=== Crawling fut.gg pages for FC 26 player cards ===");
  const crawledMap = new Map();

  // Crawl pages 1 to 60 with concurrency of 6
  const totalPages = 60;
  const chunkSize = 6;
  for (let i = 1; i <= totalPages; i += chunkSize) {
    const chunk = [];
    for (let j = i; j < i + chunkSize && j <= totalPages; j++) {
      chunk.push(j);
    }
    await Promise.all(chunk.map(async (page) => {
      const text = await fetchFromUrl(`https://www.fut.gg/players/?quality_id=%5B1%5D&page=${page}`);
      if (!text) return;
      const regex = /href=\"\/players\/(\d+)-([^\/]+)\/[^\"]*\"[\s\S]*?<img[^>]*src=\"([^\"]+)\"/g;
      let m;
      while ((m = regex.exec(text)) !== null) {
        const id = m[1];
        const slug = m[2];
        const cardUrl = m[3].replace('width=300', 'width=600');
        if (!crawledMap.has(slug)) {
          crawledMap.set(slug, { id, slug, cardUrl });
        }
      }
    }));
    process.stdout.write(`Indexed pages ${i} to ${Math.min(i + chunkSize - 1, totalPages)} (total cards: ${crawledMap.size})\r`);
  }
  console.log(`\nFinished crawling: ${crawledMap.size} unique cards indexed.`);

  // Load the 200 players
  const playersPath = 'src/data/initialPlayers.ts';
  const content = fs.readFileSync(playersPath, 'utf-8');
  const eq = content.indexOf('=');
  const jsonStart = content.indexOf('[', eq);
  const jsonEnd = content.lastIndexOf(']') + 1;
  const players = JSON.parse(content.slice(jsonStart, jsonEnd));

  let matched = 0;
  let downloaded = 0;

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const stdSlug = toSlug(player.name);
    let cardUrl = null;

    // 1. Check special mapping
    const mapping = SPECIAL_MAPPINGS[player.name];
    if (mapping) {
      if (mapping.id) {
        cardUrl = await fetchCardFromPlayerId(mapping.id);
      } else if (mapping.exactSlug && crawledMap.has(mapping.exactSlug)) {
        cardUrl = crawledMap.get(mapping.exactSlug).cardUrl;
      } else if (mapping.query) {
        cardUrl = await searchCardOnFutGG(mapping.query, mapping.exactSlug);
      }
    }

    // 2. Check crawled map with exact slug
    if (!cardUrl && crawledMap.has(stdSlug)) {
      cardUrl = crawledMap.get(stdSlug).cardUrl;
    }

    // 3. Check crawled map with partial matches
    if (!cardUrl) {
      for (const [s, data] of crawledMap.entries()) {
        if (s === stdSlug || s.startsWith(stdSlug + '-') || s.endsWith('-' + stdSlug)) {
          cardUrl = data.cardUrl;
          break;
        }
      }
    }

    // 4. Query fut.gg search if still not found
    if (!cardUrl) {
      const cleanName = player.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      cardUrl = await searchCardOnFutGG(cleanName, stdSlug);
    }

    // 5. Query last name as fallback
    if (!cardUrl) {
      const lastName = player.name.split(' ').slice(-1)[0].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      cardUrl = await searchCardOnFutGG(lastName, stdSlug);
    }

    if (cardUrl) {
      matched++;
      const cleanFileName = `${stdSlug}_card.png`;
      const localFilePath = path.join('public/images', cleanFileName);

      // Download the authentic card asset
      try {
        const dlRes = await fetch(cardUrl);
        if (dlRes.ok) {
          const buf = await dlRes.arrayBuffer();
          fs.writeFileSync(localFilePath, Buffer.from(buf));
          downloaded++;
        }
      } catch (err) {
        console.error(`Download failed for ${player.name}:`, err.message);
      }

      player.photo = `/images/${cleanFileName}`;
      console.log(`[Set ${player.setId} #${player.orderInSet}] Matched ${player.name} -> ${cleanFileName}`);
    } else {
      console.warn(`[WARNING] Could not match fut.gg card for: Set ${player.setId} #${player.orderInSet} ${player.name}`);
    }
  }

  console.log(`\n=== Complete! Matched: ${matched}/${players.length}, Downloaded: ${downloaded} ===`);

  // Write updated initialPlayers.ts
  const outContent = `import type { Player } from "../types/auction.ts";

// 200 Top-flight World Football Players for Moneyball Auction
// Formatted directly according to Moneyball 200 Player Auction Pool document with authentic fut.gg FC 26 cards
export const INITIAL_PLAYERS: Player[] = ${JSON.stringify(players, null, 2)};
`;

  fs.writeFileSync(playersPath, outContent);
  console.log(`Updated ${playersPath} with authentic cards across all 10 sets!`);
}

main().catch(console.error);
