"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
require("@solana/wallet-adapter-react-ui/styles.css");


const AppWalletProvider = ({children}: {children: React.ReactNode}) => {
    const selectNetwork = (): string => {
        if (process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true') {
            if (process.env.NEXT_PUBLIC_ENABLE_LOCAL_TESTNET === 'true' 
                && process.env.NEXT_PUBLIC_LOCAL_TESTNET) {
                return process.env.NEXT_PUBLIC_LOCAL_TESTNET;
            }
    
            return clusterApiUrl(WalletAdapterNetwork.Devnet);
        }
        return clusterApiUrl(WalletAdapterNetwork.Mainnet);
    }
 
    const endpoint = useMemo(() => selectNetwork(), []);
    const wallets = useMemo(
        () => [
            // manually add any legacy wallet adapters here
            // new UnsafeBurnerWalletAdapter(),
        ],
        [],
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default AppWalletProvider