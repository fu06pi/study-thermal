import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import { basePath } from "@/lib/base-path";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Thermal",
  description: "A calm, local-first study timer and consistency heatmap.",
  applicationName: "Study Thermal",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "Study Thermal", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#111219", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body>{children}</body></html>;
}
