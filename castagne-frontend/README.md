# Castagne front app

## Getting Started

### 1. Retrieve project

```bash
git clone https://github.com/Spt117/castagne.git
cd castagne-frontend
```

### 2. Install dependencies

```bash
npm install
```


### 3. Copy the sample.env file to 

- .env.development
- .env.production

`NEXT_PUBLIC_ENABLE_LOCAL_TESTNET` : Enable the local testnet
`NEXT_PUBLIC_LOCAL_TESTNET` : Define the local testnet endpoint (e.g. "http://127.0.0.1:8899")


### 4. Start application

```bash
# Start : dev mode
npm run dev

# Build and start : prod mode
npm run build && npm run start
```

## Tech stack

- Next.js 
- Tailwindcss
- Solana Wallet Adapter
