import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CastagneBackend } from "../target/types/castagne_backend";
import { assert, expect } from "chai";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor/dist/cjs/provider";



describe("castagne-backend", () => {
  const program = anchor.workspace.CastagneBackend as Program<CastagneBackend>;
  const provider: AnchorProvider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const adminWallet = provider.wallet as anchor.Wallet;

  const PLAYER_XP_INIT = 1000;
  const userName1 = "bob";
  const userName2 = "alice";
  const userName3 = "lol";

  const player1: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const player2: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const player3: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  // let configPda: anchor.web3.PublicKey;

  console.log('admin  :', adminWallet.publicKey.toString());
  console.log('player1:', player1.publicKey.toString());
  console.log('player2:', player2.publicKey.toString());
  console.log('player3:', player3.publicKey.toString());

  it("initialize the config", async () => {
    // The config is used to prevent any updates on XP except by the admin
    // (temporary solution)
    // Config PDA
    let [configPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config"), adminWallet.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeConfig()
      .accounts({
        owner: adminWallet.publicKey,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    let resultConfig = await program.account.config.fetch(configPda);
    expect(resultConfig.owner.toString(), adminWallet.publicKey.toString());
  });


  it("Fails to initialize the config a second time", async () => {
    let [configPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config"), adminWallet.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
      .initializeConfig()
      .accounts({
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
        owner: adminWallet.publicKey,
      } as any)
      .rpc();

      expect.fail("The second initialize call should have failed but it succeeded");
    } catch (err) {
      assert.instanceOf(err, anchor.web3.SendTransactionError);
      const errMsg = (err as anchor.web3.SendTransactionError).message;
      assert.include(errMsg, "already in use");
    }
  });


  it("Create players", async () => {
    let txairdropPlayer1 = await program.provider.connection.requestAirdrop(
      player1.publicKey, 10_000_000_000);
    let txairdropPlayer2 = await program.provider.connection.requestAirdrop(
      player2.publicKey, 10_000_000_000);
    let txairdropPlayer3 = await program.provider.connection.requestAirdrop(
      player3.publicKey, 10_000_000_000);

    await program.provider.connection.confirmTransaction(txairdropPlayer1);
    await program.provider.connection.confirmTransaction(txairdropPlayer2);
    await program.provider.connection.confirmTransaction(txairdropPlayer3);

    // PLayer PDAs
    const [player1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player1.publicKey.toBuffer()],
      program.programId
    );

    const [player2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player2.publicKey.toBuffer()],
      program.programId
    );

    const [player3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player3.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createPlayer(userName1)
      .accounts({
        user: player1.publicKey,
        player: player1Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player1])
      .rpc();

    await program.methods
      .createPlayer(userName2)
      .accounts({
        user: player2.publicKey,
        player: player2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player2])
      .rpc();

    await program.methods
      .createPlayer(userName3)
      .accounts({
        user: player3.publicKey,
        player: player3Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player3])
      .rpc();

    let players = await program.account.player.all();
    let player = await program.account.player.fetch(player1Pda);

    expect(players.length === 3);
    expect(player.user == player1.publicKey);
    expect(player.username == userName1);
    expect(player.attributes.length == 3);
    expect(player.attributes.reduce((partialSum, a) => partialSum + a, 0) == 0);
    expect(player.xp == PLAYER_XP_INIT);
  });


  it("Updates player attributes", async () => {
    // PLayer PDAs
    const [player1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player1.publicKey.toBuffer()],
      program.programId
    );

    const attributes = [250, 250, 500];
    await program.methods
      .updatePlayer(attributes)
      .accounts({
        user: player1.publicKey,
        player: player1Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player1])
      .rpc();

    let player = await program.account.player.fetch(player1Pda);

    expect(player.attributes[0] == 250);
    expect(player.attributes[1] == 250);
    expect(player.attributes[2] == 500);
    expect(player.xp == 0);
  });

  it("Updates player xp, admin only", async () => {
    // Config PDA
    let [configPda, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config"), adminWallet.publicKey.toBuffer()],
      program.programId
    );

    // PLayer PDA
    const [player1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("player"), player1.publicKey.toBuffer()],
      program.programId
    );

    const xp = 2000;
    await program.methods
      .updatePlayerXp(xp)
      .accounts({
        owner: adminWallet.publicKey,
        user: player1.publicKey,
        player: player1Pda,
        config: configPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    let player = await program.account.player.fetch(player1Pda);

    expect(player.xp == 1000);
  });
});
