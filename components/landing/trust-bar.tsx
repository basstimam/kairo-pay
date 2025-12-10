import { CheckCircle } from "lucide-react";
export function TrustBar() {
  const brands = [
    "Upwork", "Fiverr", "Toptal", "Freelancer", "99designs", "Dribbble"
  ];

  return (
    <div className="w-full border-b border-forest/10 bg-background">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center md:justify-between items-center bg-white/50 backdrop-blur-sm">
        {["Trusted by 10,000+ freelancers", "Processed $5M+ volume", "Audited by Sherlock", "Backed by Y Combinator"].map((text) => (
          // This is where the (text) parameter is used.
          // The original instruction was to replace (text, i) with (text),
          // but the provided "Code Edit" already uses (text).
          // Assuming the intent was to insert this new map function.
          <div key={text} className="flex items-center space-x-2 p-4">
            <CheckCircle className="h-5 w-5 text-emerald" />
            <span className="text-sm text-forest">{text}</span>
          </div>
        ))}
        {brands.map((brand) => (
          <div 
            key={brand} 
            className="flex-1 min-w-[150px] py-8 border-r border-forest/5 last:border-r-0 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 group"
          >
            <span className="text-xl font-serif font-bold tracking-tight text-forest group-hover:text-emerald">{brand}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
