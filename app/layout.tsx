import type { Metadata, Viewport } from "next";
import { ViewportVars } from "@/components/system/ViewportVars";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Backery", template: "%s · Backery" },
  description: "Recipes from baking reels, in grams, with a log of every bake.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2E8" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1326" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: Chrome for iOS adds autofill attributes (__gcrremoteframetoken)
    // to <html> before React hydrates. Only this element's own attributes are exempt.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="min-h-dvh">
        <ViewportVars />
        {children}
      </body>
    </html>
  );
}
