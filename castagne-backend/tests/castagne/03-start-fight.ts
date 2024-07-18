import * as anchor from '@coral-xyz/anchor';
import { expect } from 'chai';

import { confTestType, getConfTest } from '../helper';

describe.only('start fight', () => {
  let config: confTestType;

  before(async () => {
    config = await getConfTest();
  });

  it.skip('start a fight with not good status and thrown error', async () => {
    let fightData = await config.program.account.fight.fetch(config.fightPda);

    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(2).toArrayLike(Buffer, 'le', 8),
      ],
      config.program.programId
    );

    try {
      await config.program.methods
        .startFight(new anchor.BN(2))
        .accounts({
          player1: config.player1.publicKey,
          player2: config.player2.publicKey,
          fight_player_pda: fightPlayerPda,
          player1_pda: config.player1Pda,
          player2_pda: config.player1Pda,
          fight_pda: config.fightPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([config.player1])
        .rpc();

      expect.fail(
        'Init a fight with same players and thrown error should have failed but it succeded'
      );
    } catch (_err) {
      expect(_err).to.be.instanceOf(anchor.AnchorError);
      const err: anchor.AnchorError = _err;
      expect(err.error.errorCode.code).to.equal('LevelTooHigh');
    }
  });

  it('run a fight', async () => {
    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(0).toArrayLike(Buffer, 'le', 8),
      ],
      config.program.programId
    );

    let counter = new anchor.BN(0);

    await config.program.methods
      .updatePlayer([500, 500, 0])
      .accounts({
        user: config.player2.publicKey,
        player: config.player2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([config.player2])
      .rpc();

    await config.program.methods
      .updatePlayer([0, 0, 1000])
      .accounts({
        user: config.player3.publicKey,
        player: config.player3Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([config.player3])
      .rpc();

    await config.program.methods
      .startFight(counter)
      .accounts({
        player1: config.player3.publicKey,
        player2: config.player2.publicKey,
        fightplayer_pda: fightPlayerPda,
        player1_pda: config.player3Pda,
        player2_pda: config.player2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([config.player2])
      .rpc();

    let fightPlayerData = await config.program.account.fightPlayer.fetch(
      fightPlayerPda
    );

    expect(config.player2.publicKey.toString()).to.equal(
      fightPlayerData.status.won.winner.toString()
    );
  });

  // Fight
  it('start a fight with status is not initialized and thrown error', async () => {
    let fightData = await config.program.account.fight.fetch(config.fightPda);

    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(fightData.counter).toArrayLike(Buffer, 'le', 8),
      ],
      config.program.programId
    );

    try {
      await config.program.methods
        .startFight(new anchor.BN(0))
        .accounts({
          player1: config.player3.publicKey,
          player2: config.player2.publicKey,
          fightplayer_pda: fightPlayerPda,
          player1_pda: config.player3Pda,
          player2_pda: config.player2Pda,
          systemProgram: anchor.web3.SystemProgram.programId,
        } as any)
        .signers([config.player2])
        .rpc();

      expect.fail(
        'Init a fight with same players and thrown error should have failed but it succeded'
      );
    } catch (_err) {
      expect(_err).to.be.instanceOf(anchor.AnchorError);
      const err: anchor.AnchorError = _err;
      expect(err.error.errorCode.code).to.equal('-PlayersMustBeInitilazed');
    }
  });
});
