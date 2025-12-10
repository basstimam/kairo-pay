"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface LottiePlayerProps {
  animationData?: unknown;
  src?: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottiePlayer({ animationData, src, loop = true, autoplay = true, className }: LottiePlayerProps) {
  const [data, setData] = useState(animationData);

  useEffect(() => {
    if (src) {
      fetch(src)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Failed to fetch Lottie: ${response.statusText}`);
          const text = await response.text();
          try {
            const json = JSON.parse(text);
            setData(json);
          } catch (e) {
            console.error("Lottie JSON parse error:", e);
            console.error("Received response:", text.slice(0, 100)); // Log first 100 chars to debug
          }
        })
        .catch((error) => console.error("Error loading Lottie animation:", error));
    }
  }, [src]);

  if (!data) return <div className={className} />;

  return (
    <Lottie
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
}
