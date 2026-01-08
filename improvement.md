# 📚 Implementasi TIP-20 Operations

Dokumen ini menjelaskan cara implementasi berbagai operasi TIP-20 (Tempo Token Standard) untuk integrasi di web application.

---

## 🎯 1. Simple Transfer with Memo

**Tujuan**: Transfer token TIP-20 dengan memo untuk tracking/reconciliation

### Parameters:
- `token`: Address token TIP-20 yang akan ditransfer
- `receiver`: Address penerima
- `amount`: Jumlah token (dalam wei, 6 decimals untuk stablecoin)
- `memo`: 32-byte hex string untuk tracking/notes

### Implementation:
```typescript
import { encodeFunctionData } from 'viem';
import { Abis } from 'tempo.ts/viem';

async function transferWithMemo(
  token: Address,
  receiver: Address,
  amount: bigint,
  memo: `0x${string}`
) {
  const data = encodeFunctionData({
    abi: Abis.tip20,
    functionName: 'transferWithMemo',
    args: [receiver, amount, memo]
  });

  const tx = await client.sendTransaction({
    to: token,
    data
  });
  
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

### Memo Format Example:
```typescript
// Generate memo dari string
function createMemo(text: string): `0x${string}` {
  const hexMemo = Buffer.from(text)
    .toString('hex')
    .padEnd(64, '0'); // Pad to 32 bytes
  return `0x${hexMemo}`;
}

// Example usage:
const memo = createMemo('INV-123456'); // Invoice payment
```

---

## 📦 2. Batch Transfer

**Tujuan**: Kirim multiple transfers dalam satu transaksi (atomic)

### Parameters:
- `transfers`: Array of `{ token, receiver, amount, memo }`

### Implementation:
```typescript
async function batchTransfer(
  transfers: Array<{
    token: Address;
    receiver: Address;
    amount: bigint;
    memo: `0x${string}`;
  }>
) {
  const calls = transfers.map(({ token, receiver, amount, memo }) => ({
    to: token,
    data: encodeFunctionData({
      abi: Abis.tip20,
      functionName: 'transferWithMemo',
      args: [receiver, amount, memo]
    })
  }));

  // Execute as batch (all or nothing)
  const tx = await client.sendTransaction({ calls });
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

### Use Cases:
- Payroll ke multiple addresses
- Batch payment untuk multiple invoices
- Airdrop token ke multiple wallets

---

## 🔄 3. Token Swap (DEX)

**Tujuan**: Swap antar TIP-20 tokens menggunakan Tempo DEX

### Parameters:
- `tokenIn`: Token yang akan di-swap
- `tokenOut`: Token yang akan diterima
- `amountIn`: Jumlah input
- `minAmountOut`: Minimum output (slippage protection)

### Implementation:
```typescript
import { Actions, Addresses } from 'tempo.ts/viem';

async function swapTokens(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint,
  slippagePercent: number = 0.5 // Default 0.5%
) {
  // Calculate minimum output
  const minAmountOut = amountIn - 
    (amountIn * BigInt(Math.floor(slippagePercent * 10))) / 1000n;

  const calls = [
    // 1. Approve tokenIn ke DEX
    Actions.token.approve.call({
      token: tokenIn,
      spender: Addresses.stablecoinExchange,
      amount: amountIn
    }),
    // 2. Execute swap
    Actions.dex.sell.call({
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut
    })
  ];

  const tx = await client.sendTransaction({ calls });
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

### Slippage Protection:
```typescript
// 0.5% slippage
const minOut = amountIn * 0.995;

// 1% slippage
const minOut = amountIn * 0.99;
```

---

## 💧 4. Add Liquidity (Place Limit Order)

**Tujuan**: Add liquidity dengan place buy/sell order di DEX

### Parameters:
- `token`: Token yang akan di-trade
- `amount`: Jumlah token
- `type`: 'buy' atau 'sell'
- `tick`: Price tick (0 untuk market rate)

### Implementation:
```typescript
async function addLiquidity(
  token: Address,
  amount: bigint,
  type: 'buy' | 'sell',
  tick: number = 0
) {
  // Untuk buy order, spend pathUSD
  // Untuk sell order, spend token itu sendiri
  const spendToken = type === 'buy' 
    ? Addresses.pathUSD 
    : token;

  const calls = [
    // 1. Approve token
    Actions.token.approve.call({
      token: spendToken,
      spender: Addresses.stablecoinExchange,
      amount
    }),
    // 2. Place order
    Actions.dex.place.call({
      token,
      amount,
      type,
      tick
    })
  ];

  const tx = await client.sendTransaction({ calls });
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

---

## 🎁 5. Claim Rewards

**Tujuan**: Claim semua pending rewards dari TIP-20 tokens

### Parameters:
- `tokens`: Array of token addresses untuk di-claim

### Implementation:
```typescript
async function claimRewards(tokens: Address[]) {
  const calls = tokens.map(token => ({
    to: token,
    data: encodeFunctionData({
      abi: Abis.tip20,
      functionName: 'claimRewards',
      args: []
    })
  }));

  try {
    const tx = await client.sendTransaction({ calls });
    return await client.waitForTransactionReceipt({ hash: tx });
  } catch (error) {
    // No rewards available tidak apa-apa
    if (error.message?.includes('no rewards')) {
      return { status: 'success', message: 'No rewards to claim' };
    }
    throw error;
  }
}
```

### Auto-claim All Stablecoins:
```typescript
const stablecoins = [
  '0x20c0000000000000000000000000000000000001', // alphaUSD
  '0x20c0000000000000000000000000000000000002', // betaUSD
  '0x20c0000000000000000000000000000000000003', // thetaUSD
  '0x20c0000000000000000000000000000000000000', // pathUSD
];

await claimRewards(stablecoins);
```

---

## ✅ 6. Approve Token

**Tujuan**: Approve token untuk digunakan smart contract (DEX, dll)

### Parameters:
- `token`: Token address
- `spender`: Contract address yang akan di-approve
- `amount`: Jumlah yang di-approve

### Implementation:
```typescript
async function approveToken(
  token: Address,
  spender: Address,
  amount: bigint
) {
  const data = encodeFunctionData({
    abi: Abis.tip20,
    functionName: 'approve',
    args: [spender, amount]
  });

  const tx = await client.sendTransaction({
    to: token,
    data
  });
  
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

### Infinite Approval (Max Uint256):
```typescript
const MAX_UINT256 = 2n ** 256n - 1n;

await approveToken(
  tokenAddress,
  dexAddress,
  MAX_UINT256 // Infinite approval
);
```

---

## 🔥 7. Burn Token

**Tujuan**: Burn/destroy token dari supply

### Parameters:
- `token`: Token address yang akan di-burn
- `amount`: Jumlah yang akan di-burn

### Implementation:
```typescript
async function burnToken(
  token: Address,
  amount: bigint
) {
  const data = encodeFunctionData({
    abi: Abis.tip20,
    functionName: 'burn',
    args: [amount]
  });

  const tx = await client.sendTransaction({
    to: token,
    data
  });
  
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

### Use Cases:
- Deflation mechanism
- Remove dari circulation
- Token buyback & burn

---

## 🪙 8. Create New Token

**Tujuan**: Deploy TIP-20 token baru

### Parameters:
- `name`: Token name (e.g., "My Token")
- `symbol`: Token symbol (e.g., "MTK")
- `currency`: 'USD', 'EUR', dll
- `admin`: Admin address untuk token

### Implementation:
```typescript
async function createToken(
  name: string,
  symbol: string,
  currency: string = 'USD',
  admin: Address
) {
  const calls = [
    Actions.token.create.call({
      name,
      symbol,
      currency,
      admin
    })
  ];

  const tx = await client.sendTransaction({ calls });
  const receipt = await client.waitForTransactionReceipt({ hash: tx });
  
  // Token address ada di logs
  const tokenAddress = receipt.logs[0]?.address;
  
  return { receipt, tokenAddress };
}
```

### Example:
```typescript
const { tokenAddress } = await createToken(
  'MyStableCoin',
  'MSC',
  'USD',
  myAddress
);

console.log('Token deployed at:', tokenAddress);
```

---

## 💳 9. Structured Memo Payment

**Tujuan**: Payment dengan memo terstruktur untuk reconciliation

### Memo Format:
```
TYPE-ID-TIMESTAMP
```

### Implementation:
```typescript
type MemoType = 'INV' | 'PAY' | 'REF' | 'ORD';

function generateStructuredMemo(
  type: MemoType,
  id: string,
  timestamp?: number
): `0x${string}` {
  const ts = timestamp || Date.now();
  const memoText = `${type}-${id}-${ts.toString().slice(-6)}`;
  
  const hexMemo = Buffer.from(memoText)
    .toString('hex')
    .padEnd(64, '0');
  
  return `0x${hexMemo}`;
}

// Usage
const invoiceMemo = generateStructuredMemo('INV', '123456');
// Result: "INV-123456-789012"

await transferWithMemo(
  tokenAddress,
  receiverAddress,
  amount,
  invoiceMemo
);
```

### Memo Types:
- **INV**: Invoice payment
- **PAY**: General payment
- **REF**: Reference/refund
- **ORD**: Order payment

---

## 🎯 10. Set Reward Recipient

**Tujuan**: Redirect rewards ke address berbeda dari token holder

### Parameters:
- `token`: Token address
- `recipient`: Address yang akan terima rewards

### Implementation:
```typescript
async function setRewardRecipient(
  token: Address,
  recipient: Address
) {
  const data = encodeFunctionData({
    abi: Abis.tip20,
    functionName: 'setRewardRecipient',
    args: [recipient]
  });

  const tx = await client.sendTransaction({
    to: token,
    data
  });
  
  return await client.waitForTransactionReceipt({ hash: tx });
}
```

### Use Cases:
- **Delegation**: Hold token di wallet A, rewards masuk ke wallet B
- **Reward Splitting**: Multiple holders redirect rewards ke central treasury
- **Tax Optimization**: Separate rewards untuk accounting purposes

### Example:
```typescript
// Alice holds token tapi rewards ke Bob
await setRewardRecipient(
  tokenAddress,
  bobAddress // Bob terima rewards
);
```

---

## 📤 11. Withdraw from DEX

**Tujuan**: Withdraw balance dari DEX kembali ke wallet

### Parameters:
- `token`: Token yang akan di-withdraw
- `amount`: Jumlah yang akan di-withdraw

### Implementation:
```typescript
async function withdrawFromDex(
  token: Address,
  amount: bigint
) {
  const calls = [
    Actions.dex.withdraw.call({
      token,
      amount
    })
  ];

  try {
    const tx = await client.sendTransaction({ calls });
    return await client.waitForTransactionReceipt({ hash: tx });
  } catch (error) {
    if (error.message?.includes('InsufficientBalance')) {
      return { status: 'error', message: 'Insufficient DEX balance' };
    }
    throw error;
  }
}
```

---

## ❌ 12. Cancel Order

**Tujuan**: Cancel limit order di DEX

### Parameters:
- `orderId`: ID dari order yang akan di-cancel

### Implementation:
```typescript
async function cancelOrder(orderId: bigint) {
  const calls = [
    Actions.dex.cancel.call({
      orderId
    })
  ];

  try {
    const tx = await client.sendTransaction({ calls });
    return await client.waitForTransactionReceipt({ hash: tx });
  } catch (error) {
    if (error.message?.includes('OrderDoesNotExist')) {
      return { status: 'error', message: 'Order not found' };
    }
    throw error;
  }
}
```

### Get User Orders (untuk tracking order IDs):
```typescript
// You'll need to query order events or maintain state
// to track order IDs for cancellation
```

---

## 🔧 Helper Functions

### Format Amount (6 Decimals)
```typescript
function formatAmount(amount: bigint): string {
  return (Number(amount) / 1e6).toFixed(4);
}

function parseAmount(usd: number): bigint {
  return BigInt(Math.floor(usd * 1e6));
}

// Example:
const amount = parseAmount(100.50); // 100.50 USD
console.log(formatAmount(amount)); // "100.5000"
```

### Check Token Balance
```typescript
async function getBalance(
  token: Address,
  owner: Address
): Promise<bigint> {
  const data = encodeFunctionData({
    abi: Abis.tip20,
    functionName: 'balanceOf',
    args: [owner]
  });

  const result = await client.call({
    to: token,
    data
  });
  
  return decodeFunctionResult({
    abi: Abis.tip20,
    functionName: 'balanceOf',
    data: result.data
  });
}
```

### Check Allowance
```typescript
async function getAllowance(
  token: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  const data = encodeFunctionData({
    abi: Abis.tip20,
    functionName: 'allowance',
    args: [owner, spender]
  });

  const result = await client.call({
    to: token,
    data
  });
  
  return decodeFunctionResult({
    abi: Abis.tip20,
    functionName: 'allowance',
    data: result.data
  });
}
```

---

## 🎨 UI Integration Examples

### Connect & Transfer
```typescript
import { createTempoClient } from 'tempo.ts/viem';

async function handleTransfer(
  recipientAddress: string,
  amount: number,
  memo: string
) {
  try {
    // 1. Create client
    const client = createTempoClient({
      privateKey: userPrivateKey,
      rpcUrl: 'https://rpc.tempo...'
    });

    // 2. Parse amount
    const amountWei = parseAmount(amount);

    // 3. Create memo
    const memoHex = createMemo(memo);

    // 4. Execute transfer
    const receipt = await transferWithMemo(
      tokenAddress,
      recipientAddress as Address,
      amountWei,
      memoHex
    );

    // 5. Show success
    return {
      success: true,
      txHash: receipt.transactionHash
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Swap UI
```typescript
async function handleSwap(
  fromToken: Address,
  toToken: Address,
  amount: number,
  slippage: number = 0.5
) {
  const amountWei = parseAmount(amount);
  
  const receipt = await swapTokens(
    fromToken,
    toToken,
    amountWei,
    slippage
  );

  return receipt;
}
```

---

## 🔐 Best Practices

### 1. Error Handling
```typescript
try {
  const receipt = await someOperation();
  
  if (receipt.status === 'success') {
    // Handle success
  } else {
    // Handle failure
  }
} catch (error) {
  // Handle errors gracefully
  if (error.message.includes('insufficient')) {
    // Show "Insufficient balance" to user
  } else if (error.message.includes('rejected')) {
    // User rejected transaction
  } else {
    // Generic error
  }
}
```

### 2. Transaction Confirmation
```typescript
// Wait for receipt
const receipt = await client.waitForTransactionReceipt({ 
  hash: txHash,
  confirmations: 1 // Wait for 1 confirmation
});
```

### 3. Gas Estimation
```typescript
// Estimate gas before sending
const gasEstimate = await client.estimateGas({
  to: tokenAddress,
  data: txData
});

// Add 20% buffer
const gasLimit = gasEstimate * 120n / 100n;
```

### 4. Approve Before Swap/DEX
```typescript
// Always check allowance first
const allowance = await getAllowance(token, userAddress, dexAddress);

if (allowance < amount) {
  // Need to approve first
  await approveToken(token, dexAddress, amount);
}

// Then proceed with swap/dex operation
```

---

## 📊 Common Patterns

### Atomic Multi-Step Operations
```typescript
// Example: Approve + Swap dalam 1 transaksi
const calls = [
  // Step 1: Approve
  {
    to: tokenIn,
    data: encodeApprove(dexAddress, amount)
  },
  // Step 2: Swap
  {
    to: dexAddress,
    data: encodeSwap(tokenIn, tokenOut, amount)
  }
];

// Execute atomically (all or nothing)
await client.sendTransaction({ calls });
```

### Retry Logic
```typescript
async function sendWithRetry(
  fn: () => Promise<any>,
  maxRetries: number = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## 🚀 Complete Example: Payment Flow

```typescript
import { createTempoClient } from 'tempo.ts/viem';
import { encodeFunctionData } from 'viem';
import { Abis } from 'tempo.ts/viem';

class TempoPayment {
  private client;
  
  constructor(privateKey: string, rpcUrl: string) {
    this.client = createTempoClient({ privateKey, rpcUrl });
  }

  async sendPayment(
    token: Address,
    recipient: Address,
    amountUSD: number,
    invoiceId: string
  ) {
    // 1. Parse amount
    const amount = BigInt(Math.floor(amountUSD * 1e6));

    // 2. Create structured memo
    const memo = this.createInvoiceMemo(invoiceId);

    // 3. Encode transaction
    const data = encodeFunctionData({
      abi: Abis.tip20,
      functionName: 'transferWithMemo',
      args: [recipient, amount, memo]
    });

    // 4. Send transaction
    const hash = await this.client.sendTransaction({
      to: token,
      data
    });

    // 5. Wait for confirmation
    const receipt = await this.client.waitForTransactionReceipt({ hash });

    return {
      success: receipt.status === 'success',
      txHash: receipt.transactionHash,
      invoiceId,
      amount: amountUSD
    };
  }

  private createInvoiceMemo(invoiceId: string): `0x${string}` {
    const timestamp = Date.now().toString().slice(-6);
    const memoText = `INV-${invoiceId}-${timestamp}`;
    const hexMemo = Buffer.from(memoText).toString('hex').padEnd(64, '0');
    return `0x${hexMemo}`;
  }
}

// Usage
const payment = new TempoPayment(privateKey, rpcUrl);
const result = await payment.sendPayment(
  '0x20c0000000000000000000000000000000000001', // alphaUSD
  '0x123...', // recipient
  100.50, // USD amount
  'INV-2024-001' // invoice ID
);
```

---

## 📝 Notes

1. **Amount Format**: Semua amounts dalam wei (6 decimals untuk stablecoins)
2. **Atomic Batches**: Multiple calls execute all-or-nothing
3. **Memo Length**: Exactly 32 bytes (64 hex characters)
4. **Error Handling**: Beberapa "errors" adalah expected behavior (no rewards, no balance, etc)
5. **Gas**: Always estimate gas sebelum production deployment
6. **Approval**: Check allowance sebelum DEX operations untuk avoid unnecessary approvals
