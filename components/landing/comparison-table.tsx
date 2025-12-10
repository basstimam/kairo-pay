import { Container } from "@/components/ui/container";
import { Check, X } from "lucide-react";

export function ComparisonTable() {
  const features = [
    { name: "Time to get paid", kairo: "< 3 seconds", paypal: "1–7 days", wise: "1–5 days", wire: "3–14 days" },
    { name: "Fees", kairo: "0% – 1%", paypal: "3 – 6%", wise: "0.5 – 2%", wire: "$25 – $50" },
    { name: "Instant Settlement", kairo: true, paypal: false, wise: false, wire: false },
    { name: "Weekends/Holidays", kairo: true, paypal: false, wise: false, wire: false },
  ];

  return (
    <section className="py-32 bg-lime-light/20">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-display text-forest mb-6">Why Freelancers Switch</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-6 text-sm font-bold text-forest/40 uppercase tracking-widest border-b border-forest/10 w-1/4">Feature</th>
                <th className="p-6 text-xl font-bold text-emerald border-b-2 border-emerald w-1/4 bg-emerald/5 rounded-t-2xl">Kairo</th>
                <th className="p-6 text-lg font-medium text-forest/60 border-b border-forest/10 w-1/6">PayPal</th>
                <th className="p-6 text-lg font-medium text-forest/60 border-b border-forest/10 w-1/6">Wise</th>
                <th className="p-6 text-lg font-medium text-forest/60 border-b border-forest/10 w-1/6">Bank Wire</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={i} className="hover:bg-white/50 transition-colors">
                  <td className="p-6 font-medium text-forest">{feature.name}</td>
                  
                  {/* Kairo */}
                  <td className="p-6 bg-emerald/5 font-bold text-forest">
                    {typeof feature.kairo === "boolean" ? (
                      feature.kairo ? <Check className="w-6 h-6 text-emerald" /> : <X className="w-6 h-6 text-red-400" />
                    ) : (
                      <span className="text-emerald">{feature.kairo}</span>
                    )}
                  </td>
                  
                  {/* Others */}
                  {[feature.paypal, feature.wise, feature.wire].map((val, idx) => (
                    <td key={idx} className="p-6 text-forest/60">
                      {typeof val === "boolean" ? (
                        val ? <Check className="w-6 h-6 text-emerald" /> : <X className="w-6 h-6 text-red-400/50" />
                      ) : (
                        val
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
