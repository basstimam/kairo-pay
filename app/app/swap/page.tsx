import NativeSwap from "@/components/tempo/NativeSwap";

export default function SwapPage() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-forest tracking-tighter">
              DEX Integration
            </h1>
            <p className="text-forest/60 font-mono text-sm max-w-md mx-auto">
                Swap stablecoins directly using Tempo&apos;s precompiled DEX.
            </p>
        </div>
        
        <NativeSwap />
        
        <div className="mt-8 p-6 border border-forest/5 rounded-xl bg-white/50 text-left text-sm text-forest/60">
            <p className="font-serif font-bold text-forest mb-2">Protocol Details</p>
            <ul className="list-disc list-inside space-y-1 font-mono text-xs">
                <li>Contract: <code>0xdec...000</code> (Precompiled)</li>
                <li>Settlement: Instant Finality</li>
                <li>Pairs: Stable-stable only</li>
            </ul>
        </div>
      </div>
    </div>
  );
}
