"use client";

import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isConnecting && !isReconnecting && !isConnected) {
      router.push("/");
    }
  }, [isConnected, isConnecting, isReconnecting, router, isMounted]);

  if (!isMounted || isConnecting || isReconnecting) {
    return (
      <div className="flex h-screen items-center justify-center bg-lime-50">
        <Loader2 className="h-8 w-8 animate-spin text-forest" />
      </div>
    );
  }

  // If not connected, we return null while redirecting
  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
}
