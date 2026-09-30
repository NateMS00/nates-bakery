import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

// SKELETON `/`: owner → /recipes, everyone else → /login. No content of its own.
export default async function RootRedirect() {
  const session = await getSession();
  redirect(session ? "/recipes" : "/login");
}
