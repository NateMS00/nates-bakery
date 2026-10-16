import { notFound } from "next/navigation";
import { Showcase } from "./Showcase";

// Stage B scaffold (visual-round), never in production: a real build has
// NODE_ENV=production regardless of branch or environment (Vercel previews
// included), so this 404s everywhere except local dev — it can never ship.
// DELETE this file and ./Showcase.tsx once Stage C's screens render these
// components for real.
export default function ComponentShowcasePage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <Showcase />;
}
