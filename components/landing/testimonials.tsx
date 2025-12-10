"use client";

import { Container } from "@/components/ui/container";

const testimonials = [
  { name: "Sarah J.", role: "Designer", country: "🇺🇸", amount: "$4,200", quote: "Instant processing changed my life." },
  { name: "Miguel R.", role: "Developer", country: "🇧🇷", amount: "$1,850", quote: "No more waiting 5 days for Wise." },
  { name: "Lina K.", role: "Copywriter", country: "🇩🇪", amount: "€3,100", quote: "Tempo is incredibly fast. Kairo makes it easy." },
  { name: "Dai Y.", role: "3D Artist", country: "🇯🇵", amount: "¥450,000", quote: "The 3-second promise is real." },
  { name: "Elena P.", role: "Marketer", country: "🇫🇷", amount: "€2,400", quote: "Fees are basically zero. Amazing." },
  { name: "James T.", role: "Video Editor", country: "🇬🇧", amount: "£1,200", quote: "Finally, a crypto payment app that feels human." },
];

export function Testimonials() {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <Container className="mb-16 text-center">
        <h2 className="text-4xl font-bold font-display text-forest">Global Trust</h2>
      </Container>
      
      <div className="relative flex overflow-x-hidden group">
        <div className="flex animate-marquee gap-8 min-w-full items-center justify-around px-8 group-hover:[animation-play-state:paused]">
           {[...testimonials, ...testimonials].map((t, i) => (
             <div key={i} className="flex-shrink-0 w-80 p-8 rounded-3xl bg-lime-light/10 border border-forest/5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center text-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-forest">{t.name} {t.country}</p>
                        <p className="text-xs text-forest/50">{t.role}</p>
                      </div>
                   </div>
                   <div className="bg-emerald/10 text-emerald px-3 py-1 rounded-full text-xs font-bold font-mono">
                     &quot;{t.amount}&quot;
                   </div>
                </div>
                <p className="text-forest/80 italic">&quot;{t.quote}&quot;</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
