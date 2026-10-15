import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The migrations, run in PGlite (Postgres in Node, no server) on top of a stand-in for
// what Supabase provides: the auth schema with auth.uid() read from the request's JWT
// subject, the anon and authenticated roles, Supabase's default privileges (new
// tables and functions in public open to both roles), and Storage's buckets and
// objects tables with storage.foldername(). Shared by the database specs.

export type DB = Awaited<ReturnType<typeof open>>;

export const OWNER = "00000000-0000-0000-0000-00000000000a";
export const OTHER = "00000000-0000-0000-0000-00000000000b";

const migrations = (upTo?: string) => {
  const dir = join(process.cwd(), "supabase", "migrations");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .filter((f) => !upTo || f.slice(0, 4) <= upTo)
    .sort()
    .map((f) => readFileSync(join(dir, f), "utf8"));
};

/** `upTo`, e.g. "0002": stop after that migration — for a verify script that's a
 * snapshot of a point the schema has since moved past (a later migration renamed or
 * dropped something it checks for). Omit it for the normal, fully-current database. */
export async function open(options: { upTo?: string } = {}) {
  const { PGlite } = await import("@electric-sql/pglite");
  const { pgcrypto } = await import("@electric-sql/pglite/contrib/pgcrypto");
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(`
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create schema extensions;
    create role anon nologin; create role authenticated nologin;
    grant usage on schema public, auth, extensions to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
    grant all on schema public to anon, authenticated;
    create schema storage;
    create table storage.buckets (id text primary key, name text not null, public boolean not null default false, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id), name text not null, owner uuid default auth.uid());
    alter table storage.objects enable row level security;
    create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
    grant usage on schema storage to anon, authenticated;
    grant all on storage.objects to anon, authenticated;
    grant select on storage.buckets to anon, authenticated;
  `);
  for (const sql of migrations(options.upTo)) await db.exec(sql);
  await db.exec(`insert into auth.users values ('${OWNER}'), ('${OTHER}')`);
  const as = async (role: "anon" | "authenticated" | "postgres", sub: string | null = null) =>
    db.exec(`reset role; select set_config('request.jwt.claim.sub', '${sub ?? ""}', false);${role === "postgres" ? "" : ` set role ${role};`}`);
  const q = async <T = Record<string, unknown>>(sql: string, params: unknown[] = []) => (await db.query<T>(sql, params)).rows;
  const fails = async (sql: string, params: unknown[] = []) => {
    try {
      await db.query(sql, params);
      return "";
    } catch (e) {
      return (e as Error).message;
    }
  };
  return { db, as, q, fails };
}
