"use client";

import { useMemo } from "react";
import Lottie from "lottie-react";

import type { AppearanceSettings } from "@/features/study/types";

export function Background({ settings }: { settings: AppearanceSettings }) {
  const animationData = useMemo<unknown>(() => {
    if (settings.backgroundKind !== "lottie") return null;
    try { return JSON.parse(settings.backgroundValue) as unknown; } catch { return null; }
  }, [settings.backgroundKind, settings.backgroundValue]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-canvas">
      <div className="absolute -inset-8 transition" style={{ filter: `brightness(${settings.brightness / 100}) blur(${settings.blur}px)` }}>
        {settings.backgroundKind === "gradient" && <div className="absolute inset-0" style={{ background: settings.backgroundValue }} />}
        {settings.backgroundKind === "image" && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.backgroundValue})` }} />}
        {settings.backgroundKind === "video" && <video className="h-full w-full object-cover" src={settings.backgroundValue} autoPlay loop muted playsInline />}
        {settings.backgroundKind === "lottie" && animationData !== null && <Lottie className="h-full w-full" animationData={animationData} loop />}
      </div>
      <div className="absolute inset-0 bg-black transition" style={{ opacity: settings.overlay / 100 }} />
    </div>
  );
}
