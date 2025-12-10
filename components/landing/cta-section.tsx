"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight } from "lucide-react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

export function CtaSection() {
  const { primaryWallet } = useDynamicContext();
  const router = useRouter();

  return (
    <section className="py-32 bg-forest text-white relative overflow-hidden">
       {/* Decor */}
       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald/10 blur-[100px] rounded-full pointer-events-none" />
       
       <Container className="relative z-10 text-center">
         <h2 className="text-5xl md:text-7xl font-bold font-display mb-8">
           Your First Instant Payment <br /> Is On Us.
         </h2>
         <p className="text-xl text-emerald/80 mb-12 max-w-2xl mx-auto">
           Create your link in 30 seconds. Zero fees forever. 
           <br/>No wallet needed. No crypto knowledge required.
         </p>
         
         <div className="flex flex-col items-center">
            <Button 
              size="xl" 
              className="bg-emerald text-white hover:bg-emerald/90 border-0"
              onClick={() => {
                if (primaryWallet) {
                  router.push("/app");
                } else {
                  router.push("/login");
                }
              }}
            >
               Get Your Kairo Link
               <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="mt-6 text-sm text-white/30">
              Powered by Tempo. Cancel anytime.
            </p>
         </div>
       </Container>
    </section>
  );
}
