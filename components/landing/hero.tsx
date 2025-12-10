"use client";

import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HeroAnimation } from "./hero-animation";
import { motion, Variants } from "framer-motion";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

export function Hero() {
  const { primaryWallet } = useDynamicContext();
  const router = useRouter();

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVars: Variants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background border-b border-forest/10">
      {/* Brutalist Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0A3D2A08_1px,transparent_1px),linear-gradient(to_bottom,#0A3D2A08_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="max-w-2xl"
            variants={containerVars}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 
              className="text-6xl sm:text-7xl lg:text-8xl font-serif text-forest leading-[0.95] mb-8"
              variants={itemVars}
            >
              Get Paid in <br />
              <span className="italic text-emerald">3 Seconds</span>{" "}
              <span className="font-mono text-3xl align-middle tracking-tighter opacity-50 display-inline-block translate-y-[-10px]">—</span> <br />
              or It’s Free.
            </motion.h1>
            <motion.p 
              className="text-xl text-forest/80 mb-10 max-w-lg leading-relaxed font-mono text-sm tracking-tight"
              variants={itemVars}
            >
              {"// INSTANT USD PAYMENTS ON TEMPO."} <br/>
              {"// NO FEES. NO WAITING. NO EXCUSES."}
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVars}
            >
              <Button 
                size="xl" 
                className="font-mono tracking-tight uppercase"
                onClick={() => {
                  if (primaryWallet) {
                    router.push("/app");
                  } else {
                    router.push("/login");
                  }
                }}
              >
                Create Kairo Link
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <a href="#how-it-works">
                <Button variant="secondary" size="xl" className="font-mono tracking-tight uppercase">
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  How It Works
                </Button>
              </a>
            </motion.div>
            
            <motion.div 
              className="mt-12 flex items-center gap-2 text-xs font-mono text-forest/50 uppercase tracking-widest"
              variants={itemVars}
            >
              <span>Powered by Tempo Protocol</span>
                {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-emerald/20 blur-[100px] rounded-full animate-pulse-slow pointer-events-none" /> */}
            </motion.div>
          </motion.div>
          
          <div className="relative">
             <HeroAnimation />
          </div>
        </div>
      </Container>
    </section>
  );
}
