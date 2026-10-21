import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  AuctionState,
  Player,
  Team,
  AuctionConfig,
  SoldNotification,
  GlobalEventState,
  QualificationStatus,
  PlayerSet,
  TransferOffer,
  TransactionRecord,
  CallStage,
  LiveBiddingState,
} from './src/types/auction.ts';
import { INITIAL_PLAYERS } from './src/data/initialPlayers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

// 10 Official Moneyball Franchise Teams with £500M Starting Purse
const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-titans',
    username: 'titans',
    password: 'password123',
    teamName: 'Titans',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop',
    color: '#3D5AFE',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Titans Syndicate',
    boughtPlayers: [],
  },
  {
    id: 'team-phoenix',
    username: 'phoenix',
    password: 'password123',
    teamName: 'Phoenix',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop',
    color: '#FF3D00',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Phoenix Ventures',
    boughtPlayers: [],
  },
  {
    id: 'team-warriors',
    username: 'warriors',
    password: 'password123',
    teamName: 'Warriors',
    logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=300&auto=format&fit=crop',
    color: '#00C853',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Warriors Capital',
    boughtPlayers: [],
  },
  {
    id: 'team-galacticos',
    username: 'galacticos',
    password: 'password123',
    teamName: 'Galacticos',
    logo: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=300&auto=format&fit=crop',
    color: '#FFD600',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Galacticos Group',
    boughtPlayers: [],
  },
  {
    id: 'team-apexfc',
    username: 'apexfc',
    password: 'password123',
    teamName: 'Apex FC',
    logo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=300&auto=format&fit=crop',
    color: '#D500F9',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Apex Holdings',
    boughtPlayers: [],
  },
  {
    id: 'team-vanguard',
    username: 'vanguard',
    password: 'password123',
    teamName: 'Vanguard',
    logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=300&auto=format&fit=crop',
    color: '#00E5FF',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Vanguard Sports',
    boughtPlayers: [],
  },
  {
    id: 'team-spartans',
    username: 'spartans',
    password: 'password123',
    teamName: 'Spartans',
    logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=300&auto=format&fit=crop',
    color: '#FF6D00',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Spartans Athletic',
    boughtPlayers: [],
  },
  {
    id: 'team-eclipse',
    username: 'eclipse',
    password: 'password123',
    teamName: 'Eclipse',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop',
    color: '#7C4DFF',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Eclipse Collective',
    boughtPlayers: [],
  },
  {
    id: 'team-dynamo',
    username: 'dynamo',
    password: 'password123',
    teamName: 'Dynamo',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=300&auto=format&fit=crop',
    color: '#00B0FF',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Dynamo Global',
    boughtPlayers: [],
  },
  {
    id: 'team-renegades',
    username: 'renegades',
    password: 'password123',
    teamName: 'Renegades',
    logo: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=300&auto=format&fit=crop',
    color: '#FF1744',
    startingBalance: 500,
    remainingBalance: 500,
    maxSquadSize: 15,
    minSquadSize: 13,
    qualificationStatus: 'UNASSIGNED',
    ownerName: 'Renegades FC',
    boughtPlayers: [],
  },
];

// Username alias map for backward compatibility with existing credentials
const USERNAME_ALIASES: Record<string, string> = {
  barcelona: 'titans',
  realmadrid: 'phoenix',
  manunited: 'warriors',
  mancity: 'galacticos',
  liverpool: 'apexfc',
  intermilan: 'vanguard',
  juventus: 'spartans',
  intermiami: 'eclipse',
  alnassar: 'dynamo',
  psg: 'renegades',
};

// 10 Official Auction Sets
const INITIAL_SETS: PlayerSet[] = [
  { id: 1, name: 'Marquee Players', displayOrder: 1, status: 'LIVE' },
  { id: 2, name: 'Elite Forwards', displayOrder: 2, status: 'UPCOMING' },
  { id: 3, name: 'Elite Midfielders', displayOrder: 3, status: 'UPCOMING' },
  { id: 4, name: 'Elite Defenders', displayOrder: 4, status: 'UPCOMING' },
  { id: 5, name: 'Goalkeepers', displayOrder: 5, status: 'UPCOMING' },
  { id: 6, name: 'Premium Forwards', displayOrder: 6, status: 'UPCOMING' },
  { id: 7, name: 'Premium Midfielders', displayOrder: 7, status: 'UPCOMING' },
  { id: 8, name: 'Premium Defenders', displayOrder: 8, status: 'UPCOMING' },
  { id: 9, name: 'Value & Utility', displayOrder: 9, status: 'UPCOMING' },
  { id: 10, name: 'Bargains & Wildcards', displayOrder: 10, status: 'UPCOMING' },
];

const INITIAL_CONFIG: AuctionConfig = {
  eventName: "Moneyball '26 — Live Player Auction & Transfer Market",
  tagline: "10 Franchises · £500M Starting Budget · 200 Elite Footballers",
  startTime: '2026-10-20T10:00:00.000Z',
  detailsText:
    'Official Moneyball auction platform featuring verbal bid recording, real-time WebSocket synchronization, squad constraints (13-15 players), and post-league transfer market.',
  rules: [
    'Each franchise receives an equal starting purse of £500M.',
    'Squad constraint: Minimum 13, Maximum 15 players with at least 1 Goalkeeper.',
    'Bids are placed verbally in the room; the Auctioneer enters bids instantaneously into the platform.',
    'Gavel stages: Going Once... Going Twice... Sold! Decisions by the Auctioneer are final.',
    'Post-league Transfer Market: Top 4 teams negotiate private transfers exclusively with Bottom 6 teams.',
  ],
  introVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  minBidIncrement: 2.5,
  currencySymbol: '£',
  currencyUnit: 'M',
  startingPurse: 500,
  maxSquadSize: 15,
  minSquadSize: 13,
};

const firstPlayer = INITIAL_PLAYERS[0];

// In-memory persistent server state
let auctionState: AuctionState = {
  globalState: 'AUCTION_LIVE',
  status: 'live',
  currentPlayerId: firstPlayer ? firstPlayer.id : 'p-1',
  activeSetId: 1,
  liveBidding: {
    playerId: firstPlayer ? firstPlayer.id : 'p-1',
    currentBid: firstPlayer ? firstPlayer.basePrice : 60,
    currentBidderTeamId: null,
    currentBidderTeamName: null,
    callStage: 'NORMAL',
    lastBidTimestamp: null,
  },
  config: { ...INITIAL_CONFIG },
  playerSets: JSON.parse(JSON.stringify(INITIAL_SETS)),
  teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
  players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
  salesHistory: [],
  transferOffers: [],
  transactions: [],
  recentSoldNotification: null,
  lastUpdated: new Date().toISOString(),
};

// WebSocket connected clients
const wsClients = new Set<WebSocket>();
// SSE connected clients
const sseClients = new Set<Response>();

function broadcast(eventType: string, data: any) {
  const payloadStr = JSON.stringify({ type: eventType, payload: data });

  // Broadcast to WebSocket clients
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(payloadStr);
      } catch {
        wsClients.delete(client);
      }
    }
  }

  // Broadcast to SSE clients
  const ssePayload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(ssePayload);
    } catch {
      sseClients.delete(client);
    }
  }
}

function broadcastStateUpdate() {
  auctionState.lastUpdated = new Date().toISOString();
  broadcast('STATE_UPDATE', auctionState);
  broadcast('state_update', auctionState); // backward compat
}

function syncPlayerCards() {
  for (const initPlayer of INITIAL_PLAYERS) {
    const p = auctionState.players.find((pl) => pl.id === initPlayer.id);
    if (p) {
      p.stats = { ...initPlayer.stats };
      p.photo = initPlayer.photo;
      p.position = initPlayer.position;
      p.currentClub = initPlayer.currentClub;
      p.nationality = initPlayer.nationality;
      p.name = initPlayer.name;
      p.setId = initPlayer.setId;
      p.setName = initPlayer.setName;
      p.orderInSet = initPlayer.orderInSet;
      p.positionCategory = initPlayer.positionCategory;
      p.primaryPosition = initPlayer.primaryPosition;
      p.notes = initPlayer.notes;
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);

  // WebSocket Server on /ws
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    wsClients.add(ws);

    // Send full current state on connection
    ws.send(JSON.stringify({ type: 'INIT_STATE', payload: auctionState }));

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch {
        // ignore malformed message
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.on('error', () => {
      wsClients.delete(ws);
    });
  });

  // SSE Stream endpoint for fallback
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sseClients.add(res);

    res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`);
    res.write(`event: state_update\ndata: ${JSON.stringify(auctionState)}\n\n`);

    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(keepAlive);
      sseClients.delete(res);
    });
  });

  // State fetch
  app.get('/api/state', (_req: Request, res: Response) => {
    syncPlayerCards();
    res.json(auctionState);
  });

  // Authentication
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    let trimmedUser = String(username).trim().toLowerCase();
    const trimmedPass = String(password).trim();

    if (USERNAME_ALIASES[trimmedUser]) {
      trimmedUser = USERNAME_ALIASES[trimmedUser];
    }

    if (trimmedUser === 'admin' && (trimmedPass === 'moneyball2026' || trimmedPass === 'admin123' || trimmedPass === 'admin')) {
      return res.json({
        success: true,
        user: {
          id: 'user-admin',
          username: 'admin',
          role: 'admin',
        },
      });
    }

    const team = auctionState.teams.find(
      (t) => t.username.toLowerCase() === trimmedUser && t.password === trimmedPass
    );

    if (team) {
      return res.json({
        success: true,
        user: {
          id: `user-${team.id}`,
          username: team.username,
          role: 'team',
          teamId: team.id,
          teamName: team.teamName,
          color: team.color,
        },
      });
    }

    return res.status(401).json({ error: 'Invalid credentials. Please verify your team username and password.' });
  });

  // ADMIN: Set Global Event State
  app.post('/api/admin/set-global-state', (req: Request, res: Response) => {
    const { globalState } = req.body;
    const validStates: GlobalEventState[] = [
      'SETUP',
      'AUCTION_LIVE',
      'AUCTION_CLOSED',
      'TRANSFER_MARKET_LIVE',
      'TRANSFER_MARKET_CLOSED',
    ];

    if (!validStates.includes(globalState)) {
      return res.status(400).json({ error: 'Invalid global state' });
    }

    auctionState.globalState = globalState;

    if (globalState === 'AUCTION_LIVE') {
      auctionState.status = 'live';
    } else if (globalState === 'AUCTION_CLOSED' || globalState === 'TRANSFER_MARKET_CLOSED') {
      auctionState.status = 'ended';
      auctionState.liveBidding.callStage = 'NORMAL';
    }

    // When opening Transfer Market, mark Bottom 6 players as TRANSFER_AVAILABLE
    if (globalState === 'TRANSFER_MARKET_LIVE') {
      const bottom6TeamIds = auctionState.teams
        .filter((t) => t.qualificationStatus === 'BOTTOM_6')
        .map((t) => t.id);

      for (const player of auctionState.players) {
        if (player.status === 'sold' && player.soldToTeamId && bottom6TeamIds.includes(player.soldToTeamId)) {
          player.status = 'transfer_available';
        }
      }
    }

    broadcast('GLOBAL_STATE_CHANGED', { globalState });
    broadcastStateUpdate();
    res.json({ success: true, globalState: auctionState.globalState });
  });

  // ADMIN: Assign Team Qualification (TOP_4, BOTTOM_6, UNASSIGNED)
  app.post('/api/admin/set-qualification', (req: Request, res: Response) => {
    const { teamId, qualificationStatus } = req.body;
    const valid: QualificationStatus[] = ['TOP_4', 'BOTTOM_6', 'UNASSIGNED'];
    if (!valid.includes(qualificationStatus)) {
      return res.status(400).json({ error: 'Invalid qualification status' });
    }

    const team = auctionState.teams.find((t) => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    team.qualificationStatus = qualificationStatus;

    // If transfer market is live, update player statuses accordingly
    if (auctionState.globalState === 'TRANSFER_MARKET_LIVE') {
      for (const p of auctionState.players) {
        if (p.soldToTeamId === team.id) {
          if (qualificationStatus === 'BOTTOM_6' && p.status === 'sold') {
            p.status = 'transfer_available';
          } else if (qualificationStatus === 'TOP_4' && p.status === 'transfer_available') {
            p.status = 'sold';
          }
        }
      }
    }

    broadcastStateUpdate();
    res.json({ success: true, team });
  });

  // ADMIN: Record Verbal Bid (+£5M, -£5M, or direct custom bid amount)
  app.post('/api/admin/set-bid', (req: Request, res: Response) => {
    const { amount, teamId } = req.body;
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Valid bid amount is required' });
    }

    const team = auctionState.teams.find((t) => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Bid validation: purse check
    if (numericAmount > team.remainingBalance) {
      return res.status(400).json({
        error: `Insufficient purse! ${team.teamName} has only £${team.remainingBalance}M remaining.`,
      });
    }

    // Bid validation: squad size limit (15)
    if (team.boughtPlayers.length >= team.maxSquadSize) {
      return res.status(400).json({
        error: `Squad is full! ${team.teamName} already reached maximum ${team.maxSquadSize} players.`,
      });
    }

    auctionState.liveBidding = {
      playerId: auctionState.currentPlayerId,
      currentBid: numericAmount,
      currentBidderTeamId: team.id,
      currentBidderTeamName: team.teamName,
      callStage: 'NORMAL',
      lastBidTimestamp: new Date().toISOString(),
    };

    broadcast('BID_UPDATE', auctionState.liveBidding);
    broadcastStateUpdate();
    res.json({ success: true, liveBidding: auctionState.liveBidding });
  });

  // ADMIN: Set Call Stage (NORMAL, GOING_ONCE, GOING_TWICE, SOLD)
  app.post('/api/admin/call-stage', (req: Request, res: Response) => {
    const { callStage } = req.body;
    const validStages: CallStage[] = ['NORMAL', 'GOING_ONCE', 'GOING_TWICE', 'SOLD'];
    if (!validStages.includes(callStage)) {
      return res.status(400).json({ error: 'Invalid call stage' });
    }

    auctionState.liveBidding.callStage = callStage;
    broadcast('CALL_STAGE_UPDATE', { callStage });
    broadcastStateUpdate();
    res.json({ success: true, callStage });
  });

  // ADMIN: Switch Active Player Set (1-10)
  app.post('/api/admin/set-active-set', (req: Request, res: Response) => {
    const { setId } = req.body;
    const numId = Number(setId);
    const targetSet = auctionState.playerSets.find((s) => s.id === numId);
    if (!targetSet) {
      return res.status(404).json({ error: 'Set not found' });
    }

    auctionState.activeSetId = numId;

    // Find first available player in this set
    const playerInSet = auctionState.players.find(
      (p) => p.setId === numId && p.status === 'upcoming'
    );

    if (playerInSet) {
      auctionState.currentPlayerId = playerInSet.id;
      auctionState.liveBidding = {
        playerId: playerInSet.id,
        currentBid: playerInSet.basePrice,
        currentBidderTeamId: null,
        currentBidderTeamName: null,
        callStage: 'NORMAL',
        lastBidTimestamp: null,
      };
    }

    broadcastStateUpdate();
    res.json({ success: true, activeSetId: numId, currentPlayerId: auctionState.currentPlayerId });
  });

  // ADMIN: Set current player
  app.post('/api/admin/set-player', (req: Request, res: Response) => {
    const { playerId } = req.body;
    const player = auctionState.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    auctionState.currentPlayerId = player.id;
    if (player.setId) {
      auctionState.activeSetId = player.setId;
    }

    auctionState.liveBidding = {
      playerId: player.id,
      currentBid: player.basePrice,
      currentBidderTeamId: null,
      currentBidderTeamName: null,
      callStage: 'NORMAL',
      lastBidTimestamp: null,
    };

    broadcast('player_changed', { player, liveBidding: auctionState.liveBidding });
    broadcastStateUpdate();
    res.json({ success: true, currentPlayerId: player.id });
  });

  // ADMIN: Next player
  app.post('/api/admin/next-player', (_req: Request, res: Response) => {
    const currentIndex = auctionState.players.findIndex((p) => p.id === auctionState.currentPlayerId);
    let nextIndex = currentIndex + 1;
    if (nextIndex >= auctionState.players.length) nextIndex = 0;

    const nextPlayer = auctionState.players[nextIndex];
    auctionState.currentPlayerId = nextPlayer.id;
    if (nextPlayer.setId) auctionState.activeSetId = nextPlayer.setId;

    auctionState.liveBidding = {
      playerId: nextPlayer.id,
      currentBid: nextPlayer.basePrice,
      currentBidderTeamId: null,
      currentBidderTeamName: null,
      callStage: 'NORMAL',
      lastBidTimestamp: null,
    };

    broadcast('player_changed', { player: nextPlayer, liveBidding: auctionState.liveBidding });
    broadcastStateUpdate();
    res.json({ success: true, currentPlayerId: nextPlayer.id });
  });

  // ADMIN: Previous player
  app.post('/api/admin/prev-player', (_req: Request, res: Response) => {
    const currentIndex = auctionState.players.findIndex((p) => p.id === auctionState.currentPlayerId);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = auctionState.players.length - 1;

    const prevPlayer = auctionState.players[prevIndex];
    auctionState.currentPlayerId = prevPlayer.id;
    if (prevPlayer.setId) auctionState.activeSetId = prevPlayer.setId;

    auctionState.liveBidding = {
      playerId: prevPlayer.id,
      currentBid: prevPlayer.basePrice,
      currentBidderTeamId: null,
      currentBidderTeamName: null,
      callStage: 'NORMAL',
      lastBidTimestamp: null,
    };

    broadcast('player_changed', { player: prevPlayer, liveBidding: auctionState.liveBidding });
    broadcastStateUpdate();
    res.json({ success: true, currentPlayerId: prevPlayer.id });
  });

  // ADMIN: Mark SOLD
  app.post('/api/admin/sell', (req: Request, res: Response) => {
    const { playerId, teamId, soldPrice } = req.body;
    const finalPrice = Number(soldPrice ?? auctionState.liveBidding.currentBid);

    const player = auctionState.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const team = auctionState.teams.find((t) => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (finalPrice <= 0 || isNaN(finalPrice)) {
      return res.status(400).json({ error: 'Valid sale price is required' });
    }

    // Validate Purse
    if (team.remainingBalance < finalPrice) {
      return res.status(400).json({
        error: `Insufficient purse! ${team.teamName} has only £${team.remainingBalance}M remaining.`,
      });
    }

    // Validate Squad Limit (15)
    if (team.boughtPlayers.length >= team.maxSquadSize) {
      return res.status(400).json({
        error: `Squad is full! ${team.teamName} already reached ${team.maxSquadSize} players.`,
      });
    }

    const now = new Date().toISOString();

    // Deduct purse
    team.remainingBalance = Number((team.remainingBalance - finalPrice).toFixed(1));

    // Add to bought players
    team.boughtPlayers.push({
      playerId: player.id,
      playerName: player.name,
      playerPhoto: player.photo,
      club: player.currentClub,
      position: player.position,
      price: finalPrice,
      soldTimestamp: now,
    });

    // Update player status
    player.status = 'sold';
    player.soldPrice = finalPrice;
    player.soldToTeamId = team.id;
    player.soldToTeamName = team.teamName;
    player.soldTimestamp = now;

    // Record in transaction audit log
    const txRecord: TransactionRecord = {
      id: `tx-auc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: player.id,
      playerName: player.name,
      buyerTeamId: team.id,
      buyerTeamName: team.teamName,
      amount: finalPrice,
      transactionType: 'AUCTION',
      timestamp: now,
      notes: `Auction Gavel: Base £${player.basePrice}M → Sold £${finalPrice}M`,
    };
    auctionState.transactions.unshift(txRecord);

    // Record sales history
    auctionState.salesHistory.unshift({
      id: `sale-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      club: player.currentClub,
      teamId: team.id,
      teamName: team.teamName,
      basePrice: player.basePrice,
      soldPrice: finalPrice,
      timestamp: now,
    });

    const notif: SoldNotification = {
      id: `notif-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      playerPhoto: player.photo,
      club: player.currentClub,
      teamId: team.id,
      teamName: team.teamName,
      teamColor: team.color,
      teamLogo: team.logo,
      soldPrice: finalPrice,
      timestamp: now,
    };
    auctionState.recentSoldNotification = notif;
    auctionState.liveBidding.callStage = 'SOLD';

    // Auto-advance to next upcoming player
    const nextUpcoming = auctionState.players.find((p) => p.status === 'upcoming');
    if (nextUpcoming) {
      auctionState.currentPlayerId = nextUpcoming.id;
      if (nextUpcoming.setId) auctionState.activeSetId = nextUpcoming.setId;
      auctionState.liveBidding = {
        playerId: nextUpcoming.id,
        currentBid: nextUpcoming.basePrice,
        currentBidderTeamId: null,
        currentBidderTeamName: null,
        callStage: 'NORMAL',
        lastBidTimestamp: null,
      };
    }

    broadcast('player_sold', notif);
    broadcastStateUpdate();

    res.json({ success: true, notification: notif, remainingBalance: team.remainingBalance });
  });

  // ADMIN: Mark UNSOLD
  app.post('/api/admin/unsold', (req: Request, res: Response) => {
    const { playerId } = req.body;
    const player = auctionState.players.find((p) => p.id === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    player.status = 'unsold';

    // Auto-advance to next upcoming player
    const nextUpcoming = auctionState.players.find((p) => p.status === 'upcoming');
    if (nextUpcoming) {
      auctionState.currentPlayerId = nextUpcoming.id;
      if (nextUpcoming.setId) auctionState.activeSetId = nextUpcoming.setId;
      auctionState.liveBidding = {
        playerId: nextUpcoming.id,
        currentBid: nextUpcoming.basePrice,
        currentBidderTeamId: null,
        currentBidderTeamName: null,
        callStage: 'NORMAL',
        lastBidTimestamp: null,
      };
    }

    broadcast('player_unsold', { player });
    broadcastStateUpdate();
    res.json({ success: true, player });
  });

  // ADMIN: Edit Sale / Admin Correction
  app.post('/api/admin/edit-sale', (req: Request, res: Response) => {
    const { playerId, newTeamId, newSoldPrice } = req.body;
    const player = auctionState.players.find((p) => p.id === playerId);
    if (!player || player.status !== 'sold' || !player.soldToTeamId) {
      return res.status(400).json({ error: 'Only sold players can have sales edited' });
    }

    const oldTeamId = player.soldToTeamId;
    const oldPrice = Number(player.soldPrice || 0);
    const newPrice = Number(newSoldPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      return res.status(400).json({ error: 'Valid new price is required' });
    }

    const oldTeam = auctionState.teams.find((t) => t.id === oldTeamId);
    const targetTeam = auctionState.teams.find((t) => t.id === newTeamId);

    if (!targetTeam) {
      return res.status(404).json({ error: 'Target team not found' });
    }

    // Refund old team
    if (oldTeam) {
      oldTeam.remainingBalance = Number((oldTeam.remainingBalance + oldPrice).toFixed(1));
      oldTeam.boughtPlayers = oldTeam.boughtPlayers.filter((p) => p.playerId !== player.id);
    }

    // Validate new team's purse
    if (targetTeam.remainingBalance < newPrice) {
      if (oldTeam) {
        oldTeam.remainingBalance = Number((oldTeam.remainingBalance - oldPrice).toFixed(1));
        oldTeam.boughtPlayers.push({
          playerId: player.id,
          playerName: player.name,
          playerPhoto: player.photo,
          club: player.currentClub,
          position: player.position,
          price: oldPrice,
          soldTimestamp: player.soldTimestamp || new Date().toISOString(),
        });
      }
      return res.status(400).json({
        error: `Insufficient purse! ${targetTeam.teamName} only has £${targetTeam.remainingBalance}M remaining.`,
      });
    }

    // Deduct new team
    targetTeam.remainingBalance = Number((targetTeam.remainingBalance - newPrice).toFixed(1));
    targetTeam.boughtPlayers.push({
      playerId: player.id,
      playerName: player.name,
      playerPhoto: player.photo,
      club: player.currentClub,
      position: player.position,
      price: newPrice,
      soldTimestamp: new Date().toISOString(),
    });

    player.soldPrice = newPrice;
    player.soldToTeamId = targetTeam.id;
    player.soldToTeamName = targetTeam.teamName;

    // Log admin correction transaction
    const txCorrection: TransactionRecord = {
      id: `tx-corr-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      buyerTeamId: targetTeam.id,
      buyerTeamName: targetTeam.teamName,
      sellerTeamId: oldTeamId !== targetTeam.id ? oldTeamId : undefined,
      sellerTeamName: oldTeamId !== targetTeam.id ? oldTeam?.teamName : undefined,
      amount: newPrice,
      transactionType: 'ADMIN_CORRECTION',
      timestamp: new Date().toISOString(),
      notes: `Admin corrected sale from £${oldPrice}M to £${newPrice}M (${targetTeam.teamName})`,
    };
    auctionState.transactions.unshift(txCorrection);

    broadcastStateUpdate();
    res.json({ success: true, player, transactions: auctionState.transactions });
  });

  // TRANSFER MARKET: Top 4 sends monetary offer to Bottom 6 player
  app.post('/api/transfer/offer', (req: Request, res: Response) => {
    if (auctionState.globalState !== 'TRANSFER_MARKET_LIVE') {
      return res.status(403).json({ error: 'Transfer market is not currently open' });
    }

    const { playerId, buyerTeamId, amount } = req.body;
    const offerAmount = Number(amount);

    if (isNaN(offerAmount) || offerAmount <= 0) {
      return res.status(400).json({ error: 'Valid transfer offer amount is required' });
    }

    const buyer = auctionState.teams.find((t) => t.id === buyerTeamId);
    if (!buyer || buyer.qualificationStatus !== 'TOP_4') {
      return res.status(403).json({ error: 'Only Top 4 teams can submit purchase offers' });
    }

    if (buyer.remainingBalance < offerAmount) {
      return res.status(400).json({
        error: `Insufficient purse! Your franchise has £${buyer.remainingBalance}M remaining.`,
      });
    }

    if (buyer.boughtPlayers.length >= buyer.maxSquadSize) {
      return res.status(400).json({
        error: `Squad is at capacity (${buyer.maxSquadSize} players).`,
      });
    }

    const player = auctionState.players.find((p) => p.id === playerId);
    if (!player || (player.status !== 'transfer_available' && player.status !== 'sold')) {
      return res.status(404).json({ error: 'Player is not eligible for transfer' });
    }

    const seller = auctionState.teams.find((t) => t.id === player.soldToTeamId);
    if (!seller || seller.qualificationStatus !== 'BOTTOM_6') {
      return res.status(400).json({ error: 'Can only purchase players owned by Bottom 6 franchises' });
    }

    // Check if buyer already has an active offer for this player
    const existing = auctionState.transferOffers.find(
      (o) =>
        o.playerId === player.id &&
        o.buyerTeamId === buyer.id &&
        (o.status === 'PENDING' || o.status === 'COUNTERED')
    );

    const now = new Date().toISOString();
    const entry = {
      id: `neg-${Date.now()}`,
      senderTeamId: buyer.id,
      senderTeamName: buyer.teamName,
      amount: offerAmount,
      actionType: 'OFFER' as const,
      timestamp: now,
    };

    if (existing) {
      existing.currentAmount = offerAmount;
      existing.status = 'PENDING';
      existing.history.push(entry);
      existing.updatedAt = now;
    } else {
      const newOffer: TransferOffer = {
        id: `offer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        playerId: player.id,
        playerName: player.name,
        playerPhoto: player.photo,
        playerRating: player.stats.overall,
        playerPosition: player.position,
        buyerTeamId: buyer.id,
        buyerTeamName: buyer.teamName,
        sellerTeamId: seller.id,
        sellerTeamName: seller.teamName,
        currentAmount: offerAmount,
        status: 'PENDING',
        history: [entry],
        createdAt: now,
        updatedAt: now,
      };
      auctionState.transferOffers.unshift(newOffer);
    }

    broadcast('TRANSFER_OFFER_UPDATED', { playerId: player.id });
    broadcastStateUpdate();
    res.json({ success: true, message: 'Transfer offer submitted successfully' });
  });

  // TRANSFER MARKET: Seller Counters with new price
  app.post('/api/transfer/counter', (req: Request, res: Response) => {
    if (auctionState.globalState !== 'TRANSFER_MARKET_LIVE') {
      return res.status(403).json({ error: 'Transfer market is not currently open' });
    }

    const { offerId, sellerTeamId, amount } = req.body;
    const counterAmount = Number(amount);

    if (isNaN(counterAmount) || counterAmount <= 0) {
      return res.status(400).json({ error: 'Valid counter amount is required' });
    }

    const offer = auctionState.transferOffers.find((o) => o.id === offerId);
    if (!offer || (offer.status !== 'PENDING' && offer.status !== 'COUNTERED')) {
      return res.status(404).json({ error: 'Active transfer offer not found' });
    }

    if (offer.sellerTeamId !== sellerTeamId) {
      return res.status(403).json({ error: 'Unauthorized seller' });
    }

    const now = new Date().toISOString();
    offer.currentAmount = counterAmount;
    offer.status = 'COUNTERED';
    offer.history.push({
      id: `neg-${Date.now()}`,
      senderTeamId: sellerTeamId,
      senderTeamName: offer.sellerTeamName,
      amount: counterAmount,
      actionType: 'COUNTER',
      timestamp: now,
    });
    offer.updatedAt = now;

    broadcast('TRANSFER_OFFER_UPDATED', { offerId });
    broadcastStateUpdate();
    res.json({ success: true, offer });
  });

  // TRANSFER MARKET: Accept Offer and Confirm Deal
  app.post('/api/transfer/accept', (req: Request, res: Response) => {
    if (auctionState.globalState !== 'TRANSFER_MARKET_LIVE') {
      return res.status(403).json({ error: 'Transfer market is not currently open' });
    }

    const { offerId, teamId } = req.body;
    const offer = auctionState.transferOffers.find((o) => o.id === offerId);
    if (!offer || (offer.status !== 'PENDING' && offer.status !== 'COUNTERED')) {
      return res.status(404).json({ error: 'Active transfer offer not found' });
    }

    // Either buyer or seller can accept the pending/countered terms
    if (offer.buyerTeamId !== teamId && offer.sellerTeamId !== teamId) {
      return res.status(403).json({ error: 'Unauthorized party' });
    }

    const buyer = auctionState.teams.find((t) => t.id === offer.buyerTeamId);
    const seller = auctionState.teams.find((t) => t.id === offer.sellerTeamId);
    const player = auctionState.players.find((p) => p.id === offer.playerId);

    if (!buyer || !seller || !player) {
      return res.status(404).json({ error: 'Buyer, seller or player not found' });
    }

    const transferFee = offer.currentAmount;

    // Validate Buyer Purse
    if (buyer.remainingBalance < transferFee) {
      return res.status(400).json({
        error: `Buyer has insufficient purse (£${buyer.remainingBalance}M remaining).`,
      });
    }

    // Validate Buyer Squad Limit
    if (buyer.boughtPlayers.length >= buyer.maxSquadSize) {
      return res.status(400).json({
        error: `Buyer squad limit reached (${buyer.maxSquadSize} max).`,
      });
    }

    const now = new Date().toISOString();

    // 1. Deduct fee from buyer, add to seller
    buyer.remainingBalance = Number((buyer.remainingBalance - transferFee).toFixed(1));
    seller.remainingBalance = Number((seller.remainingBalance + transferFee).toFixed(1));

    // 2. Remove player from seller squad, add to buyer squad
    seller.boughtPlayers = seller.boughtPlayers.filter((p) => p.playerId !== player.id);
    buyer.boughtPlayers.push({
      playerId: player.id,
      playerName: player.name,
      playerPhoto: player.photo,
      club: player.currentClub,
      position: player.position,
      price: transferFee,
      soldTimestamp: now,
    });

    // 3. Update player ownership & status
    player.status = 'transferred';
    player.soldPrice = transferFee;
    player.soldToTeamId = buyer.id;
    player.soldToTeamName = buyer.teamName;
    player.soldTimestamp = now;

    // 4. Update this offer to ACCEPTED
    offer.status = 'ACCEPTED';
    offer.history.push({
      id: `neg-${Date.now()}`,
      senderTeamId: teamId,
      senderTeamName: teamId === buyer.id ? buyer.teamName : seller.teamName,
      amount: transferFee,
      actionType: 'ACCEPT',
      timestamp: now,
    });
    offer.updatedAt = now;

    // 5. Close competing offers for this player
    for (const otherOffer of auctionState.transferOffers) {
      if (otherOffer.id !== offer.id && otherOffer.playerId === player.id && (otherOffer.status === 'PENDING' || otherOffer.status === 'COUNTERED')) {
        otherOffer.status = 'EXPIRED';
        otherOffer.history.push({
          id: `neg-${Date.now()}`,
          senderTeamId: 'system',
          senderTeamName: 'Transfer Market Protocol',
          amount: otherOffer.currentAmount,
          actionType: 'WITHDRAW',
          timestamp: now,
        });
      }
    }

    // 6. Record transaction in audit log
    const txTransfer: TransactionRecord = {
      id: `tx-tf-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      buyerTeamId: buyer.id,
      buyerTeamName: buyer.teamName,
      sellerTeamId: seller.id,
      sellerTeamName: seller.teamName,
      amount: transferFee,
      transactionType: 'TRANSFER',
      timestamp: now,
      notes: `Transfer Agreed: ${seller.teamName} → ${buyer.teamName} for £${transferFee}M`,
    };
    auctionState.transactions.unshift(txTransfer);

    broadcast('TRANSFER_CONFIRMED', {
      transferOffer: offer,
      transaction: txTransfer,
      buyerPurse: buyer.remainingBalance,
      sellerPurse: seller.remainingBalance,
    });
    broadcastStateUpdate();

    res.json({ success: true, message: 'Transfer successfully confirmed and executed!' });
  });

  // TRANSFER MARKET: Reject Offer
  app.post('/api/transfer/reject', (req: Request, res: Response) => {
    const { offerId, teamId } = req.body;
    const offer = auctionState.transferOffers.find((o) => o.id === offerId);
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    const now = new Date().toISOString();
    offer.status = 'REJECTED';
    offer.history.push({
      id: `neg-${Date.now()}`,
      senderTeamId: teamId,
      senderTeamName: teamId === offer.sellerTeamId ? offer.sellerTeamName : offer.buyerTeamName,
      amount: offer.currentAmount,
      actionType: 'REJECT',
      timestamp: now,
    });
    offer.updatedAt = now;

    broadcast('TRANSFER_OFFER_UPDATED', { offerId });
    broadcastStateUpdate();
    res.json({ success: true, offer });
  });

  // TRANSFER MARKET: Withdraw Offer
  app.post('/api/transfer/withdraw', (req: Request, res: Response) => {
    const { offerId, buyerTeamId } = req.body;
    const offer = auctionState.transferOffers.find((o) => o.id === offerId);
    if (!offer || offer.buyerTeamId !== buyerTeamId) {
      return res.status(403).json({ error: 'Unauthorized to withdraw this offer' });
    }

    const now = new Date().toISOString();
    offer.status = 'WITHDRAWN';
    offer.history.push({
      id: `neg-${Date.now()}`,
      senderTeamId: buyerTeamId,
      senderTeamName: offer.buyerTeamName,
      amount: offer.currentAmount,
      actionType: 'WITHDRAW',
      timestamp: now,
    });
    offer.updatedAt = now;

    broadcast('TRANSFER_OFFER_UPDATED', { offerId });
    broadcastStateUpdate();
    res.json({ success: true, offer });
  });

  // ADMIN: Reset Auction & Return to Fresh State
  app.post('/api/admin/reset', (req: Request, res: Response) => {
    const { password } = req.body;
    if (password !== 'moneyball2026' && password !== 'admin123' && password !== 'admin') {
      return res.status(403).json({ error: 'Invalid admin confirmation password' });
    }

    // Restore teams to £500M starting balance and empty bought lists
    for (const team of auctionState.teams) {
      team.remainingBalance = 500;
      team.startingBalance = 500;
      team.boughtPlayers = [];
      team.qualificationStatus = 'UNASSIGNED';
    }

    // Restore players to upcoming and sync stats
    for (const player of auctionState.players) {
      player.status = 'upcoming';
      delete player.soldPrice;
      delete player.soldToTeamId;
      delete player.soldToTeamName;
      delete player.soldTimestamp;
      const init = INITIAL_PLAYERS.find((p) => p.id === player.id);
      if (init) {
        player.stats = { ...init.stats };
        player.photo = init.photo;
        player.position = init.position;
        player.currentClub = init.currentClub;
        player.nationality = init.nationality;
        player.setId = init.setId;
        player.setName = init.setName;
        player.orderInSet = init.orderInSet;
      }
    }

    auctionState.salesHistory = [];
    auctionState.transferOffers = [];
    auctionState.transactions = [];
    auctionState.recentSoldNotification = null;
    auctionState.currentPlayerId = auctionState.players[0]?.id || null;
    auctionState.status = 'live';
    auctionState.globalState = 'AUCTION_LIVE';
    auctionState.activeSetId = 1;
    auctionState.liveBidding = {
      playerId: auctionState.players[0]?.id || null,
      currentBid: auctionState.players[0]?.basePrice || 60,
      currentBidderTeamId: null,
      currentBidderTeamName: null,
      callStage: 'NORMAL',
      lastBidTimestamp: null,
    };

    broadcast('AUCTION_RESET', { message: 'Auction and balances reset to £500M' });
    broadcastStateUpdate();
    res.json({ success: true, message: 'Auction reset successfully with £500M purses' });
  });

  // ADMIN: Update Config
  app.post('/api/admin/config', (req: Request, res: Response) => {
    const newConfig = req.body;
    auctionState.config = { ...auctionState.config, ...newConfig };
    broadcastStateUpdate();
    res.json({ success: true, config: auctionState.config });
  });

  // CSV Export endpoint
  app.get('/api/export-csv', (_req: Request, res: Response) => {
    let csv = 'Type,Timestamp,Player,Position,OVR,From Team,To Team,Amount (£M),Notes\n';

    for (const tx of auctionState.transactions) {
      csv += `"${tx.transactionType}","${tx.timestamp}","${tx.playerName}","","","${tx.sellerTeamName || 'Auction Pool'}","${tx.buyerTeamName}","${tx.amount}","${tx.notes || ''}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="moneyball-transactions.csv"');
    res.send(csv);
  });

  // Vite development middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Moneyball Server running on http://0.0.0.0:${PORT} with WebSocket on ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer().catch(console.error);
