import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Castagne } from "../target/types/castagne";

// set this variable to disable warnings
// export NODE_NO_WARNINGS=1
const program = anchor.workspace.Castagne as Program<Castagne>;
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

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

  const rpcEndpoint = program.provider.connection.rpcEndpoint;

  console.log("▸ Local node:", rpcEndpoint);
  console.log("▸ program id:", program.programId.toString());

  if (program.provider.connection.rpcEndpoint === "http://127.0.0.1:8899") {

        try {
            const version = await program.provider.connection.getVersion();
            console.log("🟢Node is running with version");
            console.table(version);
            await read_players();
        } catch (err) {
            console.log("🔴Node not running!");
        }
    }
}

main()
