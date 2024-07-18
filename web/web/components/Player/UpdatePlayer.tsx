'use client'

import React, { useState } from 'react'
import { WalletButton } from '../solana/solana-provider';
import { useCastagneProgramAccount } from './PlayerDataAccess';
import { PublicKey } from '@solana/web3.js';
import { Button } from '../ui-elements/Button';
import { Input } from '../ui-elements/Input';


interface IUpdatePlayerForm {
  address?: PublicKey
  speed: number
  strength: number
  robustness: number
}


const UpdatePlayer = ({ account }: { account: PublicKey }) => {
  const { updatePlayer, playerQuery } = useCastagneProgramAccount({ account });
  const [formData, setFormData] = useState<IUpdatePlayerForm>({
    address: account,
    speed: 0,
    strength: 0,
    robustness: 0,

  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    updatePlayer.mutateAsync([
      formData.speed,
      formData.strength,
      formData.robustness,
    ]);
  }

  return account ? (
    <div>
      <form onSubmit={handleSubmit}>
        <div className={`relative flex flex-col w-[24rem]
          border dark:border-slate-700 border-slate-300 rounded-lg p-6`}>
            <h1 className={`font-semibold`}>Update player</h1>
            <p className='text-sm mt-3'>Update attributes player</p>
            <p>XP available : <span className='text-teal-500'>{playerQuery.data?.xp}</span></p>

            <Input props={{
                id: "speed", name: "speed",
                label: `Speed ${playerQuery.data?.attributes[0]}`,
                placeHolder: playerQuery.data?.attributes[0].toString(),
                value: formData.speed.toString(), onChange: handleChange, required: true,
                classes: { box: `mt-6`, input: `mt-2` }
            }} />

            <Input props={{
                id: "strength", name: "strength", placeHolder: playerQuery.data?.attributes[1].toString(),
                label: `Strength ${playerQuery.data?.attributes[1]}`,
                value: formData.strength.toString(), onChange: handleChange, required: true,
                classes: { box: `mt-6`, input: `mt-2` }
            }} />

            <Input props={{
                id: "robustness", name: "robustness", placeHolder: playerQuery.data?.attributes[2].toString(),
                label: `Robustness ${playerQuery.data?.attributes[2]}`,
                value: formData.robustness.toString(), onChange: handleChange, required: true,
                classes: { box: `mt-6`, input: `mt-2` }
            }} />

            <div className="mt-8 relative flex font-normal text-sm gap-4 justify-end">
              <Button props={{}}>Update</Button>
            </div>
        </div>
      </form>
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

export default UpdatePlayer
