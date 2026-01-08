# AGENTS.md - Kairo Development Guide

Guides AI agents working on Kairo Web3 freelance marketplace.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4, Framer Motion, class-variance-authority
- **Web3**: wagmi/viem, RainbowKit, tempo.ts (TIP-20)
- **Database**: Supabase (PostgreSQL + RLS)
- **UI**: class-variance-authority, lucide-react icons

## Development Commands

```bash
npm run dev          # Start dev server with turbopack
npm run build          # Production build (types + lint)
npm start              # Start production server
npm run lint          # Run ESLint
npx eslint app/page.tsx  # Lint single file
# Note: No test suite yet - add vitest/playwright when needed
```

## Code Style

### Imports

Use absolute imports with `@/` path alias. Order: external → internal → components → utils:
```typescript
"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

### TypeScript

**Strict mode enabled** - No implicit any, proper typing required:
```typescript
export interface Gig {
  id: string;
  title: string;
  price: number;
  freelancerAddress: `0x${string}`; // Web3 address type
  status: "open" | "paid" | "completed";
}

const address: `0x${string}` = "0x1234..."; // Typecast
const amount: bigint = parseUnits("100", 6); // 6 decimals for stablecoins
```

### Naming Conventions

| Entity | Convention | Example |
|--------|-------------|----------|
| Components | PascalCase | `Button.tsx`, `Hero.tsx` |
| Functions | camelCase | `createGig()`, `getBalance()` |
| Variables | camelCase | `userAddress`, `gigId` |
| Constants | UPPER_SNAKE_CASE | `USDC_ADDRESS`, `MAX_UINT256` |
| Types | PascalCase | `interface GigProps` |
| CSS Classes | kebab-case | `text-forest`, `bg-emerald-50` |

Web3-specific: `alphaUSD`, `betaUSD`, `thetaUSD`, `pathUSD`, `0x20c...1` (6 chars prefix)

### Server Actions (Next.js App Router)

Use `"use server"` directive and cache control:
```typescript
"use server";
import { unstable_noStore as noStore } from 'next/cache';
import { supabase } from '@/lib/supabase';

export async function createGig(data: GigInput) {
  noStore(); // Disable caching
  const { data, error } = await supabase.from("gigs").insert(data).select().single();
  if (error) {
    console.error("Error:", error);
    throw new Error("Failed to create gig");
  }
  return data;
}
```

### Client Components

Use `"use client"` directive for interactive components:
```typescript
"use client";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";

export default function Dashboard() {
  const { address } = useAccount();
  const { data: balance } = useReadContract({
    address: '0x20c...1',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { refetchInterval: 2000 },
  });

  useWatchContractEvent({
    address: tokenAddress,
    eventName: 'Transfer',
    args: { to: address },
    onLogs(logs) { /* Handle on-chain events */ },
  });
}
```

### UI Components

Use **class-variance-authority** for variants + **cn()** utility:
```typescript
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      whileTap={{ scale: 0.98 }}
      ref={ref}
      {...props}
    />
  )
);
```

### Error Handling

Try-catch with descriptive errors:
```typescript
export async function payAction({ gigId, amount }: PaymentProps) {
  try {
    await walletClient.sendTransaction({ ... });
  } catch (error: unknown) {
    console.error("Payment Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { status: 'error', message: errorMessage };
  }
}
```

Expected errors (return gracefully):
```typescript
if (error.message?.includes('rejected')) {
  return { status: 'cancelled' }; // User rejected
}
if (!gig) {
  return null; // No data found
}
```

### Web3 / Blockchain Interactions

**Address validation:**
```typescript
const address: `0x${string}` = userWallet as `0x${string}`;
import { isAddress } from 'viem';
if (!isAddress(input)) throw new Error("Invalid address");
```

**Amounts (6 decimals):**
```typescript
import { parseUnits, formatUnits } from 'viem';
const amountWei = parseUnits("100.50", 6); // 100500000n
const amountUSD = formatUnits(balanceWei, 6); // "100.50"
```

**Memo creation (32 bytes):**
```typescript
function createMemo(text: string): `0x${string}` {
  const hexMemo = Buffer.from(text).toString('hex').padEnd(64, '0'); // 32 bytes
  return `0x${hexMemo}`;
}
```

**Transaction handling (instant finality):**
```typescript
const receipt = await client.waitForTransactionReceipt({
  hash: txHash,
  pollingInterval: 100, // Faster for Tempo (4s finality)
});
```

### Database (Supabase)

Query patterns:
```typescript
// Single record
const { data: gig } = await supabase.from("gigs").select("*").eq("id", id).single();

// Multiple records with join
const { data: txs } = await supabase
  .from("transactions")
  .select("*, gigs(title)") // Join gigs
  .eq("client_address", address)
  .order("created_at", { ascending: false })
  .limit(10);
```

Cache invalidation:
```typescript
import { revalidatePath } from 'next/cache';
await supabase.from("gigs").update({ status: 'paid' }).eq("id", id);
revalidatePath('/app'); // Invalidate route
```

## File Structure

```
/app
  /app              # Main dashboard (client)
  /gigs/[id]       # Gig detail pages
  /gigs/new         # Create gig form
  /pay/[gigId]     # Payment flow
  /actions
    /gig.ts         # Gig CRUD operations
    /pay.ts         # Payment processing
/components
  /ui              # Reusable UI components
  /landing          # Landing page components
  /tempo           # Web3-specific components
/lib
  supabase.ts       # Supabase client
  tempo-client.ts    # viem + tempo.ts clients
  utils.ts         # cn() utility
```

## Key Principles

1. **Type Safety**: No `any`, proper interfaces, strict TypeScript
2. **Error Boundaries**: Try-catch everywhere, meaningful error messages
3. **User Experience**: Real-time updates via wagmi events, optimistic UI
4. **Security**: Validate addresses, amounts; never expose private keys
5. **Performance**: Use `noStore()` for server actions, revalidate after mutations
6. **Web3 Native**: Leverage tempo.ts actions over raw contract calls
7. **Consistency**: Follow existing patterns (wagmi hooks, Supabase queries)

## Common Gotchas

- **Instant finality**: Tempo Testnet finalizes in ~4s, use `pollingInterval: 100`
- **Memo length**: Exactly 64 hex characters (32 bytes), pad with '0'
- **Decimals**: Stablecoins use 6 decimals, always parse/format correctly
- **Address format**: Typecast as `0x${string}` for wagmi/viem compatibility
- **Client vs Server**: Client components = "use client", Server actions = "use server"
- **Cache control**: Server actions must use `noStore()` for real-time data
