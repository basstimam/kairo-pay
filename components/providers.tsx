'use client';

import * as React from 'react';
import {
  DynamicContextProvider,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { createConfig, WagmiProvider, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tempo } from 'tempo.ts/chains';

// Define Tempo Chain
const tempoChain = tempo({ feeToken: '0x20c0000000000000000000000000000000000001' });

// Wagmi Config (Minimal, Dynamic handles connections)
const config = createConfig({
  chains: [tempoChain],
  multiInjectedProviderDiscovery: false,
  transports: {
    [tempoChain.id]: http('https://rpc.testnet.tempo.xyz'),
  },
});

const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || 'PLACEHOLDER_DYNAMIC_ENV_ID';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());

  // Safe Guard for Missing Env ID
  if (!DYNAMIC_ENV_ID || DYNAMIC_ENV_ID === 'PLACEHOLDER_DYNAMIC_ENV_ID') {
    return (
      <div className="min-h-screen bg-lime-50 flex flex-col items-center justify-center p-8 text-center font-serif text-forest">
        <div className="bg-white p-8 rounded-xl shadow-[4px_4px_0px_0px_#0A3D2A] max-w-md border-2 border-forest">
            <h1 className="text-2xl font-bold mb-4">Setup Required</h1>
            <p className="mb-6 font-mono text-sm leading-relaxed">
                The <code>NEXT_PUBLIC_DYNAMIC_ENV_ID</code> is missing in your environment configuration.
            </p>
            <div className="bg-lime-50 p-4 rounded border border-forest/10 mb-6 text-left">
                <p className="text-xs text-forest/60 mb-2 font-mono uppercase">Add to .env file:</p>
                <code className="text-xs break-all text-emerald-600 font-bold block">
                    NEXT_PUBLIC_DYNAMIC_ENV_ID=...
                </code>
            </div>
            <p className="text-xs text-forest/60">
                Please restart the server after adding the variable.
            </p>
        </div>
      </div>
    );
  }

  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_ENV_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: {
          evmNetworks: [
            {
              blockExplorerUrls: ['https://explore.tempo.xyz'],
              chainId: 42429,
              chainName: 'Tempo Testnet',
              iconUrls: ['https://docs.tempo.xyz/img/logo.png'],
              name: 'Tempo Testnet',
              nativeCurrency: {
                decimals: 18,
                name: 'AlphaUSD',
                symbol: 'aUSD',
              },
              networkId: 42429,
              rpcUrls: ['https://rpc.testnet.tempo.xyz'],
              vanityName: 'Tempo',
            },
          ],
        },
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
