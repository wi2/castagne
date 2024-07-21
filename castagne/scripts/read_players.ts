import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Castagne } from "../target/types/castagne";
import { clusterApiUrl, Connection } from '@solana/web3.js';
const fs = require('fs');
// set this variable to disable warnings
// export NODE_NO_WARNINGS=1
const program = anchor.workspace.Castagne as Program<Castagne>;


const read_players = async () => {
  console.log('\n👉Reading players ...');

  let players = await program.account.player.all();

  for (const player of players) {
    console.table({
      user: player.account.user.toString(),
      username: player.account.username,
      xp: player.account.xp,
      attributes: player.account.attributes.toString(),
    });
  }

  console.log('\n👉Total players:', players.length);
}

const main = async () => {

  let provider: anchor.AnchorProvider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const envProvider = process.env.ANCHOR_PROVIDER || "devnet"; // Default to devnet

  if (envProvider === 'devnet') {
    const clusterUrl = clusterApiUrl('devnet')
    const connection = new Connection(clusterUrl, 'confirmed');
    const rawdata = fs.readFileSync(process.env.ANCHOR_WALLET);
    const privKey = Uint8Array.from(JSON.parse(rawdata));
    const wallet = anchor.web3.Keypair.fromSecretKey(privKey)
    provider = new anchor.AnchorProvider(
      connection, new anchor.Wallet(wallet), {
        preflightCommitment: 'confirmed',
      });

    anchor.setProvider(provider);
  }

  try {
    const version = await program.provider.connection.getVersion();
    console.log("🟢Node is running with version");
    console.table(version);
    console.log("\n▸ Provider  :", provider.connection.rpcEndpoint)
    console.log("▸ program id:", program.idl.address);

    await read_players();

  } catch (err) {
      console.log("🔴Node not running!");
  }
}

main()
