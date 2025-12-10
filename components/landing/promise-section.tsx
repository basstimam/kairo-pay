"use client";

import { Container } from "@/components/ui/container";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

function CountUp({ to, duration = 2 }: { to: number; duration?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => current.toFixed(2));

  useEffect(() => {
    if (inView) {
      spring.set(to);
    }
  }, [inView, spring, to]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export function PromiseSection() {
  return (
    <section className="py-32 bg-forest text-white overflow-hidden relative border-y border-white/10">
      {/* Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
      
      <Container className="relative z-10 text-center">
        <div className="inline-block px-4 py-1 border border-emerald/50 rounded-full bg-emerald/10 text-emerald font-mono text-xs tracking-widest uppercase mb-8">
           Performance Protocol
        </div>
        
        <h2 className="text-4xl md:text-5xl font-serif mb-16 max-w-2xl mx-auto leading-tight">
          The <span className="italic text-emerald">3-Second</span> Settlement Promise
        </h2>

        <div className="flex flex-col items-center justify-center p-12 border border-white/10 bg-white/5 backdrop-blur-sm max-w-3xl mx-auto">
           <div className="text-9xl md:text-[10rem] font-mono font-bold leading-none tracking-tighter text-white flex items-baseline gap-2 tabular-nums">
             <CountUp to={0.48} />
             <span className="text-4xl md:text-6xl text-emerald/50 ml-2">sec</span>
           </div>
           
           <div className="w-full h-px bg-white/10 my-8" />
           
           <div className="grid grid-cols-3 gap-8 w-full text-center font-mono text-sm tracking-tight text-white/60">
             <div>
               <div className="text-white text-lg block mb-1">10k+</div>
               TX TERMINATED
             </div>
             <div>
               <div className="text-white text-lg block mb-1">0.00%</div>
               FAILURE RATE
             </div>
             <div>
               <div className="text-white text-lg block mb-1">$0.00</div>
               GAS FEES
             </div>
           </div>
        </div>
      </Container>
    </section>
  );
}
