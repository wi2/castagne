import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { CastagneBackend } from '../../target/types/castagne_backend';
import { expect } from 'chai';
import { AnchorProvider } from '@coral-xyz/anchor/dist/cjs/provider';

describe('start fight', () => {
  const PLAYER_XP_INIT = 1000;
  const userName1 = 'bob';
  const userName2 = 'alice';

  const program = anchor.workspace.CastagneBackend as Program<CastagneBackend>;
  const provider: AnchorProvider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const adminWallet = provider.wallet as anchor.Wallet;
  const player1: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  const player2: anchor.web3.Keypair = anchor.web3.Keypair.generate();

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

  console.log('admin  :', adminWallet.publicKey.toString());
  console.log('player1:', player1.publicKey.toString());
  console.log('player2:', player2.publicKey.toString());

  it('run a fight', async () => {
    let txairdropPlayer1 = await program.provider.connection.requestAirdrop(
      player1.publicKey,
      10_000_000_000
    );
    let txairdropPlayer2 = await program.provider.connection.requestAirdrop(
      player2.publicKey,
      10_000_000_000
    );

    await program.provider.connection.confirmTransaction(txairdropPlayer1);
    await program.provider.connection.confirmTransaction(txairdropPlayer2);

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

    let player = await program.account.player.fetch(player1Pda);

    expect(player.user.toString()).to.equal(player1.publicKey.toString());
    expect(player.username).to.equal(userName1);
    expect(player.attributes.length).to.equal(3);
    expect(
      player.attributes.reduce((partialSum, a) => partialSum + a, 0)
    ).to.equal(0);
    expect(player.xp).to.equal(PLAYER_XP_INIT);
    expect(player.fights.length).to.equal(0);
  });

  it('Updates player attributes and succeed', async () => {
    const attributes = [250, 250, 0];
    const attributes_player2 = [0, 0, 500];
    await program.methods
      .updatePlayer(attributes)
      .accounts({
        user: player1.publicKey,
        player: player1Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player1])
      .rpc();

    await program.methods
      .updatePlayer(attributes_player2)
      .accounts({
        user: player2.publicKey,
        player: player2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player2])
      .rpc();

    const [fightPlayerPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('fight_player'),
        new anchor.BN(0).toArrayLike(Buffer, 'le', 8),
      ],
      program.programId
    );

    console.log('fightPlayerPda,', fightPlayerPda);

    await program.methods
      .initFightConfig()
      .accounts({
        owner: adminWallet.publicKey,
        fight_pda: fightPda,
      } as any)
      .rpc();

    await program.methods
      .initFight()
      .accounts({
        player1: player1.publicKey,
        player2: player2.publicKey,
        fightplayer_pda: fightPlayerPda,
        player1_pda: player1Pda,
        player2_pda: player2Pda,
        fight_pda: fightPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player1])
      .rpc();

    let fightPlayerData = await program.account.fightPlayer.fetch(
      fightPlayerPda
    );

    let counter = new anchor.BN(0);

    await program.methods
      .startFight(counter)
      .accounts({
        player1: player1.publicKey,
        player2: player2.publicKey,
        fightplayer_pda: fightPlayerPda,
        player1_pda: player1Pda,
        player2_pda: player2Pda,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .signers([player2])
      .rpc();

    fightPlayerData = await program.account.fightPlayer.fetch(fightPlayerPda);

    expect(player1.publicKey.toString()).to.equal(
      fightPlayerData.status.won.winner.toString()
    );
  });
});
