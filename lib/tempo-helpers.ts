/**
 * Tempo TIP-20 Helper Functions
 *
 * Utility functions for TIP-20 token operations including:
 * - Amount formatting (6 decimals for stablecoins)
 * - Memo creation and structured memo generation
 * - Address validation
 * - Transaction helpers
 */

import { parseUnits, formatUnits, isAddress } from 'viem';
import { Address } from 'viem';

// ==========================================
// AMOUNT FORMATTING (6 Decimals for Stablecoins)
// ==========================================

/**
 * Parse human-readable USD amount to wei (6 decimals)
 * @param usd - Human readable USD amount (e.g., "100.50")
 * @returns BigInt in wei
 */
export function parseAmount(usd: number | string): bigint {
  const amount = typeof usd === 'string' ? parseFloat(usd) : usd;
  if (isNaN(amount) || amount < 0) {
    throw new Error('Invalid amount: must be a positive number');
  }
  return parseUnits(amount.toString(), 6); // 6 decimals for stablecoins
}

/**
 * Format wei amount to human-readable USD string
 * @param wei - BigInt in wei
 * @param minimumFractionDigits - Minimum decimal places (default: 2)
 * @returns Formatted USD string (e.g., "100.50")
 */
export function formatAmount(
  wei: bigint,
  minimumFractionDigits: number = 2
): string {
  const usd = formatUnits(wei, 6); // 6 decimals for stablecoins
  return parseFloat(usd).toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: 6,
  });
}

// ==========================================
// MEMO CREATION (32 Bytes = 64 Hex Characters)
// ==========================================

/**
 * Create 32-byte hex memo from text string
 * @param text - Text to convert to memo
 * @returns 32-byte hex string prefixed with '0x'
 */
export function createMemo(text: string): `0x${string}` {
  if (text.length > 32) {
    throw new Error('Memo text cannot exceed 32 characters');
  }

  const hexMemo = Buffer.from(text)
    .toString('hex')
    .padEnd(64, '0'); // Exactly 32 bytes (64 hex chars)

  return `0x${hexMemo}` as `0x${string}`;
}

/**
 * Memo types for structured tracking
 */
export type MemoType = 'PAY' | 'INV' | 'REF' | 'ORD';

/**
 * Generate structured memo for tracking
 * Format: TYPE-ID-TIMESTAMP
 * Example: PAY-GIG-123456-789012
 *
 * @param type - Memo type (PAY, INV, REF, ORD)
 * @param id - Reference ID (gig ID, invoice ID, etc.)
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns 32-byte hex memo
 */
export function generateStructuredMemo(
  type: MemoType,
  id: string,
  timestamp?: number
): `0x${string}` {
  const ts = timestamp || Date.now();
  const shortTimestamp = ts.toString().slice(-6);

  const memoText = `${type}-${id}-${shortTimestamp}`;

  if (memoText.length > 32) {
    throw new Error('Structured memo too long - ID might be too long');
  }

  return createMemo(memoText);
}

/**
 * Parse structured memo back to components
 * @param memo - Hex memo string
 * @returns Parsed memo object or null if not structured
 */
export function parseStructuredMemo(memo: string): {
  type: MemoType;
  id: string;
  timestamp: number;
} | null {
  try {
    const cleanMemo = memo.startsWith('0x') ? memo.slice(2) : memo;
    const text = Buffer.from(cleanMemo, 'hex').toString();

    const parts = text.split('-');
    if (parts.length !== 3) return null;

    const [typeStr, id, timestampStr] = parts;

    const validTypes: MemoType[] = ['PAY', 'INV', 'REF', 'ORD'];
    if (!validTypes.includes(typeStr as MemoType)) return null;

    if (!/^\d{6}$/.test(timestampStr)) return null;

    const now = Date.now().toString().slice(0, -6);
    const fullTimestamp = parseInt(now + timestampStr);

    return {
      type: typeStr as MemoType,
      id,
      timestamp: fullTimestamp,
    };
  } catch {
    return null;
  }
}

// ==========================================
// ADDRESS VALIDATION
// ==========================================

/**
 * Validate Ethereum address
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function validateAddress(address: string): address is Address {
  return isAddress(address);
}

/**
 * Validate and typecast address
 * @param address - Address to validate and cast
 * @returns Typecast address
 * @throws Error if invalid address
 */
export function ensureAddress(address: string): Address {
  if (!validateAddress(address)) {
    throw new Error(`Invalid Ethereum address: ${address}`);
  }
  return address as Address;
}

// ==========================================
// STABLECOIN ADDRESSES (Tempo Testnet)
// ==========================================

/**
 * Tempo stablecoin addresses (Testnet)
 */
export const STABLECOINS = {
  alphaUSD: '0x20c0000000000000000000000000000000000001' as Address,
  betaUSD: '0x20c0000000000000000000000000000000000002' as Address,
  thetaUSD: '0x20c0000000000000000000000000000000000003' as Address,
  pathUSD: '0x20c0000000000000000000000000000000000000' as Address,
} as const;

/**
 * DEX address (Precompiled)
 */
export const DEX_ADDRESS = '0xdec0000000000000000000000000000000000000' as Address;

/**
 * Get stablecoin name from address
 * @param address - Stablecoin address
 * @returns Stablecoin name or null if not found
 */
export function getStablecoinName(address: Address): string | null {
  const entries = Object.entries(STABLECOINS);
  const found = entries.find(([, addr]) => addr === address);
  return found ? found[0] : null;
}

/**
 * Get all stablecoin addresses
 * @returns Array of stablecoin addresses
 */
export function getAllStablecoinAddresses(): Address[] {
  return Object.values(STABLECOINS);
}

// ==========================================
// TRANSACTION HELPERS
// ==========================================

/**
 * Transaction polling interval for Tempo (instant finality ~4s)
 */
export const TEMPO_POLLING_INTERVAL = 100;

/**
 * Maximum uint256 value for infinite approval
 */
export const MAX_UINT256 = 2n ** 256n - 1n;

/**
 * Check if transaction was successful
 * @param receipt - Transaction receipt
 * @returns True if successful
 */
export function isTransactionSuccessful(receipt: { status?: string | number } | null | undefined): boolean {
  return receipt?.status === 'success' || receipt?.status === 1;
}

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Transfer parameters
 */
export interface TransferParams {
  token: Address;
  to: Address;
  amount: bigint;
  memo?: `0x${string}`;
}

/**
 * Approval parameters
 */
export interface ApprovalParams {
  token: Address;
  spender: Address;
  amount: bigint;
}

/**
 * Swap parameters
 */
export interface SwapParams {
  tokenIn: Address;
  tokenOut: Address;
  amountIn: bigint;
  minAmountOut: bigint;
  slippagePercent?: number;
}

/**
 * Memo components
 */
export interface MemoComponents {
  type: MemoType;
  id: string;
  timestamp: number;
}