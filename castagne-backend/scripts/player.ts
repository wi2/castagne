import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CastagneBackend } from "../target/types/castagne_backend";

// set this variable to disable warnings
// export NODE_NO_WARNINGS=1


const program = anchor.workspace.CastagneBackend as Program<CastagneBackend>;
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const adminWallet = provider.wallet;


const setConfig = async () => {
  // Define config PDA
  let [configPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config"), adminWallet.publicKey.toBuffer()],
      program.programId
  );

  // Set config
  try {
    await program.methods
    .initialize()
    .accounts({
      owner: adminWallet.publicKey,
      config: configPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([])
    .rpc();

    console.log("🟢 Config set ");
  } catch (err) {
    console.log("🔴 Config already set!");
  }
}


const deployOnLocalnet = async () => {
  await setConfig();
}


const main = async () => {
    const rpcEndpoint = program.provider.connection.rpcEndpoint;

    if (program.provider.connection.rpcEndpoint === "http://127.0.0.1:8899") {
        console.log('Local node :', rpcEndpoint);

        try {
            const version = await program.provider.connection.getVersion();
            console.log("🟢 Node is running with version ", version);

            await deployOnLocalnet();
        } catch (err) {
            console.log("🔴 Node not running!");
        }
    }
}

main()
