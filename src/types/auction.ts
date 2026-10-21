export type GlobalEventState =
  | 'SETUP'
  | 'AUCTION_LIVE'
  | 'AUCTION_CLOSED'
  | 'TRANSFER_MARKET_LIVE'
  | 'TRANSFER_MARKET_CLOSED';

export type AuctionStatus = 'not_started' | 'live' | 'paused' | 'ended';

export type QualificationStatus = 'UNASSIGNED' | 'TOP_4' | 'BOTTOM_6';

export type PositionCategory = 'FORWARD' | 'MIDFIELDER' | 'DEFENDER' | 'GOALKEEPER';

export type PlayerStatus =
  | 'upcoming'
  | 'live'
  | 'sold'
  | 'unsold'
  | 'transfer_available'
  | 'transferred';

export type CallStage = 'NORMAL' | 'GOING_ONCE' | 'GOING_TWICE' | 'SOLD';

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  overall: number;
}

export interface Player {
  id: string;
  name: string;
  photo: string;
  currentClub: string;
  clubLogo?: string;
  position: string; // ST, CAM, CB, GK, etc.
  primaryPosition?: string;
  positionCategory?: PositionCategory;
  nationality: string;
  nationalityCode?: string;
  basePrice: number; // in Millions GBP (£M)
  status: PlayerStatus;
  soldPrice?: number;
  soldToTeamId?: string;
  soldToTeamName?: string;
  soldTimestamp?: string;
  setId?: number;
  setName?: string;
  orderInSet?: number;
  notes?: string;
  stats: PlayerStats;
}

export interface PlayerSet {
  id: number;
  name: string;
  displayOrder: number;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
}

export interface TeamBoughtPlayer {
  playerId: string;
  playerName: string;
  playerPhoto: string;
  club: string;
  position: string;
  price: number;
  soldTimestamp: string;
}

export interface Team {
  id: string;
  username: string;
  password?: string;
  teamName: string;
  logo: string;
  color: string;
  startingBalance: number; // £500M
  remainingBalance: number; // £M
  maxSquadSize: number; // 15
  minSquadSize: number; // 13
  qualificationStatus: QualificationStatus;
  ownerName?: string;
  boughtPlayers: TeamBoughtPlayer[];
}

export interface AuctionConfig {
  eventName: string;
  tagline: string;
  startTime: string; // ISO string
  detailsText: string;
  rules: string[];
  introVideoUrl: string;
  minBidIncrement: number; // £2.5M
  currencySymbol: string; // £
  currencyUnit: string; // M
  startingPurse: number; // 500
  maxSquadSize: number; // 15
  minSquadSize: number; // 13
}

export interface SoldNotification {
  id: string;
  playerId: string;
  playerName: string;
  playerPhoto: string;
  club: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  teamLogo?: string;
  soldPrice: number;
  timestamp: string;
}

export type TransferOfferStatus =
  | 'PENDING'
  | 'COUNTERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED';

export interface TransferNegotiationEntry {
  id: string;
  senderTeamId: string;
  senderTeamName: string;
  amount: number;
  actionType: 'OFFER' | 'COUNTER' | 'ACCEPT' | 'REJECT' | 'WITHDRAW';
  timestamp: string;
}

export interface TransferOffer {
  id: string;
  playerId: string;
  playerName: string;
  playerPhoto: string;
  playerRating: number;
  playerPosition: string;
  buyerTeamId: string;
  buyerTeamName: string;
  sellerTeamId: string;
  sellerTeamName: string;
  currentAmount: number;
  status: TransferOfferStatus;
  history: TransferNegotiationEntry[];
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'AUCTION' | 'TRANSFER' | 'ADMIN_CORRECTION';

export interface TransactionRecord {
  id: string;
  playerId: string;
  playerName: string;
  buyerTeamId: string;
  buyerTeamName: string;
  sellerTeamId?: string;
  sellerTeamName?: string;
  amount: number;
  transactionType: TransactionType;
  timestamp: string;
  notes?: string;
}

export interface LiveBiddingState {
  playerId: string | null;
  currentBid: number;
  currentBidderTeamId: string | null;
  currentBidderTeamName: string | null;
  callStage: CallStage;
  lastBidTimestamp: string | null;
}

export interface AuctionState {
  globalState: GlobalEventState;
  status: AuctionStatus;
  currentPlayerId: string | null;
  activeSetId: number;
  liveBidding: LiveBiddingState;
  config: AuctionConfig;
  playerSets: PlayerSet[];
  teams: Team[];
  players: Player[];
  salesHistory: {
    id: string;
    playerId: string;
    playerName: string;
    club: string;
    teamId: string;
    teamName: string;
    basePrice: number;
    soldPrice: number;
    timestamp: string;
  }[];
  transferOffers: TransferOffer[];
  transactions: TransactionRecord[];
  recentSoldNotification: SoldNotification | null;
  lastUpdated: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'team' | 'viewer';
  teamId?: string;
  teamName?: string;
  color?: string;
}
