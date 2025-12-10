"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export function HeroAnimation() {
  const [timeLeft, setTimeLeft] = useState(3.00);
  const [stage, setStage] = useState<"idle" | "sending" | "success">("idle");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const runSequence = async () => {
      // Reset
      setStage("idle");
      setTimeLeft(3.00);
      
      // Start Sending after 1s
      await new Promise(r => setTimeout(r, 1000));
      setStage("sending");
      
      // Countdown
      const start = Date.now();
      const duration = 2400;
      
      interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 3 - (elapsed / 1000) * (3 / (duration / 1000)));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(interval);
          setStage("success");
          setTimeout(runSequence, 4000);
        }
      }, 16);
    };

    runSequence();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square bg-white rounded-3xl border border-forest/10 shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0A3D2A08_1px,transparent_1px),linear-gradient(to_bottom,#0A3D2A08_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Timer Display */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          className="text-7xl font-bold font-mono tracking-tight tabular-nums"
          animate={{ 
            scale: stage === "success" ? 1.1 : 1, 
            color: stage === "success" ? "#10B981" : "#0A3D2A" 
          }}
        >
          {timeLeft.toFixed(2)}s
        </motion.div>
        <p className="text-forest/60 text-sm mt-4 font-mono uppercase tracking-widest">
          {stage === "idle" ? "Ready to Pay" : stage === "sending" ? "Processing..." : "Payment Complete"}
        </p>
      </div>

      {/* Pulse Ring Animation */}
      <AnimatePresence>
        {stage === "sending" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute w-32 h-32 border-2 border-emerald rounded-full"
          />
        )}
      </AnimatePresence>

      {/* Success Check */}
      <AnimatePresence>
        {stage === "success" && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute z-20 bg-emerald text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
          >
            <Check className="w-12 h-12 stroke-[3]" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Confetti */}
      {stage === "success" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           {[...Array(12)].map((_, i) => (
             <motion.div
               key={i}
               className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? "bg-emerald" : "bg-lime-100"}`}
               initial={{ x: "50%", y: "50%", scale: 0 }}
               animate={{ 
                   x: `${50 + (i % 2 ? 20 : -20)}%`, // Deterministic movement
                 y: `${50 + (i % 3 ? 20 : -20)}%`,
                 opacity: [1, 0],
                 scale: [1, 0]
               }}
               transition={{ duration: 0.8, ease: "easeOut" }}
             />
           ))}
        </div>
      )}
    </div>
  );
}
