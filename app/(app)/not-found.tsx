import type { Metadata } from "next";
import { NotFoundContent } from "@/components/system/NotFoundContent";

// WCAG 2.4.2: a title that says what happened.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundContent />;
}
