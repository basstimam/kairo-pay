'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { getGig, Gig } from '@/app/actions/gig';
import { payAction } from '@/app/actions/pay';
import { erc20Abi, parseUnits } from 'viem';
import { Loader2, ShieldCheck, Clock, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Timer Component (Replace with proper one later)
function Timer({ duration }: { duration: number }) {
  return (
    <div className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-4 animate-pulse">
       {(duration / 1000).toFixed(2)}s
    </div>
  );
}

const USDC_ADDRESS = '0x20c0000000000000000000000000000000000001';
const KAIRO_WALLET = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'; // Replace with correct server wallet from env in a real app

export default function PayPage() {
  const params = useParams();
  const gigId = params.gigId as string;
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useReadContract({
     address: '0x20c0000000000000000000000000000000000001',
     abi: erc20Abi, 
     functionName: 'balanceOf',
     args: [address as `0x${string}`],
     query: {
       refetchInterval: 2000,
       enabled: !!address
     }
  });
  const { writeContractAsync } = useWriteContract();
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [status, setStatus] = useState<'idle' | 'paying' | 'verifying' | 'success' | 'refunded' | 'error'>('idle');
  const [timerval, setTimerval] = useState(0);
  const [resultMsg, setResultMsg] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    getGig(gigId).then(setGig);
  }, [gigId]);

  const handlePay = async () => {
    if (!gig || !address) return;
    setStatus('paying');
    
    try {
      const amountBigInt = parseUnits(gig.price.toString(), 6);
      // 1. Send funds to Kairo Wallet (Intermediate)
      // Note: This is an ERC-20 transfer, so wallet might show "0 Native Token" + Token Transfer
      const hash = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [KAIRO_WALLET as `0x${string}`, amountBigInt],
      });
      setTxHash(hash);

      // Capture time AFTER user signs and tx is broadcasted
      const startTime = Date.now();

      setStatus('verifying');
      
      // Start checking server action
      const res = await payAction({
        gigId,
        hash,
        amount: gig.price,
        freelancerAddress: gig.freelancerAddress as `0x${string}`,
        clientAddress: address,
        startTime,
      });

      if (res.status === 'success') {
        setStatus('success');
        setTimerval(res.duration || 0);
        setResultMsg(`Paid in ${res.duration}ms`);
      } else if (res.status === 'refunded') {
        setStatus('refunded');
        setTimerval(res.duration || 0);
        setResultMsg(res.message || "");
      } else {
        setStatus('error');
        setResultMsg(res.message || "");
      }

    } catch (error: unknown) {
      console.error(error);
      const err = error as Error;
      // Check for user rejection
      if (err.message?.includes('User rejected') || err.name === 'UserRejectedRequestError') {
        setStatus('idle'); // Just reset to let them try again
        return;
      }
      setStatus('error');
      setResultMsg(err.message || 'Payment failed');
    }
  };

  if (!gig) return <Container className="py-20 text-center"><Loader2 className="animate-spin mx-auto" /></Container>;

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 via-forest to-forest" />
      
      <Container className="relative z-10 max-w-lg w-full">
        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-3xl text-center text-white"
          >
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
               <Zap className="w-10 h-10 text-white fill-white" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">Payment Complete!</h1>
            <Timer duration={timerval} />
            <p className="text-emerald-200 mb-6">The freelancer received the funds instantly.</p>
            
            {txHash && (
              <a 
                href={`https://explore.tempo.xyz/receipt/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-emerald-300 hover:text-white transition-colors border-b border-emerald-300/30 hover:border-white pb-1"
              >
                View Receipt on Tempo Explorer
                <Zap className="w-3 h-3 ml-1" />
              </a>
            )}
          </motion.div>
        )}

        {status === 'refunded' && (
          <motion.div 
             initial={{ scale: 0.8, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }}
             className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 p-8 rounded-3xl text-center text-white"
          >
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               <Clock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-display font-bold mb-2">Refund Processing</h1>
            <p className="text-xl mb-4 text-red-200">{resultMsg}</p>
            <p className="text-sm opacity-60">We promised 3 seconds. We missed it. You don&apos;t pay.</p>
          </motion.div>
        )}

        {(status === 'idle' || status === 'paying' || status === 'verifying') && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl relative">
            <div className="text-center mb-8">
              <span className="bg-lime-100 text-forest-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Invoice</span>
              <h1 className="text-3xl font-serif text-forest mb-2">{gig.title}</h1>
              <p className="text-forest/60 text-sm max-w-xs mx-auto">{gig.description}</p>
            </div>

            <div className="flex items-end justify-center mb-10">
              <span className="text-5xl font-bold font-mono text-forest tracking-tighter">${gig.price.toFixed(2)}</span>
              <span className="text-forest/40 font-mono ml-2 mb-2">USDC</span>
            </div>

            <div className="space-y-4">
              {!isConnected ? (
                <div className="flex justify-center">
                  <DynamicWidget />
                </div>
              ) : (
                <>
                  <Button 
                    size="xl" 
                    className="w-full text-lg h-14 shadow-emerald-500/20 shadow-lg"
                    onClick={handlePay}
                    disabled={status !== 'idle' || (balanceData || 0n) < parseUnits(gig.price.toString(), 6)}
                  >
                    {status === 'paying' ? 'Confirming Wallet...' : 
                     status === 'verifying' ? 'Verifying Speed...' : 
                     (balanceData || 0n) < parseUnits(gig.price.toString(), 6) ? 'Insufficient Balance' :
                     'Pay Now'}
                  </Button>
                  {(balanceData || 0n) < parseUnits(gig.price.toString(), 6) && (
                     <p className="text-center text-red-500 text-xs mt-2">
                       You need {gig.price} aUSD. Your balance: {balanceData ? (Number(balanceData) / 10**6).toFixed(2) : '0'} aUSD.
                       <br/>
                       <a href="https://faucet.testnet.tempo.xyz" target="_blank" className="underline hover:text-red-600">Claim Faucet</a>
                     </p>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex items-center justify-center gap-2 text-forest/40 text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Secured by Tempo. 3-second guarantee.</span>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
