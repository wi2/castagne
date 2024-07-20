'use client';

import React from 'react';

import { useFight } from '@/components/hooks/useFight';
import { PublicKey } from '@solana/web3.js';

import { useCastagneProgram } from '../Player/PlayerDataAccess';

const HistoryFights = ({ account }: { account: PublicKey }) => {
  const { fightsQuery } = useFight({
    account,
  });

  const { players } = useCastagneProgram();

  return (
    <div>
      <h1 className="my-2 border-b border-slate-600 text-lg text-pink-600">
        History
      </h1>

      <div className="grid md:grid-cols-1 gap-4 text-sm">
        {fightsQuery.data
          ?.filter(
            (f) =>
              (f.account.player2.toString() === account.toString() ||
                f.account.player1.toString() === account.toString()) &&
              !f.account.status.initialized
          )
          .map((fight) => (
            <div
              key={fight.publicKey.toString()}
              className="text-sm border-b border-slate-700/60"
            >
              <div className="grid grid-cols-3">
                <div>player 1</div>
                <div className="col-span-2 text-teal-500">
                  {
                    players.data?.find(
                      (player) =>
                        player.account.user.toString() ===
                        fight.account.player1.toString()
                    )?.account.username
                  }
                </div>

                <div>player 2</div>
                <div className="col-span-2 text-teal-500">
                  {
                    players.data?.find(
                      (player) =>
                        player.account.user.toString() ===
                        fight.account.player2.toString()
                    )?.account.username
                  }
                </div>

                <div>status</div>
                <div className="text-teal-500">
                  {String(
                    (fight.account.status.initialized && 'initialized') ||
                      (fight.account.status.won?.winner.toString() ===
                        fight.account.player1.toString() &&
                        'player1 won') ||
                      (fight.account.status.won?.winner.toString() ===
                        fight.account.player2.toString() &&
                        'player2 won')
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default HistoryFights;
