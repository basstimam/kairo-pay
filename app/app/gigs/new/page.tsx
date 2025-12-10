'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ArrowLeft, Loader2, Link as LinkIcon, Check } from 'lucide-react';
import Link from 'next/link';
import { createGig } from '@/app/actions/gig';

export default function NewGigPage() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [createdGigId, setCreatedGigId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      freelancerAddress: address,
    };

    try {
      const gig = await createGig(data);
      setCreatedGigId(gig.id);
    } catch (error) {
      console.error(error);
      alert('Failed to create gig');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Container className="min-h-screen flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-serif text-forest">Connect your wallet first</h1>
        <ConnectButton />
      </Container>
    );
  }

  if (createdGigId) {
    const link = `${window.location.origin}/pay/${createdGigId}`;
    return (
      <Container className="min-h-screen py-20 flex flex-col items-center justify-center text-center max-w-lg">
        <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-emerald" />
        </div>
        <h1 className="text-3xl font-serif text-forest mb-4">Gig Created!</h1>
        <p className="text-forest/60 mb-8">Send this link to your client to get paid instantly.</p>
        
        <div className="w-full bg-white border border-forest/10 rounded-xl p-4 flex items-center gap-3 mb-8">
          <LinkIcon className="w-5 h-5 text-forest/40 flex-shrink-0" />
          <input 
            readOnly 
            value={link} 
            className="w-full bg-transparent text-sm font-mono text-forest outline-none"
            onClick={(e) => e.currentTarget.select()}
          />
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(link)}>
            Copy
          </Button>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => setCreatedGigId(null)}>Create Another</Button>
          <Link href="/app">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen py-10 max-w-2xl">
      <Link href="/app" className="inline-flex items-center text-forest/60 hover:text-forest mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-serif text-forest mb-2">Create New Gig</h1>
        <p className="text-forest/60">Generate a payment request link for your client.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-forest/5 shadow-sm">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-forest">Gig Title</label>
          <input 
            name="title" 
            required
            placeholder="e.g. Website Redesign"
            className="w-full p-3 bg-lime-50/50 border border-forest/10 rounded-lg focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-forest">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest/40">$</span>
            <input 
              name="price" 
              type="number" 
              step="0.01" 
              required
              placeholder="500.00"
              className="w-full pl-8 p-3 bg-lime-50/50 border border-forest/10 rounded-lg focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-forest">Description</label>
          <textarea 
            name="description" 
            rows={4}
            placeholder="Describe the work delivered..."
            className="w-full p-3 bg-lime-50/50 border border-forest/10 rounded-lg focus:outline-none focus:border-emerald-400"
          />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Create Payment Link
        </Button>
      </form>
    </Container>
  );
}
