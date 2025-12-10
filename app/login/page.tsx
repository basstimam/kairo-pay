"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRight, Fingerprint } from "lucide-react";
import Link from "next/link";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setShowAuthFlow, primaryWallet } = useDynamicContext();
  const router = useRouter();

  // Redirect if connected
  useEffect(() => {
    if (primaryWallet) {
      router.push("/app");
    }
  }, [primaryWallet, router]);

  const handleLogin = () => {
    setShowAuthFlow(true);
  };

  return (
    <div className="min-h-screen bg-lime-50 flex items-center justify-center">
      <Container className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-forest/10 shadow-lg p-8 text-center">
          {/* Logo */}
          <Link href="/" className="block mb-8">
            <span className="text-3xl font-serif font-bold text-forest">Kairo</span>
          </Link>

          <div className="space-y-6 mb-8">
            <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center mx-auto">
              <Fingerprint className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-serif text-forest mb-2">Welcome back</h1>
              <p className="text-forest/60 text-sm">
                Sign in with your wallet or passkey to continue.
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="w-full font-mono font-bold"
            onClick={handleLogin}
          >
            Connect Wallet / Login <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Footer */}
          <p className="text-center text-xs text-forest/40 mt-8 font-mono">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-forest hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-forest hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
