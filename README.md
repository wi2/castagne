# castagne

Castagne is a fighting game between 2 players with random management of hitting points.

## 1. Explanation

A player has 3 characteristics, strength, speed and robustness for which he has allocated points.

When the fight begins, the characteristics of the 2 players are added together determining the min and max. The random number is generated in this range. If the number is in the range of points of player 1 he wins otherwise player 2 wins.

The match is played over 3 rounds, the winner is the one who wins at least 2 rounds.

The winner is awarded XP points.
Every 10 matches players receive XP points regardless of their result.

XP points can be used to modify characteristics.

### Exemple

| Characteristic | player 1 | player 2 | Min | Max            |
|----------------|----------|----------|-----|----------------|
| Strengh        | 250      | 350      | 0   | 250 + 350 = 600|

Random for strengh
| Random number | Player 1 | Player 2|
|---------------|----------|---------|
| 127           | Winner   |         |
| 251           |          | Winner  |

## 2. Getting Started

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.0 or higher
- Solana CLI 1.18.9 or higher

### 2.1 Installation

#### Retrieve project from GitHub

```bash
git clone https://github.com/wi2/castagne
cd castagne
```

#### Install dependencies

```bash
pnpm install
```

### 2.2 Setup provider

Select the environment you want to deploy to.

- mainnet
- devnet
- testnet
- localnet

#### localnet

Start the localnet

```bash
# If you want to start from scrach
solana-test-validator --reset

# If you want to continue with previous data
solana-test-validator

# To fund your account
solana airdrop 100

# Show your account
solana account <publicKey>
```

## 3. App: Build and deploy

```bash
anchor build
```

Get the program id

```bash
anchor keys list
```

If the program id is different from the one set inside `lib.rs` replace the program id by the new one.

file `lib.rs`

```rust
declare_id!("<new program id>");
```

file `anchor.toml`

```toml
[programs.localnet]
castagne = "<new program id>"
```

Build and deploy

You should confirm by seeing the program id deployed.

```bash
anchor build && anchor deploy
```

### 3. Run Unit tests

Run unit test locally

```bash
anchor test
```

Run unit test locally with the `solana-test-validator`

```bash
anchor run test
```

### 4. Run some scripts

- Create and update players
- Read players

```bash
anchor run create_player
anchor run read_player
```

Script are set in the Anchor.toml file

```toml
[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
create-player = "ts-node scripts/create_players.ts"
read-player = "ts-node scripts/read_players.ts"
```

## 4. Run App

```bash
npm run dev

# or

npm build
```
