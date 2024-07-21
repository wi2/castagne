import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Castagne } from "../target/types/castagne";
import { clusterApiUrl, Connection } from '@solana/web3.js';
const fs = require('fs');
// set this variable to disable warnings
// export NODE_NO_WARNINGS=1
const program = anchor.workspace.Castagne as Program<Castagne>;


const setConfig = async (adminWallet: anchor.Wallet) => {
  // Define config PDA
  let [configPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("config"),
        adminWallet.publicKey.toBuffer()
      ],
      program.programId
  );
  console.log("\n▸ Set adminWallet:", adminWallet.publicKey.toString());
  console.log("▸ Set configPda  :", configPda.toString());
  // Set config
  try {
    console.log("👉Setting Config ...");
    const tx = await program.methods
    .initializeConfig()
    .accounts(
      {
        owner: adminWallet.publicKey,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any
    )
    .rpc();

    await anchor.getProvider().connection.confirmTransaction(tx, "confirmed");
    console.log("🟢Config set Tx  :", tx);
  } catch (err) {
    const errMsg = (err as anchor.web3.SendTransactionError).message;
    if (errMsg.includes("already in use")) {
      console.log("🔵Config already set!");
    } else {
      console.log("🔴Config unknown error!", err);
    }
  }
}

const getConfig = async (adminWallet: anchor.Wallet) => {
  // Define config PDA
  let [configPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config"), adminWallet.publicKey.toBuffer()],
    program.programId
  );

  console.log("\n▸ Get adminWallet:", adminWallet.publicKey.toString());
  console.log("▸ Get configPda  :", configPda.toString());

  try {
    let resultConfig = await program.account.config.fetch(configPda);
    console.log("🟢Config Owner   :", resultConfig.owner.toString());
  } catch (err) {
    console.log("🔴Error getting config owner !", err);
  }
}

const init_fight = async (adminWallet: anchor.Wallet) => {
  const [fightPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('fight')],
    program.programId
  );

  console.log("\n▸ Init fight config:", fightPda.toString());

  try {
    console.log("👉Initiating fight config ...");
    const tx = await program.methods
      .initFightConfig()
      .accounts({
        owner: adminWallet.publicKey,
        fight_pda: fightPda,
      } as any)
      .rpc();

      await anchor.getProvider().connection.confirmTransaction(tx, "confirmed");
      console.log("🟢Init fight Tx  :", tx);
  } catch (err) {
    const errMsg = (err as anchor.web3.SendTransactionError).message;

    if (errMsg.includes("already in use")) {
      console.log("🔵Fight config already initiated!");
    } else {
      console.log("🔴Fight config unknown error!", err);
    }
  }
}

const action = async (provider: anchor.AnchorProvider) => {
  // Admin account
  const adminWallet: anchor.Wallet = provider.wallet as anchor.Wallet
  const balance = await anchor.getProvider().connection.getBalance(adminWallet.publicKey);

  // fund account if needed
  if (balance < 1e8) {
    console.log("▸ Fund account :", adminWallet.publicKey.toString());
    let txairdropAdminWallet = await program.provider.connection.requestAirdrop(
      adminWallet.publicKey, 10_000_000_000);
    await program.provider.connection.confirmTransaction(txairdropAdminWallet);
  }

  console.log("▸ admin     :", adminWallet.publicKey.toString());
  console.log("▸ balance   :", balance);
  console.log("▸ program id:", program.idl.address);

  await setConfig(adminWallet);
  await getConfig(adminWallet);
  await init_fight(adminWallet);
  console.log("")
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

    await action(provider);
  } catch (err) {
    console.log("🔴Node not running!\n");
  }
}

main()
