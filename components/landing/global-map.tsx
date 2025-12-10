"use client";

import { Container } from "@/components/ui/container";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function GlobalMap() {
  // Simulate active dots
  const [activeDots, setActiveDots] = useState<{id: number, top: string, left: string, delay: number}[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveDots(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      top: Math.random() * 80 + 10 + "%",
      left: Math.random() * 80 + 10 + "%",
      delay: Math.random() * 2,
    })));
  }, []);

  return (
    <section className="py-32 bg-forest relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#10B981_0%,_transparent_70%)] opacity-10" />
      
      <Container className="relative z-10 text-center">
        <h2 className="text-4xl font-bold font-display text-white mb-6">Global at Heart</h2>
         <p className="text-emerald/80 mb-20 max-w-2xl mx-auto">
           Live payments happening right now across 140 countries.
         </p>

        <div className="relative w-full aspect-[2/1] bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm group hover:border-emerald/30 transition-colors duration-500">
           {/* Abstract Map Background */}
           <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-cover bg-no-repeat bg-center contrast-200 grayscale invert group-hover:opacity-30 transition-opacity duration-700" />
           
           {/* Gradient Overlay for Depth */}
           <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent opacity-60" />

           {/* Pulsing Dots */}
           {activeDots.map((dot) => (
             <motion.div
               key={dot.id}
               className="absolute w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)]"
               style={{ top: dot.top, left: dot.left }}
               initial={{ scale: 0, opacity: 0 }}
               animate={{ 
                 scale: [0, 1.5, 0],
                 opacity: [0, 1, 0]
               }}
               transition={{
                 duration: 3,
                 repeat: Infinity,
                 delay: dot.delay,
                 ease: "easeInOut"
               }}
             />
           ))}
           
           {/* Stats Overlay */}
           <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div>
                <div className="text-white/40 text-xs font-mono mb-1 uppercase tracking-wider">Active Nodes</div>
                <div className="text-2xl font-mono font-bold text-white">1,240</div>
              </div>
              <div className="text-right">
                <div className="text-white/40 text-xs font-mono mb-1 uppercase tracking-wider">24h Volume</div>
                <div className="text-2xl font-mono font-bold text-emerald-400">$42.5M</div>
              </div>
           </div>
        </div>
      </Container>
    </section>
  );
}
