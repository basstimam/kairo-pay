import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Globe, Shield } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-lime-50">
      {/* Header */}
      <header className="border-b border-forest/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Container className="py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif font-bold text-forest">Kairo</Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-forest/60 hover:text-forest text-sm font-mono">Login</Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </Container>
      </header>

      {/* Hero */}
      <section className="py-24 border-b border-forest/10">
        <Container className="max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-serif text-forest mb-6">
            The Story of <span className="text-emerald italic">Kairo</span>
          </h1>
          <p className="text-xl text-forest/70 max-w-2xl mx-auto leading-relaxed">
            We built Kairo because we believe freelancers deserve to get paid as fast as they deliver value.
            No more waiting days for bank transfers. No more hidden fees eating into your earnings.
          </p>
        </Container>
      </section>

      {/* Mission */}
      <section className="py-24">
        <Container className="max-w-4xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif text-forest mb-6">Our Mission</h2>
              <p className="text-forest/70 leading-relaxed mb-6">
                Kairo leverages the Tempo blockchain to remove the middleman, ensuring that if you earn $1000, you keep $1000. It&apos;s that simple.
              </p>
              <p className="text-forest/70 leading-relaxed">
                We believe that &quot;payments&quot; shouldn&apos;t be a business model. They are a utility.
              </p>
              <p className="text-forest/70 leading-relaxed">
                Our &quot;3-Second Promise&quot; isn&apos;t just marketing. It&apos;s a guarantee backed by technology. 
                If your payment takes longer than 3 seconds, it&apos;s free. That&apos;s how confident we are.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl border border-forest/10">
                <Zap className="w-8 h-8 text-emerald mb-3" />
                <h3 className="font-serif text-xl text-forest mb-2">Lightning Fast</h3>
                <p className="text-forest/60 text-sm">Average payment settles in 0.48 seconds</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-forest/10">
                <Globe className="w-8 h-8 text-emerald mb-3" />
                <h3 className="font-serif text-xl text-forest mb-2">Truly Global</h3>
                <p className="text-forest/60 text-sm">Accept payments from 140+ countries</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-forest/10">
                <Shield className="w-8 h-8 text-emerald mb-3" />
                <h3 className="font-serif text-xl text-forest mb-2">Zero Fees</h3>
                <p className="text-forest/60 text-sm">Keep 100% of what you earn</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Tempo */}
      <section className="py-24 bg-forest text-white">
        <Container className="max-w-4xl text-center">
          <p className="text-emerald font-mono text-sm uppercase tracking-widest mb-4">Powered By</p>
          <h2 className="text-4xl font-serif mb-6">Tempo Protocol</h2>
          <p className="text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Tempo is the high-performance blockchain that makes Kairo possible. With sub-second 
            finality and near-zero gas fees, it&apos;s the perfect foundation for instant payments.
          </p>
          <a href="https://tempo.xyz" target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="font-mono">
              Learn about Tempo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-24">
        <Container className="max-w-2xl text-center">
          <h2 className="text-3xl font-serif text-forest mb-6">Ready to get started?</h2>
          <p className="text-forest/60 mb-8">Create your Kairo link and start getting paid in 3 seconds.</p>
          <Link href="/login">
            <Button size="xl" className="font-mono">
              Create Your Kairo Link <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Container>
      </section>
    </div>
  );
}
