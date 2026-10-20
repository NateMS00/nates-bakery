import type { Metadata } from "next";
import { connection } from "next/server";
import { BakesView } from "@/components/bakes/BakesView";
import { getBakeDiary } from "@/lib/data/bakes";

export const metadata: Metadata = { title: "Bakes" };

export default async function BakesPage() {
  await connection(); // fixtures are read per request (stands in for the backend)
  const diary = await getBakeDiary();
  return <BakesView diary={diary} />;
}
