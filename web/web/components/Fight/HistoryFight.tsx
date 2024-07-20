'use client';

import React from 'react';

import { PublicKey } from '@solana/web3.js';

import usePlayers from '../hooks/usePlayers';
import { useFetchFightPlayerByIds } from '../hooks/useFetchMultiple';

const HistoryFights = ({ account }: { account: PublicKey }) => {
  const players = usePlayers();

  const playerFights =
    players.data?.find(
      (player) => player.account.user.toString() === account.toString()
    )?.account.fights || [];

  const { fights } = useFetchFightPlayerByIds({
    indexes: playerFights,
  });

  return (
    <div>
      <h1 className="my-2 border-b border-slate-600 text-lg text-pink-600">
        History
      </h1>

      <div className="grid md:grid-cols-1 gap-4 text-sm">
        {fights
          ?.filter(
            (f) =>
              (f?.player2.toString() === account.toString() ||
                f?.player1.toString() === account.toString()) &&
              !f?.status.initialized
          )
          .map((fight, index) => (
            <div
              key={`fights-history-${index}`}
              className="text-sm border-b border-slate-700/60"
            >
              <div className="grid grid-cols-3">
                <div>player 1</div>
                <div className="col-span-2 text-teal-500">
                  {
                    players.data?.find(
                      (player) =>
                        player.account.user.toString() ===
                        fight?.player1.toString()
                    )?.account.username
                  }
                </div>

                <div>player 2</div>
                <div className="col-span-2 text-teal-500">
                  {
                    players.data?.find(
                      (player) =>
                        player.account.user.toString() ===
                        fight?.player2.toString()
                    )?.account.username
                  }
                </div>

                <div>status</div>
                <div className="text-teal-500">
                  {String(
                    (fight?.status.initialized && 'initialized') ||
                      (fight?.status.won?.winner.toString() ===
                        fight?.player1.toString() &&
                        'player1 won') ||
                      (fight?.status.won?.winner.toString() ===
                        fight?.player2.toString() &&
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
