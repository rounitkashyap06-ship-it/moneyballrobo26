const fs = require('fs');

const md = fs.readFileSync('public/assets/aistudio/Moneyball_200_Player_Auction_Pool_Updated_ffda0f71.md', 'utf-8');

const setNames = [
  "Set 1 - Marquee Players",
  "Set 2 - Elite Forwards",
  "Set 3 - Elite Midfielders",
  "Set 4 - Elite Defenders",
  "Set 5 - Goalkeepers",
  "Set 6 - Premium Forwards",
  "Set 7 - Premium Midfielders",
  "Set 8 - Premium Defenders",
  "Set 9 - Value & Utility",
  "Set 10 - Bargains & Wildcards"
];

const lines = md.split('\n');
const parsed = [];

for (let s = 0; s < setNames.length; s++) {
  const setName = setNames[s];
  const setIndex = s + 1;
  const headerIdx = lines.findIndex(l => l.includes(`|**${setName}**|`));
  if (headerIdx === -1) {
    console.error("Missing header:", setName);
    continue;
  }
  
  let playerRows = [];
  let i = headerIdx + 1;
  while (i < lines.length && playerRows.length < 20) {
    const l = lines[i].trim();
    const parts = l.split("|").map(p => p.trim()).filter(Boolean);
    if (parts.length >= 5 && /^\d+$/.test(parts[0])) {
      playerRows.push({
        order: parseInt(parts[0]),
        name: parts[1],
        position: parts[2],
        ovr: parseInt(parts[3]),
        category: parts[4]
      });
    }
    i++;
  }

  let basePriceRows = [];
  while (i < lines.length && basePriceRows.length < 20) {
    const l = lines[i].trim();
    const parts = l.split("|").map(p => p.trim()).filter(Boolean);
    if (parts.length >= 1 && /^\d+$/.test(parts[0])) {
      basePriceRows.push({
        basePrice: parseInt(parts[0]),
        notes: parts[1] || ""
      });
    }
    i++;
  }

  for (let k = 0; k < playerRows.length; k++) {
    parsed.push({
      setId: setIndex,
      setName: setName.replace(/^Set \d+ - /, ""),
      ...playerRows[k],
      basePrice: basePriceRows[k]?.basePrice || 20,
      notes: basePriceRows[k]?.notes || ""
    });
  }
}

console.log("Parsed 200 players count:", parsed.length);

// Club and Nationality directory for the 200 players
const playerMeta = {
  "Kylian Mbappé": { club: "Real Madrid", nationality: "France", stats: { pace: 97, shooting: 90, passing: 80, dribbling: 92, defending: 36, physical: 78 } },
  "Mohamed Salah": { club: "Liverpool", nationality: "Egypt", stats: { pace: 89, shooting: 87, passing: 82, dribbling: 88, defending: 45, physical: 76 } },
  "Erling Haaland": { club: "Manchester City", nationality: "Norway", stats: { pace: 88, shooting: 92, passing: 70, dribbling: 81, defending: 45, physical: 88 } },
  "Jude Bellingham": { club: "Real Madrid", nationality: "England", stats: { pace: 80, shooting: 87, passing: 83, dribbling: 88, defending: 78, physical: 83 } },
  "Ousmane Dembélé": { club: "Paris Saint-Germain", nationality: "France", stats: { pace: 93, shooting: 80, passing: 85, dribbling: 90, defending: 38, physical: 66 } },
  "Rodri": { club: "Manchester City", nationality: "Spain", stats: { pace: 66, shooting: 80, passing: 86, dribbling: 84, defending: 87, physical: 85 } },
  "Virgil van Dijk": { club: "Liverpool", nationality: "Netherlands", stats: { pace: 78, shooting: 60, passing: 71, dribbling: 72, defending: 90, physical: 86 } },
  "Lamine Yamal": { club: "FC Barcelona", nationality: "Spain", stats: { pace: 88, shooting: 81, passing: 84, dribbling: 90, defending: 36, physical: 60 } },
  "Vinícius Jr.": { club: "Real Madrid", nationality: "Brazil", stats: { pace: 95, shooting: 84, passing: 81, dribbling: 91, defending: 34, physical: 69 } },
  "Achraf Hakimi": { club: "Paris Saint-Germain", nationality: "Morocco", stats: { pace: 92, shooting: 76, passing: 80, dribbling: 82, defending: 78, physical: 79 } },
  "Federico Valverde": { club: "Real Madrid", nationality: "Uruguay", stats: { pace: 88, shooting: 82, passing: 84, dribbling: 84, defending: 80, physical: 84 } },
  "Harry Kane": { club: "Bayern Munich", nationality: "England", stats: { pace: 68, shooting: 93, passing: 84, dribbling: 82, defending: 48, physical: 82 } },
  "Pedri": { club: "FC Barcelona", nationality: "Spain", stats: { pace: 79, shooting: 75, passing: 88, dribbling: 90, defending: 72, physical: 67 } },
  "Vitinha": { club: "Paris Saint-Germain", nationality: "Portugal", stats: { pace: 78, shooting: 78, passing: 87, dribbling: 89, defending: 72, physical: 68 } },
  "Florian Wirtz": { club: "Bayer Leverkusen", nationality: "Germany", stats: { pace: 82, shooting: 83, passing: 88, dribbling: 90, defending: 55, physical: 68 } },
  "Joshua Kimmich": { club: "Bayern Munich", nationality: "Germany", stats: { pace: 70, shooting: 75, passing: 88, dribbling: 84, defending: 83, physical: 79 } },
  "Gabriel Magalhães": { club: "Arsenal", nationality: "Brazil", stats: { pace: 73, shooting: 40, passing: 68, dribbling: 66, defending: 88, physical: 86 } },
  "Alessandro Bastoni": { club: "Inter Milan", nationality: "Italy", stats: { pace: 74, shooting: 42, passing: 77, dribbling: 76, defending: 87, physical: 82 } },
  "Jules Koundé": { club: "FC Barcelona", nationality: "France", stats: { pace: 84, shooting: 46, passing: 76, dribbling: 78, defending: 87, physical: 80 } },
  "William Saliba": { club: "Arsenal", nationality: "France", stats: { pace: 82, shooting: 35, passing: 72, dribbling: 74, defending: 87, physical: 83 } },
};

// Default generator for any player not in custom dictionary
function getDefaultMeta(player) {
  const cat = player.category.toUpperCase();
  const ovr = player.ovr;
  const isGK = player.position === 'GK';

  if (isGK) {
    return {
      club: "Top European Club",
      nationality: "International",
      stats: {
        pace: Math.min(99, Math.round(ovr * 0.95)), // DIV
        shooting: Math.min(99, Math.round(ovr * 0.93)), // HAN
        passing: Math.min(99, Math.round(ovr * 0.90)), // KIC
        dribbling: Math.min(99, Math.round(ovr * 0.98)), // REF
        defending: Math.min(99, Math.round(ovr * 0.55)), // SPD
        physical: Math.min(99, Math.round(ovr * 0.94)) // POS
      }
    };
  }

  if (cat === 'FORWARD') {
    return {
      club: "Premier League / La Liga",
      nationality: "International",
      stats: {
        pace: Math.min(98, Math.round(ovr * 0.96) + (player.position === 'LW' || player.position === 'RW' ? 4 : -2)),
        shooting: Math.min(97, Math.round(ovr * 0.95)),
        passing: Math.min(92, Math.round(ovr * 0.85)),
        dribbling: Math.min(96, Math.round(ovr * 0.94)),
        defending: Math.min(65, Math.round(ovr * 0.42)),
        physical: Math.min(92, Math.round(ovr * 0.86))
      }
    };
  } else if (cat === 'MIDFIELDER') {
    return {
      club: "Elite Club",
      nationality: "International",
      stats: {
        pace: Math.min(90, Math.round(ovr * 0.86)),
        shooting: Math.min(90, Math.round(ovr * 0.84)),
        passing: Math.min(97, Math.round(ovr * 0.95)),
        dribbling: Math.min(95, Math.round(ovr * 0.93)),
        defending: Math.min(90, Math.round(ovr * (player.position === 'CDM' ? 0.92 : 0.75))),
        physical: Math.min(92, Math.round(ovr * 0.86))
      }
    };
  } else {
    // DEFENDER
    return {
      club: "Continental Club",
      nationality: "International",
      stats: {
        pace: Math.min(94, Math.round(ovr * (player.position === 'CB' ? 0.78 : 0.93))),
        shooting: Math.min(70, Math.round(ovr * 0.50)),
        passing: Math.min(88, Math.round(ovr * 0.76)),
        dribbling: Math.min(85, Math.round(ovr * 0.75)),
        defending: Math.min(97, Math.round(ovr * 0.96)),
        physical: Math.min(95, Math.round(ovr * 0.92))
      }
    };
  }
}

// Famous players club & nationality database
const clubMap = {
  "Alexander Isak": { club: "Newcastle United", nationality: "Sweden" },
  "Bukayo Saka": { club: "Arsenal", nationality: "England" },
  "Lautaro Martínez": { club: "Inter Milan", nationality: "Argentina" },
  "Robert Lewandowski": { club: "FC Barcelona", nationality: "Poland" },
  "Julián Álvarez": { club: "Atlético Madrid", nationality: "Argentina" },
  "Khvicha Kvaratskhelia": { club: "Napoli", nationality: "Georgia" },
  "Victor Osimhen": { club: "Galatasaray", nationality: "Nigeria" },
  "Viktor Gyökeres": { club: "Sporting CP", nationality: "Sweden" },
  "Serhou Guirassy": { club: "Borussia Dortmund", nationality: "Guinea" },
  "Lionel Messi": { club: "Inter Miami", nationality: "Argentina" },
  "Antoine Griezmann": { club: "Atlético Madrid", nationality: "France" },
  "Bryan Mbeumo": { club: "Brentford", nationality: "Cameroon" },
  "Cristiano Ronaldo": { club: "Al-Nassr", nationality: "Portugal" },
  "Désiré Doué": { club: "Paris Saint-Germain", nationality: "France" },
  "Heung-min Son": { club: "Tottenham Hotspur", nationality: "South Korea" },
  "Marcus Thuram": { club: "Inter Milan", nationality: "France" },
  "Phil Foden": { club: "Manchester City", nationality: "England" },
  "Rodrygo": { club: "Real Madrid", nationality: "Brazil" },
  "Karim Benzema": { club: "Al-Ittihad", nationality: "France" },
  "Rafael Leão": { club: "AC Milan", nationality: "Portugal" },
  "Raphinha": { club: "FC Barcelona", nationality: "Brazil" },
  "Jamal Musiala": { club: "Bayern Munich", nationality: "Germany" },
  "Alexis Mac Allister": { club: "Liverpool", nationality: "Argentina" },
  "Bruno Fernandes": { club: "Manchester United", nationality: "Portugal" },
  "Cole Palmer": { club: "Chelsea", nationality: "England" },
  "Declan Rice": { club: "Arsenal", nationality: "England" },
  "Frenkie de Jong": { club: "FC Barcelona", nationality: "Netherlands" },
  "Kevin De Bruyne": { club: "Manchester City", nationality: "Belgium" },
  "Martin Ødegaard": { club: "Arsenal", nationality: "Norway" },
  "Moisés Caicedo": { club: "Chelsea", nationality: "Ecuador" },
  "Nicolò Barella": { club: "Inter Milan", nationality: "Italy" },
  "Bruno Guimarães": { club: "Newcastle United", nationality: "Brazil" },
  "Hakan Çalhanoğlu": { club: "Inter Milan", nationality: "Turkey" },
  "Michael Olise": { club: "Bayern Munich", nationality: "France" },
  "Nico Williams": { club: "Athletic Bilbao", nationality: "Spain" },
  "Paulo Dybala": { club: "AS Roma", nationality: "Argentina" },
  "Sandro Tonali": { club: "Newcastle United", nationality: "Italy" },
  "Tijjani Reijnders": { club: "AC Milan", nationality: "Netherlands" },
  "João Neves": { club: "Paris Saint-Germain", nationality: "Portugal" },
  "N'Golo Kanté": { club: "Al-Ittihad", nationality: "France" },
  "Marquinhos": { club: "Paris Saint-Germain", nationality: "Brazil" },
  "Jonathan Tah": { club: "Bayer Leverkusen", nationality: "Germany" },
  "Nuno Mendes": { club: "Paris Saint-Germain", nationality: "Portugal" },
  "Antonio Rüdiger": { club: "Real Madrid", nationality: "Germany" },
  "Ibrahima Konaté": { club: "Liverpool", nationality: "France" },
  "Rúben Dias": { club: "Manchester City", nationality: "Portugal" },
  "Trent Alexander-Arnold": { club: "Liverpool", nationality: "England" },
  "Willian Pacho": { club: "Paris Saint-Germain", nationality: "Ecuador" },
  "Bremer": { club: "Juventus", nationality: "Brazil" },
  "Dani Carvajal": { club: "Real Madrid", nationality: "Spain" },
  "Dayot Upamecano": { club: "Bayern Munich", nationality: "France" },
  "Federico Dimarco": { club: "Inter Milan", nationality: "Italy" },
  "Nico Schlotterbeck": { club: "Borussia Dortmund", nationality: "Germany" },
  "Iñigo Martínez": { club: "FC Barcelona", nationality: "Spain" },
  "Alphonso Davies": { club: "Bayern Munich", nationality: "Canada" },
  "João Cancelo": { club: "Al-Hilal", nationality: "Portugal" },
  "Joško Gvardiol": { club: "Manchester City", nationality: "Croatia" },
  "Theo Hernández": { club: "AC Milan", nationality: "France" },
  "Éder Militão": { club: "Real Madrid", nationality: "Brazil" },
  "Denzel Dumfries": { club: "Inter Milan", nationality: "Netherlands" },
  "Alisson": { club: "Liverpool", nationality: "Brazil" },
  "Gianluigi Donnarumma": { club: "Paris Saint-Germain", nationality: "Italy" },
  "Thibaut Courtois": { club: "Real Madrid", nationality: "Belgium" },
  "Jan Oblak": { club: "Atlético Madrid", nationality: "Slovenia" },
  "David Raya": { club: "Arsenal", nationality: "Spain" },
  "Mike Maignan": { club: "AC Milan", nationality: "France" },
  "Yann Sommer": { club: "Inter Milan", nationality: "Switzerland" },
  "Gregor Kobel": { club: "Borussia Dortmund", nationality: "Switzerland" },
  "Marc-André ter Stegen": { club: "FC Barcelona", nationality: "Germany" },
  "David de Gea": { club: "Fiorentina", nationality: "Spain" },
  "Ederson": { club: "Manchester City", nationality: "Brazil" },
  "Emiliano Martínez": { club: "Aston Villa", nationality: "Argentina" },
  "Unai Simón": { club: "Athletic Bilbao", nationality: "Spain" },
  "Péter Gulácsi": { club: "RB Leipzig", nationality: "Hungary" },
  "Diogo Costa": { club: "FC Porto", nationality: "Portugal" },
  "Giorgi Mamardashvili": { club: "Valencia", nationality: "Georgia" },
  "Jordan Pickford": { club: "Everton", nationality: "England" },
  "Manuel Neuer": { club: "Bayern Munich", nationality: "Germany" },
  "Wojciech Szczęsny": { club: "FC Barcelona", nationality: "Poland" },
  "Lucas Chevalier": { club: "Lille", nationality: "France" }
};

const fullPlayers = parsed.map((p, index) => {
  const meta = playerMeta[p.name] || getDefaultMeta(p);
  const clubInfo = clubMap[p.name] || {};
  const club = clubInfo.club || meta.club || "European FC";
  const nationality = clubInfo.nationality || meta.nationality || "International";

  let photo = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop";
  if (p.name === "Kylian Mbappé") photo = "/images/mbappe_card.png";
  else if (p.name === "Erling Haaland") photo = "/images/haaland_card.png";

  const posCat = p.category.toUpperCase();
  const position = p.position;

  return {
    id: `p-${index + 1}`,
    name: p.name,
    photo,
    currentClub: club,
    position: position,
    positionCategory: posCat === "MIDFIELDER" ? "MIDFIELDER" : posCat === "FORWARD" ? "FORWARD" : posCat === "DEFENDER" ? "DEFENDER" : "GOALKEEPER",
    primaryPosition: position,
    nationality: nationality,
    basePrice: p.basePrice,
    status: "upcoming",
    setId: p.setId,
    setName: p.setName,
    orderInSet: p.order,
    notes: p.notes,
    stats: {
      pace: meta.stats?.pace || Math.round(p.ovr * 0.9),
      shooting: meta.stats?.shooting || Math.round(p.ovr * 0.88),
      passing: meta.stats?.passing || Math.round(p.ovr * 0.85),
      dribbling: meta.stats?.dribbling || Math.round(p.ovr * 0.9),
      defending: meta.stats?.defending || Math.round(p.ovr * 0.6),
      physical: meta.stats?.physical || Math.round(p.ovr * 0.85),
      overall: p.ovr
    }
  };
});

const outContent = `import type { Player } from '../types/auction.ts';

// 200 Top-flight World Football Players for Moneyball Auction
// Formatted directly according to Moneyball 200 Player Auction Pool document
export const INITIAL_PLAYERS: Player[] = ${JSON.stringify(fullPlayers, null, 2)};
`;

fs.writeFileSync('src/data/initialPlayers.ts', outContent);
console.log("Successfully wrote 200 players to src/data/initialPlayers.ts!");
