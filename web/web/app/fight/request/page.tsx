'use client';

import RequestFight from '@/components/Fight/RequestFight';
import { useWallet } from '@solana/wallet-adapter-react';
import React from 'react';

const Page = () => {
  const { publicKey } = useWallet();

  if (!publicKey) return null;

  return <RequestFight account={publicKey} />;
};

export default Page;
