import { Container } from "@/components/ui/container";
import { Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-forest py-12 border-t border-white/5 text-white/50">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-display text-white">Kairo</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald/20 text-emerald border border-emerald/20">Beta</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium">
             <a href="#" className="hover:text-emerald transition-colors">About</a>
             <a href="#" className="hover:text-emerald transition-colors">Blog</a>
             <a href="#" className="hover:text-emerald transition-colors">Terms</a>
             <a href="#" className="hover:text-emerald transition-colors">Privacy</a>
             <a href="#" className="hover:text-emerald transition-colors">Contact</a>
          </div>
          
          <div className="flex gap-4">
             <a href="#" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
               <Twitter className="w-5 h-5" />
             </a>
             <a href="#" className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
               <Linkedin className="w-5 h-5" />
             </a>
          </div>
        </div>
        <div className="text-center md:text-left mt-8 pt-8 border-t border-white/5 text-xs text-secondary-foreground/30">
           <p>Powered by Tempo – the blockchain designed for payments.</p>
           <p className="mt-2">&copy; {new Date().getFullYear()} Kairo Inc. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
