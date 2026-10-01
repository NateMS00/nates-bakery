// Supabase project settings (Vercel and .env.local). The public ("anon" or
// "publishable") key is safe in the browser: row-level security decides what it can
// do. The app never uses the secret service-role key.

export function supabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).");
  return { url, key };
}
