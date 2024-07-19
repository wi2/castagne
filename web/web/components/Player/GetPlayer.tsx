'use client'

import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { useCastagneProgramAccount } from '../Player/PlayerDataAccess';
import { PublicKey } from '@solana/web3.js';


const GetPlayer = ({ account }: { account: PublicKey }) => {
  const { publicKey } = useWallet();
  const { playerQuery } = useCastagneProgramAccount({account});

  return publicKey ? (
    <div>
      <h1 className='my-2 border-b border-slate-600 text-lg text-pink-600'>My player</h1>

      <div key={publicKey.toString()} className='text-sm'>
        <div className='grid grid-cols-2'>
            <div>Username</div>
            <div className='text-teal-500'>{playerQuery.data?.username}</div>

            <div>Key</div>
            <div className='text-teal-500'>{playerQuery.data?.user.toString()}</div>
        </div>

        <h2 className='font-bold'>Attributes</h2>
        <div className='grid grid-cols-2'>
            <div>Force</div><div className='text-teal-500'>{playerQuery.data?.attributes[0]}</div>
            <div>Strength</div><div className='text-teal-500'>{playerQuery.data?.attributes[1]}</div>
            <div>Robusteness</div><div className='text-teal-500'>{playerQuery.data?.attributes[2]}</div>
            <div>XP</div><div className='text-teal-500'>{playerQuery.data?.xp}</div>
        </div>
      </div>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}

export default GetPlayer

