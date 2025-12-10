import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-lime-50">
      {/* Header */}
      <header className="border-b border-forest/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <Container className="py-4">
          <Link href="/" className="text-xl font-serif font-bold text-forest">Kairo</Link>
        </Container>
      </header>

      <Container className="py-16 max-w-3xl">
        <h1 className="text-4xl font-serif text-forest mb-8">Terms of Service</h1>
        
        <div className="prose prose-forest max-w-none space-y-6 text-forest/80">
          <p className="text-lg">
            Last updated: December 2024
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">1. Acceptance of Terms</h2>
          <p>
                By accessing Kairo, you agree to be bound by these Terms. Kairo is a decentralized interface (&quot;DApp&quot;) interacting with the Tempo blockchain. If you do not agree, please do not use our Service.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">2. Description of Service</h2>
          <p>
            Kairo is a payment platform built on the Tempo protocol that enables freelancers to receive payouts. We do not have custody of your funds. All transactions occur directly between client and freelancer wallets on-chain. &quot;Kairo&quot; cannot reverse transactions. is free.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">3. User Accounts</h2>
          <p>
            To use certain features of the Service, you must create an account. You are responsible for 
            maintaining the confidentiality of your account credentials and for all activities under your account.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">4. Payments and Fees</h2>
          <p>
            Kairo charges zero fees for payment processing. All payments are settled in USD on the 
            Tempo blockchain. Withdrawal fees may apply depending on your chosen withdrawal method.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">5. 3-Second Guarantee</h2>
          <p>
            If a payment takes longer than 3 seconds to settle, the transaction will be automatically 
            refunded to the payer at no cost. This guarantee applies only to blockchain settlement time 
            and excludes network congestion beyond our control.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">6. Prohibited Activities</h2>
          <p>
            You may not use Kairo for any illegal activities, money laundering, fraud, or any purpose 
            that violates applicable laws and regulations.
          </p>

          <h2 className="text-2xl font-serif text-forest mt-8">7. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{" "}
            <a href="mailto:legal@kairo.app" className="text-emerald hover:underline">legal@kairo.app</a>
          </p>
        </div>
      </Container>
    </div>
  );
}
