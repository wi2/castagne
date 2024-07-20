'use client';

import AcceptFight from '@/components/Fight/AcceptFight';
import { useWallet } from '@solana/wallet-adapter-react';
import React from 'react';

const Page = () => {
  const { publicKey } = useWallet();

  if (!publicKey) return null;

  return <AcceptFight account={publicKey} />;
};

export default Page;
