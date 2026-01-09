"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Abis } from "tempo.ts/viem";
import { parseUnits, formatUnits, erc20Abi, maxUint256 } from "viem";
import { Loader2, ArrowDownUp, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Address Precomplied Stablecoin DEX Tempo
const STABLECOIN_EXCHANGE_ADDRESS = "0xdec0000000000000000000000000000000000000";
const PATH_USD_ADDRESS = "0x20c0000000000000000000000000000000000000";

// pathUSD is the QUOTE token - cannot be used for placing orders
// Only BASE tokens (AlphaUSD, BetaUSD, ThetaUSD) can be used for liquidity
const BASE_TOKENS = [
  { symbol: "AlphaUSD", address: "0x20c0000000000000000000000000000000000001" },
  { symbol: "BetaUSD", address: "0x20c0000000000000000000000000000000000002" },
  { symbol: "ThetaUSD", address: "0x20c0000000000000000000000000000000000003" },
];

// All tokens including pathUSD (for swap mode)
const ALL_TOKENS = [
  { symbol: "pathUSD", address: PATH_USD_ADDRESS, isQuote: true },
  ...BASE_TOKENS.map(t => ({ ...t, isQuote: false })),
];

// TICK_SPACING = 10 per Tempo docs (ticks must be divisible by 10)
const _TICK_SPACING = 10; // eslint-disable-line @typescript-eslint/no-unused-vars

export default function NativeSwap() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mode State
  const [mode, setMode] = useState<"swap" | "liquidity">("swap");
  const [isBid, setIsBid] = useState(false); // For Liquidity: Bid (Buy) vs Ask (Sell)

  // Default to AlphaUSD (base token) - pathUSD is quote token and cannot be used for liquidity
  const [tokenIn, setTokenIn] = useState("0x20c0000000000000000000000000000000000001"); // Default AlphaUSD
  const [tokenOut, setTokenOut] = useState(""); 
  const [amount, setAmount] = useState("");

  // Auto-reset tokenIn when switching to liquidity mode if pathUSD is selected
  // pathUSD cannot be used for place() - must use base tokens only
  useEffect(() => {
    if (mode === "liquidity" && tokenIn.toLowerCase() === PATH_USD_ADDRESS.toLowerCase()) {
      setTokenIn("0x20c0000000000000000000000000000000000001"); // Reset to AlphaUSD
    }
  }, [mode, tokenIn]);

  // CRITICAL: Spend token logic per Tempo docs
  // - Swap mode: spend tokenIn
  // - Liquidity Buy (bid): spend pathUSD (to buy base token)
  // - Liquidity Sell (ask): spend base token (tokenIn)
  const spendToken = mode === "liquidity" 
    ? (isBid ? PATH_USD_ADDRESS : tokenIn)
    : tokenIn;
  
  // 1. Check Allowance (based on spendToken, not tokenIn)
  const { data: allowance, isLoading: isAllowanceLoading, refetch: refetchAllowance } = useReadContract({
    address: spendToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, STABLECOIN_EXCHANGE_ADDRESS],
    query: {
        enabled: !!address && !!spendToken && spendToken !== "custom",
    }
  });

  // Check pathUSD Balance (for Gas)
  const { data: pathUsdBalance } = useReadContract({
    address: PATH_USD_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
        enabled: !!address,
    }
  });

  // Check TokenIn Balance (for Swap) or SpendToken Balance (for Liquidity)
  const { data: tokenInBalance, isLoading: isBalanceLoading } = useReadContract({
    address: spendToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: {
        enabled: !!address && !!spendToken && spendToken !== "custom",
    }
  });

  // Get Decimals
  const { data: decimals } = useReadContract({
    address: tokenIn as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
        enabled: !!tokenIn && tokenIn !== "custom",
    }
  });

  const tokenDecimals = decimals ?? 6; // Default 6 for stablecoins (like USDC/USDT)

  // Slippage tolerance (0.5%)
  const SLIPPAGE_TOLERANCE = 0.005;

  // Quote Swap (Check Liquidity & Est. Output) - ONLY IN SWAP MODE
  const { data: quoteAmountOut, isError: isQuoteError, isLoading: isQuoteLoading } = useReadContract({
    address: STABLECOIN_EXCHANGE_ADDRESS,
    abi: Abis.stablecoinExchange,
    functionName: "quoteSwapExactAmountIn",
    args: [
        tokenIn as `0x${string}`,
        tokenOut as `0x${string}`,
        amount ? parseUnits(amount, tokenDecimals) : 0n
    ],
    query: {
        enabled: mode === "swap" && !!amount && !!tokenIn && !!tokenOut && tokenIn !== "custom" && tokenOut !== "custom",
        retry: false, 
    }
  });

  // 2. Write Contracts
  const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: writeSwap, data: swapHash, isPending: isSwapPending } = useWriteContract();
  const { writeContract: writePlace, data: placeHash, isPending: isPlacePending } = useWriteContract();
  
  // 3. Wait for Receipts
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ 
    hash: approveHash 
  });
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } = useWaitForTransactionReceipt({ 
    hash: swapHash 
  });
  const { isLoading: isPlaceConfirming, isSuccess: isPlaceSuccess } = useWaitForTransactionReceipt({ 
    hash: placeHash 
  });

  // Auto-refetch allowance after approve
  useEffect(() => {
    if (isApproveSuccess) {
        refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  const handleApprove = () => {
     // Approve the SPEND token (varies by mode and order type)
     writeApprove({
        address: spendToken as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [STABLECOIN_EXCHANGE_ADDRESS, maxUint256]
     });
  };

  const handleSwap = async () => {
    if (!amount || !tokenIn || !tokenOut || isQuoteError || !quoteAmountOut) return;

    // Calculate minAmountOut with slippage protection
    const minAmountOut = quoteAmountOut 
      ? (quoteAmountOut * BigInt(Math.floor((1 - SLIPPAGE_TOLERANCE) * 1000))) / 1000n
      : 0n;

    try {
        writeSwap({
            address: STABLECOIN_EXCHANGE_ADDRESS,
            abi: Abis.stablecoinExchange,
            functionName: 'swapExactAmountIn',
            args: [
                tokenIn as `0x${string}`,
                tokenOut as `0x${string}`,
                parseUnits(amount, tokenDecimals), 
                minAmountOut // Slippage protection: accept minimum 99.5% of quoted amount
            ],
        });
    } catch (err) {
        console.error("Swap failed", err);
    }
  };

  const handlePlaceOrder = async () => {
     if (!amount || !tokenIn) return;
     // Prevent placing orders with pathUSD (quote token)
     if (tokenIn.toLowerCase() === PATH_USD_ADDRESS.toLowerCase()) {
       console.error("Cannot place order with pathUSD - it's the quote token");
       return;
     }
     try {
        // Place Limit Order: place(address token, uint128 amount, bool isBid, int16 tick)
        // Per Tempo docs: token is BASE token (AlphaUSD), NOT pathUSD
        // isBid = true (Buy base with quote), isBid = false (Sell base for quote)
        // tick = 0 for 1:1 peg ($1.00)
        writePlace({
            address: STABLECOIN_EXCHANGE_ADDRESS,
            abi: Abis.stablecoinExchange,
            functionName: 'place',
            args: [
                tokenIn as `0x${string}`, // Base token (e.g., AlphaUSD)
                parseUnits(amount, tokenDecimals),
                isBid,
                0 // tick 0 = 1:1 peg ($1.00) - official docs uses tick 0
            ]
        });
     } catch (err) {
        console.error("Place Order failed", err);
     }
  };

  // NOTE: Removed auto-trigger useEffect as it was causing double transactions
  // User will need to click button twice: once for approve, once for place
  // This is standard EVM behavior - each action is a separate transaction

  if (!mounted) return null;

  const parsedAmount = amount ? parseUnits(amount, tokenDecimals) : 0n;
  const needsApproval = allowance !== undefined && allowance < parsedAmount;
  const isBusy = isApprovePending || isApproveConfirming || isSwapPending || isSwapConfirming || isPlacePending || isPlaceConfirming || isAllowanceLoading || isBalanceLoading || isQuoteLoading;
  const hasPathUsd = pathUsdBalance !== undefined && pathUsdBalance > 0n;
  const hasInsufficientBalance = tokenInBalance !== undefined && tokenInBalance < parsedAmount;
  const noLiquidity = mode === "swap" && isQuoteError && amount !== ""; // Liquidity check only relevant for Swap
  // Check if user is trying to use pathUSD in liquidity mode (invalid)
  const isInvalidTokenForLiquidity = mode === "liquidity" && tokenIn.toLowerCase() === PATH_USD_ADDRESS.toLowerCase();

  // Token list depends on mode: Swap can use all tokens, Liquidity only base tokens
  const availableTokens = mode === "liquidity" ? BASE_TOKENS : ALL_TOKENS;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode Toggles */}
      <div className="flex bg-forest/10 p-1 rounded-lg mb-4">
        <button 
            onClick={() => setMode("swap")}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === "swap" ? "bg-forest text-white shadow-sm" : "text-forest/60 hover:text-forest"}`}
        >
            SWAP
        </button>
        <button 
            onClick={() => setMode("liquidity")}
            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${mode === "liquidity" ? "bg-forest text-white shadow-sm" : "text-forest/60 hover:text-forest"}`}
        >
            ADD LIQUIDITY
        </button>
      </div>

      <div className="bg-white border-2 border-forest rounded-xl shadow-[4px_4px_0px_0px_#0A3D2A] overflow-hidden">
        {/* Header */}
        <div className="bg-forest p-6 text-white flex justify-between items-center">
            <div>
                <h2 className="text-xl font-serif font-bold">Tempo {mode === "swap" ? "Swap" : "Liquidity"}</h2>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    Precompiled DEX
                </div>
            </div>
            <div className="p-2 bg-white/10 rounded-lg">
                <ArrowDownUp className="w-5 h-5" />
            </div>
        </div>

        <div className="p-8 space-y-6">
            {/* Token Input (Common for both) */}
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-forest/60">
                    <label>{mode === "swap" ? "FROM" : "DEPOSIT"}</label>
                    <a 
                        href="https://docs.tempo.xyz/quickstart/faucet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline flex items-center gap-1"
                    >
                        NEED FUNDS? FAUCET ↗
                    </a>
                </div>
                
                <div className="bg-lime-50 border border-forest/10 rounded-lg p-4 flex gap-4 transition-colors focus-within:border-forest/40">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-3xl font-mono font-bold text-forest outline-none w-full placeholder:text-forest/20"
                        placeholder="0.0"
                    />
                    <div className="min-w-[140px] flex flex-col gap-2 border-l border-forest/10 pl-4">
                         <select 
                            value={tokenIn}
                            onChange={(e) => setTokenIn(e.target.value)}
                            className="bg-white text-xs font-medium text-forest p-2 rounded border border-forest/10 outline-none w-full cursor-pointer appearance-none px-3"
                        >
                            <option value="" disabled>SELECT TOKEN</option>
                            {availableTokens.map((t) => (
                                <option key={t.address} value={t.address}>
                                    {t.symbol}
                                </option>
                            ))}
                            <option value="custom">CUSTOM</option>
                        </select>
                        {(tokenIn === "custom" || !availableTokens.find(p => p.address === tokenIn)) && (
                            <input 
                                type="text"
                                value={tokenIn === "custom" ? "" : tokenIn}
                                onChange={(e) => setTokenIn(e.target.value)}
                                className="bg-white text-[10px] text-forest p-1.5 rounded outline-none border border-forest/10 w-full font-mono text-right"
                                placeholder="0x..."
                            />
                        )}
                    </div>
                </div>
            </div>

            {mode === "liquidity" && (
                 <div className="space-y-2">
                    <label className="text-xs font-mono text-forest/60">ORDER TYPE</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsBid(false)}
                            className={`flex-1 py-3 rounded-lg border font-bold text-sm transition-all ${!isBid ? "bg-red-50 border-red-500 text-red-700 shadow-sm" : "bg-white border-forest/10 text-forest/60 hover:bg-forest/5"}`}
                        >
                            ASK (SELL)
                        </button>
                        <button
                            onClick={() => setIsBid(true)}
                            className={`flex-1 py-3 rounded-lg border font-bold text-sm transition-all ${isBid ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm" : "bg-white border-forest/10 text-forest/60 hover:bg-forest/5"}`}
                        >
                            BID (BUY)
                        </button>
                    </div>
                    <p className="text-[10px] text-forest/60 mt-1">
                        * Places a Limit Order at Tick 0 (1:1 PEG)
                    </p>
                 </div>
            )}

            {mode === "swap" && (
                <>
                    {/* Swap Trigger */}
                    <div className="flex justify-center -my-3 relative z-10">
                        <button 
                            className="bg-white border border-forest text-forest p-2 rounded-full hover:bg-lime-50 transition-colors shadow-sm"
                            onClick={() => {
                                const temp = tokenIn;
                                setTokenIn(tokenOut);
                                setTokenOut(temp);
                            }}
                        >
                            <ArrowDownUp size={16} />
                        </button>
                    </div>

                    {/* Token Out */}
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-forest/60">TO (ESTIMATED)</label>
                        <div className="bg-lime-50 border border-forest/10 rounded-lg p-4 flex gap-4 transition-colors focus-within:border-forest/40">
                            <input
                                type="text"
                                readOnly
                                value={quoteAmountOut ? formatUnits(quoteAmountOut, tokenDecimals) : ""} 
                                className="bg-transparent text-3xl font-mono font-bold text-forest outline-none w-full placeholder:text-forest/20 opacity-80"
                                placeholder="0.0"
                            />
                            <div className="min-w-[140px] flex flex-col gap-2 border-l border-forest/10 pl-4">
                                <select 
                                    value={tokenOut}
                                    onChange={(e) => setTokenOut(e.target.value)}
                                    className="bg-white text-xs font-medium text-forest p-2 rounded border border-forest/10 outline-none w-full cursor-pointer appearance-none px-3"
                                >
                                    <option value="" disabled>SELECT TOKEN</option>
                                    {ALL_TOKENS.map((t) => (
                                        <option key={t.address} value={t.address}>
                                            {t.symbol}
                                        </option>
                                    ))}
                                    <option value="custom">CUSTOM</option>
                                </select>
                                {(tokenOut === "custom" || !ALL_TOKENS.find(p => p.address === tokenOut)) && (
                                    <input 
                                        type="text"
                                        value={tokenOut === "custom" ? "" : tokenOut}
                                        onChange={(e) => setTokenOut(e.target.value)}
                                        className="bg-white text-[10px] text-forest p-1.5 rounded outline-none border border-forest/10 w-full font-mono text-right"
                                        placeholder="0x..."
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Status / Errors */}
             <div className={`flex items-start gap-3 p-4 rounded-lg border text-xs text-forest/70 ${!hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity ? 'bg-red-50 border-red-200' : 'bg-forest/5 border-forest/5'}`}>
                 {isApprovePending || isApproveConfirming || isQuoteLoading || isPlacePending || isPlaceConfirming ? (
                      <Loader2 size={16} className="mt-0.5 animate-spin text-forest" />
                 ) : !hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity ? (
                      <AlertCircle size={16} className="mt-0.5 text-red-600" />
                 ) : needsApproval ? (
                      <AlertCircle size={16} className="mt-0.5 text-forest" />
                 ) : (
                      <Info size={16} className="mt-0.5 text-forest" />
                 )}
                 
                 <div className={`leading-relaxed ${!hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity ? 'text-red-600 font-medium' : ''}`}>
                    {isApproveConfirming ? (
                        "Approving token access..."
                    ) : isPlacePending || isPlaceConfirming ? (
                        <div>
                             Placing Order... <br/>
                             <span className="opacity-80">Adding liquidity to the orderbook.</span>
                        </div>
                    ) : isQuoteLoading ? (
                        "Checking liquidity..."
                    ) : isInvalidTokenForLiquidity ? (
                        "Invalid Token: pathUSD is the quote token and cannot be used for liquidity. Please select a base token like AlphaUSD, BetaUSD, or ThetaUSD."
                    ) : noLiquidity ? (
                        "Insufficient Liquidity: No orders available. Switch to \"ADD LIQUIDITY\" mode to seed the pool yourself!"
                    ) : hasInsufficientBalance ? (
                        `Insufficient Balance: You do not have enough ${isBid && mode === "liquidity" ? "pathUSD" : "tokens"}. Please lower the amount or use the Faucet.`
                    ) : !hasPathUsd ? (
                        "Warning: You have 0 pathUSD. Transactions require pathUSD for network fees."
                    ) : needsApproval ? (
                        mode === "liquidity" 
                          ? `Approve ${isBid ? "pathUSD" : "token"} to place ${isBid ? "Bid (Buy)" : "Ask (Sell)"} order.`
                          : "You must approve the DEX contract to spend your tokens."
                    ) : mode === "swap" ? (
                        "Ready to Swap against Tempo's Orderbook."
                    ) : (
                        `Ready to Place ${isBid ? 'Bid (Buy)' : 'Ask (Sell)'} Order at $1.00 peg.`
                    )}
                 </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
                {needsApproval ? (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleApprove}
                        disabled={isBusy || !amount || !hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 border-2 border-forest transition-all shadow-[2px_2px_0px_0px_#0A3D2A]
                        ${isBusy || !amount || !hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity
                            ? "bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed"
                            : "bg-lime-200 text-forest hover:bg-lime-300"
                        }`}
                    >
                        {isApprovePending || isApproveConfirming ? (
                            <>
                                <Loader2 className="animate-spin" />
                                <span>APPROVING...</span>
                            </>
                        ) : (
                            mode === "liquidity" 
                              ? `STEP 1: APPROVE ${isBid ? "pathUSD" : "TOKEN"}`
                              : "APPROVE TOKENS"
                        )}
                    </motion.button>
                ) : (
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={mode === "swap" ? handleSwap : handlePlaceOrder}
                        disabled={!isConnected || isBusy || !amount || !hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 border-2 border-forest transition-all shadow-[2px_2px_0px_0px_#0A3D2A] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#0A3D2A] active:translate-y-[2px] active:shadow-none
                        ${!isConnected || isBusy || !amount || !hasPathUsd || hasInsufficientBalance || noLiquidity || isInvalidTokenForLiquidity
                            ? "bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed"
                            : "bg-emerald-400 text-forest hover:bg-emerald-300"
                        }`}
                    >
                        {isSwapPending || isSwapConfirming || isPlacePending || isPlaceConfirming ? (
                            <>
                                <Loader2 className="animate-spin" />
                                <span>PROCESSING...</span>
                            </>
                        ) : (
                            !isConnected ? "CONNECT WALLET" : mode === "swap" ? "SWAP TOKENS" : "PLACE ORDER"
                        )}
                    </motion.button>
                )}
            </div>

            <AnimatePresence>
                {(swapHash || approveHash || placeHash) && (
                     <motion.div 
                        key="tx-hash"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-xs text-center font-mono text-forest/60 break-all p-2 bg-lime-50 rounded border border-forest/10 mt-2"
                    >
                        Last Tx: {swapHash || approveHash || placeHash}
                    </motion.div>
                )}
                 {(isSwapSuccess || isPlaceSuccess) && (
                     <motion.div 
                        key="success-msg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-sm text-center text-emerald-600 font-bold bg-emerald-50 p-2 rounded border border-emerald-100"
                    >
                        <CheckCircle2 size={16} className="inline mr-2" />
                        {isSwapSuccess ? "Swap Confirmed!" : "Order Placed! Liquidity Added."}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
