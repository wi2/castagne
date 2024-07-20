'use client';

import HistoryFights from '@/components/Fight/HistoryFight';
import { useWallet } from '@solana/wallet-adapter-react';
import React from 'react';

const Page = () => {
  const { publicKey } = useWallet();

  if (!publicKey) return null;

  return <HistoryFights account={publicKey} />;
};

export default Page;
