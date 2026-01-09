import { decodeErrorResult } from 'viem';
import { Abis } from 'tempo.ts/viem';

const data = "0x832f98b50000000000000000000000000000000000000000000000000000271bb6d4ce400000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000020c0000000000000000000000000000000000000";

try {
  const result = decodeErrorResult({
    abi: Abis.stablecoinExchange,
    data: data as `0x${string}`
  });
  console.log("Decoded Error:", result);
} catch (error) {
  console.error("Failed to decode:", error);
}
