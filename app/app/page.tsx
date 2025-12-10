"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, DollarSign, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { erc20Abi } from "viem";
import { getGigsByAddress, Gig } from "@/app/actions/gig";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: balanceData, refetch: refetchBalance } = useReadContract({
    address: '0x20c0000000000000000000000000000000000001',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      refetchInterval: 2000,
      enabled: !!address
    }
  });
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalEarnings: 0 });

  // Realtime: Watch for incoming transfers (On-Chain Event)
  useWatchContractEvent({
    address: '0x20c0000000000000000000000000000000000001',
    abi: erc20Abi,
    eventName: 'Transfer',
    args: { to: address }, // Filter: Only transfers TO me
    onLogs(logs) {
      console.log('💰 On-Chain Transfer Detected!', logs);
      // Wait 2s to ensure Server Action has finished writing to DB
      setTimeout(() => {
        getGigsByAddress(address!).then(setGigs);
        import('@/app/actions/pay').then(mod => mod.getWalletStats(address!).then(setStats));
        refetchBalance(); 
      }, 2000);
    },
  });

  useEffect(() => {
    if (address) {
      setLoading(true);
      
      // Load Data
      const loadData = () => {
        getGigsByAddress(address).then(setGigs).catch(e => console.error("Gig fetch error (silenced):", e));
        import('@/app/actions/pay').then(mod => mod.getWalletStats(address).then(setStats).catch(e => console.error("Stats fetch error (silenced):", e)));
      };

      loadData();
      setLoading(false);

      // Backup: Poll every 5 seconds (Hybrid Realtime)
      const interval = setInterval(() => {
        loadData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [address]);

  // Use stats from DB instead of reducing gigs array
  const totalEarnings = stats.totalEarnings;

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-serif mb-4">Please connect your wallet</h2>
        <p className="mb-4 text-forest/60">You need to connect wallet to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-serif font-medium text-forest">Dashboard</h1>
           <p className="text-forest/60 font-mono text-sm mt-1">Welcome back.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/app/gigs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Gig
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-forest text-white p-8 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border border-forest-800 relative overflow-hidden group">
           <div className="relative z-10">
             <div className="text-emerald-400 font-mono text-sm tracking-widest uppercase mb-2">Total Earnings</div>
             <div className="text-5xl font-mono font-bold tracking-tighter mb-6">${totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
             <p className="text-xs font-mono opacity-50">
               Funds are auto-deposited to your wallet.
             </p>
           </div>
           {/* Decorative Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-30" />
        </div>

        <div className="bg-white p-8 rounded-xl border border-forest/5 shadow-sm">
           <div className="text-forest/60 font-mono text-sm tracking-widest uppercase mb-2">Wallet Balance</div>
           <div className="text-4xl font-mono font-bold text-forest mb-2">
             {balanceData ? (Number(balanceData) / 10**6).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
           </div>
           <p className="text-sm text-forest/40">aUSD (AlphaUSD)</p>
        </div>
      </div>

      {/* Recent Activity / Gigs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-forest/5 pb-4">
           <h2 className="text-xl font-serif text-forest">Recent Gigs</h2>
        </div>

        {loading ? <Loader2 className="animate-spin text-forest" /> : (
          <div className="space-y-4">
             {gigs.length === 0 ? (
               <p className="text-forest/40 italic">No gigs found. Create one!</p>
             ) : gigs.map((gig) => (
               <div key={gig.id} className="bg-white border border-forest/5 p-6 rounded-lg flex items-center justify-between hover:border-emerald/50 transition-colors group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-lime-50 rounded-full flex items-center justify-center text-emerald">
                        <DollarSign className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="font-medium text-forest">{gig.title}</h3>
                        <p className="text-xs font-mono text-forest/40 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" /> ID: {gig.id}
                        </p>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="font-mono font-bold text-lg text-forest">${gig.price.toFixed(2)}</div>
                      <Link href={`/pay/${gig.id}`}>
                        <Button size="sm" variant="link" className="text-xs">
                          View Link
                        </Button>
                      </Link>
                      <Link href={`/app/gigs/${gig.id}/edit`}>
                        <Button size="sm" variant="ghost" className="text-xs text-forest/60 hover:text-forest">
                          Edit
                        </Button>
                      </Link>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

     {/* Latest Transactions Section */}
      <LatestTransactions address={address} />

    </div>
  );
}



interface Transaction {
  id: string;
  amount: number;
  created_at: string;
  tx_hash: string;
  gigs: { title: string };
}

function LatestTransactions({ address }: { address: `0x${string}` | undefined }) {
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    setTxs([]); // Clear state immediately on address change to prevent stale data
    
    if (address) {
       let isMounted = true;

       // Initial
       import('@/app/actions/pay').then(mod => {
         if (!isMounted) return;
         mod.getTransactionsByAddress(address).then(data => {
            if (isMounted) setTxs(data);
         }).catch(err => console.error("Tx load error:", err));
       });

       // Poll
       const interval = setInterval(() => {
         import('@/app/actions/pay').then(mod => {
           if (!isMounted) return;
           mod.getTransactionsByAddress(address).then(data => {
              if (isMounted) setTxs(data);
           }).catch(err => console.error("Tx poll error:", err));
         });
       }, 5000);

       return () => {
         isMounted = false;
         clearInterval(interval);
         setTxs([]); // Cleanup
       };
    }
  }, [address]);

  if (!txs.length) return null;

  return (
    <div className="space-y-6 pt-8">
      <div className="flex items-center justify-between border-b border-forest/5 pb-4">
          <h2 className="text-xl font-serif text-forest">Latest Transactions</h2>
      </div>
      <div className="space-y-4">
        {txs.map((tx) => (
          <div key={tx.id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-slate-700">{tx.gigs?.title || 'Unknown Gig'}</h3>
                <p className="text-xs font-mono text-slate-400">
                   {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
               <div className="font-mono font-bold text-slate-700">${Number(tx.amount).toFixed(2)}</div>
               <a href={`https://explore.tempo.xyz/tx/${tx.tx_hash}`} target="_blank" className="text-xs text-blue-500 hover:underline">
                 View on Explorer
               </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
