import { createClient, http, publicActions, walletActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { tempo } from 'tempo.ts/chains';
import { tempoActions } from 'tempo.ts/viem';

// Ensure KAIRO_PRIVATE_KEY is set in your environment variables for server-side operations
// For dev/test, you might want to use a safe default or throw an error
const privateKey = process.env.KAIRO_PRIVATE_KEY as `0x${string}` || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default is Foundry Anvil account #0 (TEST ONLY)

export const kairoAccount = privateKeyToAccount(privateKey); 

// Official Tempo Testnet configuration
export const tempoChain = tempo({ feeToken: '0x20c0000000000000000000000000000000000001' }); // AlphaUSD on Testnet

export const publicClient = createClient({
  chain: tempoChain,
  transport: http('https://rpc.testnet.tempo.xyz'),
})
  .extend(publicActions)
  .extend(tempoActions());

export const walletClient = createClient({
  account: kairoAccount,
  chain: tempoChain,
  transport: http('https://rpc.testnet.tempo.xyz'),
})
  .extend(walletActions)
  .extend(tempoActions());
