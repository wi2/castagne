import * as anchor from '@coral-xyz/anchor';
import { AnchorError, Program } from '@coral-xyz/anchor';
import { CastagneBackend } from '../../target/types/castagne_backend';
import { assert, expect } from 'chai';
import { AnchorProvider } from '@coral-xyz/anchor/dist/cjs/provider';
import { toBuffer } from '@solana/web3.js/src/utils/to-buffer';

describe('castagne-backend', () => {
  const PLAYER_XP_INIT = 1000;
  const userName1 = 'bob';
  const userName2 = 'alice';
  const userName3 = 'lol';

  const program = anchor.workspace.CastagneBackend as Program<CastagneBackend>;
  const provider: AnchorProvider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const adminWallet = provider.wallet as anchor.Wallet;
  const player1: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const player2: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const player3: anchor.web3.Keypair = anchor.web3.Keypair.generate();

  const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('config'), adminWallet.publicKey.toBuffer()],
    program.programId
  );

  const [fightPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('fight')],
    program.programId
  );

  const [player1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('player'), player1.publicKey.toBuffer()],
    program.programId
  );

  const [player2Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('player'), player2.publicKey.toBuffer()],
    program.programId
  );

  const [player3Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('player'), player3.publicKey.toBuffer()],
    program.programId
  );

  console.log('admin  :', adminWallet.publicKey.toString());
  console.log('player1:', player1.publicKey.toString());
  console.log('player2:', player2.publicKey.toString());
  console.log('player3:', player3.publicKey.toString());

  it('Init the config and succeed', async () => {
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

  it('Init the config twice and thrown error', async () => {
    try {
      await program.methods
        .initializeConfig()
        .accounts({
          config: configPda,
          systemProgram: anchor.web3.SystemProgram.programId,
          owner: adminWallet.publicKey,
        } as any)
        .rpc();

      expect.fail(
        'The second initialize call should have failed but it succeeded'
      );
    } catch (err) {
      assert.instanceOf(err, anchor.web3.SendTransactionError);
      const errMsg = (err as anchor.web3.SendTransactionError).message;
      assert.include(errMsg, 'already in use');
    }
  });

  it('Create players and succeed', async () => {
    let txairdropPlayer1 = await program.provider.connection.requestAirdrop(
      player1.publicKey,
      10_000_000_000
    );
    let txairdropPlayer2 = await program.provider.connection.requestAirdrop(
      player2.publicKey,
      10_000_000_000
    );
    let txairdropPlayer3 = await program.provider.connection.requestAirdrop(
      player3.publicKey,
      10_000_000_000
    );

    await program.provider.connection.confirmTransaction(txairdropPlayer1);
    await program.provider.connection.confirmTransaction(txairdropPlayer2);
    await program.provider.connection.confirmTransaction(txairdropPlayer3);

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
    expect(player.fights.length == 0);
  });

  it('Updates player attributes and succeed', async () => {
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

  it('Updates player xp by admin only and succeed', async () => {
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

  // F I G H T

  /* it('Init a fight config with a non owner and thrown error AccountNotInitialized', async () => {
    try {
      await program.methods
        .initFightConfig()
        .accounts({
          owner: player1.publicKey,
          fight_pda: fightPda,
        } as any)
        .signers([player1])
        .rpc();
      expect.fail(
        'Init a fight config with a non owner and thrown error should have failed but it succeded'
      );
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.code).to.equal('AccountNotInitialized');
    }
  }); */

  it('Init a fight config with owner and succedd', async () => {
    await program.methods
      .initFightConfig()
      .accounts({
        owner: adminWallet.publicKey,
        fight_pda: fightPda,
      } as any)
      .rpc();

    let fight = await program.account.fight.fetch(fightPda);
    expect(fight.counter.toNumber() == 0);
  });

  // Fight
  it('Init a fight with same players and thrown error', async () => {
    let fightData = await program.account.fight.fetch(fightPda);

    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(fightData.counter).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .initFight()
        .accounts({
          player1: player1.publicKey,
          player2: player1.publicKey,
          fight_player_pda: fightPlayerPda,
          player1_pda: player1Pda,
          player2_pda: player1Pda,
          fight_pda: fightPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([player1])
        .rpc();

      expect.fail(
        'Init a fight with same players and thrown error should have failed but it succeded'
      );
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.code).to.equal('PlayersMustBeDifferent');
    }
  });

  it('Init a fight but a player has a level too high and thrown error', async () => {
    let fightData = await program.account.fight.fetch(fightPda);

    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(fightData.counter).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    try {
      // Allocate max xp = 2000 + 1000 to attributes
      await program.methods
        .updatePlayer([500, 1500, 1000])
        .accounts({
          user: player1.publicKey,
          player: player1Pda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([player1])
        .rpc();

      // Allocate max xp = 1000 to attributes
      await program.methods
        .updatePlayer([250, 250, 500])
        .accounts({
          user: player2.publicKey,
          player: player2Pda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([player2])
        .rpc();

      await program.methods
        .initFight()
        .accounts({
          player1: player1.publicKey,
          player2: player2.publicKey,
          fight_player_pda: fightPlayerPda,
          player1_pda: player1Pda,
          player2_pda: player2Pda,
          fight_pda: fightPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([player1])
        .rpc();

      expect.fail(
        'The Init a fight with player has level too high should have failed but it succeded'
      );
    } catch (_err) {
      expect(_err).to.be.instanceOf(AnchorError);
      const err: AnchorError = _err;
      expect(err.error.errorCode.code).to.equal('LevelTooHigh');
    }
  });

  it('Init a fight and succeed', async () => {
    // Allocate max xp = 1000 to attributes
    await program.methods
      .updatePlayer([150, 350, 500])
      .accounts({
        user: player3.publicKey,
        player: player3Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player3])
      .rpc();

    let fightData = await program.account.fight.fetch(fightPda);

    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(fightData.counter).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    await program.methods
      .initFight()
      .accounts({
        player1: player3.publicKey,
        player2: player2.publicKey,
        fightPlayerPda: fightPlayerPda,
        player1_pda: player3Pda,
        player2_pda: player2Pda,
        fight_pda: fightPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player3])
      .rpc();

    let player2Data = await program.account.player.fetch(player2Pda);
    let player3Data = await program.account.player.fetch(player3Pda);

    let fightPlayerData = await program.account.fightPlayer.fetch(
      fightPlayerPda
    );

    expect(player2Data.fights[0].toNumber() === 0);
    expect(player3Data.fights[0].toNumber() === 0);
    expect(fightData.counter.toNumber() === 1);
    expect(fightPlayerData.status.initialized);
  });
});
