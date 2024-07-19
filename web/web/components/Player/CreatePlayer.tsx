'use client'

import React, { useState } from 'react'
import { WalletButton } from '../solana/solana-provider';
import { useCastagneProgramAccount } from '../Player/PlayerDataAccess';
import { PublicKey } from '@solana/web3.js';
import { Input } from '../ui-elements/Input';
import { Button } from '../ui-elements/Button';

interface ICreatePlayerForm {
  address?: PublicKey
  username?: string
}

const CreatePlayer = ({ account }: { account: PublicKey }) => {
  const { createPlayer } = useCastagneProgramAccount({ account });
  const [formData, setFormData] = useState<ICreatePlayerForm>({
    address: account,
    username: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formData.username) createPlayer.mutateAsync(formData.username);
}

  return account ? (
    <div>
      <form onSubmit={handleSubmit}>
        <div className={`relative flex flex-col w-[24rem]
          border dark:border-slate-700 border-slate-300 rounded-lg p-6`}>
            <h1 className={`font-semibold`}>Create player</h1>
            <p className='text-sm mt-3'>Create your player by providing a username</p>

            <Input props={{
                id: "username", name: "username", placeHolder: "Player name", label: "Player name",
                value: formData.username, onChange: handleChange, required: true,
                classes: { box: `mt-6`, input: `mt-2` }
            }} />

            <div className="mt-8 relative flex font-normal text-sm gap-4 justify-end">
              <Button props={{}}>Create</Button>
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

export default CreatePlayer
