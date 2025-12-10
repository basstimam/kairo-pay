import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight, Shield, Zap, Clock } from "lucide-react";
import Link from "next/link";

// Mock data - in production this would come from database
const mockGigs = {
  "website-redesign": {
    title: "Website Redesign for Acme Inc.",
    price: 2500,
    description: "Complete redesign of the company website with modern, responsive layout. Includes 5 pages, mobile optimization, and SEO setup.",
    creator: "Naufal",
  },
  "logo-design": {
    title: "Logo Design Package",
    price: 500,
    description: "Professional logo design with 3 concepts, unlimited revisions, and all file formats.",
    creator: "Naufal",
  },
};

export default async function PublicGigPage({
  params,
}: {
  params: Promise<{ username: string; gigSlug?: string }>;
}) {
  const { username, gigSlug } = await params;
  
  // Try to fetch real gig if slug is provided
  let gig = null;
  const slug = Array.isArray(gigSlug) ? gigSlug[0] : gigSlug;

  if (slug) {
     const { getGig } = await import('@/app/actions/gig');
     gig = await getGig(slug);
  }

  // Fallback to mock if not found or no slug
  if (!gig) {
    gig = mockGigs[slug as keyof typeof mockGigs] || {
      title: "Custom Gig",
      price: 100,
      description: "A custom freelance service.",
      creator: username,
    };
  }

  return (
    <div className="min-h-screen bg-lime-50">
      {/* Header */}
      <header className="border-b border-forest/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Container className="py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif font-bold text-forest">Kairo</Link>
          <div className="flex items-center gap-2 text-sm font-mono text-forest/60">
            <Shield className="w-4 h-4 text-emerald" /> Secure Payment
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <Container className="py-16 max-w-2xl">
        <div className="bg-white rounded-2xl border border-forest/10 shadow-lg overflow-hidden">
          {/* Creator Badge */}
          <div className="bg-forest text-white px-6 py-3 flex items-center justify-between">
            <span className="font-mono text-sm">
              @{"freelancerAddress" in gig ? gig.freelancerAddress.slice(0, 6) + "..." + gig.freelancerAddress.slice(-4) : (gig as { creator: string }).creator || "Unknown"}
            </span>
            <span className="text-xs text-white/60">via Kairo</span>
          </div>

          {/* Gig Details */}
          <div className="p-8 space-y-6">
            <h1 className="text-3xl font-serif text-forest">{gig.title}</h1>
            
            {gig.description && (
              <p className="text-forest/70 leading-relaxed">{gig.description}</p>
            )}

            {/* Price */}
            <div className="border-t border-forest/10 pt-6">
              <div className="flex items-end justify-between">
                <span className="text-forest/60 font-mono text-sm uppercase tracking-widest">Amount Due</span>
                <span className="text-5xl font-mono font-bold text-forest">${gig.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Pay Button */}
            <Link href={`/pay/${gigSlug || "demo"}`} className="block">
              <Button size="xl" className="w-full font-mono uppercase tracking-wider">
                Pay with USD <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-forest/60">
                <Zap className="w-4 h-4 text-emerald" />
                <span>Instant settlement</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-forest/60">
                <Clock className="w-4 h-4 text-emerald" />
                <span>3-second guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-forest/40 mt-8 font-mono">
          Powered by <Link href="/" className="text-emerald hover:underline">Kairo</Link> • Built on Tempo
        </p>
      </Container>
    </div>
  );
}
