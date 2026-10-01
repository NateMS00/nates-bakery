import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnv } from "./env";

// A Supabase client for one request (pages, layouts, server actions), signed in as
// whoever's session cookies came with it. Create a new one per request.
// Server Components can't set cookies; a refreshed session is written by proxy.ts
// (which runs first) or by a server action, so a failed write here is safe to ignore.

export async function supabaseServer() {
  // Cookies first: it marks the page as per-request, so a page that only checks the
  // session (Not found) isn't rendered at build time, when there's no request or env.
  const store = await cookies();
  const { url, key } = supabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          /* called from a Server Component: proxy.ts keeps the session fresh */
        }
      },
    },
  });
}
