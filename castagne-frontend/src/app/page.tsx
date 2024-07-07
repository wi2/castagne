"use client";

import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
	async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
	{ ssr: false }
);

export default function Home() {
	return (
		<main className="flex items-center justify-center min-h-screen">
		  	<div className="border hover:border-slate-900 rounded">
				<WalletMultiButtonDynamic />
			</div>
		</main> 
	);
}
