'use client';

import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';

import { useCastagneProgram } from './useCastagneProgram';
import { BN } from '@coral-xyz/anchor';

export const useFetchFightPlayerByIds = ({ indexes }: { indexes: BN[] }) => {
  const { cluster, program } = useCastagneProgram();
  const pdas = indexes.map((index) => {
    const [fightPlayerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('fight_player'), index.toArrayLike(Buffer, 'le', 8)],
      program.programId
    );
    return fightPlayerPda;
  });

  const fightsQuery =
    useQuery({
      queryKey: ['fight_player', 'fetch', { cluster, pdas }],
      queryFn: () => program.account.fightPlayer.fetchMultiple(pdas),
    }) || [];

  return {
    program,
    fights: fightsQuery.data || [],
  };
};
