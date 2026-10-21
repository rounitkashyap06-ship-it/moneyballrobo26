# MONEYBALL AUCTION & TRANSFER MARKET PLATFORM
## Product Requirements Document

---

## 1. PRODUCT NAME

**Moneyball Auction & Transfer Market Platform**

---

## 2. PRODUCT PURPOSE

The Moneyball platform is a real-time web application built to support the player-management portion of the Moneyball event.

The platform will handle only two major phases:

1. **Initial Player Auction**
2. **Post-League Transfer Market**

The website will not manage:

- Preliminary quiz
- Team shortlisting
- Match simulation
- League standings
- Match results
- Semi-finals or finals

These activities will be handled separately by the event organizers.

The purpose of the platform is to provide a reliable central system for:

- Conducting and displaying the player auction
- Tracking player ownership
- Tracking team purses
- Tracking squad sizes
- Organizing players into auction sets
- Displaying team squads
- Conducting private transfer negotiations
- Updating purses and squads automatically after transfers
- Maintaining complete transaction records

---

# 3. EVENT CONTEXT

A total of **10 teams** will participate in the main Moneyball auction.

Each team will receive an equal starting purse.

Example:

**Starting Purse: £500M**

Each team will be required to build a squad within a defined squad-size limit.

Example:

**Maximum Squad Size: 15 Players**

The website will begin functioning only after the 10 participating teams have already been finalized.

---

# 4. PRIMARY USERS

The platform will support three primary user types.

## 4.1 ADMIN / AUCTIONEER

The Admin controls the entire event platform.

Responsibilities include:

- Managing players
- Managing player sets
- Managing teams
- Conducting the live auction
- Recording verbal bids
- Marking players SOLD or UNSOLD
- Monitoring team purses
- Monitoring squads
- Opening and closing the Transfer Market
- Marking teams as Top 4 or Bottom 6
- Monitoring transfer negotiations
- Correcting accidental transactions
- Accessing complete transaction history

Only the Admin can modify auction data during the initial auction.

---

## 4.2 TEAM USER

Each participating team receives one team account.

During the initial auction, the team interface is mostly read-only.

Teams can:

- View the current player
- View current bid
- View current highest bidder
- View their remaining purse
- View their squad size
- View players they have purchased
- View all teams' purse information
- View all teams' squad counts
- Browse player sets
- View player statuses

During the Transfer Market, eligible teams receive additional interactive features.

---

## 4.3 PUBLIC DISPLAY / PROJECTOR MODE

A separate interface will be designed for the main event screen.

This interface will display:

- Current player
- Player image
- Player position
- Rating
- Base price
- Current bid
- Current bidder
- Auction status
- Team purse table
- Squad count table

It will not contain administrative controls.

---

# 5. HIGH-LEVEL PRODUCT FLOW

```text
10 TEAMS CREATED
        ↓
PLAYER AUCTION OPENS
        ↓
PLAYER SET SELECTED
        ↓
PLAYER BROUGHT TO AUCTION
        ↓
TEAMS BID VERBALLY
        ↓
AUCTIONEER RECORDS BIDS
        ↓
PLAYER SOLD / UNSOLD
        ↓
PURSE + SQUAD UPDATED
        ↓
AUCTION COMPLETED
        ↓
AUCTION LOCKED
        ↓
MATCHES CONDUCTED OUTSIDE WEBSITE
        ↓
ADMIN MARKS TOP 4 / BOTTOM 6
        ↓
TRANSFER MARKET OPENS
        ↓
TOP 4 SEND PRIVATE OFFERS
        ↓
BOTTOM 6 RECEIVE OFFERS
        ↓
COUNTER-OFFER NEGOTIATION
        ↓
TRANSFER AGREED
        ↓
TRANSFER CONFIRMED
        ↓
PLAYER + PURSE UPDATED
        ↓
TRANSFER MARKET CLOSED
```

---

# 6. GLOBAL EVENT STATES

The system should have a global event status.

Possible states:

### SETUP
Players, teams and auction sets are being configured.

### AUCTION_LIVE
Initial auction is active.

### AUCTION_CLOSED
Initial auction has ended.

### TRANSFER_MARKET_LIVE
Post-league transfer negotiations are active.

### TRANSFER_MARKET_CLOSED
All financial activity is complete.

Different website functionality should automatically enable or disable based on this state.

---

# 7. TEAM MANAGEMENT

Admin should be able to create and manage 10 teams.

Each team should contain:

- Team ID
- Team Name
- Login Username
- Password
- Starting Purse
- Current Purse
- Maximum Squad Size
- Current Squad Size
- Qualification Status

Qualification status:

- UNASSIGNED
- TOP_4
- BOTTOM_6

---

# 8. PLAYER MANAGEMENT

Admin should be able to create, edit and delete players.

Each player should contain:

- Player ID
- Player Name
- Player Image
- Club
- Primary Position
- Secondary Position
- Overall Rating
- Base Price
- Auction Set
- Status
- Current Owner
- Purchase Price

Optional player statistics:

- Pace
- Shooting
- Passing
- Dribbling
- Defending
- Physical

---

# 9. PLAYER POSITION CATEGORIES

Players must also belong to one of four broader squad categories:

### FORWARD

Examples:

- ST
- CF
- LW
- RW

### MIDFIELDER

Examples:

- CAM
- CM
- CDM
- LM
- RM

### DEFENDER

Examples:

- CB
- LB
- RB
- LWB
- RWB

### GOALKEEPER

- GK

These categories will be used to organize each team's squad.

---

# 10. PLAYER SETS

Players will be grouped into predefined auction sets.

Example:

- Marquee Players
- Elite Attackers
- Elite Midfielders
- Elite Defenders
- Goalkeepers
- Value Attackers
- Value Midfielders
- Value Defenders
- Wildcards

Each set should have:

- Set ID
- Set Name
- Display Order
- Status
- List of Players

Set status:

- UPCOMING
- LIVE
- COMPLETED

---

# 11. PLAYER STATUS

Every player can have one of the following statuses:

### AVAILABLE
Player has not entered the auction.

### LIVE
Player is currently being auctioned.

### SOLD
Player was purchased.

### UNSOLD
Player received no successful bid.

### TRANSFER_AVAILABLE
Player belongs to a Bottom 6 team and can receive transfer offers.

### TRANSFERRED
Player changed ownership during the Transfer Market.

---

# 12. INITIAL AUCTION BEHAVIOUR

The initial auction is conducted physically.

Teams will **bid verbally**.

Teams will not place bids through their devices.

The Admin/Auctioneer will record all bids through the Auction Control Panel.

The website acts as:

- Bid recorder
- Auction display
- Purse tracker
- Ownership system
- Squad tracker
- Transaction record

---

# 13. AUCTIONEER CONTROL PANEL

The Admin should have a fast and simple interface.

Required information:

### Current Set

Example:

**Marquee Players**

### Current Player

- Image
- Name
- Position
- Rating
- Base Price

### Current Bid

Example:

**£85M**

### Current Bidder

Example:

**Team Titans**

### Team Selection

Buttons for:

- Team 1
- Team 2
- Team 3
- ...
- Team 10

### Bid Controls

- +£5M
- -£5M
- Custom Bid

### Auction Controls

- Start Auction
- Going Once
- Going Twice
- Sold
- Unsold
- Next Player

---

# 14. VERBAL BID RECORDING

Example:

Current Player:

**Jude Bellingham**

Base Price:

**£30M**

Team Alpha verbally bids:

**£35M**

Auctioneer selects:

**Team Alpha**

and enters:

**£35M**

All connected screens immediately display:

**Current Bid: £35M**

**Current Bidder: Team Alpha**

If Team Titans then verbally bids £40M, the Auctioneer updates the bidder and amount.

---

# 15. LIVE AUCTION DISPLAY

The public display should approximately contain:

```text
MONEYBALL

KYLIAN MBAPPÉ

[PLAYER IMAGE]

ST | 91
REAL MADRID

BASE PRICE
£50M

CURRENT BID
£105M

CURRENT BIDDER
TEAM TITANS
```

Below this:

```text
TEAM            PURSE          PLAYERS

Titans          £310M           7/15
Phoenix         £375M           6/15
Galacticos      £295M           9/15
Warriors        £420M           5/15
...
```

---

# 16. GOING ONCE / GOING TWICE

The Auctioneer can trigger:

### GOING ONCE

### GOING TWICE

### SOLD

The projected screen should visibly display these states.

Example:

```text
CURRENT BID

£85M

TEAM TITANS

GOING TWICE...
```

---

# 17. SOLD FUNCTIONALITY

When the Admin selects:

**SOLD**

the system automatically performs the following:

1. Assign player to winning team.
2. Deduct winning amount from team purse.
3. Increase team squad count.
4. Add player to My Team.
5. Save purchase price.
6. Set status to SOLD.
7. Create transaction record.
8. Update all connected clients.

Example:

```text
KYLIAN MBAPPÉ

SOLD TO

TEAM TITANS

£105M
```

---

# 18. UNSOLD FUNCTIONALITY

If no team buys a player:

Admin selects:

**UNSOLD**

The player status becomes:

**UNSOLD**

No money or squad changes occur.

Admin may optionally bring the player back later if event rules allow it.

---

# 19. GLOBAL PURSE TRACKER

The remaining purse of all 10 teams should be continuously visible.

Example:

| Team | Purse | Players |
|---|---:|---:|
| Titans | £310M | 7/15 |
| Phoenix | £375M | 6/15 |
| Warriors | £295M | 9/15 |
| Galacticos | £420M | 5/15 |

This table must update automatically after every successful transaction.

---

# 20. SQUAD LIMIT

Every team will have a maximum squad size.

Example:

**15 Players**

The system should show:

```text
13 / 15
```

Once the team reaches:

```text
15 / 15
```

the team cannot purchase another player.

---

# 21. BID VALIDATION

The website must prevent invalid purchases.

## INSUFFICIENT PURSE

If:

```text
Remaining Purse: £25M
```

and winning price is:

```text
£30M
```

the transaction must be rejected.

---

## SQUAD FULL

If:

```text
Squad: 15 / 15
```

the team cannot purchase another player.

---

# 22. MY TEAM PAGE

Every team gets a dedicated squad page.

At the top:

```text
TEAM TITANS

PURSE
£225M

SQUAD
13 / 15
```

Players are displayed under four sections.

---

## FORWARDS

Example:

- Kylian Mbappé — ST — £105M
- Mohamed Salah — RW — £65M
- Rafael Leão — LW — £30M

---

## MIDFIELDERS

Example:

- Jude Bellingham — CM — £70M
- Pedri — CM — £45M
- Rodri — CDM — £55M

---

## DEFENDERS

Example:

- William Saliba — CB — £40M
- Achraf Hakimi — RB — £30M
- Theo Hernández — LB — £25M

---

## GOALKEEPERS

Example:

- Gianluigi Donnarumma — GK — £25M

---

# 23. PLAYER SET PAGE

Teams should be able to browse players by set.

Example:

## MARQUEE PLAYERS

| Player | Position | Rating | Base Price | Status |
|---|---|---:|---:|---|
| Mbappé | ST | 91 | £50M | SOLD |
| Haaland | ST | 90 | £50M | AVAILABLE |
| Salah | RW | 91 | £50M | SOLD |
| Bellingham | CM | 90 | £50M | AVAILABLE |

Teams cannot modify anything on this page.

---

# 24. END OF INITIAL AUCTION

Admin selects:

**CLOSE AUCTION**

After this:

- Bids cannot be entered.
- Players cannot be sold.
- Auction controls are disabled.
- Team squads remain visible.
- Purse values remain visible.
- Transaction history remains available.

The website does nothing while football matches take place.

---

# 25. QUALIFICATION ASSIGNMENT

Once the external league stage is complete, the Admin manually assigns:

### TOP 4

or

### BOTTOM 6

to each team.

The website does not calculate this automatically.

---

# 26. TRANSFER MARKET

After qualification statuses are assigned, Admin selects:

**OPEN TRANSFER MARKET**

Top 4 teams become:

### BUYERS

Bottom 6 teams become:

### SELLERS

Players owned by Bottom 6 teams become eligible for transfer offers.

---

# 27. TRANSFER MARKET BROWSER

Top 4 teams can browse players owned by Bottom 6 teams.

Filters:

- Player Name
- Position
- Team
- Rating

Example:

```text
BUKAYO SAKA

RW | 88

Owned By:
TEAM PHOENIX

[VIEW PLAYER]

[MAKE OFFER]
```

---

# 28. TRANSFER OFFERS

Buyers can send private monetary offers.

Example:

```text
BUKAYO SAKA

Current Owner:
TEAM PHOENIX

Your Purse:
£105M

ENTER OFFER

£ [        ] M

[SEND OFFER]
```

---

# 29. OFFER PRIVACY

An offer should only be visible to:

- Buyer
- Seller
- Admin

Other teams must not know the offer amount.

This preserves private negotiation.

---

# 30. NO FREE-TEXT CHAT

Transfer negotiations should not support normal messaging.

Negotiations are limited to:

- Offer
- Counter Offer
- Accept
- Reject
- Withdraw

This keeps negotiations simple and fully auditable.

---

# 31. SELLER OFFER INBOX

Bottom 6 teams receive an offer inbox.

Example:

## Bukayo Saka

```text
TEAM TITANS

£55M

[ACCEPT]
[REJECT]
[COUNTER]
```

Another team:

```text
TEAM WARRIORS

£50M

[ACCEPT]
[REJECT]
[COUNTER]
```

---

# 32. COUNTER-OFFERS

Example:

Buyer:

```text
£50M
```

Seller:

```text
Counter: £65M
```

Buyer:

```text
Counter: £58M
```

Seller:

```text
Counter: £62M
```

Buyer:

```text
ACCEPT
```

Final Transfer Fee:

**£62M**

---

# 33. NEGOTIATION HISTORY

Every offer should maintain an internal history.

Example:

```text
BUKAYO SAKA

Team Titans
£50M

Team Phoenix
Counter £65M

Team Titans
Counter £58M

Team Phoenix
Counter £62M

Team Titans
Accepted
```

This creates an audit trail in case of disputes.

---

# 34. MULTIPLE OFFERS

One player may receive offers from several Top 4 teams simultaneously.

Example:

```text
BUKAYO SAKA

Titans       £62M
Warriors     £58M
Galacticos   £55M
```

The seller can decide which offer to accept.

The website does not automatically force acceptance of the highest offer.

---

# 35. TRANSFER CONFIRMATION

Before completing a transfer:

```text
CONFIRM TRANSFER

BUKAYO SAKA

TEAM PHOENIX
      ↓
TEAM TITANS

TRANSFER FEE

£62M

[CANCEL]

[CONFIRM DEAL]
```

Only after confirmation should player ownership and money change.

---

# 36. AUTOMATIC TRANSFER UPDATE

After confirmation:

### BUYER

Purse:

```text
£100M → £38M
```

Squad:

```text
13 / 15 → 14 / 15
```

Player added.

### SELLER

Purse:

```text
£45M → £107M
```

Squad:

```text
14 / 15 → 13 / 15
```

Player removed.

---

# 37. COMPETING OFFERS AFTER TRANSFER

Once a player is successfully transferred:

- All other pending offers for that player become closed.
- Other negotiations become read-only.
- No further offers may be sent for that player.

---

# 38. TRANSFER OFFER STATUS

Possible statuses:

- PENDING
- COUNTERED
- ACCEPTED
- REJECTED
- WITHDRAWN
- EXPIRED

---

# 39. MY OFFERS PAGE

Top 4 teams should be able to see their outgoing offers.

Example:

| Player | Seller | Amount | Status |
|---|---|---:|---|
| Saka | Phoenix | £62M | Countered |
| Son | Warriors | £40M | Pending |
| Barella | United | £35M | Rejected |

---

# 40. RECEIVED OFFERS PAGE

Bottom 6 teams should see incoming offers grouped by player.

Example:

```text
BUKAYO SAKA

3 Active Offers

£62M — Titans
£58M — Warriors
£55M — Galacticos
```

---

# 41. BEST NEGOTIATOR TRACKER

The Bottom 6 teams compete for the **Best Negotiator Award**.

The website should show each Bottom 6 team's current purse.

Example:

| Team | Current Purse |
|---|---:|
| Phoenix | £185M |
| Warriors | £165M |
| United | £145M |
| Legends | £130M |

The team with the highest purse when the Transfer Market closes wins the award.

---

# 42. TRANSFER VALIDATION

The system must prevent:

- Offering more than available purse.
- Purchasing beyond squad capacity.
- Buying a player from another Top 4 team.
- Buying an already transferred player.
- Selling the same player twice.
- Accepting multiple offers for the same player.
- Sending offers after Transfer Market closure.

---

# 43. TRANSACTION HISTORY

Every financial action should be recorded.

## AUCTION PURCHASE

Example:

```text
10:42 AM

KYLIAN MBAPPÉ

TEAM TITANS

£105M

Type:
AUCTION PURCHASE
```

## PLAYER TRANSFER

Example:

```text
4:35 PM

BUKAYO SAKA

TEAM PHOENIX
      ↓
TEAM TITANS

£62M

Type:
TRANSFER
```

---

# 44. ADMIN CORRECTIONS

Admin should be able to correct accidental entries.

Example:

Player was accidentally sold for:

```text
£85M
```

instead of:

```text
£75M
```

Admin can edit the transaction.

The system should automatically correct:

- Purchase price
- Team purse
- Transaction record

Every correction should itself be logged.

---

# 45. REAL-TIME REQUIREMENTS

The following actions must update instantly without refreshing:

- Current player
- Current bid
- Current bidder
- Going Once
- Going Twice
- Sold status
- Team purse
- Squad count
- Player ownership
- Transfer offer
- Counter-offer
- Transfer acceptance
- Completed transfer
- Transfer Market status

---

# 46. TEAM WEBSITE NAVIGATION

```text
MONEYBALL

├── Live Auction
├── Player Sets
├── Teams
├── My Team
├── Transfer Market
└── Transactions
```

---

# 47. ADMIN NAVIGATION

```text
ADMIN DASHBOARD

├── Auction Control
├── Players
├── Player Sets
├── Teams
├── Transfer Market
└── Transactions
```

---

# 48. DATABASE ENTITIES

## USER

```text
id
username
passwordHash
role
teamId
```

Roles:

```text
ADMIN
TEAM
```

---

## TEAM

```text
id
teamName
startingPurse
currentPurse
maximumPlayers
qualificationStatus
createdAt
```

---

## PLAYER

```text
id
name
imageUrl
club
primaryPosition
secondaryPosition
positionCategory
rating
basePrice
setId
status
ownerTeamId
purchasePrice
```

---

## PLAYER_SET

```text
id
name
displayOrder
status
```

---

## AUCTION_BID

```text
id
playerId
teamId
amount
enteredByAdminId
timestamp
```

---

## TRANSFER_OFFER

```text
id
playerId
buyerTeamId
sellerTeamId
status
createdAt
updatedAt
```

---

## TRANSFER_NEGOTIATION

```text
id
transferOfferId
senderTeamId
amount
actionType
timestamp
```

Possible action types:

```text
OFFER
COUNTER
ACCEPT
REJECT
WITHDRAW
```

---

## TRANSACTION

```text
id
playerId
buyerTeamId
sellerTeamId
amount
transactionType
timestamp
```

Types:

```text
AUCTION
TRANSFER
ADMIN_CORRECTION
```

---

# 49. RECOMMENDED TECH STACK

## FRONTEND

- Next.js
- React
- TypeScript
- Tailwind CSS

## BACKEND

- Spring Boot

## DATABASE

- PostgreSQL

## REAL-TIME COMMUNICATION

- WebSockets

Suggested architecture:

```text
NEXT.JS FRONTEND
        ↓
SPRING BOOT REST API
        ↓
POSTGRESQL

        +

WEBSOCKETS
        ↓
REAL-TIME AUCTION
AND TRANSFER UPDATES
```

---

# 50. MVP DEVELOPMENT PHASES

## PHASE 1 — CORE SETUP

Build:

- Authentication
- Admin account
- Team accounts
- Team management
- Player management
- Player sets
- Starting purses

---

## PHASE 2 — LIVE AUCTION

Build:

- Auction Control Panel
- Current player
- Verbal bid entry
- Current bidder
- Going Once
- Going Twice
- Sold
- Unsold
- Automatic purse calculation
- Squad updates
- Global purse tracker
- My Team page
- Projector display

---

## PHASE 3 — TRANSFER MARKET

Build:

- Top 4 / Bottom 6 assignment
- Transfer player browser
- Private offers
- Offer Inbox
- Counter-offers
- Accept
- Reject
- Withdraw
- Confirmation
- Automatic transfer
- Automatic purse updates
- Squad updates

---

## PHASE 4 — ADMIN SAFETY & POLISH

Build:

- Transaction logs
- Admin corrections
- Search
- Player filters
- Notifications
- Auction animations
- Responsive interface
- Connection status
- Reconnection handling
- Audit logs

---

# 51. OUT OF SCOPE

The following are explicitly outside the scope of the platform:

- Preliminary quiz
- Quiz scoring
- Selecting Top 10 through the website
- EA SPORTS FC integration
- CPU-vs-CPU simulation
- Match schedule
- Match result recording
- League table
- Qualification calculation
- Semi-final bracket
- Final result
- Formation builder
- Starting XI builder

The Admin will manually tell the website which teams are Top 4 and Bottom 6 after the external league stage.

---

# 52. SUCCESS CRITERIA

The product will be considered successful if:

1. The Admin can conduct the full auction without manual purse calculations.
2. Team purse values remain accurate throughout the event.
3. Player ownership is always clearly visible.
4. Squad counts are updated automatically.
5. Teams can view their complete squad at any point.
6. Public auction information updates in real time.
7. Top 4 teams can privately negotiate with Bottom 6 teams.
8. Transfer offers remain hidden from competing buyers.
9. Purse and ownership update automatically after every completed transfer.
10. Every auction purchase and transfer has an auditable transaction record.

---

# 53. CORE PRODUCT PRINCIPLE

The Moneyball platform should not replace the physical auction.

It should strengthen it.

During the initial auction:

**Participants create the auction experience.  
The website records, validates and displays it.**

During the Transfer Market:

**The website becomes the private negotiation and transaction platform.**

This principle should guide the UI, backend logic and overall product architecture.