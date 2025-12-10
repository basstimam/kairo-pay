import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-lime-50">
      {/* Header */}
      <header className="border-b border-forest/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Container className="py-4">
          <Link href="/" className="text-xl font-serif font-bold text-forest">Kairo</Link>
        </Container>
      </header>

      <Container className="py-16 max-w-3xl">
        <h1 className="text-4xl font-serif text-forest mb-8">Privacy Policy</h1>
        
        <div className="prose prose-forest max-w-none space-y-6 text-forest/80">
          <p className="text-lg">
            Last updated: December 2024
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, including your email address, wallet address, 
            and transaction history when you use our Service.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Process payments and provide our Service</li>
            <li>Send you transaction confirmations and updates</li>
            <li>Detect and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-serif text-forest mt-8">3. Blockchain Data</h2>
          <p>
            Transactions on the Tempo blockchain are public by nature. While we do not publicly associate 
            your personal information with your wallet address, transaction data is visible on the blockchain.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, no 
            method of transmission over the Internet is 100% secure.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal information. Contact us to 
            exercise these rights.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">6. Contact</h2>
          <p>
            For privacy-related inquiries, please contact us at{" "}
            <a href="mailto:privacy@kairo.app" className="text-emerald hover:underline">privacy@kairo.app</a>
          </p>
        </div>
      </Container>
    </div>
  );
}
