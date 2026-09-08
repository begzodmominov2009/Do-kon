import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/db";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. Set it in .env.local before using Supabase.`,
    );
  }
  return value;
}

let cachedClient: SupabaseClient<Database> | undefined;

// Server-only client: uses the service_role key, which bypasses RLS. The
// "server-only" import above makes any accidental client-component import
// of this file fail at build time instead of leaking the key to the browser.
// Created lazily (and cached) on first call so a missing env var fails when
// the client is actually used, not at module load / build time.
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (!cachedClient) {
    cachedClient = createClient<Database>(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    );
  }
  return cachedClient;
}
