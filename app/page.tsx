import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { PromiseSection } from "@/components/landing/promise-section";
import Link from "next/link";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { Testimonials } from "@/components/landing/testimonials";
import { GlobalMap } from "@/components/landing/global-map";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export default function Home() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden selection:bg-emerald/20 selection:text-forest">
      {/* Navigation Overlay */}
      <nav className="absolute top-0 w-full z-50 pt-6">
        <Container className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center text-white font-bold text-lg">
              K
            </div>
            <span className="text-xl font-bold font-display text-forest tracking-tight">Kairo</span>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/login">
               <Button variant="ghost" className="hidden sm:inline-flex" size="sm">Log In</Button>
             </Link>
             <Link href="/app">
               <Button size="sm" className="shadow-none">Get Started</Button>
             </Link>
          </div>
        </Container>
      </nav>

      <Hero />
      <Reveal width="100%"><TrustBar /></Reveal>
      <PromiseSection />
      <Reveal width="100%"><HowItWorks /></Reveal>
      <Reveal width="100%"><ComparisonTable /></Reveal>
      <Reveal width="100%"><Testimonials /></Reveal>
      <Reveal width="100%"><GlobalMap /></Reveal>
      <Reveal width="100%"><CtaSection /></Reveal>
      <Footer />
    </main>
  );
}
