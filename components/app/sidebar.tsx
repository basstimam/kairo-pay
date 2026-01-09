"use client";

import Link from "next/link";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, PlusCircle, Settings, LogOut, ArrowRightLeft } from "lucide-react";

const sidebarLinks = [
  { name: "Dashboard", href: "/app", icon: LayoutDashboard },
  { name: "Create Gig", href: "/app/gigs/new", icon: PlusCircle },
  { name: "Swap", href: "/app/swap", icon: ArrowRightLeft },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { handleLogOut } = useDynamicContext();
  const router = useRouter();

  const onSignOut = async () => {
    await handleLogOut();
    router.push("/");
  };

  return (
    <div className="h-screen w-64 bg-forest text-white flex flex-col border-r border-forest-800 fixed left-0 top-0 overflow-y-auto">
      <div className="p-8">
        <h1 className="text-2xl font-serif font-bold tracking-tight">Kairo</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive 
                  ? "bg-emerald text-white shadow-[0px_2px_10px_rgba(16,185,129,0.3)]" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={onSignOut}
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-white/40 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
