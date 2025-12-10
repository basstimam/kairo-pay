import { Container } from "@/components/ui/container";
import { Link, Send, Zap } from "lucide-react";

const steps = [
  {
    icon: Link,
    title: "1. Create your Kairo link",
    desc: "Claim your unique username (username.kairo.app). No confusing wallet addresses.",
  },
  {
    icon: Send,
    title: "2. Send invoice",
    desc: "Client pays with one click using any card or crypto. They don't need Kairo.",
  },
  {
    icon: Zap,
    title: "3. Money lands instantly",
    desc: "Funds arrive in your wallet in <3 seconds. If it takes longer, fees are refunded.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 bg-white">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-20">
          <h2 className="text-4xl font-bold font-display text-forest mb-6">How It Works</h2>
          <p className="text-lg text-forest/60">
            Freelancing is hard enough. Getting paid shouldn&apos;t be.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-lime-light/30 border border-emerald/5 hover:border-emerald/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-emerald">
                <step.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-forest mb-4">{step.title}</h3>
              <p className="text-forest/70 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
