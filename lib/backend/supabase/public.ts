import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * A plain, session-less Supabase client (anon role, the anon key only). Used only by
 * the import API routes (app/api/import/*): the Shortcut calls them with its import
 * key, never a session, so there are no cookies to read. The import_* functions
 * (supabase/migrations/0002_import.sql) are SECURITY DEFINER and authenticate the
 * key themselves. One per call; nothing to clean up.
 */
export function supabasePublic() {
  const { url, key } = supabaseEnv();
  return createClient(url, key);
}
