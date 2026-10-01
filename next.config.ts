import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// Dev only: let `npm run dev:lan` be opened from a phone on the same Wi-Fi. Next blocks
// its dev resources (hot reload, client chunks) for any host but localhost unless the
// host is listed, so this lists this machine's own private IPv4 addresses, whatever
// the network hands out. Ignored by `next build` and `next start`.
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((a) => a?.family === "IPv4" && !a.internal)
  .map((a) => a!.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: lanAddresses,
  // Don't let `next dev` append its generated agent-rules block to CLAUDE.md: the working
  // rules there are Nathan's, and the Next.js 16 note is already one of them.
  agentRules: false,
};

export default nextConfig;
