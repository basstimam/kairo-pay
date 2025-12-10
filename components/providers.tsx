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

const queryClient = new QueryClient();

// Placeholder ID - User must update this!
const DYNAMIC_ENV_ID = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || 'PLACEHOLDER_DYNAMIC_ENV_ID';

export function Providers({ children }: { children: React.ReactNode }) {
  if (DYNAMIC_ENV_ID === 'PLACEHOLDER_DYNAMIC_ENV_ID') {
    console.warn("⚠️ Dynamic Environment ID is missing. features will not work until set in .env");
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
