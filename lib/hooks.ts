/**
 * Custom hooks for Web3 operations
 */

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { getAllStablecoinAddresses, getStablecoinName } from "./tempo-helpers";
import { Address } from "viem";

/**
 * Hook to get balance for a single token
 */
export function useTokenBalance(tokenAddress: Address) {
  const { address } = useAccount();

  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      refetchInterval: 2000,
      enabled: !!address
    }
  });
}

/**
 * Hook to get balances for all stablecoins
 */
export function useMultiBalance() {
  const { address: userAddress } = useAccount();
  const stablecoinAddresses = getAllStablecoinAddresses();

  const contracts = stablecoinAddresses.map(tokenAddress => ({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf' as const,
    args: userAddress ? [userAddress] : undefined,
  }));

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      refetchInterval: 2000,
      enabled: !!userAddress
    }
  });

  const balances = data?.reduce((acc, result, index) => {
    const tokenAddress = stablecoinAddresses[index];
    const tokenName = getStablecoinName(tokenAddress) || 'unknown';
    const balance = result.result ? BigInt(result.result.toString()) : 0n;

    acc[tokenName] = {
      address: tokenAddress,
      balance,
      formatted: balance.toString(),
      usdValue: Number(balance) / 10**6
    };

    return acc;
  }, {} as Record<string, { address: Address; balance: bigint; formatted: string; usdValue: number }>) || {};

  const totalBalance = Object.values(balances).reduce((sum, token) => sum + token.usdValue, 0);

  return {
    balances,
    totalBalance,
    isLoading,
    error,
    refetch
  };
}

/**
 * Hook to get allowance for a token
 */
export function useTokenAllowance(tokenAddress: Address, spenderAddress: Address) {
  const { address } = useAccount();

  return useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: !!address && !!spenderAddress
    }
  });
}

/**
 * Hook to check if token approval is needed
 */
export function useTokenApproval(tokenAddress: Address, spenderAddress: Address, amount: bigint) {
  const { address } = useAccount();

  const allowance = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && spenderAddress ? [address, spenderAddress] : undefined,
    query: {
      enabled: !!address && !!spenderAddress
    }
  });

  const needsApproval = allowance.data ? BigInt(allowance.data.toString()) < amount : true;
  const isLoading = allowance.isLoading;
  const error = allowance.error;

  return {
    needsApproval,
    allowance: allowance.data ? BigInt(allowance.data.toString()) : 0n,
    isLoading,
    error,
    // Note: Actual approval should be done via server action or external tool
    // as it requires wallet interaction
  };
}